// ==========================
// ESTADO
// ==========================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];

// ==========================
// SALVAR
// ==========================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
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
  renderizarMapa();
}

// ==========================
// EXCLUIR ÁREA
// ==========================
function excluirArea(index) {
  if (!confirm('Deseja excluir esta área?')) return;

  mapa.splice(index, 1);
  salvar();
  renderizarMapa();
}

// ==========================
// RENDER MAPA
// ==========================
function renderizarMapa() {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.innerHTML = '';

  mapa.forEach((area, index) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea(${index})">Excluir Área</button>
      </div>
    `;

    mapaDiv.appendChild(areaDiv);
  });
}

// ==========================
// INIT
// ==========================
renderizarMapa();
