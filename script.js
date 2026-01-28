// =======================
// ESTADO GLOBAL
// =======================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;
let termoBuscaAtual = '';

// =======================
// STORAGE
// =======================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// =======================
// LOTE
// =======================
function criarLote() {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);

  if (!nome || qtd <= 0) {
    alert('Informe nome e quantidade');
    return;
  }

  lotes[nome] = { total: qtd };
  loteNome.value = '';
  loteQtd.value = '';

  salvar();
  renderLotes();
}

function renderLotes() {
  listaLotes.innerHTML = '';
  Object.keys(lotes).forEach(lote => {
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.textContent = `${lote} (${lotes[lote].total})`;
    listaLotes.appendChild(div);
  });
}

// =======================
// ÁREA / RUA
// =======================
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Informe o nome da área');

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';
  salvar();
  renderMapa();
}

function criarRua(a) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));

  if (!nome || qtd <= 0) return;

  mapa[a].ruas.push({
    nome,
    posicoes: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

// =======================
// MAPA
// =======================
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `Rua ${rua.nome}`;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (pos) {
          d.classList.add('ocupada');

          // 🔑 DATASET GARANTIDO
          d.dataset.lote = pos.lote || '';
          d.dataset.rz = pos.rz || '';
          d.dataset.volume = pos.volume || '';
        }

        d.onclick = () => abrirModal(a, r, p);
        posDiv.appendChild(d);
      });

      ruaDiv.appendChild(posDiv);
      areaDiv.appendChild(ruaDiv);
    });

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => criarRua(a);

    areaDiv.appendChild(btnRua);
    mapaDiv.appendChild(areaDiv);
  });

  reaplicarBusca(); // 🔁 reaplica destaque após render
}

// =======================
// BUSCA (CORRIGIDA)
// =======================
function buscar() {
  termoBuscaAtual = buscaInput.value.trim().toLowerCase();
  aplicarBusca();
}

function aplicarBusca() {
  limparBusca();
  if (!termoBuscaAtual) return;

  let encontrou = false;

  document.querySelectorAll('.posicao.ocupada').forEach(pos => {
    const lote = pos.dataset.lote.toLowerCase();
    const rz = pos.dataset.rz.toLowerCase();
    const volume = pos.dataset.volume.toLowerCase();

    if (
      lote.includes(termoBuscaAtual) ||
      rz.includes(termoBuscaAtual) ||
      volume.includes(termoBuscaAtual)
    ) {
      pos.classList.add('destaque');
      encontrou = true;
    }
  });

  if (!encontrou) {
    alert('Nenhum resultado encontrado');
  }
}

function limparBusca() {
  termoBuscaAtual = '';
  document
    .querySelectorAll('.posicao.destaque')
    .forEach(p => p.classList.remove('destaque'));
}

function reaplicarBusca() {
  if (termoBuscaAtual) aplicarBusca();
}

// =======================
// MODAL
// =======================
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };
  const pos = mapa[a].ruas[r].posicoes[p];

  infoEndereco.textContent =
    `Área: ${mapa[a].nome} | Rua: ${mapa[a].ruas[r].nome} | Posição: ${p + 1}`;

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l =>
    modalLote.innerHTML += `<option value="${l}">${l}</option>`
  );

  modalLote.value = pos?.lote || '';
  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';

  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

// =======================
// ENDEREÇAMENTO
// =======================
function salvarEndereco() {
  const lote = modalLote.value;
  const rz = modalRz.value.trim();
  const volume = modalVolume.value.trim() || null;

  if (!lote || !rz) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  if (mapa[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p]) {
    alert('Endereço já ocupado');
    return;
  }

  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = { lote, rz, volume };

  salvar();
  fecharModal();
  renderMapa();
}

function removerEndereco() {
  if (!confirm('Remover gaylord desta posição?')) return;

  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = null;

  salvar();
  fecharModal();
  renderMapa();
}

// =======================
// INIT
// =======================
renderMapa();
renderLotes();
