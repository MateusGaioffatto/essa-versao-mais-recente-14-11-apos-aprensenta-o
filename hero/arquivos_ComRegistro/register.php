<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $senha = $_POST['password'];
    $data_nascimento = $_POST['nascimento_register'];
    $confirmar_senha = $_POST['password_confirm'];
    
    // Validações
    if (empty($nome) || empty($email) || empty($senha) || empty($data_nascimento)) {
        header('Location: logi.php?message=' . urlencode('Todos os campos são obrigatórios!') . '&type=error');
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header('Location: logi.php?message=' . urlencode('E-mail inválido!') . '&type=error');
        exit();
    }
    
    if ($senha !== $confirmar_senha) {
        header('Location: logi.php?message=' . urlencode('As senhas não coincidem!') . '&type=error');
        exit();
    }
    
    if (strlen($senha) < 6) {
        header('Location: logi.php?message=' . urlencode('A senha deve ter pelo menos 6 caracteres!') . '&type=error');
        exit();
    }
    
    // Validar data de nascimento
    $data_nascimento_obj = DateTime::createFromFormat('Y-m-d', $data_nascimento);
    if (!$data_nascimento_obj || $data_nascimento_obj->format('Y-m-d') !== $data_nascimento) {
        header('Location: logi.php?message=' . urlencode('Data de nascimento inválida!') . '&type=error');
        exit();
    }
    
    // Validar idade mínima (13 anos)
    $idade = calcularIdade($data_nascimento);
    if ($idade < 13) {
        header('Location: logi.php?message=' . urlencode('Você deve ter pelo menos 13 anos para se cadastrar!') . '&type=error');
        exit();
    }
    
    try {
        $conn = getDBConnection();
        
        // Verificar se o e-mail já existe
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            header('Location: logi.php?message=' . urlencode('Este e-mail já está cadastrado!') . '&type=error');
            exit();
        }
        
        // Hash da senha
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        
        // Inserir usuário
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, data_nascimento) VALUES (:nome, :email, :senha, :data_nascimento)");
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':senha', $senha_hash);
        $stmt->bindParam(':data_nascimento', $data_nascimento);
        
        if ($stmt->execute()) {
            header('Location: logi.php?message=' . urlencode('Cadastro realizado com sucesso! Faça login.') . '&type=success');
            exit();
        } else {
            header('Location: logi.php?message=' . urlencode('Erro ao cadastrar. Tente novamente.') . '&type=error');
            exit();
        }
    } catch(PDOException $e) {
        header('Location: logi.php?message=' . urlencode('Erro no servidor: ' . $e->getMessage()) . '&type=error');
        exit();
    }
} else {
    header('Location: /index.php');
    exit();
}
?>