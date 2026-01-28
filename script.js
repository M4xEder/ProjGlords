let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

// ---------- STORAGE ----------
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ---------- LOTES ----------
document.getElementById('btnCriarLote').onclick = () => {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);

  if (!nome || qtd <= 0) return alert('Dados inválidos');

  lotes[nome] = { total: qtd };
  loteNome.value = '';
  loteQtd.value = '';

  salvar();
  renderLotes();
};

function renderLotes() {
  listaLotes.innerHTML = '';
  Object.keys(lotes).forEach(l =>
    listaLotes.innerHTML += `<div>${l} (${lotes[l].total})</div>`
  );
}

// ---------- ÁREA ----------
document.getElementById('btnCriarArea').onclick = () => {
  const nome = areaNome.value.trim();
  if (!nome) return;

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';

  salvar();
  renderMapa();
};

// ---------- RUA ----------
function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Qtd de posições'));
  if (!nome || qtd <= 0) return;

  mapa[areaIndex].ruas.push({
    nome,
    posicoes: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

// ---------- MAPA ----------
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
        d.className = 'posicao' + (pos ? ' ocupada' : '');
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
}

// ---------- MODAL ----------
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };
  modal.classList.remove('hidden');

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l =>
    modalLote.innerHTML += `<option value="${l}">${l}</option>`
  );
}

btnFecharModal.onclick = () => modal.classList.add('hidden');

btnSalvarEndereco.onclick = () => {
  if (!modalLote.value || !modalRz.value) return alert('Dados obrigatórios');

  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = {
      lote: modalLote.value,
      rz: modalRz.value,
      volume: modalVolume.value || null
    };

  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

btnRemoverEndereco.onclick = () => {
  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = null;

  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

// ---------- INIT ----------
const mapaDiv = document.getElementById('mapa');
renderLotes();
renderMapa();
