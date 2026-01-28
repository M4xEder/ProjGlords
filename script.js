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
// MAPA (CORRIGIDO)
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

    areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `Rua ${rua.nome}`;

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
// LOTES
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
// MODAL (placeholder)
// =======================
function abrirModal(a, r, p) {
  alert(`Endereço clicado: Área ${a + 1}, Rua ${r + 1}, Posição ${p + 1}`);
}

// =======================
// INIT
// =======================
renderMapa();
renderLotes();
