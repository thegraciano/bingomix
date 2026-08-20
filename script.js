/* ============================================================
   BINGO DE EMOJIS - script.js
   ------------------------------------------------------------
   Organizacao do arquivo:
   1) Lista dos 75 emojis (15 por coluna B-I-N-G-O)
   2) Estado + localStorage
   3) Tela de carregamento (10s)
   4) Navegacao entre abas
   5) Cartela (geracao aleatoria, marcacao, bingo)
   6) Sorteador (senha, sorteio sem repeticao, historico)
   7) Sons (Web Audio), confetes, modais
   ============================================================ */

/* ---------- 1) OS 75 EMOJIS ----------
   Igual ao bingo tradicional de 75 numeros: 5 colunas x 15 emojis.
   A coluna B usa os 15 primeiros, I os 15 seguintes, e assim por diante.
   Para trocar emojis, basta editar os grupos abaixo mantendo 15 em cada. */
const GRUPOS = [
  ["\u{1F600}","\u{1F603}","\u{1F604}","\u{1F601}","\u{1F606}","\u{1F605}","\u{1F602}","\u{1F923}","\u{1F60A}","\u{1F607}","\u{1F642}","\u{1F643}","\u{1F609}","\u{1F60C}","\u{1F60D}"], // B
  ["\u{1F970}","\u{1F618}","\u{1F60B}","\u{1F61B}","\u{1F61C}","\u{1F92A}","\u{1F928}","\u{1F9D0}","\u{1F913}","\u{1F60E}","\u{1F929}","\u{1F973}","\u{1F917}","\u{1F920}","\u{1F634}"], // I  (correcao: gatos removidos, eram parecidos com o 🐱 da coluna N)
  ["\u{1F436}","\u{1F431}","\u{1F42D}","\u{1F439}","\u{1F430}","\u{1F98A}","\u{1F43B}","\u{1F43C}","\u{1F428}","\u{1F42F}","\u{1F981}","\u{1F42E}","\u{1F437}","\u{1F438}","\u{1F435}"], // N
  ["\u{1F419}","\u{1F984}","\u{1F41D}","\u{1F98B}","\u{1F422}","\u{1F42C}","\u{1F433}","\u{1F308}","\u2B50","\u{1F31F}","\u2728","\u{1F525}","\u2600\uFE0F","\u{1F319}","\u{1F338}"], // G
  ["\u{1F34E}","\u{1F355}","\u{1F354}","\u{1F369}","\u{1F366}","\u26BD","\u{1F3C0}","\u{1F3AE}","\u{1F3B8}","\u{1F697}","\u{1F680}","\u2708\uFE0F","\u{1F388}","\u{1F381}","\u2764\uFE0F"]  // O
];
const TODOS = GRUPOS.flat(); // lista unica usada pela cartela E pelo sorteador

// Verificacao de seguranca: exatamente 75 emojis, nenhum repetido.
console.assert(TODOS.length === 75, "A lista precisa ter 75 emojis");
if(new Set(TODOS).size !== 75){
  const vistos = new Set(), repetidos = [];
  TODOS.forEach(e => { if(vistos.has(e)) repetidos.push(e); else vistos.add(e); });
  console.error("Emoji(s) repetido(s) na lista:", repetidos.join(" "));
}
GRUPOS.forEach((g, i) => console.assert(g.length === 15, "A coluna " + i + " precisa ter 15 emojis"));

const LETRAS = ["B","I","N","G","O"];

/* ---------- 2) ESTADO E PERSISTENCIA ---------- */
const CHAVE = "bingoEmojis.v2"; // v2: lista de emojis mudou, o estado antigo nao serve mais

const estadoPadrao = () => ({
  cartela: null,      // array de 25 posicoes { emoji, marcado, livre }
  sorteados: [],      // emojis ja sorteados na partida atual
  som: false,         // som comeca DESATIVADO (navegadores bloqueiam autoplay)
  tema: "claro",
  desbloqueado: false // sorteador liberado neste navegador
});

let estado = carregar();

