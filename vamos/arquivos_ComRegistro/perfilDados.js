
// Gerenciamento do formulário de perfil na página de perfil
document.addEventListener('DOMContentLoaded', function() {
    // Envio do formulário de perfil
    document.getElementById("profileFormPerfil").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const name = document.getElementById("profileName").value;
        const email = document.getElementById("profileEmail").value;
        const password = document.getElementById("profilePassword").value;
        const passwordConfirm = document.getElementById("profilePasswordConfirm").value;
        const formMessage = document.getElementById("formMessage");
        
        // Validações
        if (!name || !email) {
            showMessage('Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }
        
        if (password && password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'danger');
            return;
        }
        
        if (password !== passwordConfirm) {
            showMessage('As senhas não coincidem!', 'danger');
            return;
        }
        
        // Enviar dados para atualização via AJAX
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) formData.append('password', password);
        
        showMessage('Atualizando perfil...', 'info');
        
        fetch('update_profile.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Perfil atualizado com sucesso!', 'success');
                // Atualizar a sessão/local storage se necessário
                setTimeout(() => {
                    location.reload(); // Recarregar para pegar dados atualizados
                }, 1500);
            } else {
                showMessage('Erro: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Erro ao atualizar perfil. Tente novamente.', 'danger');
        });
    });
    
    // Excluir conta
    document.getElementById("deleteAccountPerfil").addEventListener("click", function() {
        showConfirmModal(
            'Excluir Conta',
            'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos permanentemente.',
            'Excluir',
            'btn-danger',
            function() {
                fetch('delete_account.php', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage('Conta excluída com sucesso! Redirecionando...', 'success');
                        setTimeout(() => {
                            window.location.href = "logi.php";
                        }, 2000);
                    } else {
                        showMessage('Erro: ' + data.message, 'danger');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('Erro ao excluir conta.', 'danger');
                });
            }
        );
    });
    
    // Função para mostrar mensagens
    function showMessage(message, type) {
        const formMessage = document.getElementById("formMessage");
        formMessage.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Auto-dismiss success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                const alert = formMessage.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        }
    }
    
    // Função para mostrar modal de confirmação
    function showConfirmModal(title, message, confirmText, confirmClass, confirmCallback) {
        const modalBody = document.getElementById('confirmModalBody');
        const confirmButton = document.getElementById('confirmModalButton');
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        
        modalBody.innerHTML = message;
        confirmButton.textContent = confirmText;
        confirmButton.className = `btn ${confirmClass}`;
        
        // Remover event listeners anteriores
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // Adicionar novo event listener
        document.getElementById('confirmModalButton').addEventListener('click', function() {
            modal.hide();
            confirmCallback();
        });
        
        modal.show();
    }
    
    // Validação em tempo real
    const passwordInput = document.getElementById("profilePassword");
    const confirmPasswordInput = document.getElementById("profilePasswordConfirm");
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.classList.add('is-invalid');
            } else {
                confirmPasswordInput.classList.remove('is-invalid');
            }
        });
    }
});
