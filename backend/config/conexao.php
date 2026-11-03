<?php
/* ===========================================================================
   ARA0062 — conexão com o banco de dados
   Este arquivo começa vazio de propósito: o PHP entra no ciclo 8.

   Aqui vai ficar a conexão PDO com o banco do projeto, e é ela que os
   arquivos de dentro do backend/ vão incluir. Nada de HTML aqui: o backend
   recebe, valida e grava; quem desenha a tela é o frontend.
   =========================================================================== */
<?php

function obterConexao(): PDO
{
    $host = getenv('BIBLIOTECA_DB_HOST') ?: '127.0.0.1';
    $nomeBanco = getenv('BIBLIOTECA_DB_NAME') ?: 'biblioteca_online';
    $usuario = getenv('BIBLIOTECA_DB_USER');
    $senha = getenv('BIBLIOTECA_DB_PASSWORD');

    if ($usuario === false || $senha === false) {
        throw new RuntimeException(
            'Configure BIBLIOTECA_DB_USER e BIBLIOTECA_DB_PASSWORD no ambiente.'
        );
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $host,
        $nomeBanco
    );

    return new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