function carregar(){
  try{
    const bruto = localStorage.getItem(CHAVE);
    if(!bruto) return estadoPadrao();
    const salvo = JSON.parse(bruto);
    const st = Object.assign(estadoPadrao(), salvo);

    /* Higieniza o estado salvo: se a lista de emojis mudou (ou o dado esta
       corrompido), descarta o que nao existe mais para nao travar o jogo. */
    const validos = new Set(TODOS);
    if(Array.isArray(st.sorteados)){
      st.sorteados = st.sorteados.filter(e => validos.has(e));
    }else{
      st.sorteados = [];
    }
    const cartelaOk = Array.isArray(st.cartela) && st.cartela.length === 25 &&
      st.cartela.every(c => c && (c.livre === true || validos.has(c.emoji)));
    if(!cartelaOk) st.cartela = null;
    return st;
  }catch(e){ return estadoPadrao(); }
}
function salvar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(estado)); }catch(e){ /* modo privado */ }
}

/* Atalhos de DOM */
const $ = (id) => document.getElementById(id);

/* Flag de desenvolvimento: index.html?dev=1 pula a tela de carregamento
   e libera o sorteador. Serve apenas para testes rapidos. */
const DEV = new URLSearchParams(location.search).get("dev") === "1";

/* ---------- 3) TELA DE CARREGAMENTO (10 segundos) ---------- */
function iniciarLoader(){
  const DURACAO = DEV ? 300 : 10000; // 10 segundos reais
  const inicio = Date.now();
  const fill = $("barFill"), pct = $("loaderPct");

  const timer = setInterval(() => {
    const p = Math.min(100, ((Date.now() - inicio) / DURACAO) * 100);
    fill.style.width = p + "%";
    pct.textContent = Math.floor(p);
    if(p >= 100){
      clearInterval(timer);
      $("loader").classList.add("is-hidden");
      setTimeout(() => { $("loader").remove(); }, 500);
      $("app").hidden = false;   // entra automaticamente no site
      iniciarApp();
    }
  }, 100);
}

/* ---------- 4) NAVEGACAO ENTRE ABAS ---------- */
function mostrarAba(qual){
  const ehCartela = qual === "cartela";
  $("tabCartela").classList.toggle("is-active", ehCartela);
  $("tabSorteador").classList.toggle("is-active", !ehCartela);
  $("tabCartela").setAttribute("aria-selected", String(ehCartela));
  $("tabSorteador").setAttribute("aria-selected", String(!ehCartela));
  $("viewCartela").classList.toggle("is-active", ehCartela);
  $("viewSorteador").classList.toggle("is-active", !ehCartela);
  if(!ehCartela) aplicarTravaSorteador();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- 5) CARTELA ---------- */

