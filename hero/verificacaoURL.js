// Função para verificar a segurança da URL
function verificarUrlSegura(url) {
  const resultadoVerificacaoURL = document.getElementById('resultadoVerificacaoURL');
  resultadoVerificacaoURL.style.display = 'block';
  resultadoVerificacaoURL.innerHTML = `
    <div class="d-flex justify-content-center align-items-center p-4">
      <div class="spinner-border text-primary me-3" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <span>Verificando URL...</span>
    </div>
  `;
  
  fetch('virus_total_api.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url })
  })
  .then(response => response.json())
  .then(data => {
    if (data.segura) {
      mostrarResultadoResumidoSeguro(data, url);
    } else {
      mostrarResultadoResumidoNaoSeguro(data, url);
    }
  })
  .catch(error => {
    resultadoVerificacaoURL.innerHTML = `
      <div class="alert alert-warning text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Erro de Conexão</strong><br>
        Não foi possível verificar a URL no momento.
      </div>
    `;
    console.error('Erro:', error);
  });
}

// Função para mostrar resultado SEGURO resumido
function mostrarResultadoResumidoSeguro(data, url) {
  const cacheBadge = data.cache ? '<span class="badge bg-secondary ms-2">CACHE</span>' : '';
  
  const html = `
    <div class="alert alert-success">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex align-items-center">
          <i class="fas fa-check-circle me-2"></i>
          <h5 class="mb-0">URL Segura</h5>
          ${cacheBadge}
        </div>
        <button class="btn btn-outline-success btn-sm" onclick="mostrarDetalhesVerificacao(${JSON.stringify(data).replace(/"/g, '&quot;')})">
          <i class="fas fa-info-circle me-1"></i> Saiba mais
        </button>
      </div>
      <div class="mt-2">
        <p class="mb-1"><strong>URL:</strong> ${data.url}</p>
        ${gerarResumoSistemas(data)}
        ${gerarResumoEstatisticas(data)}
        <p class="mb-0"><strong>Status:</strong> <span class="text-success fw-bold">✅ SEGURO PARA ACESSO</span></p>
      </div>
    </div>
  `;

  document.getElementById('resultadoVerificacaoURL').innerHTML = html;
  adicionarAoHistorico(url);
}

// Função para mostrar resultado NÃO SEGURO resumido
function mostrarResultadoResumidoNaoSeguro(data, url) {
  let html = '';

  if (data.erro) {
    html = `
      <div class="alert alert-danger">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <i class="fas fa-exclamation-triangle me-2"></i>
            <h5 class="mb-0">Erro na Verificação</h5>
          </div>
          <button class="btn btn-outline-danger btn-sm" onclick="mostrarDetalhesVerificacao(${JSON.stringify(data).replace(/"/g, '&quot;')})">
            <i class="fas fa-info-circle me-1"></i> Detalhes
          </button>
        </div>
        <div class="mt-2">
          <p class="mb-1"><strong>URL:</strong> ${data.url}</p>
          <p class="mb-0"><strong>Erro:</strong> ${data.erro}</p>
        </div>
      </div>
    `;
  } else if (data.ameacas) {
    const totalAmeacas = data.ameacas.length;
    const fontePrincipal = data.fonte_principal || data.fontes?.[0] || 'Sistema de segurança';
    
    html = `
      <div class="alert alert-danger">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <h5 class="mb-0">URL Não Segura</h5>
            <span class="badge bg-danger ms-2">${totalAmeacas} AMEAÇA${totalAmeacas > 1 ? 'S' : ''}</span>
          </div>
          <button class="btn btn-outline-danger btn-sm" onclick="mostrarDetalhesVerificacao(${JSON.stringify(data).replace(/"/g, '&quot;')})">
            <i class="fas fa-info-circle me-1"></i> Ver ameaças
          </button>
        </div>
        <div class="mt-2">
          <p class="mb-1"><strong>URL:</strong> ${data.url}</p>
          <p class="mb-1"><strong>Detectado por:</strong> ${fontePrincipal}</p>
          ${gerarResumoDetecoes(data)}
          <p class="mb-0"><strong>Recomendação:</strong> <span class="text-danger fw-bold">🚫 NÃO ACESSE ESTE SITE</span></p>
        </div>
      </div>
    `;
  }

  document.getElementById('resultadoVerificacaoURL').innerHTML = html;
}

