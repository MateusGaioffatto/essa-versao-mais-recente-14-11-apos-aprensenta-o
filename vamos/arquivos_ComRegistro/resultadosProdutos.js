document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflow = 'auto';
    fetchProducts();
});

// Variáveis globais
let todosProdutos = [];
let lojasUnicas = new Set();
let userFavoritesWithIds = [];

// Sistema de filtros
let lojasSelecionadas = [];
let todasLojasDisponiveis = [];

// Elementos de filtro
let filtroLojasInput;
let lojasSugestoes;
let lojasCheckboxes;
let filtroCategorias;
let aplicarFiltrosBtn;
let limparFiltrosBtn;

// Parâmetros da URL
const params = new URLSearchParams(window.location.search);
const searchQuery = params.get("query");

// Função para inicializar os filtros
function inicializarFiltros() {
    console.log("Inicializando filtros...");
    
    // Inicializar elementos de filtro
    filtroLojasInput = document.getElementById('filtroLojasInput');
    lojasSugestoes = document.getElementById('lojasSugestoes');
    lojasCheckboxes = document.getElementById('lojasCheckboxes');
    filtroCategorias = document.getElementById('filtroCategorias');
    aplicarFiltrosBtn = document.getElementById('aplicarFiltrosBtn');
    limparFiltrosBtn = document.getElementById('limparFiltrosBtn');

    // Verificar se elementos foram encontrados
    if (!filtroLojasInput) {
        console.error("Elemento filtroLojasInput não encontrado!");
        return;
    }

    // Event listeners para filtros
    filtroLojasInput.addEventListener('input', function() {
        const valor = this.value.toLowerCase().trim();
        console.log("Input lojas:", valor);
        if (valor.length > 0) {
            mostrarSugestoesLojas(valor);
        } else {
            lojasSugestoes.style.display = 'none';
        }
    });

    filtroLojasInput.addEventListener('focus', function() {
        const valor = this.value.toLowerCase().trim();
        if (valor.length > 0) {
            mostrarSugestoesLojas(valor);
        }
    });

    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
        if (filtroLojasInput && lojasSugestoes && 
            !filtroLojasInput.contains(e.target) && 
            !lojasSugestoes.contains(e.target)) {
            lojasSugestoes.style.display = 'none';
        }
    });

    // Event listeners para botões
    if (aplicarFiltrosBtn) {
        aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
    }
    
    if (limparFiltrosBtn) {
        limparFiltrosBtn.addEventListener('click', limparFiltros);
    }

    console.log("Filtros inicializados com sucesso");
}

function mostrarSugestoesLojas(termo) {
    console.log("Mostrando sugestões para:", termo, "Lojas disponíveis:", todasLojasDisponiveis);
    
    if (todasLojasDisponiveis.length === 0) {
        console.log("Nenhuma loja disponível para sugestões");
        lojasSugestoes.style.display = 'none';
        return;
    }

    const lojasFiltradas = todasLojasDisponiveis.filter(loja => 
        loja && loja.toLowerCase().includes(termo)
    );
    
    console.log("Lojas filtradas:", lojasFiltradas);
    
    lojasSugestoes.innerHTML = '';
    
    if (lojasFiltradas.length > 0) {
        lojasFiltradas.forEach(loja => {
            const div = document.createElement('div');
            div.textContent = loja;
            div.className = 'sugestao-loja';
            div.addEventListener('click', () => {
                console.log("Loja selecionada:", loja);
                adicionarLojaFiltro(loja);
            });
            lojasSugestoes.appendChild(div);
        });
        lojasSugestoes.style.display = 'block';
    } else {
        lojasSugestoes.style.display = 'none';
        // Mostrar mensagem de nenhuma loja encontrada
        const div = document.createElement('div');
        div.textContent = 'Nenhuma loja encontrada';
        div.className = 'sugestao-loja';
        div.style.color = '#999';
        div.style.cursor = 'default';
        lojasSugestoes.appendChild(div);
        lojasSugestoes.style.display = 'block';
    }
}

// Funções de filtro
function adicionarLojaFiltro(loja) {
    if (!lojasSelecionadas.includes(loja)) {
        lojasSelecionadas.push(loja);
        atualizarCheckboxesLojas();
    }
    filtroLojasInput.value = '';
    lojasSugestoes.style.display = 'none';
}

