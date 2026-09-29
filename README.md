# Biblioteca Online - Equipe Alfa

**Assunto:** Uma biblioteca online privada
**Equipe:** Keven · Francoarlesson · Leodiney · Jéssica · Isabela · Júlia
**Disciplina:** ARA0062 — Desenvolvimento Web em HTML5, CSS, JavaScript e PHP
**Centro Universitário Newton Paiva · 2026/2**

---

## Sobre o projeto

"Um site de bibliotecas online, onde o cliente pode comprar e alugar livros de forma simples e rápido."

Até o fim do semestre, o site terá uma página inicial, um catálogo de espécies
com tabela de preços e porte, e um formulário de pedido
de orçamento. Os pedidos enviados pelo formulário serão gravados em um banco de
dados (nome, e-mail, tipo de ambiente e mensagem) e listados em uma página
administrativa simples.

---

## Identidade visual

### Paleta

| Papel | Cor | Por que esta |
|---|---|---|
| `--principal` | `#111111` |
| `--sobre-principal` | `#F5C518` |
| `--apoio` | `#F5C518` | 
| `--fundo` | `#FFFFFF` |
| `--superficie` | `#FFFFFF` |
| `--texto` | `#111111` |

**Contraste conferido** em https://webaim.org/resources/contrastchecker/:

```
--texto sobre --superficie ......... 18,9:1
--principal sobre --superficie ..... 18,9:1
--sobre-principal sobre --principal  11,6:1
```

### Tipografia

**Fonte:** "Poppins", com plano B `arial, sans-serif`
**Pesos:** 400 e 600
**Por que esta:** Poppins tem letras redondas e legíveis, o que combina com o tom do amarelo e do preto.

**Escala:** `h1` 2.5rem · `h2` 1.75rem · `h3` 1.25rem · corpo 1rem

### Segundo tema

**Arquivo:** `frontend/css/tema-modo_escuro.css`
**O que é:** modo escuro

---

## Como abrir

1. Abra **a pasta inteira** no VS Code (*Arquivo → Abrir Pasta*).
2. Abra `frontend/index.html` e clique em **Go Live** (extensão *Live Server*).

---

## Estrutura

```
.
├─ README.md                 esta folha de rosto
├─ frontend/                 tudo o que roda no navegador
│   ├─ index.html
│   ├─ css/
│   │   ├─ estilo.css        a folha do projeto
│   │   └─ tema-modo_escuro.css   o segundo tema: só variáveis
│   ├─ js/
│   │   └─ script.js         vazio até o ciclo 6
│   └─ img/
└─ backend/                  tudo o que roda no servidor
    ├─ config/
    │   └─ conexao.php       vazio até o ciclo 8
    └─ processa-contato.php
```

---

## Quem fez o quê

| Integrante | Parte da folha de estilo |
|---|---|
| Keven | o `:root`, o `box-sizing` e o segundo tema |
|  | tipografia: web font, escala e entrelinha |
| Júlia | página e conteúdo |
| Jéssica | cabeçalho e menu |
| Francoarlesson | tabela |
| Isabela | formulário e rodapé |