// Funções auxiliares para gerar conteúdo
function gerarResumoSistemas(data) {
  if (!data.fontes || data.fontes.length === 0) return '';
  
  const sistemas = data.fontes.map(fonte => {
    const icone = fonte.includes('Safe Browsing') ? '🔒' : '🛡️';
    return `${icone} ${fonte}`;
  }).join(', ');
  
  return `<p class="mb-1"><strong>Sistemas utilizados:</strong> ${sistemas}</p>`;
}

function gerarResumoEstatisticas(data) {
  if (!data.estatisticas_virustotal) return '';
  
  const vt = data.estatisticas_virustotal;
  return `<p class="mb-1"><strong>VirusTotal:</strong> ${vt.deteccoes_favoraveis}/${vt.total_analises} motores seguros (${vt.percentual_seguro}%)</p>`;
}

function gerarResumoDetecoes(data) {
  if (!data.estatisticas_virustotal) return '';
  
  const vt = data.estatisticas_virustotal;
  return `<p class="mb-1"><strong>Detecções:</strong> ${vt.total_deteccoes}/${vt.total_analises} motores</p>`;
}

// Modal de detalhes
function mostrarDetalhesVerificacao(data) {
  const modalHTML = `
    <div class="modal fade" id="detalhesVerificacaoModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              ${data.segura ? 
                '<i class="fas fa-check-circle text-success me-2"></i>Detalhes da Verificação - URL Segura' : 
                '<i class="fas fa-exclamation-triangle text-danger me-2"></i>Detalhes da Verificação - URL Não Segura'
              }
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${data.segura ? criarConteudoModalSeguro(data) : criarConteudoModalNaoSeguro(data)}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove modal existente se houver
  const existingModal = document.getElementById('detalhesVerificacaoModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Adiciona novo modal ao DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Mostra o modal
  const modal = new bootstrap.Modal(document.getElementById('detalhesVerificacaoModal'));
  modal.show();
}

function criarConteudoModalSeguro(data) {
  return `
    <div class="mb-3">
      <p><strong>URL:</strong> ${data.url}</p>
    </div>
    ${criarSecaoSistemas(data)}
    ${criarSecaoEstatisticas(data)}
    ${criarSecaoGestaoRecursos(data)}
    ${criarSecaoCache(data)}
  `;
}

function criarConteudoModalNaoSeguro(data) {
  if (data.erro) {
    return `
      <div class="alert alert-danger">
        <h6>🚫 Erro na Verificação</h6>
        <p class="mb-0">${data.erro}</p>
      </div>
    `;
  }

  return `
    <div class="mb-3">
      <p><strong>URL:</strong> ${data.url}</p>
    </div>
    ${criarSecaoSistemasPerigo(data)}
    ${criarSecaoAmeacas(data)}
    ${criarSecaoEstatisticasPerigo(data)}
    ${criarSecaoRecomendacoes()}
  `;
}

// Funções para criar seções do modal
function criarSecaoSistemas(data) {
  if (!data.fontes || data.fontes.length === 0) return '';
  
  const sistemasHTML = data.fontes.map(fonte => {
    const icone = fonte.includes('Safe Browsing') ? '🔒' : '🛡️';
    const status = fonte.includes('Safe Browsing') ? '<span class="text-success">✅ Nenhuma ameaça detectada</span>' : '<span class="text-success">✅ Análise concluída</span>';
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              ${icone} <strong>${fonte}</strong>
            </div>
            <div class="text-end">
              <small>${status}</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2">🔍 Sistemas de Verificação Utilizados</h6>
      ${sistemasHTML}
      <small class="text-muted">Verificações realizadas: ${data.verificacoes_realizadas || 1}</small>
    </div>
  `;
}