function atualizarCheckboxesLojas() {
    if (!lojasCheckboxes) return;
    
    lojasCheckboxes.innerHTML = '';
    
    lojasSelecionadas.forEach(loja => {
        const container = document.createElement('div');
        container.className = 'loja-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.id = `loja-${loja.replace(/\s+/g, '-')}`;
        checkbox.addEventListener('change', function() {
            if (!this.checked) {
                lojasSelecionadas = lojasSelecionadas.filter(l => l !== loja);
                atualizarCheckboxesLojas();
            }
        });
        
        const label = document.createElement('label');
        label.phpFor = `loja-${loja.replace(/\s+/g, '-')}`;
        label.textContent = loja;
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '';
        removeBtn.className = 'remove-loja';
        removeBtn.addEventListener('click', function() {
            lojasSelecionadas = lojasSelecionadas.filter(l => l !== loja);
            atualizarCheckboxesLojas();
        });
        
        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(removeBtn);
        lojasCheckboxes.appendChild(container);
    });
}

async function aplicarFiltros() {
    if (!searchQuery) {
        console.error("Nenhuma query de pesquisa encontrada");
        return;
    }
    
    try {
        // Construir URL com filtros
        let url = `../api_search.php?q=${encodeURIComponent(searchQuery)}`;
        
        if (lojasSelecionadas.length > 0) {
            url += `&lojas=${lojasSelecionadas.map(encodeURIComponent).join(',')}`;
        }
        
        if (filtroCategorias && filtroCategorias.value !== 'todos') {
            url += `&categoria=${encodeURIComponent(filtroCategorias.value)}`;
        }
        
        console.log("URL da requisição:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Dados filtrados recebidos:", data);
        
        exibirProdutosFiltrados(data);
        
    } catch (err) {
        console.error("Error applying filters:", err);
        mostrarMensagemVazia("Erro ao aplicar filtros. Tente novamente.");
    }
}

function exibirProdutosFiltrados(data) {
    console.log("Exibindo produtos filtrados:", data);
    
    const resultadosProdutosUl = document.getElementById('resultadosProdutosUlID');
    if (!resultadosProdutosUl) return;
    
    // Limpar resultados
    resultadosProdutosUl.innerHTML = '';
    
    if (data.shopping_results && data.shopping_results.length > 0) {
        // Aplicar filtros adicionais nos dados recebidos
        let produtosFiltrados = data.shopping_results;
        
        // Filtrar por lojas selecionadas (se houver)
        if (lojasSelecionadas.length > 0) {
            produtosFiltrados = produtosFiltrados.filter(product => 
                product.source && lojasSelecionadas.includes(product.source)
            );
            console.log("Produtos após filtro de lojas:", produtosFiltrados.length);
        }
        
        // Filtrar por categoria (se aplicável)
        if (filtroCategorias && filtroCategorias.value !== 'todos') {
            const categoriaSelecionada = filtroCategorias.value.toLowerCase();
            
            produtosFiltrados = produtosFiltrados.filter(product => {
                // Verificar diferentes possíveis campos de categoria
                const categoriaProduto = (
                    product.category || 
                    product.categoria || 
                    product.product_category || 
                    ''
                ).toLowerCase();
                
                return categoriaProduto.includes(categoriaSelecionada);
            });
            
            console.log("Produtos após filtro de categoria:", produtosFiltrados.length);
            console.log("Categoria selecionada:", categoriaSelecionada);
        }
        
        // Exibir produtos filtrados
        if (produtosFiltrados.length > 0) {
            exibirProdutos(produtosFiltrados);
            console.log(`Exibidos ${produtosFiltrados.length} produtos filtrados`);
        } else {
            mostrarMensagemVazia("Nenhum produto encontrado com os filtros selecionados.");
        }
    } else {
        mostrarMensagemVazia("Nenhum produto encontrado com os filtros selecionados.");
    }
}

