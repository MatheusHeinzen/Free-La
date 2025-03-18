const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.sign-up-container form');
    
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        let valid = true;

        if (nome.trim() === "") {
            alert("O nome é obrigatório.");
            valid = false;
        }
        
        if (!validateEmail(email)) {
            alert("Por favor, insira um email válido.");
            valid = false;
        }
        
        if (senha.length < 8) {
            alert("A senha deve ter pelo menos 8 caracteres.");
            valid = false;
        }
        
        if (valid) {
            alert("Formulário enviado com sucesso!");
            form.submit();
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});

async function verificarSessao() {
    try {
        const response = await fetch('http://localhost:3000/api/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.log('erro na autentificação')
            return;
        }

        const data = await response.json();
        alert(data.message);
        console.log("autentificado com sucesso")

    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
    }
}