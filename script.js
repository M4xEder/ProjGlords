// =======================
// ESTADO GLOBAL
// =======================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};

// =======================
// UTIL
// =======================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
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

function excluirArea(index) {
  if (!confirm('Excluir esta área?')) return;
  mapa.splice(index, 1);
  salvar();
  renderMapa();
}

// =======================
// RUA
// =======================
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

function excluirRua(areaIndex, ruaIndex) {
  if (!confirm('Excluir esta rua?')) return;
  mapa[areaIndex].ruas.splice(ruaIndex, 1);
  salvar();
  renderMapa();
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

// =======================
// RENDER
// =======================
function renderMapa() {
  mapaDiv = document.getElementById('mapa');
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

      ruaDiv.innerHTML = `
        Rua ${rua.nome}
        <button class="danger" onclick="excluirRua(${a},${r})">Excluir Rua</button>
      `;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach(() => {
        const p = document.createElement('div');
        p.className = 'posicao';
        posDiv.appendChild(p);
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
    div.innerHTML = `
      <strong>${nome}</strong><br>
      Quantidade: ${lotes[nome].total}
    `;
    listaLotes.appendChild(div);
  });
}

// =======================
// INIT
// =======================
renderMapa();
renderLotes();
