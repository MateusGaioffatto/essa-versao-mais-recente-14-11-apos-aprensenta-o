
<?php
// REDIRECIONAMENTO FORTE PARA HTTPS - COLOCAR NO TOPO ABSOLUTO
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirect_url);
    exit();
}

session_start();

// Verificar se o usuário está logado
if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    // Se não estiver logado, redirecionar para a página de login
    header('Location: logi.php?message=' . urlencode('Acesso restrito! Faça login.') . '&type=error');
    exit();
}


?>
<!DOCTYPE html>
<html lang="pt_br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> SafeLinks - Meu Perfil </title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <link rel="shortcut icon" href="../SafeLinks_Favicon_Logo.png">

    <link rel="stylesheet" href="perfil.css">
    <link rel="stylesheet" href="index_php.css">
    <link rel="stylesheet" href="../navBarStyle.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="../style.css">
    <!-- Incluir estilos específicos de favoritos e histórico -->
    <link rel="stylesheet" href="favoritosStyle.css">
    <link rel="stylesheet" href="historicoStyle.css">
</head>
<body>
    <nav class="navBarElemento" id="navBarElementoId"> <!-- HOMEPAGE: NAVBAR -->
        <div class="navBarContainer"> 
        <div class="navBarLogo" id="navBarLogoId"><a href="index.php"> SafeLinks </a></div> <!-- HOMEPAGE: NAVBAR, LOGO -->
            <ul class="navBarLinks" id="navBarLinksId"> <!-- HOMEPAGE: NAVBAR, ÍCONES COM LINKS -->
                <li><a href="./index.php"><i class="fas fa-home"></i> Início </a></li>
                <!-- <li><a href="#"><i class="fa fa-bell" id="notificacoesIcone"></i> Notificações </a></li>  -->
                <li><a href="sobre.php"><i class="fa-solid fa-circle-info"></i> Sobre </a></li> 
                <li><a href="dicas.php"><i class="fa-solid fa-lightbulb"></i> Dicas </a></li>
                <li class="modoEscuroClaroElemento" id="modoEscuroClaroElementoId">
                <a><i class="fas fa-moon"></i> Modo </a>
                </li>
                <li> 
                    <a href="logout.php" class="sair-link">
                        <i class="fas fa-sign-out-alt"></i> Deslogar
                    </a>
                </li>
            </ul>
            <div class="menuHamburguerElemento" id="menuHamburguerElementoId"> <!-- HOMEPAGE: NAVBAR, MENU HAMBURGUER -->
                <i class="fas fa-bars"></i> <!-- ÍCONE, MENU HAMBURGUER -->
            </div>
        </div>
    </nav>
    
    <div class="perfilContainer" id="perfilContainerID"> <!-- PERFIL: CONTAINER PRINCIPAL -->
              <nav class="perfilNavbarEsquerdo" id="perfilNavbarEsquerdoID"> <!-- PERFIL: NAVBAR LATERAL ESQUERDO -->
            <div class="perfilNavbarEsquerdoDiv" id="perfilNavbarEsquerdoDivID">
                <button> PERFIL <i class="fa-solid fa-angle-up" id="perfilNavbarEsquerdoButtonArrowIcon"></i> </button>   
                <ul class="perfilNavbarEsquerdoPerfilUl" id="perfilNavbarEsquerdoPerfilUlID">
                    <li data-section="dados"> <i class="fa-regular fa-id-card"></i> Meus Dados </li>
                    <li data-section="favoritos"> <i class="fas fa-heart"></i> Favoritos </li>
                    <li data-section="historico"> <i class="fas fa-history"></i> Histórico </li>
                </ul>
                
              
            </div>
             
        </nav>
        
        <div class="perfilDados" id="perfilDadosID">
            <p class="voltarPerfilUlTexto" id="voltarPerfilUlTextoID"></p>
            <div class="voltarPerfilUl" id="voltarPerfilUlID">
                <i class="fa-solid fa-angle-left"></i>
                VOLTAR
            </div>
            
            <!-- Seção Meus Dados -->
            <div class="section-content" id="section-dados" style="display: none;">
                <div class="container mt-4">
                    <h2 class="mb-4"><i class="fa-regular fa-id-card me-2"></i>Meus Dados</h2>
                    
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <form id="profileFormPerfil">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="profileName" class="form-label">Nome</label>
                                        <input type="text" class="form-control" id="profileName" 
                                               value="<?php echo htmlspecialchars($_SESSION['usuario_nome']); ?>" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="profileEmail" class="form-label">E-mail</label>
                                        <input type="email" class="form-control" id="profileEmail" 
                                               value="<?php echo htmlspecialchars($_SESSION['usuario_email']); ?>" required>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="profilePassword" class="form-label">Nova Senha</label>
                                        <input type="password" class="form-control" id="profilePassword" 
                                               placeholder="Deixe em branco para não alterar">
                                        <div class="form-text">Mínimo 6 caracteres</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="profilePasswordConfirm" class="form-label">Confirmar Nova Senha</label>
                                        <input type="password" class="form-control" id="profilePasswordConfirm" 
                                               placeholder="Confirme a nova senha">
                                    </div>
                                </div>
                                
                                <div class="d-flex gap-2 mt-4">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-2"></i>Salvar Alterações
                                    </button>
                                    <button type="button" id="deleteAccountPerfil" class="btn btn-danger">
                                        <i class="fas fa-trash me-2"></i>Excluir Conta
                                    </button>
                                </div>
                                
                                <div id="formMessage" class="mt-3"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Seção Favoritos -->
            <div class="section-content" id="section-favoritos" style="display: none;">
                <div class="favoritos-container">
                    <div class="favoritos-header">
                        <h1><i class="fas fa-heart"></i> Meus Produtos Favoritos</h1>
                        <p>Gerencie todos os produtos que você salvou para consultas futuras</p>
                    </div>
                    
                    <div class="favoritos-grid" id="favoritosGrid">
                        <div class="empty-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Carregando seus produtos favoritos...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Seção Histórico -->
            <div class="section-content" id="section-historico" style="display: none;">
                <div class="historico-container">
                    <div class="historico-header">
                        <h1><i class="fas fa-history"></i> Meu Histórico de Pesquisas</h1>
                    </div>
                    <div class="historico-list" id="historicoList">
                        <div class="empty-state">
                            <i class="fas fa-spinner fa-spin"></i> Carregando histórico...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal de Confirmação -->
    <div class="modal fade" id="confirmModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirmação</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="confirmModalBody">
                    <!-- Conteúdo dinâmico -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="confirmModalButton">Confirmar</button>
                </div>
            </div>
        </div>
    </div>



    <!-- Incluir scripts necessários -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="perfil.js"></script>
    <script src="../script.js"></script>
    <script src="../theme.js"></script>
    <script src="favoritosScript.js"></script>
    <script type="module" src="historicoScript.js" ></script>
    <script src="perfilDados.js"></script>
</body>
</html>
