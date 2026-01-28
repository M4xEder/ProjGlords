// ================= ELEMENTOS =================
const mapaDiv = document.getElementById('mapa');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const btnCriarLote = document.getElementById('btnCriarLote');
const listaLotes = document.getElementById('listaLotes');

const areaNome = document.getElementById('areaNome');
const btnCriarArea = document.getElementById('btnCriarArea');

const buscaInput = document.getElementById('buscaInput');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimparBusca = document.getElementById('btnLimparBusca');

const modal = document.getElementById('modal');
const modalLote = document.getElementById('modalLote');
const modalRz = document.getElementById('modalRz');
const modalVolume = document.getElementById('modalVolume');
const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');
const btnRemoverEndereco = document.getElementById('btnRemoverEndereco');
const btnFecharModal = document.getElementById('btnFecharModal');

// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let posicaoAtual = null;

// ================= UTIL =================
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,70%)`;
}

// ================= STORAGE =================
function salvar() {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
}

// ================= CONTADORES =================
function quantidadeAlocada(loteNome) {
  let total = 0;
  mapa.forEach(area =>
    area.ruas.forEach(rua =>
      rua.posicoes.forEach(pos => {
        if (pos && pos.lote === loteNome) total++;
      })
    )
  );
  return total;
}

function loteEmUso(nome) {
  return quantidadeAlocada(nome) > 0;
}

// ================= LOTES =================
btnCriarLote.onclick = () => {
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

  lotes[nome] = { total: qtd, cor: gerarCor() };

  loteNome.value = '';
  loteQtd.value = '';

  salvar();
  renderLotes();
  renderMapa();
};

function renderLotes() {
  listaLotes.innerHTML = '';

  Object.entries(lotes).forEach(([nome, data]) => {
    const div = document.createElement('div');
    div.className = 'lote-item';

    const cor = document.createElement('span');
    cor.className = 'lote-cor';
    cor.style.background = data.cor;

    const usado = quantidadeAlocada(nome);

    const info = document.createElement('span');
    info.textContent = `${nome} (${usado}/${data.total})`;

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.onclick = () => {
      const novaQtd = Number(
        prompt(
          `Quantidade atual: ${data.total}\nAlocadas: ${usado}\n\nNova quantidade:`,
          data.total
        )
      );

      if (!novaQtd || novaQtd <= 0) return;

      if (novaQtd < usado) {
        alert(`Quantidade inválida. Existem ${usado} gaylords alocadas.`);
        return;
      }

      lotes[nome].total = novaQtd;
      salvar();
      renderLotes();
    };

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'danger';
    btnExcluir.onclick = () => {
      if (loteEmUso(nome)) {
        alert('Não é possível excluir. Lote possui gaylords alocadas.');
        return;
      }
      if (!confirm(`Excluir o lote "${nome}"?`)) return;

      delete lotes[nome];
      salvar();
      renderLotes();
      renderMapa();
    };

    div.appendChild(cor);
    div.appendChild(info);
    div.appendChild(btnEditar);
    div.appendChild(btnExcluir);
    listaLotes.appendChild(div);
  });
}

// ================= ÁREA =================
btnCriarArea.onclick = () => {
  const nome = areaNome.value.trim();
  if (!nome) return;

  mapa.push({ nome, ruas: [] });
  areaNome.value = '';
  salvar();
  renderMapa();
};

// ================= RUA =================
function criarRua(a) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));
  if (!nome || qtd <= 0) return;

  mapa[a].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
  salvar();
  renderMapa();
}

function excluirRua(a, r) {
  if (mapa[a].ruas[r].posicoes.some(p => p)) {
    alert('Rua possui gaylords alocadas');
    return;
  }
  mapa[a].ruas.splice(r, 1);
  salvar();
  renderMapa();
}

function excluirArea(a) {
  if (mapa[a].ruas.some(rua => rua.posicoes.some(p => p))) {
    alert('Área possui gaylords alocadas');
    return;
  }
  mapa.splice(a, 1);
  salvar();
  renderMapa();
}

// ================= MAPA =================
function renderMapa() {
  mapaDiv.innerHTML = '';

  mapa.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    const header = document.createElement('div');
    header.className = 'area-header';
    header.innerHTML = `<strong>${area.nome}</strong>`;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => excluirArea(a);

    header.appendChild(btnExcluirArea);
    areaDiv.appendChild(header);

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const ruaHeader = document.createElement('div');
      ruaHeader.className = 'rua-header';
      ruaHeader.innerHTML = `Rua ${rua.nome}`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => excluirRua(a, r);

      ruaHeader.appendChild(btnExcluirRua);
      ruaDiv.appendChild(ruaHeader);

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (pos) {
          d.classList.add('ocupada');
          d.style.background = lotes[pos.lote]?.cor || '#ccc';
        }

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
  modal.classList.remove('hidden');

  modalLote.innerHTML = '<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l =>
    modalLote.innerHTML += `<option value="${l}">${l}</option>`
  );

  const pos = mapa[a].ruas[r].posicoes[p];
  modalLote.value = pos?.lote || '';
  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';
}

btnSalvarEndereco.onclick = () => {
  const { a, r, p } = posicaoAtual;

  if (mapa[a].ruas[r].posicoes[p]) {
    alert('Endereço ocupado. Remova antes.');
    return;
  }

  if (!modalLote.value || !modalRz.value) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  const lote = modalLote.value;
  const alocados = quantidadeAlocada(lote);
  const limite = lotes[lote].total;

  if (alocados >= limite) {
    alert(
      `Lote "${lote}" já possui ${alocados} gaylords alocadas.\n` +
      `Limite do lote: ${limite}.`
    );
    return;
  }

  mapa[a].ruas[r].posicoes[p] = {
    lote,
    rz: modalRz.value,
    volume: modalVolume.value || null
  };

  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

btnRemoverEndereco.onclick = () => {
  const { a, r, p } = posicaoAtual;
  if (!mapa[a].ruas[r].posicoes[p]) return;

  mapa[a].ruas[r].posicoes[p] = null;
  salvar();
  modal.classList.add('hidden');
  renderMapa();
};

btnFecharModal.onclick = () => modal.classList.add('hidden');

// ================= BUSCA =================
btnBuscar.onclick = () => {
  const termo = buscaInput.value.trim().toLowerCase();
  limparDestaques();
  if (!termo) return;

  mapa.forEach((area, a) => {
    area.ruas.forEach((rua, r) => {
      rua.posicoes.forEach((pos, p) => {
        if (!pos) return;

        if (
          pos.lote.toLowerCase().includes(termo) ||
          pos.rz.toLowerCase().includes(termo) ||
          (pos.volume || '').toString().includes(termo)
        ) {
          mapaDiv
            .querySelectorAll('.area')[a]
            .querySelectorAll('.rua')[r]
            .querySelectorAll('.posicao')[p]
            .classList.add('highlight');
        }
      });
    });
  });
};

btnLimparBusca.onclick = limparDestaques;

function limparDestaques() {
  document
    .querySelectorAll('.posicao.highlight')
    .forEach(p => p.classList.remove('highlight'));
}

// ================= INIT =================
renderLotes();
renderMapa();
