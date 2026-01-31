// =======================
// ESTADO GLOBAL
// =======================
let mapaSalvo = JSON.parse(localStorage.getItem('mapa')) || [];
let lotesCadastrados = JSON.parse(localStorage.getItem('lotes')) || {};
let historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];
let posicaoAtual = null;

// =======================
// UTILIDADES
// =======================
function salvarTudo() {
  localStorage.setItem('mapa', JSON.stringify(mapaSalvo));
  localStorage.setItem('lotes', JSON.stringify(lotesCadastrados));
  localStorage.setItem('historicoExpedidos', JSON.stringify(historicoExpedidos));
}

function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 70%)`;
}

// =======================
// CADASTRO DE LOTE
// =======================
function cadastrarLote() {
  const nome = loteNome.value.trim();
  const total = Number(loteTotal.value);
  if (!nome || total <= 0) return alert('Informe nome e quantidade');
  if (lotesCadastrados[nome]) return alert('Lote já existe');

  lotesCadastrados[nome] = { total, cor: gerarCor() };
  loteNome.value = '';
  loteTotal.value = '';
  salvarTudo();
  renderDashboard();
}

// Alterar quantidade de lote
function alterarQuantidadeLote(nome) {
  const alocados = contarGaylordsDoLote(nome);
  const novo = Number(
    prompt(
      `Quantidade nova para o lote "${nome}" (alocados: ${alocados})`,
      lotesCadastrados[nome].total
    )
  );
  if (isNaN(novo) || novo < alocados)
    return alert(`Quantidade inválida! Deve ser >= ${alocados}`);

  lotesCadastrados[nome].total = novo;
  salvarTudo();
  renderDashboard();
}

// Excluir lote ativo
function excluirLote(nome) {
  if (contarGaylordsDoLote(nome) > 0)
    return alert('Não é possível excluir. Existem gaylords alocadas');
  if (!confirm(`Excluir lote "${nome}"?`)) return;

  delete lotesCadastrados[nome];
  salvarTudo();
  renderDashboard();
}

// =======================
// CADASTRO DE ÁREA
// =======================
function cadastrarArea() {
  const nome = areaNome.value.trim();
  if (!nome) return alert('Informe nome da área');

  mapaSalvo.push({ nome, ruas: [] });
  areaNome.value = '';
  salvarTudo();
  renderMapa();
}

function excluirArea(index) {
  const possuiAlocacao = mapaSalvo[index].ruas.some(r =>
    r.posicoes.some(p => p)
  );
  if (possuiAlocacao)
    return alert('Não é possível excluir. Existem gaylords alocadas!');
  if (!confirm('Excluir área?')) return;

  mapaSalvo.splice(index, 1);
  salvarTudo();
  renderMapa();
}

// =======================
// RUA
// =======================
function adicionarRua(aIndex) {
  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de posições'));
  if (isNaN(qtd) || qtd <= 0) return alert('Quantidade inválida');

  mapaSalvo[aIndex].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
  salvarTudo();
  renderMapa();
}

function excluirRua(aIndex, rIndex) {
  const rua = mapaSalvo[aIndex].ruas[rIndex];
  if (rua.posicoes.some(p => p))
    return alert('Não é possível excluir. Existem gaylords alocadas!');
  if (!confirm('Excluir rua?')) return;

  mapaSalvo[aIndex].ruas.splice(rIndex, 1);
  salvarTudo();
  renderMapa();
}

// =======================
// MAPA
// =======================
function renderMapa() {
  mapa.innerHTML = '';

  mapaSalvo.forEach((area, aIndex) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';
    areaDiv.innerHTML = `
      <strong>${area.nome}</strong>
      <button onclick="excluirArea(${aIndex})">Excluir Área</button>
    `;

    area.ruas.forEach((rua, rIndex) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `
        Rua ${rua.nome}
        <button onclick="excluirRua(${aIndex},${rIndex})">Excluir Rua</button>
      `;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pIndex) => {
        const d = document.createElement('div');
        d.className = 'posicao';

        if (pos) {
          d.classList.add('ocupada');
          d.style.background = lotesCadastrados[pos.lote]?.cor || '#ccc';
          d.dataset.lote = pos.lote;
          d.dataset.rz = pos.rz;
          d.dataset.volume = pos.volume || '';
        } else {
          d.dataset.lote = '';
          d.dataset.rz = '';
          d.dataset.volume = '';
        }

        d.onclick = () => abrirModal(aIndex, rIndex, pIndex);
        posDiv.appendChild(d);
      });

      ruaDiv.appendChild(posDiv);
      areaDiv.appendChild(ruaDiv);
    });

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => adicionarRua(aIndex);
    areaDiv.appendChild(btnRua);

    mapa.appendChild(areaDiv);
  });

  renderDashboard();
  renderExpedidos();
}

// =======================
// MODAL
// =======================
function abrirModal(aIndex, rIndex, pIndex) {
  posicaoAtual = { a: aIndex, r: rIndex, p: pIndex };
  const pos = mapaSalvo[aIndex].ruas[rIndex].posicoes[pIndex];

  carregarLotesNoModal(pos?.lote || '');
  modalRz.value = pos?.rz || '';
  modalVolume.value = pos?.volume || '';
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
}

function carregarLotesNoModal(selecionado = '') {
  modalLote.innerHTML = '<option value="">Selecione o lote</option>';
  Object.keys(lotesCadastrados).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    if (l === selecionado) opt.selected = true;
    modalLote.appendChild(opt);
  });
}

// =======================
// ENDEREÇAMENTO
// =======================
function confirmarEndereco() {
  const lote = modalLote.value;
  const rz = modalRz.value.trim();
  const volume = modalVolume.value.trim() || null;

  if (!lote) return alert('Selecione lote');
  if (!rz) return alert('RZ obrigatório');

  const totalLote = lotesCadastrados[lote].total;
  const alocados = contarGaylordsDoLote(lote);
  const posAtual =
    mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p];

  if (!posAtual && alocados >= totalLote)
    return alert(`Lote "${lote}" já completo`);
  if (posAtual) return alert('Posição já ocupada');

  mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p] = {
    lote,
    rz,
    volume
  };

  salvarTudo();
  fecharModal();
  renderMapa();
}

function removerGaylord() {
  const posAtualData =
    mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p];

  if (!posAtualData) return alert('Nenhuma gaylord nesta posição');
  if (!confirm('Remover gaylord?')) return;

  mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p] = null;
  salvarTudo();
  fecharModal();
  renderMapa();
}

// =======================
// CONTADOR
// =======================
function contarGaylordsDoLote(nome) {
  let total = 0;
  mapaSalvo.forEach(area =>
    area.ruas.forEach(rua =>
      rua.posicoes.forEach(p => {
        if (p?.lote === nome) total++;
      })
    )
  );
  return total;
}

// =======================
// DASHBOARD LOTES ATIVOS
// =======================
function renderDashboard() {
  dashboard.innerHTML = '';

  Object.entries(lotesCadastrados).forEach(([nome, data]) => {
    const usado = contarGaylordsDoLote(nome);
    const perc = data.total > 0 ? (usado / data.total) * 100 : 0;

    const div = document.createElement('div');
    div.className = 'lote-card';
    div.innerHTML = `
      <strong>${nome}</strong><br>
      ${usado} / ${data.total}
      <div class="progress-bar">
        <div class="progress-fill" style="width:${perc}%;background:${data.cor}"></div>
      </div>
      <button onclick="alterarQuantidadeLote('${nome}')">Alterar Quantidade</button>
      <button onclick="excluirLote('${nome}')">Excluir Lote</button>
      <button onclick="expedirLote('${nome}')">Expedir</button>
    `;

    dashboard.appendChild(div);
  });
}

// =======================
// EXPEDIÇÃO
// =======================
function expedirLote(nome) {
  const alocados = [];

  mapaSalvo.forEach(area =>
    area.ruas.forEach(rua => {
      rua.posicoes = rua.posicoes.map(pos => {
        if (pos?.lote === nome) {
          alocados.push({ rz: pos.rz, volume: pos.volume || '-' });
          return null;
        }
        return pos;
      });
    })
  );

  if (alocados.length === 0) return alert('Nenhuma gaylord alocada');

  const totalOriginal = lotesCadastrados[nome].total;
  const observacao =
    alocados.length < totalOriginal
      ? `Expedido parcialmente: ${alocados.length} de ${totalOriginal}`
      : 'Expedido completo';

historicoExpedidos.push({
  lote: nome,
  expedidos: alocados.length,   // quantidade expedida nessa ação
  totalOriginal,                // total criado do lote
  observacao,                   // texto opcional
  data: new Date().toLocaleDateString(),
  hora: new Date().toLocaleTimeString(),
  detalhes: alocados            // [{rz, volume, area, rua, posicao}]
});

  lotesCadastrados[nome].total -= alocados.length;
  if (lotesCadastrados[nome].total <= 0) delete lotesCadastrados[nome];

  salvarTudo();
  renderMapa();
}

// =======================
// HISTÓRICO EXPEDIDOS
// =======================
function renderExpedidos() {
  lotesExpedidos.innerHTML = '';

  if (historicoExpedidos.length === 0) {
    lotesExpedidos.innerHTML = '<p>Nenhum lote expedido</p>';
    return;
  }

  historicoExpedidos.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'historico-item';

    div.innerHTML = `
      <strong>Lote:</strong> ${item.lote}<br>
      <strong>Expedidos:</strong> ${item.expedidos}<br>
      <strong>Total original:</strong> ${item.totalOriginal}<br>
      <strong>Observação:</strong> ${item.observacao}<br>
      <strong>Data:</strong> ${item.data}<br>
      <strong>Hora:</strong> ${item.hora}<br>

      <button onclick="verDetalhes(${index})">Ver detalhes</button>
      <button onclick="excluirLoteExpedido(${index})"
        style="margin-left:6px;background:#c0392b;color:#fff;
        border:none;padding:4px 8px;border-radius:4px;cursor:pointer">
        Excluir lote
      </button>
    `;

    lotesExpedidos.appendChild(div);
  });
}

function verDetalhes(index) {
  const item = historicoExpedidos[index];
  if (!item.detalhes || item.detalhes.length === 0)
    return alert('Nenhum detalhe');

  let texto = `Detalhes do lote ${item.lote}:\n`;
  item.detalhes.forEach(
    (g, i) => (texto += `${i + 1} - RZ:${g.rz}, Volume:${g.volume}\n`)
  );
  alert(texto);
}

// =======================
// EXCLUIR LOTE EXPEDIDO
// =======================
function excluirLoteExpedido(index) {
  const item = historicoExpedidos[index];
  if (!item) return;

  if (
    !confirm(
      `Deseja excluir o lote expedido "${item.lote}"?\n\nEssa ação não pode ser desfeita.`
    )
  )
    return;

  historicoExpedidos.splice(index, 1);
  salvarTudo();
  renderExpedidos();
}

// =======================
// BUSCA
// =======================
function buscar() {
  const termo = buscaInput.value.trim().toLowerCase();
  limparBusca();
  if (!termo) return;

  document.querySelectorAll('.posicao').forEach(pos => {
    const lote = (pos.dataset.lote || '').toLowerCase();
    const rz = (pos.dataset.rz || '').toLowerCase();
    const volume = (pos.dataset.volume || '').toLowerCase();

    if (
      lote.includes(termo) ||
      rz.includes(termo) ||
      volume.includes(termo)
    ) {
      pos.classList.add('highlight');
    }
  });
}

function limparBusca() {
  document
    .querySelectorAll('.posicao.highlight')
    .forEach(p => p.classList.remove('highlight'));
}

// =======================
// INIT
// =======================
renderMapa();
