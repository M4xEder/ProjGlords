// ===== ELEMENTOS =====
const mapaDiv = document.getElementById('mapa');
const listaLotes = document.getElementById('listaLotes');
const historicoDiv = document.getElementById('historico');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const btnCriarLote = document.getElementById('btnCriarLote');

const areaNome = document.getElementById('areaNome');
const btnCriarArea = document.getElementById('btnCriarArea');

const modal = document.getElementById('modal');
const modalLote = document.getElementById('modalLote');
const modalRz = document.getElementById('modalRz');
const modalVolume = document.getElementById('modalVolume');
const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');
const btnRemoverEndereco = document.getElementById('btnRemoverEndereco');
const btnFecharModal = document.getElementById('btnFecharModal');

// ===== ESTADO =====
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let posicaoAtual = null;

// ===== UTIL =====
const gerarCor = () => `hsl(${Math.random()*360},70%,70%)`;

const salvar = () => {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
  localStorage.setItem('historico', JSON.stringify(historico));
};

const contarAlocados = lote =>
  mapa.flatMap(a => a.ruas.flatMap(r => r.posicoes))
      .filter(p => p && p.lote === lote).length;

// ===== LOTES =====
btnCriarLote.onclick = () => {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);
  if (!nome || qtd <= 0 || lotes[nome]) return;

  lotes[nome] = { total: qtd, cor: gerarCor() };
  loteNome.value = loteQtd.value = '';
  salvar();
  renderLotes();
  renderMapa();
};

function renderLotes() {
  listaLotes.innerHTML = '';
  Object.entries(lotes).forEach(([nome, d]) => {
    const usado = contarAlocados(nome);
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.innerHTML = `
      <span class="lote-cor" style="background:${d.cor}"></span>
      ${nome} (${usado}/${d.total})
    `;
    const btn = document.createElement('button');
    btn.textContent = '🚚 Expedir';
    btn.onclick = () => expedirLote(nome);
    div.appendChild(btn);
    listaLotes.appendChild(div);
  });
}

// ===== EXPEDIÇÃO =====
function expedirLote(lote) {
  const total = lotes[lote].total;
  const alocados = contarAlocados(lote);
  if (!alocados) return alert('Nenhuma gaylord alocada');

  let obs = 'Expedição completa';
  if (alocados < total) {
    if (!confirm('Expedição parcial. Continuar?')) return;
    obs = `Expedição parcial (${alocados}/${total})`;
  }

  const itens = [];
  mapa.forEach(a => a.ruas.forEach(r =>
    r.posicoes.forEach((p,i) => {
      if (p && p.lote === lote) {
        itens.push({ rz:p.rz, volume:p.volume });
        r.posicoes[i] = null;
      }
    })
  ));

  const agora = new Date();
  historico.push({
    lote, expedidos: alocados, obs,
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

// ===== HISTÓRICO =====
function renderHistorico() {
  historicoDiv.innerHTML = '';
  historico.forEach(h => {
    const d = document.createElement('div');
    d.className = 'historico-item';
    d.innerHTML = `
      <strong>${h.lote}</strong><br>
      ${h.obs}<br>
      ${h.data} ${h.hora}
    `;
    const b = document.createElement('button');
    b.textContent = 'Ver RZ / Volume';
    b.onclick = () => alert(h.itens.map(i =>
      `RZ:${i.rz} | Vol:${i.volume||'-'}`).join('\n'));
    d.appendChild(b);
    historicoDiv.appendChild(d);
  });
}

// ===== ÁREA / RUA / MAPA =====
btnCriarArea.onclick = () => {
  if (!areaNome.value.trim()) return;
  mapa.push({ nome: areaNome.value, ruas: [] });
  areaNome.value = '';
  salvar(); renderMapa();
};

function renderMapa() {
  mapaDiv.innerHTML = '';
  mapa.forEach((a,ai) => {
    const ad = document.createElement('div');
    ad.className = 'area';
    ad.innerHTML = `<strong>${a.nome}</strong>`;
    a.ruas.forEach((r,ri) => {
      const rd = document.createElement('div');
      rd.className = 'rua';
      rd.innerHTML = `Rua ${r.nome}`;
      const pd = document.createElement('div');
      pd.className = 'posicoes';
      r.posicoes.forEach((p,pi) => {
        const d = document.createElement('div');
        d.className = 'posicao';
        if (p) {
          d.classList.add('ocupada');
          d.style.background = lotes[p.lote]?.cor;
        }
        d.onclick = () => abrirModal(ai,ri,pi);
        pd.appendChild(d);
      });
      rd.appendChild(pd);
      ad.appendChild(rd);
    });
    const b = document.createElement('button');
    b.textContent = 'Adicionar rua';
    b.onclick = () => {
      const n = prompt('Nome da rua');
      const q = Number(prompt('Qtd endereços'));
      if (n && q>0) {
        a.ruas.push({ nome:n, posicoes:Array(q).fill(null) });
        salvar(); renderMapa();
      }
    };
    ad.appendChild(b);
    mapaDiv.appendChild(ad);
  });
}

// ===== MODAL =====
function abrirModal(a,r,p) {
  posicaoAtual={a,r,p};
  modal.classList.remove('hidden');
  modalLote.innerHTML='<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l=>modalLote.innerHTML+=`<option>${l}</option>`);
  const pos=mapa[a].ruas[r].posicoes[p];
  modalLote.value=pos?.lote||'';
  modalRz.value=pos?.rz||'';
  modalVolume.value=pos?.volume||'';
}

btnSalvarEndereco.onclick=()=>{
  const {a,r,p}=posicaoAtual;
  if(mapa[a].ruas[r].posicoes[p])return alert('Endereço ocupado');
  if(!modalLote.value||!modalRz.value)return;
  if(contarAlocados(modalLote.value)>=lotes[modalLote.value].total)
    return alert('Limite do lote atingido');
  mapa[a].ruas[r].posicoes[p]={lote:modalLote.value,rz:modalRz.value,volume:modalVolume.value};
  salvar();modal.classList.add('hidden');renderMapa();
};

btnRemoverEndereco.onclick=()=>{
  const {a,r,p}=posicaoAtual;
  mapa[a].ruas[r].posicoes[p]=null;
  salvar();modal.classList.add('hidden');renderMapa();
};

btnFecharModal.onclick=()=>modal.classList.add('hidden');

// ===== INIT =====
renderLotes();
renderMapa();
renderHistorico();
