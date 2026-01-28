// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

// ================= SALVAR =================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ================= LOTE =================
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
  alert('Lote cadastrado');
}

// ================= ÁREA =================
function criarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Nome da área obrigatório');

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';
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
    posicoes: Array(qtd).fill(null)
  });

  salvar();
  renderMapa();
}

// ================= MAPA =================
function renderMapa() {
  mapaDiv.innerHTML = '';

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
        const d = document.createElement('div');
        d.className = 'posicao';
        if (pos) d.classList.add('ocupada');

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
  const pos = mapa[a].ruas[r].posicoes[p];

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    modalLote.appendChild(opt);
  });

  modalLote.value = pos?.lote || '';
  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';

  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

// ================= ENDEREÇAR =================
function salvarEndereco() {
  const lote = modalLote.value;
  const rz = modalRz.value.trim();

  if (!lote) return alert('Selecione um lote');
  if (!rz) return alert('RZ obrigatório');

  const { a, r, p } = posicaoAtual;

  if (mapa[a].ruas[r].posicoes[p]) {
    alert('Endereço já ocupado');
    return;
  }

  mapa[a].ruas[r].posicoes[p] = {
    lote,
    rz,
    volume: modalVolume.value || null
  };

  salvar();
  fecharModal();
  renderMapa();
}

function removerEndereco() {
  const { a, r, p } = posicaoAtual;
  mapa[a].ruas[r].posicoes[p] = null;
  salvar();
  fecharModal();
  renderMapa();
}

// ================= INIT =================
renderMapa();
