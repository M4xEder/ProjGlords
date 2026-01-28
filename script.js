// ================= ESTADO =================
let mapa = JSON.parse(localStorage.getItem('mapa')) || [];
let lotes = JSON.parse(localStorage.getItem('lotes')) || {};
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let posicaoAtual = null;

// ================= ELEMENTOS =================
const mapaDiv = document.getElementById('mapa');
const listaLotes = document.getElementById('listaLotes');
const historicoDiv = document.getElementById('historico');

const loteNome = document.getElementById('loteNome');
const loteQtd = document.getElementById('loteQtd');
const areaNome = document.getElementById('areaNome');

const modal = document.getElementById('modal');
const modalLote = document.getElementById('modalLote');
const modalRz = document.getElementById('modalRz');
const modalVolume = document.getElementById('modalVolume');

// ================= UTIL =================
const gerarCor = () => `hsl(${Math.random()*360},70%,70%)`;
const salvar = () => {
  localStorage.setItem('mapa', JSON.stringify(mapa));
  localStorage.setItem('lotes', JSON.stringify(lotes));
  localStorage.setItem('historico', JSON.stringify(historico));
};

const alocadosLote = lote =>
  mapa.flatMap(a=>a.ruas.flatMap(r=>r.posicoes))
      .filter(p=>p && p.lote===lote).length;

// ================= LOTES =================
document.getElementById('btnCriarLote').onclick = () => {
  if (!loteNome.value || loteQtd.value <= 0) return;
  lotes[loteNome.value] = { total: +loteQtd.value, cor: gerarCor() };
  loteNome.value = loteQtd.value = '';
  salvar(); renderLotes(); renderMapa();
};

function renderLotes() {
  listaLotes.innerHTML = '';
  Object.entries(lotes).forEach(([nome, d]) => {
    const usado = alocadosLote(nome);
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.innerHTML = `
      <span class="lote-cor" style="background:${d.cor}"></span>
      ${nome} (${usado}/${d.total})
    `;

    const editar = document.createElement('button');
    editar.textContent = 'Editar';
    editar.onclick = () => {
      const nova = Number(prompt('Nova quantidade:', d.total));
      if (nova < usado) return alert('Quantidade menor que alocadas');
      lotes[nome].total = nova;
      salvar(); renderLotes();
    };

    const excluir = document.createElement('button');
    excluir.textContent = 'Excluir';
    excluir.className = 'danger';
    excluir.onclick = () => {
      if (usado > 0) return alert('Lote em uso');
      delete lotes[nome];
      salvar(); renderLotes(); renderMapa();
    };

    const expedir = document.createElement('button');
    expedir.textContent = '🚚';
    expedir.onclick = () => expedirLote(nome);

    div.append(editar, excluir, expedir);
    listaLotes.appendChild(div);
  });
}

// ================= ÁREA / RUA =================
document.getElementById('btnCriarArea').onclick = () => {
  if (!areaNome.value) return;
  mapa.push({ nome: areaNome.value, ruas: [] });
  areaNome.value = '';
  salvar(); renderMapa();
};

function renderMapa() {
  mapaDiv.innerHTML = '';
  mapa.forEach((a, ai) => {
    const ad = document.createElement('div');
    ad.className = 'area';
    ad.innerHTML = `<strong>${a.nome}</strong>`;

    const btnExcluirArea = document.createElement('button');
    btnExcluirArea.textContent = 'Excluir Área';
    btnExcluirArea.className = 'danger';
    btnExcluirArea.onclick = () => {
      if (a.ruas.some(r=>r.posicoes.some(p=>p)))
        return alert('Área contém gaylords');
      mapa.splice(ai,1);
      salvar(); renderMapa();
    };

    ad.appendChild(btnExcluirArea);

    a.ruas.forEach((r, ri) => {
      const rd = document.createElement('div');
      rd.className = 'rua';
      rd.innerHTML = `Rua ${r.nome}`;

      const btnExcluirRua = document.createElement('button');
      btnExcluirRua.textContent = 'Excluir Rua';
      btnExcluirRua.className = 'danger';
      btnExcluirRua.onclick = () => {
        if (r.posicoes.some(p=>p))
          return alert('Rua contém gaylords');
        a.ruas.splice(ri,1);
        salvar(); renderMapa();
      };

      rd.appendChild(btnExcluirRua);

      const pd = document.createElement('div');
      pd.className = 'posicoes';

      r.posicoes.forEach((p,pi)=>{
        const d=document.createElement('div');
        d.className='posicao';
        if(p){
          d.classList.add('ocupada');
          d.style.background=lotes[p.lote]?.cor;
          d.dataset.lote=p.lote;
          d.dataset.rz=p.rz;
          d.dataset.volume=p.volume||'';
        }
        d.onclick=()=>abrirModal(ai,ri,pi);
        pd.appendChild(d);
      });

      rd.appendChild(pd);
      ad.appendChild(rd);
    });

    const btnRua=document.createElement('button');
    btnRua.textContent='Adicionar Rua';
    btnRua.onclick=()=>{
      const n=prompt('Nome da rua');
      const q=Number(prompt('Qtd endereços'));
      if(n&&q>0){a.ruas.push({nome:n,posicoes:Array(q).fill(null)});salvar();renderMapa();}
    };

    ad.appendChild(btnRua);
    mapaDiv.appendChild(ad);
  });
}

