<?php
/* ===========================================================================
   ARA0062 — recebe o formulário de contato do frontend
   Este arquivo começa vazio de propósito: o PHP entra no ciclo 8.

   No ciclo 8 ele passa a ler os campos enviados pelo formulário
   (frontend/index.html), validar do lado do servidor e gravar no banco
   usando a conexão de config/conexao.php.

   É para cá que o atributo action do formulário vai apontar:
   <form action="../backend/processa-contato.php" method="post">
   =========================================================================== */
<?php

require_once __DIR__ . '/config/conexao.php';

function responder(string $mensagem, int $status, bool $json): void
{
    http_response_code($status);

    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            ['mensagem' => $mensagem],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $mensagemSegura = htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8');
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>Solicitação de contato</title></head><body>';
    echo '<main><h1>' . ($status < 400 ? 'Solicitação recebida' : 'Não foi possível enviar') . '</h1>';
    echo '<p>' . $mensagemSegura . '</p>';
    echo '<p><a href="../frontend/index.html#contato">Voltar ao formulário</a></p></main>';
    echo '</body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    responder('Método não permitido.', 405, true);
}

$json = isset($_SERVER['HTTP_ACCEPT'])
    && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

$site = $_POST['site'] ?? '';
if (is_string($site) && trim($site) !== '') {
    responder('Solicitação recebida. A equipe retornará pelo e-mail informado.', 200, $json);
}

$nomeRecebido = $_POST['nome'] ?? '';
$emailRecebido = $_POST['email'] ?? '';
$tipoRecebido = $_POST['tipo'] ?? '';
$mensagemRecebida = $_POST['mensagem'] ?? '';
$nome = is_string($nomeRecebido) ? trim($nomeRecebido) : '';
$email = is_string($emailRecebido) ? trim($emailRecebido) : '';
$tipo = is_string($tipoRecebido) ? $tipoRecebido : '';
$mensagem = is_string($mensagemRecebida) ? trim($mensagemRecebida) : '';
$tiposPermitidos = ['compra', 'aluguel', 'duvida'];

if (
    $nome === ''
    || strlen($nome) > 120
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || strlen($email) > 254
    || !in_array($tipo, $tiposPermitidos, true)
    || $mensagem === ''
    || strlen($mensagem) > 2000
) {
    responder('Confira os campos: nome, e-mail, tipo de solicitação e mensagem.', 422, $json);
}

try {
    $conexao = obterConexao();
    $comando = $conexao->prepare(
        'INSERT INTO solicitacoes_contato (nome, email, tipo, mensagem)
         VALUES (:nome, :email, :tipo, :mensagem)'
    );
    $comando->execute([
        ':nome' => $nome,
        ':email' => $email,
        ':tipo' => $tipo,
        ':mensagem' => $mensagem,
    ]);
} catch (Throwable $erro) {
    error_log((string) $erro);
    responder('O serviço está temporariamente indisponível. Tente novamente mais tarde.', 500, $json);
}

responder('Solicitação enviada com sucesso. A equipe retornará pelo e-mail informado.', 201, $json);

