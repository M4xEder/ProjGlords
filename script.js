// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

// ================= STORAGE =================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ================= LOTES =================
btnCriarLote.onclick = () => {
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
};

function renderLotes() {
  listaLotes.innerHTML = '';
  Object.keys(lotes).forEach(lote => {
    const div = document.createElement('div');
    div.textContent = `${lote} (${lotes[lote].total})`;
    listaLotes.appendChild(div);
  });
}

// ================= ÁREA =================
btnCriarArea.onclick = () => {
  const nome = areaNome.value.trim();
  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';

  salvar();
  renderMapa();
};

// ================= RUA =================
function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));

  if (!nome || qtd <= 0) return;

  mapa[areaIndex].ruas.push({
    nome,
    posicoes: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

// ================= VALIDAÇÕES =================
function ruaTemGaylord(a, r) {
  return mapa[a].ruas[r].posicoes.some(p => p !== null);
}

function areaTemGaylord(a) {
  return mapa[a].ruas.some(rua =>
    rua.posicoes.some(p => p !== null)
  );
}

// ================= EXCLUSÃO =================
function excluirRua(a, r) {
  if (ruaTemGaylord(a, r)) {
    alert('Não é possível excluir a rua. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Excluir esta rua?')) return;

  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (areaTemGaylord(a)) {
    alert('Não é possível excluir a área. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Excluir esta área?')) return;

  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

// ================= MAPA =================
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    // HEADER ÁREA
    const areaHeader = document.createElement('div');
    areaHeader.className = 'area-header';

    const titulo = document.createElement('strong');
    titulo.textContent = area.nome;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    areaHeader.appendChild(titulo);
    areaHeader.appendChild(btnExcluirArea);
    areaDiv.appendChild(areaHeader);

    // RUAS
    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const ruaHeader = document.createElement('div');
      ruaHeader.className = 'rua-header';

      const ruaTitulo = document.createElement('span');
      ruaTitulo.textContent = `Rua ${rua.nome}`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => excluirRua(a, r);

      ruaHeader.appendChild(ruaTitulo);
      ruaHeader.appendChild(btnExcluirRua);
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

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => criarRua(a);

    areaDiv.appendChild(btnRua);
    mapaDiv.appendChild(areaDiv);
  });
}

// ================= MODAL =================
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
  if (!modalLote.value || !modalRz.value) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

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

// ================= INIT =================
const mapaDiv = document.getElementById('mapa');
renderLotes();
renderMapa();