// ================= MODAL =================
function abrirModal(a,r,p){
  posicaoAtual={a,r,p};
  modalLote.innerHTML='<option value="">Selecione</option>';
  Object.keys(lotes).forEach(l=>modalLote.innerHTML+=`<option>${l}</option>`);
  modal.classList.remove('hidden');
}

function fecharModal(){ modal.classList.add('hidden'); }

document.getElementById('btnSalvarEndereco').onclick=()=>{
  const {a,r,p}=posicaoAtual;
  if(mapa[a].ruas[r].posicoes[p])return alert('Ocupado');
  if(!modalLote.value||!modalRz.value)return alert('RZ obrigatório');
  if(alocadosLote(modalLote.value)>=lotes[modalLote.value].total)
    return alert('Lote atingiu limite');
  mapa[a].ruas[r].posicoes[p]={lote:modalLote.value,rz:modalRz.value,volume:modalVolume.value};
  salvar();fecharModal();renderMapa();renderLotes();
};

document.getElementById('btnRemoverEndereco').onclick=()=>{
  const {a,r,p}=posicaoAtual;
  mapa[a].ruas[r].posicoes[p]=null;
  salvar();fecharModal();renderMapa();renderLotes();
};

// ================= BUSCA =================
function buscar(){
  limparBusca();
  const t=document.getElementById('buscaInput').value.toLowerCase();
  document.querySelectorAll('.posicao').forEach(p=>{
    if(
      p.dataset.lote?.toLowerCase().includes(t)||
      p.dataset.rz?.toLowerCase().includes(t)||
      p.dataset.volume?.toLowerCase().includes(t)
    ) p.classList.add('highlight');
  });
}
function limparBusca(){
  document.querySelectorAll('.posicao.highlight').forEach(p=>p.classList.remove('highlight'));
}

// ================= EXPEDIÇÃO =================
function expedirLote(lote){
  const total=lotes[lote].total;
  const usados=alocadosLote(lote);
  if(!usados)return alert('Nada alocado');
  let obs='Expedição completa';
  if(usados<total&&!confirm('Expedição parcial?'))return;
  if(usados<total)obs=`Parcial ${usados}/${total}`;

  const itens=[];
  mapa.forEach(a=>a.ruas.forEach(r=>r.posicoes.forEach((p,i)=>{
    if(p&&p.lote===lote){itens.push(p);r.posicoes[i]=null;}
  })));

  historico.push({
    lote,usados,obs,
    data:new Date().toLocaleString(),
    itens
  });

  delete lotes[lote];
  salvar();renderMapa();renderLotes();renderHistorico();
}

function renderHistorico(){
  historicoDiv.innerHTML='';
  historico.forEach(h=>{
    const d=document.createElement('div');
    d.className='historico-item';
    d.innerHTML=`<strong>${h.lote}</strong><br>${h.obs}<br>${h.data}`;
    const b=document.createElement('button');
    b.textContent='Ver RZ';
    b.onclick=()=>alert(h.itens.map(i=>`${i.rz} (${i.volume||'-'})`).join('\n'));
    d.appendChild(b);
    historicoDiv.appendChild(d);
  });
}

// ================= INIT =================
renderMapa();
renderLotes();
renderHistorico();
