<?php
// REDIRECIONAMENTO FORTE PARA HTTPS - COLOCAR NO TOPO ABSOLUTO
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirect_url);
    exit();
}
?>
<?php
    session_start();

    // Verificar se o usuário está logado
    if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
        // Se não estiver logado, redirecionar para a página de login
        header('Location: logi.php?message=' . urlencode('Acesso restrito! Faça login.') . '&type=error');
        exit();
    }

    require_once 'config.php';
?>





<!DOCTYPE html>
<html lang="pt_br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Histórico - SafeLinks</title>
    <link rel="stylesheet" href="../navBarStyle.css">
    <link rel="stylesheet" href="historicoStyle.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="index_php.css">
    <link rel="icon" href="../SafeLinks_Favicon_Logo.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <nav class="navBarElemento" id="navBarElementoId">
        <div class="navBarContainer">
            <div class="navBarLogo"><a href="index.php">SafeLinks</a></div>
            <ul class="navBarLinks" id="historicoNavBarLinksID">
                <li class="user-menu">
                    <button class="user-menu-button">
                        <i class="fas fa-user"></i> <?php echo htmlspecialchars($_SESSION['usuario_nome']); ?> <i class="fas fa-caret-down"></i>
                    </button>
                    <div class="user-dropdown">
                        <a id="openProfileModal"><i class="fas fa-user-cog"></i> Meu Perfil</a>
                        <a href="favorito.php"><i class="fas fa-heart"></i> Favoritos</a>
                        <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </li>
                <li><a href="../index.php"><i class="fas fa-home"></i> Início </a></li>
                <!-- <li><a href="#"><i class="fa fa-bell" id="notificacoesIcone"></i> Notificações </a></li> HOMEPAGE: NAVBAR, LINK => NOTIFICAÇÕES -->
                <li><a href="sobre.php"><i class="fa-solid fa-circle-info"></i> Sobre </a></li> <!-- HOMEPAGE: NAVBAR, LINK => SOBRE -->
                <li><a href="dicas.php"><i class="fa-solid fa-lightbulb"></i> Dicas </a></li>
                <li> 
                    <a href="logout.php" class="sair-link">
                        <i class="fas fa-sign-out-alt"></i> Deslogar
                    </a>
                </li>
                <li class="modoEscuroClaroElemento" id="modoEscuroClaroElementoId">
                    <a><i class="fas fa-moon"></i> Modo </a>
                </li>
            </ul>
            <div class="menuHamburguerElemento" id="menuHamburguerElementoId"><i class="fas fa-bars"></i></div>
        </div>
    </nav>

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





    <div class="redesDeContatoElemento" id="redesDeContatoElementoId">
      <ul aria-label="Fine Print">
        <a href="https://www.youtube.com/@safeLink-s7j" target="blank"><li><i class="fa-brands fa-youtube"></i></li> YouTube </a>
        <a href="https://web.facebook.com/profile.php?id=61582107901762" target="blank"><li> <i class="fa-brands fa-square-facebook"></i></li> Facebook </a>
        <a href="https://www.instagram.com/safelin297/" target="blank"> <li><i class="fa-brands fa-instagram"></i></li> Instagram </a>
      </ul>
    </div>


    
<!-- Modifique a parte do botão de pesquisa no histórico -->
<script src="../theme.js"></script>
<script src="index_php.js"></script>
<script src="historicoScript.js"></script>
</body>
</html>