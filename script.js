// ================= ELEMENTOS =================
const mapaDiv = document.getElementById('mapa');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const btnCriarLote = document.getElementById('btnCriarLote');
const listaLotes = document.getElementById('listaLotes');

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
  Object.entries(lotes).forEach(([nome, data]) => {
    const div = document.createElement('div');
    div.textContent = `${nome} (${data.total})`;
    listaLotes.appendChild(div);
  });
}

// ================= ÁREA =================
btnCriarArea.onclick = () => {
  if (!areaNome.value.trim()) return;
  mapa.push({ nome: areaNome.value.trim(), ruas: [] });
  areaNome.value = '';
  salvar();
  renderMapa();
};

// ================= RUA =================
function criarRua(a) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));
  if (!nome || qtd <= 0) return;

  mapa[a].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
  salvar();
  renderMapa();
}

// ================= EXCLUSÕES =================
function excluirRua(a, r) {
  if (mapa[a].ruas[r].posicoes.some(p => p)) {
    alert('Rua possui gaylords alocadas');
    return;
  }
  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (mapa[a].ruas.some(rua => rua.posicoes.some(p => p))) {
    alert('Área possui gaylords alocadas');
    return;
  }
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
      ruaHeader.innerHTML = `Rua ${rua.nome}`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => excluirRua(a, r);
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

  const pos = mapa[a].ruas[r].posicoes[p];
  modalLote.value = pos?.lote || '';
  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';
}

btnSalvarEndereco.onclick = () => {
  const { a, r, p } = posicaoAtual;
  if (mapa[a].ruas[r].posicoes[p]) {
    alert('Endereço ocupado. Remova antes.');
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
  if (!mapa[a].ruas[r].posicoes[p]) return;
  mapa[a].ruas[r].posicoes[p] = null;
  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

btnFecharModal.onclick = () => modal.classList.add('hidden');

// ================= BUSCA =================
btnBuscar.onclick = () => {
  const termo = buscaInput.value.toLowerCase();
  document.querySelectorAll('.posicao').forEach(p => p.classList.remove('highlight'));

  mapa.forEach((area, a) => {
    area.ruas.forEach((rua, r) => {
      rua.posicoes.forEach((pos, p) => {
        if (pos && pos.lote.toLowerCase().includes(termo)) {
          mapaDiv
            .querySelectorAll('.area')[a]
            .querySelectorAll('.rua')[r]
            .querySelectorAll('.posicao')[p]
            .classList.add('highlight');
        }
      });
    });
  });
};

btnLimparBusca.onclick = () =>
  document.querySelectorAll('.posicao').forEach(p => p.classList.remove('highlight'));

// ================= INIT =================
renderLotes();
renderMapa();
