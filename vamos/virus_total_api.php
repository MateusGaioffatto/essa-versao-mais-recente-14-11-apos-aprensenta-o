<?php
header('Content-Type: application/json');

// Configurações de APIs
$VIRUSTOTAL_API_KEY = '81d9e2a95c5b27dd47775884a8967074ff99e3a2b89e6818a9222e4eedbe5ef9'; // Substitua pela sua chave
$SAFEBROWSING_API_KEY = 'AIzaSyBqsbb3claaGJ-4XZ-FugWHLtl5uxHDdNo';
$CACHE_DURATION = 3600; // 1 hora
$CACHE_DIR = __DIR__ . '/cache/';

// Sistema de rate limit para VirusTotal
$VIRUSTOTAL_MAX_REQUESTS = 4;
$VIRUSTOTAL_WINDOW_MINUTES = 1;

// Criar diretório de cache se não existir
if (!file_exists($CACHE_DIR)) {
    mkdir($CACHE_DIR, 0755, true);
}

function normalizarUrl($url) {
    // Remover espaços em branco
    $url = trim($url);
    
    // Adicionar http:// se não tiver protocolo
    if (!preg_match('/^https?:\/\//i', $url)) {
        $url = 'http://' . $url;
    }
    
    // Validar e sanitizar URL
    $url = filter_var($url, FILTER_SANITIZE_URL);
    
    return $url;
}

function getCacheKey($url) {
    return md5($url);
}

function getCachedResult($cacheKey) {
    global $CACHE_DIR, $CACHE_DURATION;
    
    $cacheFile = $CACHE_DIR . $cacheKey . '.json';
    
    if (file_exists($cacheFile)) {
        $fileTime = filemtime($cacheFile);
        if (time() - $fileTime < $CACHE_DURATION) {
            return json_decode(file_get_contents($cacheFile), true);
        }
        unlink($cacheFile);
    }
    
    return null;
}

function saveToCache($cacheKey, $data) {
    global $CACHE_DIR;
    
    $cacheFile = $CACHE_DIR . $cacheKey . '.json';
    file_put_contents($cacheFile, json_encode($data));
}

// Gestão de Rate Limit para VirusTotal
function getVirusTotalRateLimit() {
    $rateLimitFile = __DIR__ . '/virustotal_rate_limit.json';
    $now = time();
    
    if (file_exists($rateLimitFile)) {
        $rateData = json_decode(file_get_contents($rateLimitFile), true);
        
        // Manter apenas registros da última janela de tempo
        $rateData = array_filter($rateData, function($timestamp) use ($now) {
            return ($now - $timestamp) < (60 * $GLOBALS['VIRUSTOTAL_WINDOW_MINUTES']);
        });
        
        $used = count($rateData);
        $remaining = $GLOBALS['VIRUSTOTAL_MAX_REQUESTS'] - $used;
        
        return [
            'used' => $used,
            'remaining' => $remaining,
            'exceeded' => $used >= $GLOBALS['VIRUSTOTAL_MAX_REQUESTS'],
            'reset_time' => $now + (60 * $GLOBALS['VIRUSTOTAL_WINDOW_MINUTES'])
        ];
    }
    
    return [
        'used' => 0,
        'remaining' => $GLOBALS['VIRUSTOTAL_MAX_REQUESTS'],
        'exceeded' => false,
        'reset_time' => $now + (60 * $GLOBALS['VIRUSTOTAL_WINDOW_MINUTES'])
    ];
}

function recordVirusTotalRequest() {
    $rateLimitFile = __DIR__ . '/virustotal_rate_limit.json';
    $now = time();
    
    $rateData = [];
    if (file_exists($rateLimitFile)) {
        $rateData = json_decode(file_get_contents($rateLimitFile), true);
        $rateData = array_filter($rateData, function($timestamp) use ($now) {
            return ($now - $timestamp) < (60 * $GLOBALS['VIRUSTOTAL_WINDOW_MINUTES']);
        });
    }
    
    $rateData[] = $now;
    file_put_contents($rateLimitFile, json_encode(array_values($rateData)));
}

