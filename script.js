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
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
}

// =======================
// CADASTRO DE ÁREA
// =======================
function criarArea() {
  const nome = document.getElementById('areaNome').value.trim();
  if (!nome) { alert('Informe o nome da área'); return; }

  mapaSalvo.push({ nome, ruas: [] });
  document.getElementById('areaNome').value = '';
  salvarTudo();
  renderMapa();
}

// =======================
// CADASTRO DE LOTE
// =======================
function cadastrarLote() {
  const nome = document.getElementById('loteNome').value.trim();
  const total = parseInt(document.getElementById('loteTotal').value);

  if (!nome || total <= 0) { alert('Informe nome e quantidade de gaylords'); return; }

  lotesCadastrados[nome] = { total, cor: gerarCor() };

  document.getElementById('loteNome').value = '';
  document.getElementById('loteTotal').value = '';

  salvarTudo();
  renderLotes();
  renderMapa();
}

// =======================
// RENDER LOTES ATIVOS
// =======================
function renderLotes() {
  const container = document.getElementById('lotesAtivos');
  container.innerHTML = '';

  Object.entries(lotesCadastrados).forEach(([nome, data]) => {
    const usado = contarGaylordsDoLote(nome);
    const perc = Math.min((usado / data.total) * 100, 100);

    const div = document.createElement('div');
    div.className = 'lote-card';
    div.innerHTML = `
      <strong>${nome}</strong> (${usado}/${data.total})
      <div class="progress-bar">
        <div class="progress-fill" style="width:${perc}%; background:${data.cor}"></div>
      </div>
      <button onclick="alterarQtdLote('${nome}')">Alterar Qtd</button>
      <button onclick="excluirLote('${nome}')">Excluir</button>
      <button onclick="expedirLote('${nome}')">Expedir</button>
    `;
    container.appendChild(div);
  });
}

// =======================
// RENDER MAPA
// =======================
function renderMapa() {
  const container = document.getElementById('mapa');
  container.innerHTML = '';

  mapaSalvo.forEach((area, ai) => {
    const divArea = document.createElement('div');
    divArea.className = 'area';

    const areaHeader = document.createElement('div');
    areaHeader.className = 'area-header';
    areaHeader.innerHTML = `<strong>${area.nome}</strong>`;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.onclick = () => excluirArea(ai);
    areaHeader.appendChild(btnExcluirArea);
    divArea.appendChild(areaHeader);

    area.ruas.forEach((rua, ri) => {
      const divRua = document.createElement('div');
      divRua.className = 'rua';
      divRua.innerHTML = `<strong>Rua: ${rua.nome}</strong>`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.onclick = () => excluirRua(ai, ri);
      divRua.appendChild(btnExcluirRua);

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pi) => {
        const box = document.createElement('div');
        box.className = 'posicao';
        box.dataset.area = ai;
        box.dataset.rua = ri;
        box.dataset.pos = pi;

        if (pos) {
          box.classList.add('ocupada');
          box.style.background = lotesCadastrados[pos.lote]?.cor || '#ccc';
          box.dataset.lote = pos.lote;
          box.dataset.rz = pos.rz || '';
          box.dataset.volume = pos.volume || '';
          box.title = `Lote: ${pos.lote}\nRZ: ${pos.rz || '-'}\nVolume: ${pos.volume || '-'}`;
        } else {
          box.dataset.lote = '';
          box.dataset.rz = '';
          box.dataset.volume = '';
        }

        box.onclick = () => abrirModal(ai, ri, pi);
        posicoesDiv.appendChild(box);
      });

      divRua.appendChild(posicoesDiv);
      divArea.appendChild(divRua);
    });

    const btnAddRua = document.createElement('button');
    btnAddRua.textContent = 'Adicionar Rua';
    btnAddRua.onclick = () => adicionarRua(ai);
    divArea.appendChild(btnAddRua);

    container.appendChild(divArea);
  });

  renderLotes();
  renderExpedidos();
}

// =======================
// RUA
// =======================
function adicionarRua(areaIndex) {
  const nome = prompt('Nome da rua');
  const qtd = parseInt(prompt('Quantidade de posições'));
  if (!nome || qtd <= 0) return;

  mapaSalvo[areaIndex].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
  salvarTudo();
  renderMapa();
}

// =======================
// EXCLUIR AREA / RUA
// =======================
function excluirArea(ai) {
  const area = mapaSalvo[ai];
  if (area.ruas.some(rua => rua.posicoes.some(pos => pos))) {
    alert('Não é possível excluir área com gaylords alocados!');
    return;
  }
  if (!confirm('Excluir área?')) return;
  mapaSalvo.splice(ai, 1);
  salvarTudo();
  renderMapa();
}

function excluirRua(ai, ri) {
  const rua = mapaSalvo[ai].ruas[ri];
  if (rua.posicoes.some(pos => pos)) {
    alert('Não é possível excluir rua com gaylords alocados!');
    return;
  }
  if (!confirm('Excluir rua?')) return;
  mapaSalvo[ai].ruas.splice(ri,1);
  salvarTudo();
  renderMapa();
}

// =======================
// MODAL
// =======================
function abrirModal(ai, ri, pi) {
  posicaoAtual = { ai, ri, pi };
  const pos = mapaSalvo[ai].ruas[ri].posicoes[pi];

  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione lote</option>';
  Object.keys(lotesCadastrados).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    if(pos?.lote === l) opt.selected = true;
    select.appendChild(opt);
  });

  document.getElementById('modalRz').value = pos?.rz || '';
  document.getElementById('modalVolume').value = pos?.volume || '';
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

