/* ============================================================
   BINGO DE IMAGENS - script.js
   ------------------------------------------------------------
   Organizacao do arquivo:
   1) Lista das 75 IMAGENS (15 por coluna B-I-N-G-O) + banco de imagens
   2) Estado + localStorage
   3) Tela de carregamento (10s)
   4) Navegacao entre abas
   5) Cartela (geracao aleatoria, marcacao, bingo)
   6) Sorteador (senha, sorteio sem repeticao, historico)
   7) Sons (Web Audio), confetes, modais
   ============================================================ */

/* ---------- 1) AS 75 IMAGENS ----------
   BANCO DE IMAGENS: Iconify (api.iconify.design), gratuito e aberto.
   Conjunto principal: "noto" (Google Noto Emoji, desenhos coloridos e simples).
   Se um desenho falhar em carregar, o app tenta "twemoji" e "openmoji"
   automaticamente (mesma imagem em todo lugar) e, em ultimo caso, mostra o
   simbolo local. TODAS as telas (cartela, sorteador e historico) usam
   EXATAMENTE a mesma funcao de imagem -> nunca ha diferenca de desenho.

   Sao 5 grupos tematicos de 15 imagens (igual ao bingo de 75):
   B = objetos do dia a dia | I = comidas | N = animais
   G = natureza            | O = brinquedos e transportes
   Todas sao coisas faceis de reconhecer por criancas de 5 a 11 anos. */

