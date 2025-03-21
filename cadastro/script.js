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
        
        if (!validateSenha(senha)) {
            alert("A senha não atende os requisitos de SENHA FORTE.");
            valid = false;
        }
        
        if (valid) {
            alert("Formulário enviado com sucesso!");
            form.submit();
        }
    });

    function validateEmail(email) {
        const re = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i
        return re.test(String(email).toLowerCase());
    }
});

    function validateSenha(senha) {
        const re = /^(?=.*[A-Z])(?=.*[!#@$%&])(?=.*[0-9])(?=.*[a-z]).{6,15}$/i
        return re.test(String(senha));
    }

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