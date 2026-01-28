let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

/* ÁREA */
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Informe o nome');
  mapa.push({ nome, ruas: [] });
  areaNome.value = '';
  salvar();
  renderMapa();
}

function criarRua(a) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Qtd de endereços'));
  if (!nome || qtd <= 0) return;
  mapa[a].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
  salvar();
  renderMapa();
}

/* LOTE */
function criarLote() {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);
  if (!nome || qtd <= 0) return alert('Dados inválidos');
  lotes[nome] = { total: qtd };
  loteNome.value = '';
  loteQtd.value = '';
  salvar();
  renderLotes();
}

/* MAPA */
function renderMapa() {
  mapaDiv.innerHTML = '';
  mapa.forEach((area, a) => {
    const d = document.createElement('div');
    d.className = 'area';
    d.innerHTML = `<strong>${area.nome}</strong>`;
    area.ruas.forEach((rua, r) => {
      const rd = document.createElement('div');
      rd.className = 'rua';
      rd.innerHTML = `Rua ${rua.nome}`;
      const pdiv = document.createElement('div');
      pdiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const el = document.createElement('div');
        el.className = 'posicao';
        if (pos) el.classList.add('ocupada');
        el.onclick = () => abrirModal(a, r, p);
        pdiv.appendChild(el);
      });

      rd.appendChild(pdiv);
      d.appendChild(rd);
    });

    const btn = document.createElement('button');
    btn.textContent = 'Adicionar Rua';
    btn.onclick = () => criarRua(a);
    d.appendChild(btn);

    mapaDiv.appendChild(d);
  });
}

/* LOTES */
function renderLotes() {
  listaLotes.innerHTML = '';
  Object.keys(lotes).forEach(l => {
    const d = document.createElement('div');
    d.className = 'lote-item';
    d.textContent = `${l} - ${lotes[l].total}`;
    listaLotes.appendChild(d);
  });
}

/* MODAL */
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };
  modal.classList.remove('hidden');

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l => {
    modalLote.innerHTML += `<option>${l}</option>`;
  });

  const atual = mapa[a].ruas[r].posicoes[p];
  modalLote.value = atual?.lote || '';
  modalRz.value = atual?.rz || '';
  modalVolume.value = atual?.volume || '';
}

function fecharModal() {
  modal.classList.add('hidden');
}

function salvarEndereco() {
  const lote = modalLote.value;
  const rz = modalRz.value.trim();
  const volume = modalVolume.value.trim() || null;

  if (!lote || !rz) return alert('Lote e RZ são obrigatórios');

  const pos = mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p];

  if (pos) return alert('Endereço já ocupado');

  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = { lote, rz, volume };

  salvar();
  fecharModal();
  renderMapa();
}

function removerEndereco() {
  mapa[posicaoAtual.a]
    .ruas[posicaoAtual.r]
    .posicoes[posicaoAtual.p] = null;
  salvar();
  fecharModal();
  renderMapa();
}

/* INIT */
renderMapa();
renderLotes();
