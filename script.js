// ===== ESTADO =====
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let enderecoAtual = null;

// ===== ELEMENTOS =====
const mapaDiv = document.getElementById('mapa');
const modal = document.getElementById('modal');
const modalLote = document.getElementById('modalLote');
const modalRz = document.getElementById('modalRz');
const modalVolume = document.getElementById('modalVolume');

// ===== UTIL =====
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ===== ÁREA =====
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Informe o nome da área');

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';
  salvar();
  renderMapa();
}

// ===== RUA =====
function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));

  if (!nome || qtd <= 0) return;

  mapa[areaIndex].ruas.push({
    nome,
    enderecos: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

function excluirRua(a, r) {
  if (!confirm('Excluir esta rua?')) return;
  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

// ===== LOTE =====
function criarLote() {
  const nome = loteNome.value.trim();
  const qtd = Number(loteQtd.value);

  if (!nome || qtd <= 0) {
    return alert('Informe nome e quantidade');
  }

  lotes[nome] = { total: qtd };
  loteNome.value = '';
  loteQtd.value = '';
  salvar();
  alert('Lote cadastrado');
}

// ===== MAPA =====
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';
    areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Criar Rua';
    btnRua.onclick = () => criarRua(a);
    areaDiv.appendChild(btnRua);

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div>
          Rua ${rua.nome}
          <button onclick="excluirRua(${a},${r})">Excluir</button>
        </div>
      `;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.enderecos.forEach((end, e) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (end) d.classList.add('ocupada');

        d.onclick = () => abrirModal(a, r, e);
        posDiv.appendChild(d);
      });

      ruaDiv.appendChild(posDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapaDiv.appendChild(areaDiv);
  });
}

// ===== MODAL =====
function abrirModal(a, r, e) {
  enderecoAtual = { a, r, e };

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l =>
    modalLote.innerHTML += `<option value="${l}">${l}</option>`
  );

  modalRz.value = '';
  modalVolume.value = '';

  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

// ===== ENDEREÇAR =====
function salvarEndereco() {
  const lote = modalLote.value;
  const rz = modalRz.value.trim();
  const volume = modalVolume.value.trim() || null;

  if (!lote) return alert('Selecione um lote');
  if (!rz) return alert('RZ é obrigatório');

  mapa[enderecoAtual.a]
    .ruas[enderecoAtual.r]
    .enderecos[enderecoAtual.e] = { lote, rz, volume };

  salvar();
  fecharModal();
  renderMapa();
}

// ===== INIT =====
renderMapa();
