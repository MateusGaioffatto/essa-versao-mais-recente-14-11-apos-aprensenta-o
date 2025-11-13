<?php
// REDIRECIONAMENTO FORTE PARA HTTPS - COLOCAR NO TOPO ABSOLUTO
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $redirect_url);
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt_br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meus Produtos Favoritos - SafeLinks</title>
        <link rel="stylesheet" href="favoritosStyle.css">
        <link rel="stylesheet" href="../navBarStyle.css">
        <link rel="stylesheet" href="style.css">
        <link rel="icon" href="../SafeLinks_Favicon_Logo.png" type="image/png">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
    <!-- NAVBAR -->
    <nav class="navBarElemento" id="navBarElementoId">
        <div class="navBarContainer">
            <div class="navBarLogo"><a href="index.php">SafeLinks</a></div>
            <ul class="navBarLinks" id="favoritosNavBarLinksID">
                

            
                <li><a href="#"><i class="fa fa-bell" id="notificacoesIcone"></i> Notificações </a></li> <!-- HOMEPAGE: NAVBAR, LINK => NOTIFICAÇÕES -->
                <li><a href="sobre.php"><i class="fa-solid fa-circle-info"></i> Sobre </a></li> <!-- HOMEPAGE: NAVBAR, LINK => SOBRE -->
                <li><a href="dicas.php"><i class="fa-solid fa-lightbulb"></i> Dicas </a></li>
                <li class="modoEscuroClaroElemento" id="modoEscuroClaroElementoId"><i class="fas fa-moon"></i></li> <!-- <= CONCERTO NESCESSÁRIO! -->
            </ul>
            <div class="menuHamburguerElemento" id="menuHamburguerElementoId"><i class="fas fa-bars"></i></div>
        </div>
    </nav>

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

    



    <div class="redesDeContatoElemento" id="redesDeContatoElementoId">
      <ul aria-label="Fine Print">
        <a href="https://www.youtube.com/@safeLink-s7j" target="blank"><li><i class="fa-brands fa-youtube"></i></li> YouTube </a>
        <a href="https://web.facebook.com/profile.php?id=61582107901762" target="blank"><li> <i class="fa-brands fa-square-facebook"></i></li> Facebook </a>
        <a href="https://www.instagram.com/safelin297/" target="blank"> <li><i class="fa-brands fa-instagram"></i></li> Instagram </a>
      </ul>
    </div>



    <script src="favoritosScript.js"></script>
    <script src="../theme.js"></script>
</body>
</html>