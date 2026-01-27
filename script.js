// ==========================
// ESTADO
// ==========================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};

// ==========================
// SALVAR
// ==========================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ==========================
// CADASTRAR LOTE
// ==========================
function cadastrarLote() {
  const nome = document.getElementById('loteNome').value.trim();
  const qtd = Number(document.getElementById('loteQtd').value);

  if (!nome || qtd <= 0) {
    alert('Informe nome do lote e quantidade válida');
    return;
  }

  if (lotes[nome]) {
    alert('Este lote já existe');
    return;
  }

  lotes[nome] = {
    total: qtd
  };

  document.getElementById('loteNome').value = '';
  document.getElementById('loteQtd').value = '';

  salvar();
  renderLotes();
}

// ==========================
// RENDER LOTES
// ==========================
function renderLotes() {
  const div = document.getElementById('listaLotes');
  div.innerHTML = '';

  const nomes = Object.keys(lotes);

  if (nomes.length === 0) {
    div.innerHTML = '<em>Nenhum lote cadastrado</em>';
    return;
  }

  nomes.forEach(nome => {
    const item = document.createElement('div');
    item.className = 'lote-item';
    item.innerHTML = `<strong>${nome}</strong> — ${lotes[nome].total} gaylords`;
    div.appendChild(item);
  });
}

// ==========================
// CRIAR ÁREA
// ==========================
function criarArea() {
  const nome = document.getElementById('areaNome').value.trim();
  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  mapa.push({
    nome,
    ruas: []
  });

  document.getElementById('areaNome').value = '';
  salvar();
  renderMapa();
}

// ==========================
// EXCLUIR ÁREA
// ==========================
function excluirArea(areaIndex) {
  if (!confirm('Excluir esta área?')) return;

  mapa.splice(areaIndex, 1);
  salvar();
  renderMapa();
}

// ==========================
// CRIAR RUA
// ==========================
function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de endereços'));
  if (!qtd || qtd <= 0) return;

  mapa[areaIndex].ruas.push({
    nome,
    enderecos: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

// ==========================
// EXCLUIR RUA
// ==========================
function excluirRua(areaIndex, ruaIndex) {
  if (!confirm('Excluir esta rua?')) return;

  mapa[areaIndex].ruas.splice(ruaIndex, 1);
  salvar();
  renderMapa();
}

// ==========================
// RENDER MAPA
// ==========================
function renderMapa() {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.innerHTML = '';

  mapa.forEach((area, aIndex) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>Área: ${area.nome}</strong>
        <div>
          <button onclick="criarRua(${aIndex})">+ Rua</button>
          <button class="danger" onclick="excluirArea(${aIndex})">Excluir Área</button>
        </div>
      </div>
    `;

    area.ruas.forEach((rua, rIndex) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          <strong>Rua: ${rua.nome}</strong>
          <button class="danger" onclick="excluirRua(${aIndex}, ${rIndex})">Excluir Rua</button>
        </div>
      `;

      const enderecosDiv = document.createElement('div');
      enderecosDiv.className = 'enderecos';

      rua.enderecos.forEach(() => {
        const e = document.createElement('div');
        e.className = 'endereco';
        enderecosDiv.appendChild(e);
      });

      ruaDiv.appendChild(enderecosDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapaDiv.appendChild(areaDiv);
  });
}

// ==========================
// INIT
// ==========================
renderLotes();
renderMapa();
