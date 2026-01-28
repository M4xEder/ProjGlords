// =======================
// ESTADO GLOBAL
// =======================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let posicaoAtual = null;

// =======================
// SALVAR
// =======================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
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

  mapa.push({
    nome,
    ruas: []
  });

  areaNome.value = '';
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (!confirm('Excluir esta área e todas as ruas?')) return;

  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

// =======================
// RUA
// =======================
function criarRua(a) {
  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de endereços'));
  if (!qtd || qtd <= 0) {
    alert('Quantidade inválida');
    return;
  }

  mapa[a].ruas.push({
    nome,
    posicoes: Array(qtd).fill(null)
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

// =======================
// MAPA VISUAL
// =======================
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    // Cabeçalho da área
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const titulo = document.createElement('strong');
    titulo.textContent = area.nome;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    header.appendChild(titulo);
    header.appendChild(btnExcluirArea);
    areaDiv.appendChild(header);

    // Ruas
    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const ruaHeader = document.createElement('div');
      ruaHeader.style.display = 'flex';
      ruaHeader.style.justifyContent = 'space-between';
      ruaHeader.style.alignItems = 'center';

      ruaHeader.innerHTML = `<span>Rua ${rua.nome}</span>`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => excluirRua(a, r);

      ruaHeader.appendChild(btnExcluirRua);
      ruaDiv.appendChild(ruaHeader);

      // Endereços
      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const posDiv = document.createElement('div');
        posDiv.className = 'posicao';

        if (pos) {
          posDiv.classList.add('ocupada');
          posDiv.title = `RZ: ${pos.rz}`;
        }

        posDiv.onclick = () => abrirModal(a, r, p);
        posicoesDiv.appendChild(posDiv);
      });

      ruaDiv.appendChild(posicoesDiv);
      areaDiv.appendChild(ruaDiv);
    });

    // Botão criar rua
    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => criarRua(a);

    areaDiv.appendChild(btnRua);
    mapaDiv.appendChild(areaDiv);
  });
}

// =======================
// MODAL (ENDEREÇO)
// =======================
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };

  const pos = mapa[a].ruas[r].posicoes[p];

  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';

  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

// =======================
// SALVAR ENDEREÇO
// =======================
function salvarEndereco() {
  const rz = modalRz.value.trim();
  const volume = modalVolume.value.trim() || null;

  if (!rz) {
    alert('RZ é obrigatório');
    return;
  }

  const { a, r, p } = posicaoAtual;

  if (mapa[a].ruas[r].posicoes[p]) {
    alert('Endereço já ocupado');
    return;
  }

  mapa[a].ruas[r].posicoes[p] = { rz, volume };

  salvar();
  fecharModal();
  renderMapa();
}

// =======================
// REMOVER ENDEREÇO
// =======================
function removerEndereco() {
  const { a, r, p } = posicaoAtual;

  if (!mapa[a].ruas[r].posicoes[p]) {
    alert('Endereço já está vazio');
    return;
  }

  if (!confirm('Remover gaylord deste endereço?')) return;

  mapa[a].ruas[r].posicoes[p] = null;

  salvar();
  fecharModal();
  renderMapa();
}

// =======================
// INIT
// =======================
renderMapa();
