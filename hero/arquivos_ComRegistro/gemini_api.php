<?php
header('Content-Type: application/json');

// Sua API Key do Gemini
define('GEMINI_API_KEY', 'AIzaSyCjNNvEhrM_zDEbUGtu-oD4_lopIFyJhCA'); // SUBSTITUA pela sua chave real

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['prompt']) || empty(trim($input['prompt']))) {
            throw new Exception('Prompt não fornecido');
        }
        
        $prompt = $input['prompt'];
        
        // Endpoint correto da API Gemini
        $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_API_KEY;
        
        // Estrutura de dados correta para a API Gemini
        $postData = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 200,
                'topP' => 0.8,
                'topK' => 10
            ]
        ];
        
        // Fazer requisição para a API Gemini
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            throw new Exception('Erro na comunicação com Gemini: ' . $curlError);
        }
        
        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = isset($errorData['error']['message']) 
                ? $errorData['error']['message'] 
                : 'Erro HTTP ' . $httpCode;
            throw new Exception($errorMessage);
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Resposta inválida da API Gemini');
        }
        
        // Extrair o texto da resposta
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            $text = $data['candidates'][0]['content']['parts'][0]['text'];
            
            echo json_encode([
                'success' => true,
                'text' => trim($text)
            ]);
        } else {
            throw new Exception('Formato de resposta inesperado');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido. Use POST.'
    ]);
}
?>