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
  const nomes = Object.keys(lotes);

  if (nomes.length === 0) {
    listaLotes.innerHTML = '<p>Nenhum lote cadastrado</p>';
    return;
  }

  nomes.forEach(nome => {
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.textContent = `${nome} - ${lotes[nome].total}`;
    listaLotes.appendChild(div);
  });
}

// =======================
// ÁREA
// =======================
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';

  salvar();
  renderMapa();
}

function excluirArea(a) {
  const temGaylord = mapa[a].ruas.some(rua =>
    rua.posicoes.some(pos => pos !== null)
  );

  if (temGaylord) {
    alert('Não é possível excluir a área. Existem gaylords alocadas.');
    return;
  }

  if (!confirm(`Excluir a área "${mapa[a].nome}"?`)) return;

  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

// =======================
// RUA
// =======================
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

function excluirRua(a, r) {
  const temGaylord = mapa[a].ruas[r].posicoes.some(pos => pos !== null);

  if (temGaylord) {
    alert('Não é possível excluir a rua. Existem gaylords alocadas.');
    return;
  }

  if (!confirm(`Excluir a rua "${mapa[a].ruas[r].nome}"?`)) return;

  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

// =======================
// MAPA
// =======================
function renderMapa() {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.innerHTML = '';

  if (mapa.length === 0) {
    mapaDiv.innerHTML = '<p>Nenhuma área criada</p>';
    return;
  }

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    // Área header
    const headerArea = document.createElement('div');
    headerArea.style.display = 'flex';
    headerArea.style.justifyContent = 'space-between';

    headerArea.innerHTML = `<strong>${area.nome}</strong>`;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    headerArea.appendChild(btnExcluirArea);
    areaDiv.appendChild(headerArea);

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const headerRua = document.createElement('div');
      headerRua.style.display = 'flex';
      headerRua.style.justifyContent = 'space-between';

      headerRua.innerHTML = `<span>Rua ${rua.nome}</span>`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => excluirRua(a, r);

      headerRua.appendChild(btnExcluirRua);
      ruaDiv.appendChild(headerRua);

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (pos) {
          d.classList.add('ocupada');
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

  reaplicarBusca();
}

// =======================
// BUSCA
// =======================
function buscar() {
  termoBuscaAtual = document.getElementById('buscaInput').value
    .trim()
    .toLowerCase();

  aplicarBusca();
}

function aplicarBusca() {
  limparBusca();
  if (!termoBuscaAtual) return;

  document.querySelectorAll('.posicao.ocupada').forEach(pos => {
    const lote = (pos.dataset.lote || '').toLowerCase();
    const rz = (pos.dataset.rz || '').toLowerCase();
    const volume = (pos.dataset.volume || '').toLowerCase();

    if (
      lote.includes(termoBuscaAtual) ||
      rz.includes(termoBuscaAtual) ||
      volume.includes(termoBuscaAtual)
    ) {
      pos.classList.add('destaque');
    }
  });
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

  const ref =
    mapa[posicaoAtual.a]
      .ruas[posicaoAtual.r]
      .posicoes[posicaoAtual.p];

  if (ref) {
    alert('Este endereço já está ocupado');
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