function limparFiltros() {
    lojasSelecionadas = [];
    if (filtroCategorias) {
        filtroCategorias.value = 'todos';
    }
    if (lojasCheckboxes) {
        lojasCheckboxes.innerHTML = '';
    }
    if (filtroLojasInput) {
        filtroLojasInput.value = '';
    }
    if (lojasSugestoes) {
        lojasSugestoes.style.display = 'none';
    }
     window.location.reload(); 
    // Recarregar produtos sem filtros
    fetchProducts();
}
// Função para salvar no histórico
async function salvarNoHistorico(product) {
    try {
        const response = await fetch('historico.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                termo: searchQuery,
                produto_nome: product.title,
                produto_url: product.product_link,
                loja_nome: product.source,
                preco: product.price,
                imagem: product.thumbnail
            })
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error('Erro ao salvar no histórico');
        }
    } catch (error) {
        console.error('Erro ao salvar no histórico:', error);
    }
}

// Função para buscar o ID do favorito pela URL
function getFavoriteIdByUrl(productUrl) {
    const favorito = userFavoritesWithIds.find(fav => fav.produto_url === productUrl);
    return favorito ? favorito.id : null;
}

// Função para favoritar produto usando ID
async function toggleFavorite(product, heartButton, productIndex) {
    const isCurrentlyFavorite = heartButton.classList.contains('active');
    
    try {
        if (isCurrentlyFavorite) {
            // Para remover, usar o ID do favorito
            const favoritoId = getFavoriteIdByUrl(product.product_link);
            if (!favoritoId) {
                alert('Erro: Não foi possível encontrar o favorito para remover');
                return;
            }
            
            const response = await fetch('favoritos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    produto_id: favoritoId,
                    acao: 'remover'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                heartButton.innerHTML = '<i class="far fa-heart"></i>';
                heartButton.classList.remove('active');
                // Atualizar a lista de favoritos
                userFavoritesWithIds = userFavoritesWithIds.filter(fav => fav.id !== favoritoId);
            } else {
                alert(data.message || 'Erro ao remover favorito!');
            }
        } else {
            // Para adicionar, usar os dados normais
            const response = await fetch('favoritos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acao: 'adicionar',
                    produto_nome: product.title,
                    produto_url: product.product_link,
                    loja_nome: product.source,
                    preco: product.price,
                    imagem: product.thumbnail
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                heartButton.innerHTML = '<i class="fas fa-heart"></i>';
                heartButton.classList.add('active');
                // Recarregar a lista de favoritos para obter o ID
                await loadUserFavorites();
            } else {
                alert(data.message || 'Erro ao favoritar produto!');
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar favorito:', error);
        alert('Erro ao favoritar produto!');
    }
}

// Carregar favoritos do usuário com IDs
async function loadUserFavorites() {
    try {
        const response = await fetch('favoritos.php');
        if (response.ok) {
            userFavoritesWithIds = await response.json();
            return userFavoritesWithIds.map(fav => fav.produto_url);
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
    }
    return [];
}

// Função para verificar e marcar favoritos existentes
async function verificarFavoritosExistentes() {
    try {
        await loadUserFavorites();
        
        // Marcar corações como ativos para produtos já favoritados
        document.querySelectorAll('.favorite-btn').forEach((btn, index) => {
            const product = todosProdutos[index];
            if (product && userFavoritesWithIds.some(fav => fav.produto_url === product.product_link)) {
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                btn.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Erro ao verificar favoritos:', error);
    }
}

// Função para exibir produtos
function exibirProdutos(produtos) {
    const resultadosProdutosUl = document.getElementById('resultadosProdutosUlID');
    
    if (!resultadosProdutosUl) {
        console.error("Elemento resultadosProdutosUlID não encontrado!");
        return;
    }
    
    console.log("Exibindo produtos:", produtos.length);
    
    // Limpar a UL antes de adicionar novos produtos
    resultadosProdutosUl.innerHTML = '';
    
    // Se não há produtos, mostrar mensagem
    if (!produtos || produtos.length === 0) {
        resultadosProdutosUl.innerHTML = '<p class="mensagem-vazio">Nenhum produto encontrado com os filtros aplicados.</p>';
        return;
    }
    
    // Criar e exibir os produtos disponíveis
    produtos.forEach((product, index) => {
        if (index >= 40) return; // Limitar a 40 produtos
        
        // Criar novos elementos para cada produto
        const li = document.createElement('li');
        li.className = "resultadosProdutosLi";
        li.style.display = 'block';

        // Botão de favorito
        const favoritoBtn = document.createElement('button');
        favoritoBtn.className = "favorite-btn";
        
        // Verificar se o produto já está favoritado
        const isFavorited = userFavoritesWithIds.some(fav => fav.produto_url === product.product_link);
        favoritoBtn.innerHTML = isFavorited ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        if (isFavorited) {
            favoritoBtn.classList.add('active');
        }
        
        favoritoBtn.style.position = 'absolute';
        favoritoBtn.style.top = '8px';
        favoritoBtn.style.right = '8px';
        favoritoBtn.style.background = 'none';
        favoritoBtn.style.border = 'none';
        favoritoBtn.style.fontSize = '1.2rem';
        favoritoBtn.style.cursor = 'pointer';
        favoritoBtn.style.zIndex = '10';

        // Imagem do produto
        const foto = document.createElement('img');
        foto.className = "resultadosProdutosLiImg";
        foto.src = product.thumbnail || 'https://via.placeholder.com/150';
        foto.alt = product.title || 'Produto';

        // Título do produto
        const texto = document.createElement('h1');
        texto.className = "liProdutosTitulos";
        texto.textContent = product.title || 'Produto sem título';

        // Preço do produto
        const preco = document.createElement('h2');
        preco.className = "liProdutosPrecos";
        preco.textContent = product.price ? `${product.price}` : 'Preço não disponível';

        // Ícone da loja
        const icone = document.createElement('img');
        icone.className = "liProdutosIconesImagens";
        icone.src = product.source_icon || '';
        icone.alt = product.source || 'Loja';

        // Nome da loja
        const lojaNome = document.createElement('p');
        lojaNome.className = "liProdutosLojasNomes";
        lojaNome.textContent = product.source || 'Loja não especificada';

        // Link do produto
        const link = document.createElement('a');
        link.className = "resultadosProdutosA";
        link.href = product.link || product.product_link || '#';
        link.target = "_blank";

        // Adicionar elementos ao LI
        li.appendChild(favoritoBtn);
        li.appendChild(foto);
        li.appendChild(texto);
        li.appendChild(preco);
        li.appendChild(icone);
        li.appendChild(lojaNome);

        // Adicionar LI ao link
        link.appendChild(li);

        // Adicionar link à UL
        resultadosProdutosUl.appendChild(link);

        // Configurar evento de favorito
        favoritoBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product, favoritoBtn, index);
        };

        // Configurar evento de histórico
        link.onclick = async () => {
            await salvarNoHistorico(product);
        };
    });
}
function mostrarMensagemVazia(mensagem) {
    const resultadosProdutosUl = document.getElementById('resultadosProdutosUlID');
    if (resultadosProdutosUl) {
        resultadosProdutosUl.innerHTML = `<p class="mensagem-vazio">${mensagem}</p>`;
    }
}

// Função principal para buscar produtos
async function fetchProducts() {
    if (!searchQuery) {
        mostrarMensagemVazia("Digite um termo de pesquisa para buscar produtos.");
        return;
    }

    try {
        document.title = 'SafeLinks - ' + searchQuery;
        
        // Mostrar indicador de carregamento
        const resultadosProdutosUl = document.getElementById('resultadosProdutosUlID');
        if (resultadosProdutosUl) {
            resultadosProdutosUl.innerHTML = '<p class="carregando">Carregando produtos...</p>';
        }
        
        // Carregar favoritos do usuário ANTES de exibir os produtos
        await loadUserFavorites();
        
        console.log("Buscando produtos para:", searchQuery);
        const response = await fetch(`../api_search.php?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Dados recebidos:", data);

        // Coletar lojas disponíveis
        todasLojasDisponiveis = []; // Resetar array
        if (data.shopping_results && data.shopping_results.length > 0) {
            todosProdutos = data.shopping_results;
            
            data.shopping_results.forEach(product => {
                if (product.source && !todasLojasDisponiveis.includes(product.source)) {
                    todasLojasDisponiveis.push(product.source);
                }
                if (product.source) {
                    lojasUnicas.add(product.source);
                }
            });
            console.log("Lojas coletadas:", todasLojasDisponiveis);
            
            // Inicializar filtros após carregar os produtos
            inicializarFiltros();
            
            // Exibir produtos
            exibirProdutos(data.shopping_results);
        } else {
            mostrarMensagemVazia("Nenhum produto encontrado para sua pesquisa.");
        }
        
    } catch (err) {
        console.error("Error fetching products:", err);
        mostrarMensagemVazia("Erro ao carregar produtos. Por favor, tente novamente.");
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Buscar produtos
    fetchProducts();
});