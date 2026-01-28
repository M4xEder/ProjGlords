// ======================
// ESTADO GLOBAL
// ======================
let areas = JSON.parse(localStorage.getItem('areas')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];

let posicaoAtual = null;

// ======================
// STORAGE
// ======================
function salvar() {
  localStorage.setItem('areas', JSON.stringify(areas));
  localStorage.setItem('lotes', JSON.stringify(lotes));
  localStorage.setItem('historicoExpedidos', JSON.stringify(historicoExpedidos));
}

// ======================
// UTIL
// ======================
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

function contarAlocados(lote) {
  let total = 0;
  areas.forEach(a =>
    a.ruas.forEach(r =>
      r.posicoes.forEach(p => {
        if (p && p.lote === lote) total++;
      })
    )
  );
  return total;
}

// ======================
// LOTES
// ======================
function cadastrarLote() {
  const nome = document.getElementById('loteNome').value.trim();
  const total = Number(document.getElementById('loteTotal').value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida');
    return;
  }

  if (lotes[nome]) {
    alert('Lote já existe');
    return;
  }

  lotes[nome] = {
    total,
    cor: gerarCor()
  };

  document.getElementById('loteNome').value = '';
  document.getElementById('loteTotal').value = '';

  salvar();
  renderLotes();
}

function excluirLote(nome) {
  if (contarAlocados(nome) > 0) {
    alert('Não é possível excluir lote com gaylords alocadas');
    return;
  }

  if (!confirm(`Excluir lote ${nome}?`)) return;

  delete lotes[nome];
  salvar();
  renderLotes();
}

function alterarQuantidadeLote(nome) {
  const novoTotal = Number(prompt('Nova quantidade total'));
  if (novoTotal <= 0) return;

  const usados = contarAlocados(nome);
  if (novoTotal < usados) {
    alert(`Já existem ${usados} alocados`);
    return;
  }

  lotes[nome].total = novoTotal;
  salvar();
  renderLotes();
}

// ======================
// ÁREAS / RUAS
// ======================
function criarArea() {
  const nome = document.getElementById('areaNome').value.trim();
  if (!nome) return;

  areas.push({ nome, ruas: [] });
  document.getElementById('areaNome').value = '';
  salvar();
  renderAreas();
}

function excluirArea(index) {
  const temOcupado = areas[index].ruas.some(r =>
    r.posicoes.some(p => p)
  );

  if (temOcupado) {
    alert('Área possui gaylords alocadas');
    return;
  }

  if (!confirm('Excluir área?')) return;

  areas.splice(index, 1);
  salvar();
  renderAreas();
}

function criarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de endereços'));

  if (!nome || qtd <= 0) return;

  areas[areaIndex].ruas.push({
    nome,
    posicoes: Array(qtd).fill(null)
  });

  salvar();
  renderAreas();
}

function excluirRua(a, r) {
  const temOcupado = areas[a].ruas[r].posicoes.some(p => p);
  if (temOcupado) {
    alert('Rua possui gaylords alocadas');
    return;
  }

  if (!confirm('Excluir rua?')) return;

  areas[a].ruas.splice(r, 1);
  salvar();
  renderAreas();
}

// ======================
// RENDER
// ======================
function renderAreas() {
  const container = document.getElementById('mapa');
  container.innerHTML = '';

  areas.forEach((area, a) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <h3>${area.nome}
        <button onclick="excluirArea(${a})">Excluir Área</button>
      </h3>
    `;

    area.ruas.forEach((rua, r) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <strong>${rua.nome}</strong>
        <button onclick="excluirRua(${a},${r})">Excluir Rua</button>
      `;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, p) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (pos) {
          d.style.background = lotes[pos.lote]?.cor || '#ccc';
          d.dataset.lote = pos.lote;
          d.dataset.rz = pos.rz;
          d.dataset.volume = pos.volume || '';
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
    container.appendChild(areaDiv);
  });
}