function criarSecaoEstatisticas(data) {
  if (!data.estatisticas_virustotal) return '';
  
  const vt = data.estatisticas_virustotal;
  const percentual = vt.percentual_seguro;
  let progressColor = 'bg-success';
  if (percentual < 80) progressColor = 'bg-warning';
  if (percentual < 60) progressColor = 'bg-danger';

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2">📊 Análise VirusTotal Detalhada</h6>
      <div class="row text-center mb-3">
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1">${vt.total_analises}</div>
            <small class="text-muted">Total de Motores</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1 text-success">${vt.deteccoes_favoraveis}</div>
            <small class="text-muted">Motores Seguros</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1 text-danger">${vt.total_deteccoes}</div>
            <small class="text-muted">Detecções</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1">${vt.percentual_seguro}%</div>
            <small class="text-muted">Taxa de Confiança</small>
          </div>
        </div>
      </div>
      <div class="progress mb-2" style="height: 20px;">
        <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${percentual}%">
          ${percentual}%
        </div>
      </div>
    </div>
  `;
}

function criarSecaoGestaoRecursos(data) {
  if (!data.gestao_recursos) return '';
  
  const gr = data.gestao_recursos;
  const nivelRisco = gr.analise_heuristica?.nivel_risco || 'N/A';
  let riscoBadge = 'bg-secondary';
  if (nivelRisco === 'ALTO') riscoBadge = 'bg-danger';
  if (nivelRisco === 'MEDIO') riscoBadge = 'bg-warning';
  if (nivelRisco === 'BAIXO') riscoBadge = 'bg-success';

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2">⚡ Gestão de Recursos</h6>
      <div class="row text-center mb-3">
        <div class="col-4">
          <div class="border rounded p-2">
            <div class="h5 mb-1">${gr.usar_virustotal ? '✅' : '❌'}</div>
            <small class="text-muted">VirusTotal Usado</small>
          </div>
        </div>
        <div class="col-4">
          <div class="border rounded p-2">
            <div class="h5 mb-1">${gr.remaining}/4</div>
            <small class="text-muted">Requests Disponível</small>
          </div>
        </div>
        <div class="col-4">
          <div class="border rounded p-2">
            <div class="h5 mb-1"><span class="badge ${riscoBadge}">${nivelRisco}</span></div>
            <small class="text-muted">Nível de Risco</small>
          </div>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>Motivo:</strong> ${gr.motivo}
        ${gr.analise_heuristica?.pontuacao ? `<br><strong>Pontuação:</strong> ${gr.analise_heuristica.pontuacao}/10` : ''}
      </div>
    </div>
  `;
}

function criarSecaoCache(data) {
  if (!data.cache) return '';
  
  return `
    <div class="alert alert-secondary">
      <strong>💾 Resultado em Cache</strong><br>
      <small>Esta verificação foi recuperada do cache local para otimização de performance.</small>
    </div>
  `;
}

