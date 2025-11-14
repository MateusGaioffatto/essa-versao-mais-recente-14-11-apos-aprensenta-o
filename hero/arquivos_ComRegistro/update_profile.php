<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Usuário não logado']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = $_SESSION['usuario_id'];
    $nome = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $data_nascimento = $_POST['data_nascimento'] ?? '';
    $senha = $_POST['password'] ?? '';
    
    try {
        $conn = getDBConnection();
        
        // Verificar se o email já existe em outro usuário
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = :email AND id != :id");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Este e-mail já está em uso por outro usuário']);
            exit();
        }
        
        // Validar data de nascimento
        if (!empty($data_nascimento)) {
            $data_nascimento = date('Y-m-d', strtotime($data_nascimento));
            
            // Validar se a data é válida
            $data_obj = DateTime::createFromFormat('Y-m-d', $data_nascimento);
            if (!$data_obj || $data_obj->format('Y-m-d') !== $data_nascimento) {
                echo json_encode(['success' => false, 'message' => 'Data de nascimento inválida']);
                exit();
            }
            
            // Validar se o usuário tem pelo menos 13 anos
            $idade = calcularIdade($data_nascimento);
            if ($idade < 13) {
                echo json_encode(['success' => false, 'message' => 'Você deve ter pelo menos 13 anos para usar este serviço']);
                exit();
            }
        } else {
            // Manter a data atual se não for fornecida
            $stmt_current = $conn->prepare("SELECT data_nascimento FROM usuarios WHERE id = :id");
            $stmt_current->bindParam(':id', $id);
            $stmt_current->execute();
            $usuario_atual = $stmt_current->fetch(PDO::FETCH_ASSOC);
            $data_nascimento = $usuario_atual['data_nascimento'];
        }
        
        // Atualizar usuário
        if (!empty($senha)) {
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("UPDATE usuarios SET nome = :nome, email = :email, data_nascimento = :data_nascimento, senha = :senha WHERE id = :id");
            $stmt->bindParam(':senha', $senhaHash);
        } else {
            $stmt = $conn->prepare("UPDATE usuarios SET nome = :nome, email = :email, data_nascimento = :data_nascimento WHERE id = :id");
        }
        
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':data_nascimento', $data_nascimento);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            // Atualizar dados na sessão
            $_SESSION['usuario_nome'] = $nome;
            $_SESSION['usuario_email'] = $email;
            $_SESSION['usuario_data_nascimento'] = $data_nascimento;
            
            echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar perfil']);
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>