// Safe Browsing (mantém igual ao seu código)
function verificarSafeBrowsing($url) {
    global $SAFEBROWSING_API_KEY;
    
    $apiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" . $SAFEBROWSING_API_KEY;
    
    $postData = [
        "client" => [
            "clientId" => "safelinks",
            "clientVersion" => "1.0.0"
        ],
        "threatInfo" => [
            "threatTypes" => [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes" => ["ANY_PLATFORM"],
            "threatEntryTypes" => ["URL"],
            "threatEntries" => [
                ["url" => $url]
            ]
        ]
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($postData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FAILONERROR => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        return [
            'segura' => true,
            'erro' => 'Erro na comunicação com Safe Browsing: ' . $curlError,
            'codigo_http' => $httpCode
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'segura' => true,
            'erro' => 'Erro no Safe Browsing: HTTP ' . $httpCode,
            'resposta' => $response
        ];
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'segura' => true,
            'erro' => 'Resposta do Safe Browsing inválida'
        ];
    }
    
    if (empty($data['matches'])) {
        return [
            'segura' => true,
            'url' => $url
        ];
    }
    
    $threats = [];
    foreach ($data['matches'] as $match) {
        $threats[] = [
            'tipo' => $match['threatType'],
            'plataforma' => $match['platformType']
        ];
    }
    
    return [
        'segura' => false,
        'ameacas' => $threats,
        'url' => $url
    ];
}

// VirusTotal
function verificarVirusTotal($url) {
    global $VIRUSTOTAL_API_KEY;
    
    $reportUrl = "https://www.virustotal.com/vtapi/v2/url/report";
    $postData = http_build_query([
        'apikey' => $VIRUSTOTAL_API_KEY,
        'resource' => $url
    ]);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $reportUrl . '?' . $postData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        return [
            'segura' => null,
            'erro' => 'Erro VirusTotal: ' . $curlError
        ];
    }
    
    if ($httpCode !== 200) {
        return [
            'segura' => null,
            'erro' => 'VirusTotal HTTP: ' . $httpCode
        ];
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'segura' => null,
            'erro' => 'Resposta VirusTotal inválida'
        ];
    }
    
    if ($data['response_code'] === 0) {
        return [
            'segura' => true,
            'mensagem' => 'URL não encontrada no VirusTotal'
        ];
    }
    
    $totalAnalises = 0;
    $totalDeteccoes = 0;
    $ameacas = [];
    
    if (isset($data['scans']) && is_array($data['scans'])) {
        foreach ($data['scans'] as $engine => $result) {
            $totalAnalises++;
            if ($result['detected']) {
                $totalDeteccoes++;
                $ameacas[] = [
                    'engine' => $engine,
                    'resultado' => $result['result']
                ];
            }
        }
    }
    
    $limiteDeteccoes = 3;
    
    if ($totalDeteccoes < $limiteDeteccoes) {
        return [
            'segura' => true,
            'total_analises' => $totalAnalises,
            'total_deteccoes' => $totalDeteccoes,
            'deteccoes_favoraveis' => ($totalAnalises - $totalDeteccoes)
        ];
    } else {
        return [
            'segura' => false,
            'total_analises' => $totalAnalises,
            'total_deteccoes' => $totalDeteccoes,
            'ameacas' => $ameacas
        ];
    }
}

// Análise heurística para priorização
function analiseHeuristica($url) {
    $dominio = parse_url($url, PHP_URL_HOST);
    $pontuacao = 0;
    $motivos = [];
    
    // Domínios confiáveis
    $dominiosConfiáveis = [
        'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
        'facebook.com', 'youtube.com', 'wikipedia.org', 'github.com',
        'gov.br', 'org.br', 'com.br', 'net.br'
    ];
    
    foreach ($dominiosConfiáveis as $confiavel) {
        if (strpos($dominio, $confiavel) !== false) {
            return [
                'nivel_risco' => 'BAIXO',
                'pontuacao' => 0,
                'motivos' => ['Domínio conhecidamente confiável']
            ];
        }
    }
    
    // Domínios gratuitos suspeitos
    $dominiosGratuitos = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    foreach ($dominiosGratuitos as $gratuito) {
        if (strpos($dominio, $gratuito) !== false) {
            $pontuacao += 3;
            $motivos[] = "Domínio gratuito suspeito ($gratuito)";
        }
    }
    
    // IP direto
    if (preg_match('/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/', $dominio)) {
        $pontuacao += 2;
        $motivos[] = "Usa endereço IP direto";
    }
    
    if ($pontuacao >= 3) {
        return [
            'nivel_risco' => 'ALTO',
            'pontuacao' => $pontuacao,
            'motivos' => $motivos
        ];
    } elseif ($pontuacao >= 1) {
        return [
            'nivel_risco' => 'MEDIO',
            'pontuacao' => $pontuacao,
            'motivos' => $motivos
        ];
    }
    
    return [
        'nivel_risco' => 'BAIXO',
        'pontuacao' => $pontuacao,
        'motivos' => ['Nenhum padrão suspeito detectado']
    ];
}