const GRUPOS = [
  [ // B - objetos do dia a dia
    { icone:"spoon",              nome:"Colher",        emoji:"\u{1F944}" },
    { icone:"cup-with-straw",     nome:"Copo",          emoji:"\u{1F964}" },
    { icone:"pencil",             nome:"L\u00e1pis",    emoji:"\u270F\uFE0F" },
    { icone:"scissors",           nome:"Tesoura",       emoji:"\u2702\uFE0F" },
    { icone:"open-book",          nome:"Livro",         emoji:"\u{1F4D6}" },
    { icone:"backpack",           nome:"Mochila",       emoji:"\u{1F392}" },
    { icone:"alarm-clock",        nome:"Rel\u00f3gio",  emoji:"\u23F0" },
    { icone:"key",                nome:"Chave",         emoji:"\u{1F511}" },
    { icone:"light-bulb",         nome:"L\u00e2mpada",  emoji:"\u{1F4A1}" },
    { icone:"umbrella",           nome:"Guarda-chuva",  emoji:"\u2602\uFE0F" },
    { icone:"chair",              nome:"Cadeira",       emoji:"\u{1FA91}" },
    { icone:"bed",                nome:"Cama",          emoji:"\u{1F6CF}\uFE0F" },
    { icone:"door",               nome:"Porta",         emoji:"\u{1F6AA}" },
    { icone:"broom",              nome:"Vassoura",      emoji:"\u{1F9F9}" },
    { icone:"telephone",          nome:"Telefone",      emoji:"\u260E\uFE0F" }
  ],
  [ // I - comidas
    { icone:"red-apple",          nome:"Ma\u00e7\u00e3", emoji:"\u{1F34E}" },
    { icone:"banana",             nome:"Banana",        emoji:"\u{1F34C}" },
    { icone:"grapes",             nome:"Uva",           emoji:"\u{1F347}" },
    { icone:"watermelon",         nome:"Melancia",      emoji:"\u{1F349}" },
    { icone:"strawberry",         nome:"Morango",       emoji:"\u{1F353}" },
    { icone:"tangerine",          nome:"Laranja",       emoji:"\u{1F34A}" },
    { icone:"carrot",             nome:"Cenoura",       emoji:"\u{1F955}" },
    { icone:"ear-of-corn",        nome:"Milho",         emoji:"\u{1F33D}" },
    { icone:"bread",              nome:"P\u00e3o",      emoji:"\u{1F35E}" },
    { icone:"cheese-wedge",       nome:"Queijo",        emoji:"\u{1F9C0}" },
    { icone:"egg",                nome:"Ovo",           emoji:"\u{1F95A}" },
    { icone:"pizza",              nome:"Pizza",         emoji:"\u{1F355}" },
    { icone:"birthday-cake",      nome:"Bolo",          emoji:"\u{1F382}" },
    { icone:"soft-ice-cream",     nome:"Sorvete",       emoji:"\u{1F366}" },
    { icone:"popcorn",            nome:"Pipoca",        emoji:"\u{1F37F}" }
  ],
  [ // N - animais
    { icone:"dog-face",           nome:"Cachorro",      emoji:"\u{1F436}" },
    { icone:"cat-face",           nome:"Gato",          emoji:"\u{1F431}" },
    { icone:"rabbit-face",        nome:"Coelho",        emoji:"\u{1F430}" },
    { icone:"horse-face",         nome:"Cavalo",        emoji:"\u{1F434}" },
    { icone:"cow-face",           nome:"Vaca",          emoji:"\u{1F42E}" },
    { icone:"pig-face",           nome:"Porco",         emoji:"\u{1F437}" },
    { icone:"chicken",            nome:"Galinha",       emoji:"\u{1F414}" },
    { icone:"duck",               nome:"Pato",          emoji:"\u{1F986}" },
    { icone:"fish",               nome:"Peixe",         emoji:"\u{1F41F}" },
    { icone:"turtle",             nome:"Tartaruga",     emoji:"\u{1F422}" },
    { icone:"butterfly",          nome:"Borboleta",     emoji:"\u{1F98B}" },
    { icone:"honeybee",           nome:"Abelha",        emoji:"\u{1F41D}" },
    { icone:"ant",                nome:"Formiga",       emoji:"\u{1F41C}" },
    { icone:"elephant",           nome:"Elefante",      emoji:"\u{1F418}" },
    { icone:"lion",               nome:"Le\u00e3o",     emoji:"\u{1F981}" }
  ],
  [ // G - natureza
    { icone:"sun",                nome:"Sol",           emoji:"\u2600\uFE0F" },
    { icone:"crescent-moon",      nome:"Lua",           emoji:"\u{1F319}" },
    { icone:"star",               nome:"Estrela",       emoji:"\u2B50" },
    { icone:"cloud",              nome:"Nuvem",         emoji:"\u2601\uFE0F" },
    { icone:"rainbow",            nome:"Arco-\u00edris", emoji:"\u{1F308}" },
    { icone:"sunflower",          nome:"Girassol",      emoji:"\u{1F33B}" },
    { icone:"deciduous-tree",     nome:"\u00c1rvore",   emoji:"\u{1F333}" },
    { icone:"leaf-fluttering-in-wind", nome:"Folha",    emoji:"\u{1F343}" },
    { icone:"cactus",             nome:"Cacto",         emoji:"\u{1F335}" },
    { icone:"mountain",           nome:"Montanha",      emoji:"\u26F0\uFE0F" },
    { icone:"water-wave",         nome:"Onda do mar",   emoji:"\u{1F30A}" },
    { icone:"fire",               nome:"Fogo",          emoji:"\u{1F525}" },
    { icone:"droplet",            nome:"Gota de \u00e1gua", emoji:"\u{1F4A7}" },
    { icone:"snowflake",          nome:"Floco de neve", emoji:"\u2744\uFE0F" },
    { icone:"house",              nome:"Casa",          emoji:"\u{1F3E0}" }
  ],
  [ // O - brinquedos e transportes
    { icone:"soccer-ball",        nome:"Bola de futebol", emoji:"\u26BD" },
    { icone:"basketball",         nome:"Bola de basquete", emoji:"\u{1F3C0}" },
    { icone:"bicycle",            nome:"Bicicleta",     emoji:"\u{1F6B2}" },
    { icone:"automobile",         nome:"Carro",         emoji:"\u{1F697}" },
    { icone:"bus",                nome:"\u00d4nibus",   emoji:"\u{1F68C}" },
    { icone:"locomotive",         nome:"Trem",          emoji:"\u{1F682}" },
    { icone:"airplane",           nome:"Avi\u00e3o",    emoji:"\u2708\uFE0F" },
    { icone:"sailboat",           nome:"Barco",         emoji:"\u26F5" },
    { icone:"rocket",             nome:"Foguete",       emoji:"\u{1F680}" },
    { icone:"balloon",            nome:"Bal\u00e3o",    emoji:"\u{1F388}" },
    { icone:"wrapped-gift",       nome:"Presente",      emoji:"\u{1F381}" },
    { icone:"guitar",             nome:"Viol\u00e3o",   emoji:"\u{1F3B8}" },
    { icone:"drum",               nome:"Tambor",        emoji:"\u{1F941}" },
    { icone:"kite",               nome:"Pipa",          emoji:"\u{1FA81}" },
    { icone:"teddy-bear",         nome:"Ursinho",       emoji:"\u{1F9F8}" }
  ]
];

