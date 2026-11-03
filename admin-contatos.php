<?php

require_once __DIR__ . '/config/conexao.php';

$usuarioEsperado = getenv('BIBLIOTECA_ADMIN_USER');
$senhaEsperada = getenv('BIBLIOTECA_ADMIN_PASSWORD');

if ($usuarioEsperado === false || $usuarioEsperado === '' || $senhaEsperada === false || $senhaEsperada === '') {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Acesso administrativo indisponível: configure as credenciais no ambiente do PHP.');
}

$usuarioRecebido = $_SERVER['PHP_AUTH_USER'] ?? '';
$senhaRecebida = $_SERVER['PHP_AUTH_PW'] ?? '';

if (
    !hash_equals($usuarioEsperado, $usuarioRecebido)
    || !hash_equals($senhaEsperada, $senhaRecebida)
) {
    header('WWW-Authenticate: Basic realm="Biblioteca Online - Administração", charset="UTF-8"');
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Autenticação necessária.');
}

try {
    $conexao = obterConexao();
    $solicitacoes = $conexao->query(
        'SELECT nome, email, tipo, mensagem, criado_em
         FROM solicitacoes_contato
         ORDER BY criado_em DESC
         LIMIT 100'
    )->fetchAll();
} catch (Throwable $erro) {
    error_log((string) $erro);
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Não foi possível carregar as solicitações. Verifique a configuração do banco de dados.');
}

function escapar(string $valor): string
{
    return htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
}

$nomesTipos = [
    'compra' => 'Compra de livro',
    'aluguel' => 'Aluguel de livro',
    'duvida' => 'Dúvida ou outro assunto',
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitações recebidas — Biblioteca Online</title>
    <style>
      body { margin: 0; padding: 2rem; color: #111; font: 1rem/1.5 Arial, sans-serif; }
      main { max-width: 1100px; margin: 0 auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: .75rem; border: 1px solid #ccc; text-align: left; vertical-align: top; }
      th { background: #111; color: #f5c518; }
      tbody tr:nth-child(even) { background: #f5f5f5; }
      td.mensagem { white-space: pre-wrap; overflow-wrap: anywhere; }
      @media (max-width: 700px) {
        body { padding: 1rem; }
        table, tbody, tr, td { display: block; }
        thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
        tbody tr { margin-bottom: 1rem; border: 1px solid #ccc; }
        td { border: 0; border-bottom: 1px solid #ddd; }
        td::before { display: block; font-weight: bold; }
        td:nth-child(1)::before { content: "Data"; }
        td:nth-child(2)::before { content: "Nome"; }
        td:nth-child(3)::before { content: "E-mail"; }
        td:nth-child(4)::before { content: "Solicitação"; }
        td:nth-child(5)::before { content: "Mensagem"; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Solicitações recebidas</h1>
      <p>Exibindo até as 100 solicitações mais recentes.</p>
      <?php if (!$solicitacoes): ?>
        <p>Nenhuma solicitação recebida ainda.</p>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Solicitação</th>
              <th scope="col">Mensagem</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($solicitacoes as $solicitacao): ?>
              <tr>
                <td><?= escapar($solicitacao['criado_em']) ?></td>
                <td><?= escapar($solicitacao['nome']) ?></td>
                <td><a href="mailto:<?= escapar($solicitacao['email']) ?>"><?= escapar($solicitacao['email']) ?></a></td>
                <td><?= escapar($nomesTipos[$solicitacao['tipo']] ?? 'Outro assunto') ?></td>
                <td class="mensagem"><?= escapar($solicitacao['mensagem']) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
      <p><a href="../frontend/index.html">Voltar ao site</a></p>
    </main>
  </body>
</html>
