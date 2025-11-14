// resumo_Gemini.js - Updated to use PHP backend
const resumo_Gemini = document.getElementById('resumo_Gemini');

async function getGeminiExplanation(securityStatus) {
    try {
        const response = await fetch('gemini_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Explique o porquê da seguinte avaliação de segurança de URL em três frases: ${getSecurityStatusMessage(securityStatus)}`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.text;
        } else {
            console.error('Gemini API Error:', data.error);
            return 'Não foi possível gerar explicação no momento.';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return 'Erro de conexão ao gerar explicação.';
    }
}

function getSecurityStatusMessage(status) {
    switch(status) {
        case 0: return "A URL verificada é segura e não apresenta ameaças conhecidas.";
        case 1: return "Houve um erro na verificação da URL. Não foi possível determinar sua segurança.";
        case 2: return "A URL verificada não é segura e apresenta ameaças conhecidas.";
        default: return "O status de segurança da URL é desconhecido.";
    }
}

// Usage in your existing code
if (typeof segurancaStatusURL !== 'undefined' && segurancaStatusURL != -1) {
    getGeminiExplanation(segurancaStatusURL).then(explanation => {
        if (resumo_Gemini) {
            resumo_Gemini.textContent = explanation;
        }
    });
}
