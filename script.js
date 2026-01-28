const mapaDiv = document.getElementById('mapa');

let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

/* LOTES */
btnCriarLote.onclick = () => {
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

/* ÁREA */
btnCriarArea.onclick = () => {
  const nome = areaNome.value.trim();
  if (!nome) return;

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';

  salvar();
  renderMapa();
};

/* RUA */
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

/* VALIDAÇÕES */
function ruaTemGaylord(a, r) {
  return mapa[a].ruas[r].posicoes.some(p => p);
}

function areaTemGaylord(a) {
  return mapa[a].ruas.some(rua =>
    rua.posicoes.some(p => p)
  );
}

/* EXCLUSÕES */
function excluirRua(a, r) {
  if (ruaTemGaylord(a, r)) {
    alert('Rua possui gaylords alocadas');
    return;
  }
  if (!confirm('Excluir rua?')) return;

  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (areaTemGaylord(a)) {
    alert('Área possui gaylords alocadas');
    return;
  }
  if (!confirm('Excluir área?')) return;

  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

/* MAPA */
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    const header = document.createElement('div');
    header.className = 'area-header';

    header.innerHTML = `<strong>${area.nome}</strong>`;
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir Área';
    btnExcluir.className = 'danger';
    btnExcluir.onclick = () => excluirArea(a);

    header.appendChild(btnExcluir);
    areaDiv.appendChild(header);

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const ruaHeader = document.createElement('div');
      ruaHeader.className = 'rua-header';
      ruaHeader.textContent = `Rua ${rua.nome}`;

      const btnRua = document.createElement('button');
      btnRua.textContent = 'Excluir Rua';
      btnRua.className = 'danger';
      btnRua.onclick = () => excluirRua(a, r);

      ruaHeader.appendChild(btnRua);
      ruaDiv.appendChild(ruaHeader);

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

    const btnNovaRua = document.createElement('button');
    btnNovaRua.textContent = 'Adicionar Rua';
    btnNovaRua.onclick = () => criarRua(a);

    areaDiv.appendChild(btnNovaRua);
    mapaDiv.appendChild(areaDiv);
  });
}

/* MODAL */
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };
  modal.classList.remove('hidden');

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l =>
    modalLote.innerHTML += `<option>${l}</option>`
  );
}

btnFecharModal.onclick = () => modal.classList.add('hidden');

btnSalvarEndereco.onclick = () => {
  if (!modalLote.value || !modalRz.value) return alert('Obrigatório');

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

/* INIT */
renderLotes();
renderMapa();