/* Cada imagem recebe um id (usado no sorteio, na cartela e no localStorage) */
GRUPOS.forEach((grupo, c) => grupo.forEach(item => { item.id = item.icone; item.coluna = c; }));

const TODOS = GRUPOS.flat();                       // lista unica: cartela E sorteador
const POR_ID = new Map(TODOS.map(it => [it.id, it]));
const item = (id) => POR_ID.get(id);

/* Verificacao de seguranca: exatamente 75 imagens, nenhuma repetida. */
console.assert(TODOS.length === 75, "A lista precisa ter 75 imagens");
if(POR_ID.size !== 75) console.error("Existe imagem repetida na lista.");
GRUPOS.forEach((g, i) => console.assert(g.length === 15, "A coluna " + i + " precisa ter 15 imagens"));

const LETRAS = ["B","I","N","G","O"];

/* ---------- 1b) BANCO DE IMAGENS (uma unica fonte para todo o app) ----------
   Conjuntos tentados em ordem. Todos usam o MESMO nome de icone, entao a
   imagem continua sendo a mesma coisa (ex.: colher) em qualquer conjunto. */
const CONJUNTOS = ["noto", "twemoji", "openmoji"];
const urlImagem = (icone, tentativa, altura) =>
  "https://api.iconify.design/" + CONJUNTOS[tentativa] + "/" + icone + ".svg?height=" + altura;

/* Cria o <img> de uma imagem do bingo.
   - mesma funcao para cartela, sorteador e historico (sem excecao)
   - se um conjunto falhar, tenta o proximo; no fim, mostra o simbolo local */
function criarFigura(it, altura, classe){
  const img = document.createElement("img");
  img.className = "fig" + (classe ? " " + classe : "");
  img.alt = it.nome;
  img.title = it.nome;
  img.decoding = "async";
  img.dataset.tentativa = "0";
  img.dataset.icone = it.icone;
  img.dataset.altura = String(altura);
  img.src = urlImagem(it.icone, 0, altura);
  img.addEventListener("error", () => {
    const t = Number(img.dataset.tentativa) + 1;
    if(t < CONJUNTOS.length){
      img.dataset.tentativa = String(t);
      img.src = urlImagem(img.dataset.icone, t, img.dataset.altura);
    }else{
      // ultimo recurso: simbolo desenhado pelo proprio aparelho
      const span = document.createElement("span");
      span.className = "fig fig--fallback" + (classe ? " " + classe : "");
      span.textContent = it.emoji;
      span.title = it.nome;
      if(img.parentNode) img.parentNode.replaceChild(span, img);
    }
  });
  return img;
}

/* Deixa as imagens no cache do navegador antes do jogo comecar */
function prepararImagens(){
  TODOS.forEach(it => { const i = new Image(); i.src = urlImagem(it.icone, 0, 128); });
}