function renderLotes() {
  const div = document.getElementById('lotesAtivos');
  div.innerHTML = '';

  Object.entries(lotes).forEach(([nome, data]) => {
    const usados = contarAlocados(nome);

    div.innerHTML += `
      <div class="lote-card">
        <strong>${nome}</strong><br>
        ${usados} / ${data.total}
        <div class="acoes">
          <button onclick="alterarQuantidadeLote('${nome}')">Editar</button>
          <button onclick="excluirLote('${nome}')">Excluir</button>
          <button onclick="expedirLote('${nome}')">Expedir</button>
        </div>
      </div>
    `;
  });
}

// ======================
// MODAL
// ======================
function abrirModal(a, r, p) {
  posicaoAtual = { a, r, p };
  const pos = areas[a].ruas[r].posicoes[p];

  document.getElementById('modal').classList.remove('hidden');

  document.getElementById('modalRz').value = pos?.rz || '';
  document.getElementById('modalVolume').value = pos?.volume || '';

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  Object.keys(lotes).forEach(l => {
    const usados = contarAlocados(l);
    if (usados < lotes[l].total || pos?.lote === l) {
      select.innerHTML += `<option value="${l}" ${pos?.lote === l ? 'selected' : ''}>${l}</option>`;
    }
  });
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

function salvarEndereco() {
  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!rz) {
    alert('RZ é obrigatório');
    return;
  }

  const pos = areas[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p];

  if (pos && pos.lote && pos.lote !== lote) {
    alert('Endereço já ocupado');
    return;
  }

  areas[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p] = {
    lote,
    rz,
    volume
  };

  salvar();
  fecharModal();
  renderAreas();
  renderLotes();
}

function removerEndereco() {
  areas[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p] = null;
  salvar();
  fecharModal();
  renderAreas();
  renderLotes();
}

// ======================
// BUSCA
// ======================
function buscar() {
  const termo = document.getElementById('busca').value.toLowerCase();
  document.querySelectorAll('.posicao').forEach(p => p.classList.remove('highlight'));

  if (!termo) return;

  document.querySelectorAll('.posicao').forEach(p => {
    if (
      (p.dataset.lote || '').toLowerCase().includes(termo) ||
      (p.dataset.rz || '').toLowerCase().includes(termo) ||
      (p.dataset.volume || '').toLowerCase().includes(termo)
    ) {
      p.classList.add('highlight');
    }
  });
}

// ======================
// EXPEDIÇÃO
// ======================
function expedirLote(nome) {
  let expedidos = [];
  let qtd = 0;

  areas.forEach(a =>
    a.ruas.forEach(r =>
      r.posicoes.forEach((p, i) => {
        if (p && p.lote === nome) {
          expedidos.push({ rz: p.rz, volume: p.volume });
          r.posicoes[i] = null;
          qtd++;
        }
      })
    )
  );

  if (qtd === 0) {
    alert('Nenhuma gaylord alocada');
    return;
  }

  lotes[nome].total -= qtd;
  const parcial = lotes[nome].total > 0;

  historicoExpedidos.push({
    lote: nome,
    quantidade: qtd,
    restante: lotes[nome].total,
    parcial,
    data: new Date().toLocaleString(),
    itens: expedidos
  });

  if (lotes[nome].total <= 0) delete lotes[nome];

  salvar();
  renderAreas();
  renderLotes();
  renderExpedidos();
}

// ======================
// HISTÓRICO
// ======================
function renderExpedidos() {
  const div = document.getElementById('lotesExpedidos');
  if (!div) return;

  div.innerHTML = '';

  historicoExpedidos.forEach(h => {
    div.innerHTML += `
      <div class="lote-card">
        <strong>${h.lote}</strong><br>
        Expedidos: ${h.quantidade}<br>
        ${h.parcial ? 'Parcial<br>' : ''}
        ${h.data}
        <details>
          <summary>RZ / Volumes</summary>
          ${h.itens.map(i => `RZ:${i.rz} Vol:${i.volume || '-'}`).join('<br>')}
        </details>
      </div>
    `;
  });
}

// ======================
renderAreas();
renderLotes();
renderExpedidos();