function criarSecaoSistemasPerigo(data) {
  if (!data.fontes || data.fontes.length === 0) return '';
  
  const sistemasHTML = data.fontes.map(fonte => {
    const icone = fonte.includes('Safe Browsing') ? '🔒' : '🛡️';
    return `
      <div class="card border-danger mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              ${icone} <strong>${fonte}</strong>
            </div>
            <div class="text-end">
              <span class="badge bg-danger">❌ Ameaças detectadas</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2 text-danger">🔍 Sistemas que Detectaram Ameaças</h6>
      ${sistemasHTML}
    </div>
  `;
}

function criarSecaoAmeacas(data) {
  if (!data.ameacas || data.ameacas.length === 0) return '';
  
  const ameacasHTML = data.ameacas.map((ameaca, index) => {
    if (ameaca.tipo) {
      return `
        <div class="card border-danger mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center mb-1">
              <span class="badge bg-danger me-2">⚠️</span>
              <strong>${ameaca.tipo}</strong>
            </div>
            <small class="text-muted">Plataforma: ${ameaca.plataforma}</small>
          </div>
        </div>
      `;
    } else if (ameaca.engine) {
      return `
        <div class="card border-danger mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center mb-1">
              <span class="badge bg-warning me-2">🛡️</span>
              <strong>${ameaca.engine}</strong>
            </div>
            <small class="text-muted">Detecção: ${ameaca.resultado}</small>
          </div>
        </div>
      `;
    }
    return '';
  }).join('');

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2 text-danger">📋 Ameaças Detectadas</h6>
      ${ameacasHTML}
    </div>
  `;
}

function criarSecaoEstatisticasPerigo(data) {
  if (!data.estatisticas_virustotal) return '';
  
  const vt = data.estatisticas_virustotal;
  const taxaDetecao = Math.round((vt.total_deteccoes / vt.total_analises) * 100);

  return `
    <div class="mb-4">
      <h6 class="border-bottom pb-2 text-danger">📊 Estatísticas VirusTotal</h6>
      <div class="row text-center mb-3">
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1">${vt.total_analises}</div>
            <small class="text-muted">Total de Motores</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1 text-danger">${vt.total_deteccoes}</div>
            <small class="text-muted">Motores que Detectaram</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1 text-warning">${taxaDetecao}%</div>
            <small class="text-muted">Taxa de Detecção</small>
          </div>
        </div>
        <div class="col-3">
          <div class="border rounded p-2">
            <div class="h5 mb-1"><span class="badge bg-danger">🔴 Crítico</span></div>
            <small class="text-muted">Status</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

function criarSecaoRecomendacoes() {
  return `
    <div class="alert alert-danger">
      <h6>🚨 Recomendações de Segurança</h6>
      <ul class="mb-0">
        <li><strong>NÃO ACESSE</strong> este site</li>
        <li>Não forneça informações pessoais</li>
        <li>Feche imediatamente se já estiver aberto</li>
        <li>Verifique se não é um site de phishing</li>
        <li>Reporte como site malicioso se possível</li>
      </ul>
    </div>
  `;
}

// [MANTENHA AS FUNÇÕES EXISTENTES ABAIXO]
function adicionarAoHistorico(url) {
  let historico = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!historico.includes(url)) {
    historico.unshift(url);
    historico = historico.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(historico));
    atualizarExibicaoHistorico();
  }
}

function atualizarExibicaoHistorico() {
  const historicoItems = document.getElementById('pesquisasRecentesItemsId');
  const historico = JSON.parse(localStorage.getItem('searchHistory')) || [];
  
  historicoItems.innerHTML = '';
  
  historico.forEach(url => {
    const item = document.createElement('div');
    item.className = 'pesquisaRecenteItem';
    item.textContent = url;
    item.style.cursor = 'pointer';
    item.style.margin = '5px 0';
    item.style.padding = '5px';
    item.style.borderRadius = '4px';
    item.style.backgroundColor = '#f0f0f0';
    item.addEventListener('click', () => {
      document.getElementById('searchInputId').value = url;
      verificarUrlSegura(url);
    });
    
    historicoItems.appendChild(item);
  });
}

// Event Listeners
document.getElementById('searchButtonId').addEventListener('click', function() {
  const url = document.getElementById('searchInputId').value.trim();
  if (url) {
    verificarUrlSegura(url);
  } else {
    alert('Por favor, digite uma URL para verificar.');
  }
});

document.getElementById('searchInputId').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const url = this.value.trim();
    if (url) {
      verificarUrlSegura(url);
    } else {
      alert('Por favor, digite uma URL para verificar.');
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  atualizarExibicaoHistorico();
});