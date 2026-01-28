// =======================
// ESTADO GLOBAL
// =======================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

// =======================
// SALVAR
// =======================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// =======================
// ÁREA
// =======================
function criarArea() {
  const nome = document.getElementById('areaNome').value.trim();
  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  mapa.push({ nome, ruas: [] });
  document.getElementById('areaNome').value = '';

  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (!confirm('Excluir esta área e todas as ruas dentro dela?')) return;

  mapa.splice(a, 1);
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

function excluirRua(a, r) {
  if (!confirm('Excluir esta rua e todos os endereços?')) return;

  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

// =======================
// LOTE
// =======================
function criarLote() {
  const nome = document.getElementById('loteNome').value.trim();
  const qtd = Number(document.getElementById('loteQtd').value);

  if (!nome || qtd <= 0) {
    alert('Informe nome e quantidade');
    return;
  }

  lotes[nome] = { total: qtd };

  document.getElementById('loteNome').value = '';
  document.getElementById('loteQtd').value = '';

  salvar();
  renderLotes();
}

// =======================
// MAPA (COM BOTÕES)
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

    // Cabeçalho da área
    const headerArea = document.createElement('div');
    headerArea.style.display = 'flex';
    headerArea.style.justifyContent = 'space-between';
    headerArea.style.alignItems = 'center';

    headerArea.innerHTML = `<strong>${area.nome}</strong>`;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    headerArea.appendChild(btnExcluirArea);
    areaDiv.appendChild(headerArea);

    // Ruas
    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const headerRua = document.createElement('div');
      headerRua.style.display = 'flex';
      headerRua.style.justifyContent = 'space-between';
      headerRua.style.alignItems = 'center';

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
        const posEl = document.createElement('div');
        posEl.className = 'posicao';
        if (pos) posEl.classList.add('ocupada');

        posEl.onclick = () => abrirModal(a, r, p);
        posDiv.appendChild(posEl);
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

// =======================
// LOTES VISUAIS
// =======================
function renderLotes() {
  const lista = document.getElementById('listaLotes');
  lista.innerHTML = '';

  const nomes = Object.keys(lotes);
  if (nomes.length === 0) {
    lista.innerHTML = '<p>Nenhum lote cadastrado</p>';
    return;
  }

  nomes.forEach(nome => {
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.textContent = `${nome} - ${lotes[nome].total}`;
    lista.appendChild(div);
  });
}

// =======================
// MODAL (TEMP)
// =======================
function abrirModal(a, r, p) {
  alert(
    `Área: ${mapa[a].nome}\n` +
    `Rua: ${mapa[a].ruas[r].nome}\n` +
    `Posição: ${p + 1}`
  );
}

// =======================
// INIT
// =======================
renderMapa();
renderLotes();
