/* ==========================================================
   Biblioteca Online – comportamento da página
   Sem dependências. Funciona com o HTML e o CSS do projeto.
   ========================================================== */
(() => {
  'use strict';

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

  const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FRETE_GRATIS = 129;

  /* ---------- Utilitários ---------- */
  const guardar = {
    ler(chave, padrao) {
      try {
        const valor = localStorage.getItem(chave);
        return valor === null ? padrao : JSON.parse(valor);
      } catch { return padrao; }
    },
    gravar(chave, valor) {
      try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
    },
  };

  const moeda = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const lerPreco = (texto) => parseFloat(texto.replace(/[^\d,]/g, '').replace(',', '.'));

  /* ---------- Aviso rápido (leitores de tela anunciam) ---------- */
  const aviso = document.createElement('div');
  aviso.id = 'aviso';
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  document.body.append(aviso);

  let temporizadorAviso;
  function avisar(mensagem) {
    aviso.textContent = mensagem;
    aviso.classList.add('visivel');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove('visivel'), 3000);
  }

  /* ==========================================================
     1. Tema claro / escuro
     ========================================================== */
  const raiz = document.documentElement;
  const botaoTema = $('#alternar-tema');

  function aplicarTema(tema) {
    raiz.dataset.tema = tema;
    botaoTema?.setAttribute('aria-pressed', String(tema === 'escuro'));
  }

  aplicarTema(
    guardar.ler('tema', null) ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro')
  );

  botaoTema?.addEventListener('click', () => {
    const novo = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    aplicarTema(novo);
    guardar.gravar('tema', novo);
  });

  /* ==========================================================
     2. Carrossel do banner
     ========================================================== */
  const banner = $('main > section[aria-label="Destaques da semana"]');
  if (banner) {
    const faixa = $('.faixa', banner);
    const slides = $$('article', faixa);
    const [anterior, proximo] = $$(':scope > button', banner);
    let pausado = false;

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} de ${slides.length}`);
    });
    faixa.setAttribute('tabindex', '0');
    faixa.setAttribute('aria-label', 'Destaques da semana');

    const atual = () => Math.round(faixa.scrollLeft / faixa.clientWidth);
    const ir = (indice) => {
      const n = (indice + slides.length) % slides.length;
      faixa.scrollTo({ left: n * faixa.clientWidth, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    };

    anterior?.addEventListener('click', () => ir(atual() - 1));
    proximo?.addEventListener('click', () => ir(atual() + 1));
    faixa.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual() + 1); }
    });

    // Rotação automática: desligada para quem prefere menos movimento
    if (!reduzirMovimento && slides.length > 1) {
      ['mouseenter', 'focusin'].forEach((ev) => banner.addEventListener(ev, () => { pausado = true; }));
      ['mouseleave', 'focusout'].forEach((ev) => banner.addEventListener(ev, () => { pausado = false; }));
      setInterval(() => { if (!pausado && !document.hidden) ir(atual() + 1); }, 6000);
    }
  }

  /* ==========================================================
     3. Carrinho
     ========================================================== */
  let itens = guardar.ler('carrinho', []);
  const contador = $('a[href="/carrinho"] span');

  const gaveta = document.createElement('dialog');
  gaveta.id = 'carrinho';
  gaveta.setAttribute('aria-labelledby', 'titulo-carrinho');
  gaveta.innerHTML = `
    <header>
      <h2 id="titulo-carrinho">Seu carrinho</h2>
      <button type="button" data-acao="fechar" aria-label="Fechar carrinho">×</button>
    </header>
    <p data-vazio>Seu carrinho está vazio.</p>
    <ul></ul>
    <div data-resumo>
      <p data-frete></p>
      <progress max="${FRETE_GRATIS}" value="0" aria-label="Progresso para o frete grátis"></progress>
      <p><strong>Total: <span data-total></span></strong></p>
      <a class="botao" href="/checkout">Finalizar compra</a>
    </div>`;
  document.body.append(gaveta);

  const listaCarrinho = $('ul', gaveta);

  function salvarCarrinho() {
    guardar.gravar('carrinho', itens);
    renderizarCarrinho();
  }

  function renderizarCarrinho() {
    const quantidade = itens.reduce((soma, i) => soma + i.qtd, 0);
    const total = itens.reduce((soma, i) => soma + i.qtd * i.preco, 0);

    if (contador) contador.textContent = quantidade;

    $('[data-vazio]', gaveta).hidden = itens.length > 0;
    $('[data-resumo]', gaveta).hidden = itens.length === 0;

    listaCarrinho.innerHTML = itens.map((i) => `
      <li>
        <strong>${i.titulo}</strong>
        <span>${moeda(i.preco * i.qtd)}</span>
        <div class="quantidade">
          <button type="button" data-acao="menos" data-id="${i.id}" aria-label="Diminuir quantidade de ${i.titulo}">−</button>
          <span aria-label="Quantidade">${i.qtd}</span>
          <button type="button" data-acao="mais" data-id="${i.id}" aria-label="Aumentar quantidade de ${i.titulo}">+</button>
        </div>
        <button type="button" data-acao="remover" data-id="${i.id}" aria-label="Remover ${i.titulo} do carrinho">Remover</button>
      </li>`).join('');

    $('[data-total]', gaveta).textContent = moeda(total);
    $('progress', gaveta).value = Math.min(total, FRETE_GRATIS);
    $('[data-frete]', gaveta).textContent = total >= FRETE_GRATIS
      ? 'Você ganhou frete grátis!'
      : `Faltam ${moeda(FRETE_GRATIS - total)} para o frete grátis.`;
  }

  function adicionar(artigo) {
    const id = $('a', artigo).getAttribute('href');
    const titulo = $('h3', artigo).textContent.trim();
    const preco = lerPreco($('strong', artigo).textContent);

    const existente = itens.find((i) => i.id === id);
    if (existente) existente.qtd += 1;
    else itens.push({ id, titulo, preco, qtd: 1 });

    salvarCarrinho();
    avisar(`"${titulo}" foi adicionado ao carrinho.`);
  }

  gaveta.addEventListener('click', (e) => {
    if (e.target === gaveta) return gaveta.close(); // clique no fundo escuro
    const botao = e.target.closest('button[data-acao]');
    if (!botao) return;

    const { acao, id } = botao.dataset;
    const item = itens.find((i) => i.id === id);

    if (acao === 'fechar') return gaveta.close();
    if (acao === 'mais' && item) item.qtd += 1;
    if (acao === 'menos' && item) item.qtd -= 1;
    if (acao === 'remover') itens = itens.filter((i) => i.id !== id);
    itens = itens.filter((i) => i.qtd > 0);
    salvarCarrinho();
  });

  $('a[href="/carrinho"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    gaveta.showModal();
  });

  // Botões "Comprar" (os botões com aria-label são outros, como a lista de desejos)
  document.addEventListener('click', (e) => {
    const botao = e.target.closest('main li > article > button:not([aria-label])');
    if (botao) adicionar(botao.closest('article'));
  });

  renderizarCarrinho();

  /* ==========================================================
     4. Lista de desejos
     ========================================================== */
  let desejos = guardar.ler('desejos', []);
  const botoesDesejo = $$('main li > article button[aria-label$="lista de desejos"]');

  function pintarDesejo(botao) {
    const titulo = $('h3', botao.closest('article')).textContent.trim();
    const ativo = desejos.includes($('a', botao.closest('article')).getAttribute('href'));
    botao.setAttribute('aria-pressed', String(ativo));
    botao.setAttribute('aria-label', `${ativo ? 'Remover da' : 'Adicionar à'} lista de desejos: ${titulo}`);
    botao.textContent = ativo ? '♥' : '♡';
  }

  botoesDesejo.forEach((botao) => {
    pintarDesejo(botao);
    botao.addEventListener('click', () => {
      const artigo = botao.closest('article');
      const id = $('a', artigo).getAttribute('href');
      const titulo = $('h3', artigo).textContent.trim();
      const jaTinha = desejos.includes(id);

      desejos = jaTinha ? desejos.filter((d) => d !== id) : [...desejos, id];
      guardar.gravar('desejos', desejos);
      pintarDesejo(botao);
      avisar(jaTinha ? `"${titulo}" saiu da lista de desejos.` : `"${titulo}" entrou na lista de desejos.`);
    });
  });

  /* ==========================================================
     5. Formulários
     ========================================================== */
  // Busca: não envia vazia
  const busca = $('#busca');
  busca?.form.addEventListener('submit', (e) => {
    if (!busca.value.trim()) {
      e.preventDefault();
      busca.focus();
      avisar('Digite um título, autor ou ISBN para buscar.');
    }
  });

  // CEP: máscara 00000-000 e validação
  const cep = $('#cep');
  cep?.addEventListener('input', () => {
    const digitos = cep.value.replace(/\D/g, '').slice(0, 8);
    cep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
    cep.setCustomValidity('');
  });
  cep?.form.addEventListener('submit', (e) => {
    if (cep.value.replace(/\D/g, '').length !== 8) {
      e.preventDefault();
      cep.setCustomValidity('Informe um CEP com 8 dígitos.');
      cep.reportValidity();
    }
  });
})();
