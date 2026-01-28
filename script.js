// ================= ELEMENTOS =================
const mapaDiv = document.getElementById('mapa');
const listaLotes = document.getElementById('listaLotes');
const historicoDiv = document.getElementById('historico');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const btnCriarLote = document.getElementById('btnCriarLote');

const areaNome = document.getElementById('areaNome');
const btnCriarArea = document.getElementById('btnCriarArea');

const buscaInput = document.getElementById('buscaInput');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimparBusca = document.getElementById('btnLimparBusca');

const modal = document.getElementById('modal');
const modalLote = document.getElementById('modalLote');
const modalRz = document.getElementById('modalRz');
const modalVolume = document.getElementById('modalVolume');
const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');
const btnRemoverEndereco = document.getElementById('btnRemoverEndereco');
const btnFecharModal = document.getElementById('btnFecharModal');

// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let posicaoAtual = null;

// ================= UTIL =================
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,70%)`;
}

function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
  localStorage.setItem('historico', JSON.stringify(historico));
}

// ================= CONTADORES =================
function quantidadeAlocada(lote) {
  let total = 0;
  mapa.forEach(a =>
    a.ruas.forEach(r =>
      r.posicoes.forEach(p => {
        if (p && p.lote === lote) total++;
      })
    )
  );
  return total;
}

// ================= LOTES =================
btnCriarLote.onclick = () => {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);

  if (!nome || qtd <= 0 || lotes[nome]) return;

  lotes[nome] = { total: qtd, cor: gerarCor() };
  loteNome.value = '';
  loteQtd.value = '';

  salvar();
  renderLotes();
  renderMapa();
};

function renderLotes() {
  listaLotes.innerHTML = '';

  Object.entries(lotes).forEach(([nome, data]) => {
    const usado = quantidadeAlocada(nome);

    const div = document.createElement('div');
    div.className = 'lote-item';

    div.innerHTML = `
      <span class="lote-cor" style="background:${data.cor}"></span>
      <strong>${nome}</strong> (${usado}/${data.total})
    `;

    const btnExpedir = document.createElement('button');
    btnExpedir.textContent = '🚚 Expedir';

    btnExpedir.onclick = () => expedirLote(nome);

    div.appendChild(btnExpedir);
    listaLotes.appendChild(div);
  });
}

// ================= EXPEDIÇÃO =================
function expedirLote(lote) {
  const total = lotes[lote].total;
  const alocados = quantidadeAlocada(lote);

  if (alocados === 0) {
    alert('Nenhuma gaylord alocada neste lote.');
    return;
  }

  let observacao = 'Expedição completa';

  if (alocados < total) {
    const ok = confirm(
      `Lote incompleto\nAlocados: ${alocados}\nTotal: ${total}\n\nDeseja expedir mesmo assim?`
    );
    if (!ok) return;

    observacao = `Expedição parcial (${alocados} de ${total})`;
  }

  const itens = [];

  mapa.forEach(area =>
    area.ruas.forEach(rua =>
      rua.posicoes.forEach((pos, i) => {
        if (pos && pos.lote === lote) {
          itens.push({ rz: pos.rz, volume: pos.volume });
          rua.posicoes[i] = null;
        }
      })
    )
  );

  const agora = new Date();

  historico.push({
    lote,
    totalOriginal: total,
    expedidos: alocados,
    observacao,
    data: agora.toLocaleDateString(),
    hora: agora.toLocaleTimeString(),
    itens
  });

  delete lotes[lote];

  salvar();
  renderLotes();
  renderMapa();
  renderHistorico();
}

// ================= HISTÓRICO =================
function renderHistorico() {
  historicoDiv.innerHTML = '';

  historico.forEach(h => {
    const div = document.createElement('div');
    div.className = 'historico-item';

    const btnDetalhes = document.createElement('button');
    btnDetalhes.textContent = 'Ver detalhes';

    btnDetalhes.onclick = () => {
      alert(
        h.itens
          .map(i => `RZ: ${i.rz} | Volume: ${i.volume || '-'}`)
          .join('\n')
      );
    };

    div.innerHTML = `
      <strong>${h.lote}</strong><br>
      Expedidos: ${h.expedidos}<br>
      ${h.observacao}<br>
      ${h.data} ${h.hora}<br>
    `;

    div.appendChild(btnDetalhes);
    historicoDiv.appendChild(div);
  });
}

// ================= ÁREA / RUA / MAPA =================
/* (mantém exatamente igual ao que você já tem)
   renderMapa, criarRua, excluirRua, excluirArea,
   modal, busca etc — NÃO foram alterados */

// ================= INIT =================
renderLotes();
renderMapa();
renderHistorico();