/* ---------- 2) ESTADO E PERSISTENCIA ---------- */
const CHAVE = "bingoImagens.v3"; // v3: agora o jogo usa imagens, o estado antigo nao serve

const estadoPadrao = () => ({
  cartela: null,      // array de 25 posicoes { id, marcado, livre }
  sorteados: [],      // ids ja sorteados na partida atual
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

    /* Higieniza o estado salvo: se a lista de imagens mudou (ou o dado esta
       corrompido), descarta o que nao existe mais para nao travar o jogo. */
    if(Array.isArray(st.sorteados)) st.sorteados = st.sorteados.filter(id => POR_ID.has(id));
    else st.sorteados = [];

    const cartelaOk = Array.isArray(st.cartela) && st.cartela.length === 25 &&
      st.cartela.every(c => c && (c.livre === true || POR_ID.has(c.id)));
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

  // amostra de imagens animadas na tela de carregamento
  const mostra = $("loaderFigs");
  if(mostra){
    mostra.innerHTML = "";
    ["spoon","cup-with-straw","pencil","soccer-ball","dog-face"].forEach(id => {
      const s = document.createElement("span");
      s.appendChild(criarFigura(item(id), 96));
      mostra.appendChild(s);
    });
  }
  prepararImagens();

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

/* Gera uma cartela 5x5 aleatoria (mesma logica de antes):
   - cada coluna usa 5 imagens do seu proprio grupo de 15
   - por isso nunca existe imagem repetida na mesma cartela
   - o centro (linha 3, coluna 3) e o espaco LIVRE, ja marcado
   Como cada coluna sorteia 5 de 15 em ordem aleatoria, o numero de cartelas
   possiveis e enorme: as cartelas praticamente nunca se repetem. */
function gerarCartela(){
  const celulas = new Array(25);
  for(let c = 0; c < 5; c++){
    const escolhidos = escolherAleatorios(GRUPOS[c], 5);
    for(let l = 0; l < 5; l++){
      const i = l * 5 + c;
      if(l === 2 && c === 2){
        celulas[i] = { id: null, marcado: true, livre: true }; // espaco LIVRE
      }else{
        celulas[i] = { id: escolhidos[l].id, marcado: false, livre: false };
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
      const it = item(cel.id);
      b.appendChild(criarFigura(it, 96, "fig--cell"));
      const nome = document.createElement("span");
      nome.className = "cell__nome";
      nome.textContent = it.nome;
      b.appendChild(nome);
      b.classList.toggle("is-marked", cel.marcado);
      b.classList.toggle("is-drawn", estado.sorteados.includes(cel.id));
      b.setAttribute("aria-pressed", String(cel.marcado));
      b.setAttribute("aria-label", it.nome + (cel.marcado ? ", marcado" : ", nao marcado"));
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
    (faltam === 0 ? "cartela completa!" : "faltam " + faltam + " para o BINGO (cartela inteira).");
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

/* REGRA DO BINGO: so vale CARTELA CHEIA.
   Linha, coluna e diagonal NAO valem. */
function cartelaCompleta(){
  return estado.cartela.every(c => c.marcado);
}

let ultimoBingo = false; // evita repetir a tela de vitoria
function verificarBingo(){
  const completa = cartelaCompleta();
  const celulas = $("grid").children;

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
  $("contador").textContent = "Imagens sorteadas: " + n + " / 75";
  $("restantes").textContent = "Restam " + (75 - n);
  $("progFill").style.width = (n / 75 * 100) + "%";
  $("btnSortear").disabled = n >= 75;

  const hist = $("history");
  hist.innerHTML = "";
  if(!n){
    hist.innerHTML = '<p class="muted">Nenhuma imagem sorteada ainda.</p>';
  }else{
    // mais recentes primeiro
    estado.sorteados.slice().reverse().forEach((id, i) => {
      const it = item(id);
      const s = document.createElement("span");
      s.className = "chip" + (i === 0 ? " is-last" : "");
      s.title = it.nome;
      s.appendChild(criarFigura(it, 64, "fig--chip"));
      hist.appendChild(s);
    });
  }
  if(n >= 75) $("stageLabel").textContent = "Todas as 75 imagens sairam!";
}

/* Mostra uma imagem grande no palco do sorteador (mesma imagem da cartela) */
function mostrarNoPalco(it){
  const palco = $("stageFig");
  palco.className = "stage__fig";
  palco.innerHTML = "";
  palco.appendChild(criarFigura(it, 320, "fig--stage"));
  return palco;
}
function textoNoPalco(txt, classe){
  const palco = $("stageFig");
  palco.className = "stage__fig " + (classe || "");
  palco.textContent = txt;
  return palco;
}

let sorteando = false;
async function sortear(){
  if(sorteando) return;
  const disponiveis = TODOS.filter(it => !estado.sorteados.includes(it.id)); // nunca repete
  if(!disponiveis.length) return;

  sorteando = true;
  $("btnSortear").disabled = true;
  const alvo = disponiveis[Math.floor(Math.random() * disponiveis.length)];

  const labelEl = $("stageLabel");
  $("stageNome").textContent = "";

  // pequena animacao: Preparando... 3 2 1
  const passos = ["Preparando...", "3", "2", "1"];
  for(const passo of passos){
    labelEl.textContent = passo === "Preparando..." ? passo : "Vai sair em...";
    textoNoPalco(passo === "Preparando..." ? "?" : passo, "is-numero is-counting");
    som("tique");
    await espera(650);
  }

  // revela a imagem
  const palco = mostrarNoPalco(alvo);
  void palco.offsetWidth;                 // reinicia a animacao
  palco.classList.add("is-reveal");
  $("stageNome").textContent = alvo.nome;
  labelEl.textContent = "Saiu essa!";
  som("sorteio");
  confetes(1200);

  estado.sorteados.push(alvo.id);
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
  textoNoPalco("?", "is-numero");
  $("stageNome").textContent = "";
  ultimoBingo = false;
  $("stageLabel").textContent = "Toque em SORTEAR IMAGEM para comecar";
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
  $("btnTema").textContent = estado.tema === "claro" ? "Modo escuro" : "Modo claro";
  atualizarBotaoSom();

  // cartela: usa a salva ou gera uma nova automaticamente
  if(!estado.cartela || estado.cartela.length !== 25){
    estado.cartela = gerarCartela();
    salvar();
  }
  renderCartela();
  verificarBingo();
  aplicarTravaSorteador();

  // palco inicial
  if(!estado.sorteados.length){
    textoNoPalco("?", "is-numero");
  }else{
    mostrarNoPalco(item(estado.sorteados[estado.sorteados.length - 1]));
    $("stageNome").textContent = item(estado.sorteados[estado.sorteados.length - 1]).nome;
  }

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
    $("btnTema").textContent = estado.tema === "claro" ? "Modo escuro" : "Modo claro";
    salvar(); som("clique");
  };
  $("btnAjuda").onclick = () => { $("modalAjuda").hidden = false; som("clique"); };

  /* --- cartela --- */
  $("btnNovaCartela").onclick = () => confirmar(
    "Tem certeza que quer gerar uma nova cartela? O sorteio nao sera afetado.",
    () => {
      estado.cartela = gerarCartela();  // nao mexe no historico do sorteio
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
    "Tem certeza que quer comecar uma nova partida? Todas as imagens sorteadas serao liberadas novamente.",
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

  // redimensionar nao deve estragar os confetes no meio da animacao
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
  b.textContent = estado.som ? "Som: ON" : "Som: OFF";
  b.setAttribute("aria-pressed", String(estado.som));
}

/* Ganchos apenas para testes/depuracao no console do navegador */
window.__todos = TODOS;
window.__estado = () => estado;

/* Comeca pela tela de carregamento */
iniciarLoader();
