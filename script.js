// =======================
// ESTADO
// =======================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];

// =======================
// SALVAR
// =======================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
}

// =======================
// CRIAR ÁREA
// =======================
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Informe o nome da área');

  mapa.push({
    nome,
    ruas: []
  });

  areaNome.value = '';
  salvar();
  render();
}

// =======================
// EXCLUIR ÁREA
// =======================
function excluirArea(index) {
  if (!confirm('Excluir esta área?')) return;

  mapa.splice(index, 1);
  salvar();
  render();
}

// =======================
// CRIAR RUA
// =======================
function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de endereços'));
  if (qtd <= 0) return alert('Quantidade inválida');

  mapa[areaIndex].ruas.push({
    nome,
    enderecos: Array(qtd).fill(null)
  });

  salvar();
  render();
}

// =======================
// EXCLUIR RUA
// =======================
function excluirRua(areaIndex, ruaIndex) {
  if (!confirm('Excluir esta rua?')) return;

  mapa[areaIndex].ruas.splice(ruaIndex, 1);
  salvar();
  render();
}

// =======================
// RENDER
// =======================
function render() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, aIndex) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <div>
          <button onclick="criarRua(${aIndex})">+ Rua</button>
          <button onclick="excluirArea(${aIndex})">Excluir Área</button>
        </div>
      </div>
    `;

    area.ruas.forEach((rua, rIndex) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          <span>Rua ${rua.nome}</span>
          <button onclick="excluirRua(${aIndex}, ${rIndex})">Excluir Rua</button>
        </div>
      `;

      const enderecosDiv = document.createElement('div');
      enderecosDiv.className = 'enderecos';

      rua.enderecos.forEach((_, eIndex) => {
        const e = document.createElement('div');
        e.className = 'endereco';
        e.title = `Endereço ${eIndex + 1}`;
        enderecosDiv.appendChild(e);
      });

      ruaDiv.appendChild(enderecosDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapaDiv.appendChild(areaDiv);
  });
}

// =======================
// INIT
// =======================
const mapaDiv = document.getElementById('mapa');
render();