// =======================
// SALVAR / REMOVER ENDEREÇO
// =======================
function salvarEndereco() {
  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if(!lote) { alert('Selecione um lote'); return; }
  if(!rz) { alert('RZ é obrigatório'); return; }

  const totalLote = lotesCadastrados[lote].total;
  const alocados = contarGaylordsDoLote(lote);
  const posAtual = mapaSalvo[posicaoAtual.ai].ruas[posicaoAtual.ri].posicoes[posicaoAtual.pi];

  if(!posAtual && alocados >= totalLote){
    alert(`Lote ${lote} já atingiu limite de ${totalLote} gaylords`);
    return;
  }

  if(posAtual && posAtual.lote && posAtual.lote !== lote){
    alert('Endereço já ocupado por outro lote!');
    return;
  }

  mapaSalvo[posicaoAtual.ai].ruas[posicaoAtual.ri].posicoes[posicaoAtual.pi] = { lote, rz, volume };
  salvarTudo();
  fecharModal();
  renderMapa();
}

function removerEndereco() {
  mapaSalvo[posicaoAtual.ai].ruas[posicaoAtual.ri].posicoes[posicaoAtual.pi] = null;
  salvarTudo();
  fecharModal();
  renderMapa();
}

// =======================
// CONTADOR
// =======================
function contarGaylordsDoLote(lote) {
  let total = 0;
  mapaSalvo.forEach(area => area.ruas.forEach(rua => rua.posicoes.forEach(pos => {
    if(pos?.lote === lote) total++;
  })));
  return total;
}

// =======================
// ALTERAR / EXCLUIR LOTE
// =======================
function alterarQtdLote(nome) {
  const novo = parseInt(prompt('Nova quantidade de gaylords', lotesCadastrados[nome].total));
  if(!novo || novo < 1) return;
  lotesCadastrados[nome].total = novo;
  salvarTudo();
  renderLotes();
}

function excluirLote(nome) {
  if(contarGaylordsDoLote(nome) > 0){
    alert('Não é possível excluir lote com gaylords alocados');
    return;
  }
  if(!confirm('Excluir lote?')) return;
  delete lotesCadastrados[nome];
  salvarTudo();
  renderMapa();
}

// =======================
// BUSCA COM DESTAQUE E ROLL
// =======================
function buscar() {
  const termo = document.getElementById('buscaInput').value.trim().toLowerCase();
  limparBusca();
  if(!termo) return;

  const resultados = [];
  document.querySelectorAll('.posicao').forEach(p => {
    const lote = (p.dataset.lote || '').toLowerCase();
    const rz = (p.dataset.rz || '').toLowerCase();
    const volume = (p.dataset.volume || '').toLowerCase();

    if(lote.includes(termo) || rz.includes(termo) || volume.includes(termo)){
      p.classList.add('highlight');
      resultados.push(p);
    }
  });

  if(resultados.length > 0){
    resultados[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    alert('Nenhum resultado encontrado');
  }
}

function limparBusca() {
  document.querySelectorAll('.posicao.highlight').forEach(p => p.classList.remove('highlight'));
}

// =======================
// EXPEDIÇÃO
// =======================
function expedirLote(nome) {
  const alocados = contarGaylordsDoLote(nome);
  const totalOriginal = lotesCadastrados[nome].total;

  if(alocados === 0) { alert('Nenhuma gaylord alocada para expedição'); return; }

  let observacao = '';
  if(alocados < totalOriginal){
    const confirma = confirm(`Lote ${nome} não está totalmente alocado.\nExpedir apenas alocados?`);
    if(!confirma) return;
    observacao = `Expedido parcialmente: ${alocados} de ${totalOriginal}`;
  } else {
    observacao = 'Expedido completo';
  }

  // Remove posições alocadas
  mapaSalvo.forEach(area => area.ruas.forEach(rua => {
    rua.posicoes = rua.posicoes.map(pos => pos?.lote === nome ? null : pos);
  }));

  // Histórico
  const agora = new Date();
  historicoExpedidos.push({
    lote: nome,
    expedidos: alocados,
    totalOriginal,
    observacao,
    data: agora.toLocaleDateString(),
    hora: agora.toLocaleTimeString()
  });

  salvarTudo();
  renderMapa();
  renderExpedidos();
}

// =======================
// RENDER EXPEDIDOS
// =======================
function renderExpedidos() {
  const container = document.getElementById('lotesExpedidos');
  container.innerHTML = '';

  if(historicoExpedidos.length === 0){
    container.innerHTML = '<p>Nenhum lote expedido ainda</p>';
    return;
  }

  historicoExpedidos.forEach(item => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    div.innerHTML = `
      <strong>Lote:</strong> ${item.lote}<br>
      <strong>Expedidos:</strong> ${item.expedidos}<br>
      <strong>Total original:</strong> ${item.totalOriginal}<br>
      <strong>Observação:</strong> ${item.observacao}<br>
      <strong>Data:</strong> ${item.data}<br>
      <strong>Hora:</strong> ${item.hora}
    `;
    container.appendChild(div);
  });
}

// =======================
// INIT
// =======================
renderMapa();