// Sorteia n itens diferentes de um array (sem repeticao)
function escolherAleatorios(lista, n){
  const copia = lista.slice();
  for(let i = copia.length - 1; i > 0; i--){          // embaralhamento Fisher-Yates
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
}

/* Gera uma cartela 5x5 aleatoria:
   - cada coluna usa 5 emojis do seu proprio grupo de 15
   - por isso nunca existe emoji repetido na cartela
   - o centro (linha 3, coluna 3) e o espaco LIVRE, ja marcado */
function gerarCartela(){
  const celulas = new Array(25);
  for(let c = 0; c < 5; c++){
    const escolhidos = escolherAleatorios(GRUPOS[c], 5);
    for(let l = 0; l < 5; l++){
      const i = l * 5 + c;
      if(l === 2 && c === 2){
        celulas[i] = { emoji: "LIVRE", marcado: true, livre: true }; // regra 5
      }else{
        celulas[i] = { emoji: escolhidos[l], marcado: false, livre: false };
      }
    }
  }
  return celulas;
}

function renderCartela(){
  const grid = $("grid");
  grid.innerHTML = "";
  estado.cartela.forEach((cel, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cell";
    b.dataset.i = i;
    b.setAttribute("role", "gridcell");
    if(cel.livre){
      b.classList.add("is-free", "is-marked");
      b.textContent = "LIVRE";
      b.setAttribute("aria-label", "Espaco livre, ja marcado");
      b.disabled = true;
    }else{
      b.textContent = cel.emoji;
      b.classList.toggle("is-marked", cel.marcado);
      b.classList.toggle("is-drawn", estado.sorteados.includes(cel.emoji));
      b.setAttribute("aria-pressed", String(cel.marcado));
      b.setAttribute("aria-label", "Emoji " + cel.emoji + (cel.marcado ? ", marcado" : ", nao marcado"));
      b.addEventListener("click", () => alternarMarca(i, b));
    }
    grid.appendChild(b);
  });
  atualizarInfoCartela();
}

function atualizarInfoCartela(){
  const marcados = estado.cartela.filter(c => c.marcado).length;
  const faltam = 25 - marcados;
  $("cartelaInfo").textContent = "Marcados: " + marcados + " de 25 \u00b7 " +
    (faltam === 0 ? "cartela completa! \u{1F389}" : "faltam " + faltam + " para o BINGO (cartela inteira).");
}

function alternarMarca(i, botao){
  const cel = estado.cartela[i];
  cel.marcado = !cel.marcado;
  botao.classList.toggle("is-marked", cel.marcado);
  botao.setAttribute("aria-pressed", String(cel.marcado));
  som(cel.marcado ? "marcar" : "clique");
  salvar();
  atualizarInfoCartela();
  verificarBingo(); // roda sempre: desmarcar tambem precisa desfazer o bingo
}

/* REGRA DO BINGO (ajuste 3): so vale CARTELA CHEIA.
   Linha, coluna e diagonal NAO valem mais bingo. */
function cartelaCompleta(){
  return estado.cartela.every(c => c.marcado);
}

let ultimoBingo = false; // evita repetir a tela de vitoria
function verificarBingo(){
  const completa = cartelaCompleta();
  const celulas = $("grid").children;

  // o brilho aparece somente quando a cartela inteira esta marcada
  document.querySelectorAll(".cell.is-win").forEach(el => el.classList.remove("is-win"));
  if(!completa){ ultimoBingo = false; return; }
  for(let i = 0; i < celulas.length; i++) celulas[i].classList.add("is-win");

  if(ultimoBingo) return;
  ultimoBingo = true;

  $("winSub").textContent = "Voce completou a CARTELA INTEIRA!";
  $("winScreen").hidden = false;
  som("vitoria");
  confetes(2600);
}

/* ---------- 6) SORTEADOR ---------- */

/* SEGURANCA: esta e apenas uma BARREIRA DE INTERFACE, nao uma autenticacao
   segura. Como o projeto e 100% frontend, qualquer pessoa com conhecimento
   tecnico consegue contornar a checagem no navegador. Para nao deixar a senha
   escrita em texto puro, guardamos apenas um hash (FNV-1a) dela. */
const SENHA_HASH = "6p4dqp";
function hash(txt){
  let h = 2166136261;
  for(let i = 0; i < txt.length; i++){ h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

function aplicarTravaSorteador(){
  const liberado = estado.desbloqueado || DEV;
  $("lockScreen").hidden = liberado;
  $("drawPanel").hidden = !liberado;
  if(liberado) renderSorteador();
}

function renderSorteador(){
  const n = estado.sorteados.length;
  $("contador").textContent = "Emojis sorteados: " + n + " / 75";
  $("restantes").textContent = "Restam " + (75 - n);
  $("progFill").style.width = (n / 75 * 100) + "%";
  $("btnSortear").disabled = n >= 75;

  const hist = $("history");
  hist.innerHTML = "";
  if(!n){
    hist.innerHTML = '<p class="muted">Nenhum emoji sorteado ainda.</p>';
  }else{
    // mais recentes primeiro
    estado.sorteados.slice().reverse().forEach((e, i) => {
      const s = document.createElement("span");
      s.className = "chip" + (i === 0 ? " is-last" : "");
      s.textContent = e;
      hist.appendChild(s);
    });
  }
  if(n >= 75) $("stageLabel").textContent = "Todos os 75 emojis sairam! \u{1F389}";
}

let sorteando = false;
async function sortear(){
  if(sorteando) return;
  const disponiveis = TODOS.filter(e => !estado.sorteados.includes(e)); // nunca repete
  if(!disponiveis.length) return;

  sorteando = true;
  $("btnSortear").disabled = true;
  const alvo = disponiveis[Math.floor(Math.random() * disponiveis.length)];

  const emojiEl = $("stageEmoji"), labelEl = $("stageLabel");
  emojiEl.classList.remove("is-reveal");
  emojiEl.classList.add("is-counting", "is-numero"); // is-numero: 3-2-1 nao usa a fonte de emoji

  // pequena animacao: Preparando... 3 2 1
  const passos = ["Preparando...", "3", "2", "1"];
  for(const passo of passos){
    labelEl.textContent = passo === "Preparando..." ? passo : "Vai sair em...";
    emojiEl.textContent = passo === "Preparando..." ? "\u{1F3B0}" : passo;
    som("tique");
    await espera(650);
  }

  // revela o emoji
  emojiEl.classList.remove("is-counting", "is-numero");
  emojiEl.textContent = alvo;
  void emojiEl.offsetWidth;               // reinicia a animacao
  emojiEl.classList.add("is-reveal");
  labelEl.textContent = "\u{1F389} Saiu esse!";
  som("sorteio");
  confetes(1200);

  estado.sorteados.push(alvo);
  salvar();
  renderSorteador();
  renderCartela();  // atualiza as dicas de "ja saiu" na cartela
  sorteando = false;
  $("btnSortear").disabled = estado.sorteados.length >= 75;
}
const espera = (ms) => new Promise(r => setTimeout(r, ms));

function reiniciarPartida(){
  estado.sorteados = [];
  salvar();
  $("stageEmoji").textContent = "\u{1F3B2}";
  $("stageEmoji").className = "stage__emoji";
  ultimoBingo = false;
  $("stageLabel").textContent = "Toque em SORTEAR EMOJI para comecar";
  renderSorteador();
  renderCartela();
}

/* ---------- 7) SONS (Web Audio, sem arquivos externos) ---------- */
let ctxAudio = null;
function som(tipo){
  if(!estado.som) return;
  try{
    ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)();
    if(ctxAudio.state === "suspended") ctxAudio.resume();
    const notas = {
      clique:  [[520, 0.06]],
      marcar:  [[660, 0.07], [880, 0.09]],
      tique:   [[380, 0.05]],
      sorteio: [[523, 0.09], [659, 0.09], [784, 0.14]],
      vitoria: [[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.3]]
    }[tipo] || [[440, 0.06]];

    let t = ctxAudio.currentTime;
    notas.forEach(([freq, dur]) => {
      const osc = ctxAudio.createOscillator(), g = ctxAudio.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(ctxAudio.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
      t += dur;
    });
  }catch(e){ /* audio indisponivel */ }
}

/* ---------- CONFETES (canvas) ---------- */
function confetes(duracao){
  const cv = $("confetti"), ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  cv.classList.add("is-on");
  const cores = ["#4C7DF0","#8B5CF6","#F5B324","#EC4899","#10B981"];
  const pecas = Array.from({ length: 120 }, () => ({
    x: Math.random() * cv.width,
    y: -20 - Math.random() * cv.height * 0.4,
    r: 5 + Math.random() * 7,
    vy: 2 + Math.random() * 4,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    cor: cores[Math.floor(Math.random() * cores.length)]
  }));
  const fim = Date.now() + duracao;

  (function anima(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    pecas.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if(p.y > cv.height + 20) p.y = -20;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      ctx.restore();
    });
    if(Date.now() < fim){ requestAnimationFrame(anima); }
    else{ ctx.clearRect(0, 0, cv.width, cv.height); cv.classList.remove("is-on"); }
  })();
}

/* ---------- MODAL DE CONFIRMACAO ---------- */
let acaoConfirmada = null;
function confirmar(texto, acao){
  $("confirmaTexto").textContent = texto;
  $("modalConfirma").hidden = false;
  acaoConfirmada = acao;
}

/* ---------- INICIALIZACAO DO APP ---------- */
function iniciarApp(){
  // tema e som salvos
  document.documentElement.dataset.tema = estado.tema;
  // bug corrigido: o icone do tema nao acompanhava o tema salvo ao abrir o site
  $("btnTema").textContent = estado.tema === "claro" ? "\u{1F319}" : "\u2600\uFE0F";
  atualizarBotaoSom();

  // cartela: usa a salva ou gera uma nova automaticamente
  if(!estado.cartela || estado.cartela.length !== 25){
    estado.cartela = gerarCartela();
    salvar();
  }
  renderCartela();
  verificarBingo();
  aplicarTravaSorteador();

  /* --- abas --- */
  $("tabCartela").onclick = () => { som("clique"); mostrarAba("cartela"); };
  $("tabSorteador").onclick = () => { som("clique"); mostrarAba("sorteador"); };

  /* --- configuracoes --- */
  $("btnSom").onclick = () => {
    estado.som = !estado.som; salvar(); atualizarBotaoSom(); som("clique");
  };
  $("btnTema").onclick = () => {
    estado.tema = estado.tema === "claro" ? "escuro" : "claro";
    document.documentElement.dataset.tema = estado.tema;
    $("btnTema").textContent = estado.tema === "claro" ? "\u{1F319}" : "\u2600\uFE0F";
    salvar(); som("clique");
  };
  $("btnAjuda").onclick = () => { $("modalAjuda").hidden = false; som("clique"); };

  /* --- cartela --- */
  $("btnNovaCartela").onclick = () => confirmar(
    "Tem certeza que quer gerar uma nova cartela? O sorteio nao sera afetado.",
    () => {
      estado.cartela = gerarCartela();  // regra 11: nao mexe no historico do sorteio
      ultimoBingo = false;
      salvar(); renderCartela(); som("marcar");
    }
  );
  $("btnLimparMarcas").onclick = () => confirmar(
    "Quer limpar todas as suas marcacoes desta cartela?",
    () => {
      estado.cartela.forEach(c => { if(!c.livre) c.marcado = false; });
      ultimoBingo = false;
      salvar(); renderCartela(); som("clique");
    }
  );

  /* --- senha do sorteador --- */
  $("formSenha").onsubmit = (ev) => {
    ev.preventDefault();
    const valor = $("inputSenha").value.trim().toLowerCase();
    if(hash(valor) === SENHA_HASH){
      estado.desbloqueado = true; salvar();
      $("erroSenha").hidden = true;
      $("inputSenha").value = "";
      aplicarTravaSorteador();
      som("marcar");
    }else{
      $("erroSenha").hidden = false;
      $("inputSenha").select();
      som("tique");
    }
  };
  $("btnSair").onclick = () => {
    estado.desbloqueado = false; salvar(); aplicarTravaSorteador(); som("clique");
  };

  /* --- sorteio --- */
  $("btnSortear").onclick = sortear;
  $("btnReiniciar").onclick = () => confirmar(
    "Tem certeza que quer comecar uma nova partida? Todos os emojis sorteados serao liberados novamente.",
    reiniciarPartida
  );

  /* --- tela de vitoria --- */
  $("btnComemorar").onclick = () => { confetes(2600); som("vitoria"); };
  $("btnFecharWin").onclick = () => { $("winScreen").hidden = true; som("clique"); };
  $("btnJogarNovamente").onclick = () => {
    $("winScreen").hidden = true;
    estado.cartela = gerarCartela();
    ultimoBingo = false;
    salvar(); renderCartela(); mostrarAba("cartela"); som("marcar");
  };

  /* --- modais --- */
  document.querySelectorAll("[data-fechar-modal]").forEach(b => {
    b.onclick = () => { b.closest(".modal").hidden = true; som("clique"); };
  });
  $("confirmaNao").onclick = () => { $("modalConfirma").hidden = true; acaoConfirmada = null; som("clique"); };
  $("confirmaSim").onclick = () => {
    $("modalConfirma").hidden = true;
    if(acaoConfirmada) acaoConfirmada();
    acaoConfirmada = null;
  };
  // clicar fora fecha o modal / Esc tambem
  document.querySelectorAll(".modal, .win").forEach(m => {
    m.addEventListener("click", (e) => { if(e.target === m) m.hidden = true; });
  });
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") document.querySelectorAll(".modal, .win").forEach(m => m.hidden = true);
  });

  // bug corrigido: redimensionar limpava/esticava os confetes no meio da animacao
  let idResize = null;
  addEventListener("resize", () => {
    clearTimeout(idResize);
    idResize = setTimeout(() => {
      const cv = $("confetti");
      if(!cv.classList.contains("is-on")){ cv.width = innerWidth; cv.height = innerHeight; }
    }, 150);
  });
}

function atualizarBotaoSom(){
  const b = $("btnSom");
  b.textContent = estado.som ? "\u{1F50A} Som: ON" : "\u{1F507} Som: OFF";
  b.setAttribute("aria-pressed", String(estado.som));
}

/* Ganchos apenas para testes/depuracao no console do navegador */
window.__todos = TODOS;
window.__estado = () => estado;

/* Comeca pela tela de carregamento */
iniciarLoader();
