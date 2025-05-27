document.addEventListener('DOMContentLoaded', () => {
    // Alternar visibilidade das senhas
    function toggleSenha(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
        } else {
            input.type = 'password';
            icon.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
        }
    }
    document.getElementById('toggleSenhaAtual').onclick = () => toggleSenha('senhaAtual', 'toggleSenhaAtual');
    document.getElementById('toggleNovaSenha').onclick = () => toggleSenha('novaSenha', 'toggleNovaSenha');
    document.getElementById('toggleConfirmaNovaSenha').onclick = () => toggleSenha('confirmaNovaSenha', 'toggleConfirmaNovaSenha');

    // Validação e envio do formulário
    document.getElementById('form-alterar-senha').addEventListener('submit', async function (e) {
        e.preventDefault();
        const senhaAtual = document.getElementById('senhaAtual').value.trim();
        const novaSenha = document.getElementById('novaSenha').value.trim();
        const confirmaNovaSenha = document.getElementById('confirmaNovaSenha').value.trim();

        if (!senhaAtual || !novaSenha || !confirmaNovaSenha) {
            Swal.fire({ icon: 'error', title: 'Erro!', text: 'Preencha todos os campos.' });
            return;
        }
        if (novaSenha.length < 8 || !/[A-Z]/.test(novaSenha) || !/\d/.test(novaSenha) || !/[$*&@#]/.test(novaSenha)) {
            Swal.fire({ icon: 'error', title: 'Senha fraca!', text: 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.' });
            return;
        }
        if (novaSenha !== confirmaNovaSenha) {
            Swal.fire({ icon: 'error', title: 'Erro!', text: 'As senhas novas não conferem.' });
            return;
        }

        try {
            const res = await fetch('/user/alterarSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
            });
            const data = await res.json();
            if (data.sucesso) {
                Swal.fire({
                    icon: 'success',
                    title: 'Senha alterada com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => window.location.href = '/alterarDados');
            } else {
                Swal.fire({ icon: 'error', title: 'Erro!', text: data.erro || 'Erro ao alterar senha.' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Erro!', text: 'Erro ao alterar senha.' });
        }
    });
});