// Função principal híbrida
function verificarUrlHibrida($url) {
    $url = normalizarUrl($url);
    
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return [
            'segura' => false,
            'erro' => 'URL inválida',
            'confianca' => 'ALTA'
        ];
    }
    
    // 1. Cache
    $cacheKey = getCacheKey($url);
    $cachedResult = getCachedResult($cacheKey);
    if ($cachedResult !== null) {
        $cachedResult['cache'] = true;
        return $cachedResult;
    }
    
    $resultado = [
        'url' => $url,
        'fontes' => [],
        'verificacoes_realizadas' => 0
    ];
    
    // 2. Safe Browsing (SEMPRE)
    $safeBrowsingResult = verificarSafeBrowsing($url);
    $resultado['fontes'][] = 'Google Safe Browsing';
    $resultado['verificacoes_realizadas']++;
    
    if ($safeBrowsingResult['segura'] === false) {
        $resultado = array_merge($resultado, $safeBrowsingResult);
        $resultado['confianca'] = 'ALTA';
        $resultado['fonte_principal'] = 'Google Safe Browsing';
        saveToCache($cacheKey, $resultado);
        return $resultado;
    }
    
    // 3. Decisão inteligente: Usar VirusTotal?
    $analise = analiseHeuristica($url);
    $rateLimit = getVirusTotalRateLimit();
    
    $usarVirusTotal = false;
    $motivoVT = '';
    
    if (!$rateLimit['exceeded']) {
        if ($analise['nivel_risco'] === 'ALTO') {
            $usarVirusTotal = true;
            $motivoVT = 'URL de alto risco';
        } elseif ($analise['nivel_risco'] === 'MEDIO' && $rateLimit['remaining'] >= 2) {
            $usarVirusTotal = true;
            $motivoVT = 'URL de médio risco - recursos disponíveis';
        } elseif ($analise['nivel_risco'] === 'BAIXO' && $rateLimit['remaining'] >= 3) {
            $usarVirusTotal = true;
            $motivoVT = 'URL de baixo risco - muitos recursos disponíveis';
        }
    }
    
    $resultado['gestao_recursos'] = [
        'usar_virustotal' => $usarVirusTotal,
        'motivo' => $motivoVT ?: 'Limite atingido ou prioridade baixa',
        'remaining' => $rateLimit['remaining'],
        'analise_heuristica' => $analise
    ];
    
    if ($usarVirusTotal) {
        $virusTotalResult = verificarVirusTotal($url);
        recordVirusTotalRequest();
        
        $resultado['fontes'][] = 'VirusTotal';
        $resultado['verificacoes_realizadas']++;
        
        if ($virusTotalResult['segura'] === false) {
            $resultado = array_merge($resultado, $virusTotalResult);
            $resultado['confianca'] = 'ALTA';
            $resultado['fonte_principal'] = 'VirusTotal';
            $resultado['observacao'] = 'Ameaças detectadas pela análise multi-motor';
        } elseif ($safeBrowsingResult['segura'] === true) {
            $resultado['segura'] = true;
            $resultado['confianca'] = 'ALTA';
            $resultado['fonte_principal'] = 'Google Safe Browsing + VirusTotal';
            
            if (isset($virusTotalResult['total_analises'])) {
                $resultado['estatisticas_virustotal'] = [
                    'total_analises' => $virusTotalResult['total_analises'],
                    'total_deteccoes' => $virusTotalResult['total_deteccoes'],
                    'deteccoes_favoraveis' => $virusTotalResult['total_analises'] - $virusTotalResult['total_deteccoes'],
                    'percentual_seguro' => round((($virusTotalResult['total_analises'] - $virusTotalResult['total_deteccoes']) / $virusTotalResult['total_analises']) * 100, 1)
                ];
            }
        }
    } else {
        // Apenas Safe Browsing
        if ($safeBrowsingResult['segura'] === true) {
            $resultado['segura'] = true;
            $resultado['confianca'] = 'ALTA';
            $resultado['fonte_principal'] = 'Google Safe Browsing';
        } else {
            $resultado = array_merge($resultado, $safeBrowsingResult);
        }
    }
    
    saveToCache($cacheKey, $resultado);
    return $resultado;
}

// Processar requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['url']) || empty(trim($input['url']))) {
            throw new Exception('URL não fornecida');
        }
        
        $url = $input['url'];
        $resultado = verificarUrlHibrida($url);
        
        echo json_encode($resultado);
        
    } catch (Exception $e) {
        echo json_encode([
            'segura' => false,
            'erro' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'segura' => false,
        'erro' => 'Método não permitido. Use POST.'
    ]);
}
?>