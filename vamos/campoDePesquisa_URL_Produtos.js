modificarTextoPlaceholder();
setInterval(modificarTextoPlaceholder, 5000);

// MODIFICAR TEXTO DE PLACEHOLDER: VARIÁVEIS
const searchInputPlaceholders = ["Pesquise algum produto", "Entre com a URL de um site"];
let placeholderIndex = 0;

// MODIFICAR TEXTO DE PLACEHOLDER A CADA 5 SEGUNDOS: FUNCTION
function modificarTextoPlaceholder() {
    searchInput.classList.add("fade-out");

  setTimeout(() => {
    searchInput.placeholder = searchInputPlaceholders[placeholderIndex];
    placeholderIndex = (placeholderIndex + 1) % searchInputPlaceholders.length;

    searchInput.classList.remove("fade-out");
    searchInput.classList.add("fade-in");

    setTimeout(() => {
      searchInput.classList.remove("fade-in");
    }, 500);

  }, 3000);
}

// PESQUISA POR VOZ: VARIÁVEIS CONSTANTES
const voiceSearch = document.getElementById("voiceSearchId");
const homePageVoiceIcon = document.getElementById("voiceSearchIcon");

// PESQUISA POR VOZ: VARIÁVEIS
let recognition;
let recognizing = false;

// PESQUISA POR VOZ: FUNÇÕES
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    recognizing = true;
    voiceSearch.classList.add('active');
    homePageVoiceIcon.style.color = 'red';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    console.log(transcript);
  };
  recognition.onerror = () => {
    voiceSearch.classList.remove('active');
  };
  
  recognition.onend = () => {
    recognizing = false;
    voiceSearch.classList.remove('active');
  };

  voiceSearch.onclick = () => {
    if (recognizing) {
      recognition.stop();
      homePageVoiceIcon.style.color = '';
    } else {
      recognition.start();
    }
  };
} else {
  voiceSearch.disabled = true;
  homePageVoiceIcon.textContent = 'mic_off';
  homePageVoiceIcon.style.color = 'red';
  homePageVoiceIcon.title = 'Navegador não reconhece pesquisa por voz';
}

// Função para verificar se é uma URL válida
function isUrl(valor) {
    try {
        new URL(valor);
        return true;
    } catch (e) {
        return false;
    }
}

// Função principal para processar a entrada do usuário
async function processarEntradaUsuario(entrada) {
    const texto = entrada.trim();
    
    if (!texto) return;
    
    // Verificar se é uma URL
    if (isUrl(texto)) {
        // É uma URL - verificar segurança
        verificarUrlSegura(texto);
    } else {
        // É um termo de pesquisa - redirecionar para resultados
        window.location.href = `resultadosProdutos.php?query=${encodeURIComponent(texto)}`;
    }
}

// Modificar os event listeners
searchInput.addEventListener("keydown", async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        await processarEntradaUsuario(searchInput.value);
    }
});

searchButton.addEventListener('click', async function() {
    await processarEntradaUsuario(searchInput.value);
});

// Limpar pesquisa
limparTexto.addEventListener('click', function() {
  searchInput.value = '';
  const resultadosProdutosSearchInput = document.getElementById('resultadosProdutosSearchInput');
  if (resultadosProdutosSearchInput) resultadosProdutosSearchInput.value = '';
  searchInputText = '';
  const homePageProdutosDiv = document.getElementById('homePageProdutosDiv');
  if (homePageProdutosDiv) homePageProdutosDiv.style.display = 'none';
  pesquisasRecentes.style.display = 'none';
});

// Mostrar histórico de pesquisas
acessarHistorico.addEventListener('click', function() {
  const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (searchHistory.length > 0) {
    pesquisasRecentes.style.display = pesquisasRecentes.style.display === 'block' ? 'none' : 'block';
  } else {
    alert('Nenhum histórico de pesquisa disponível!');
  }
});