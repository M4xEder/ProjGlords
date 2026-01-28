// ================= ELEMENTOS =================
const mapaDiv = document.getElementById('mapa');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const btnCriarLote = document.getElementById('btnCriarLote');
const listaLotes = document.getElementById('listaLotes');

const areaNome = document.getElementById('areaNome');
const btnCriarArea = document.getElementById('btnCriarArea');

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
    alert('Informe nome do lote e quantidade válida');
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

  Object.entries(lotes).forEach(([nome, data]) => {
    const div = document.createElement('div');
    div.textContent = `${nome} (${data.total})`;
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

// ================= EXCLUSÕES =================
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

    const tituloArea = document.createElement('strong');
    tituloArea.textContent = area.nome;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    areaHeader.appendChild(tituloArea);
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

  const pos = mapa[a].ruas[r].posicoes[p];

  modalLote.innerHTML = '<option value="">Selecione o lote</option>';
  Object.keys(lotes).forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote;
    opt.textContent = lote;
    modalLote.appendChild(opt);
  });

  if (pos) {
    modalLote.value = pos.lote;
    modalRz.value = pos.rz;
    modalVolume.value = pos.volume || '';
  } else {
    modalLote.value = '';
    modalRz.value = '';
    modalVolume.value = '';
  }
}

btnFecharModal.onclick = () => {
  modal.classList.add('hidden');
};

// ================= ENDEREÇAMENTO =================
btnSalvarEndereco.onclick = () => {
  const { a, r, p } = posicaoAtual;
  const posAtual = mapa[a].ruas[r].posicoes[p];

  if (posAtual) {
    alert('Este endereço já está ocupado. Remova a gaylord antes de alterar.');
    return;
  }

  if (!modalLote.value || !modalRz.value) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  mapa[a].ruas[r].posicoes[p] = {
    lote: modalLote.value,
    rz: modalRz.value,
    volume: modalVolume.value || null
  };

  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

btnRemoverEndereco.onclick = () => {
  const { a, r, p } = posicaoAtual;
  const posAtual = mapa[a].ruas[r].posicoes[p];

  if (!posAtual) {
    alert('Não há gaylord para remover');
    return;
  }

  if (!confirm('Remover esta gaylord do endereço?')) return;

  mapa[a].ruas[r].posicoes[p] = null;

  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

// ================= INIT =================
renderLotes();
renderMapa();
