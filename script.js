// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};

let enderecoAtual = null;

// ================= UTIL =================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ================= LOTES =================
function cadastrarLote() {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);

  if (!nome || qtd <= 0) {
    alert('Informe nome e quantidade');
    return;
  }

  if (lotes[nome]) {
    alert('Lote já existe');
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
  Object.entries(lotes).forEach(([nome, data]) => {
    listaLotes.innerHTML += `<div>${nome} — ${data.total}</div>`;
  });
}

// ================= ÁREA =================
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return;

  mapa.push({
    nome,
    ruas: []
  });

  areaNome.value = '';
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (!confirm('Excluir área?')) return;
  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

// ================= RUA =================
function criarRua(a) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));

  if (!nome || qtd <= 0) return;

  mapa[a].ruas.push({
    nome,
    enderecos: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

function excluirRua(a, r) {
  if (!confirm('Excluir rua?')) return;
  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

// ================= MODAL =================
function abrirModal(a, r, e) {
  enderecoAtual = { a, r, e };

  modalLote.innerHTML = '<option value="">Selecione o lote</option>';
  Object.keys(lotes).forEach(l => {
    modalLote.innerHTML += `<option value="${l}">${l}</option>`;
  });

  modalQtd.value = '';
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
  enderecoAtual = null;
}

function salvarEndereco() {
  const lote = modalLote.value;
  const qtd = Number(modalQtd.value);

  if (!lote || qtd <= 0) {
    alert('Dados inválidos');
    return;
  }

  const { a, r, e } = enderecoAtual;

  mapa[a].ruas[r].enderecos[e] = { lote, qtd };

  salvar();
  fecharModal();
  renderMapa();
}

// ================= RENDER =================
function renderMapa() {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <div>
          <button onclick="criarRua(${a})">+ Rua</button>
          <button class="danger" onclick="excluirArea(${a})">Excluir</button>
        </div>
      </div>
    `;

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          <strong>${rua.nome}</strong>
          <button class="danger" onclick="excluirRua(${a},${r})">Excluir</button>
        </div>
      `;

      const endDiv = document.createElement('div');
      endDiv.className = 'enderecos';

      rua.enderecos.forEach((end, e) => {
        const d = document.createElement('div');
        d.className = 'endereco';
        if (end) d.classList.add('ocupado');

        d.onclick = () => abrirModal(a, r, e);
        endDiv.appendChild(d);
      });

      ruaDiv.appendChild(endDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapaDiv.appendChild(areaDiv);
  });
}

// ================= INIT =================
renderLotes();
renderMapa();
