// MÁSCARAS E VALIDAÇÕES
document.addEventListener('DOMContentLoaded', () => {
    // Configura máscaras
    if (document.getElementById("telefone")) {
        $("#telefone").mask("(00) 00000-0000");
    }
    if (document.getElementById("cpf")) {
        $("#cpf").mask("000.000.000-00");
    }
    
    // Validação em tempo real da senha
    const senhaInput = document.getElementById("senha");
    if (senhaInput) {
        senhaInput.addEventListener("input", validarSenha);
    }
});

// FUNÇÕES DE UI
function alternarModo(modo) {
    const container = document.getElementById("container");
    if (modo === "login") {
        container.classList.remove("right-panel-active");
    } else {
        container.classList.add("right-panel-active");
    }
}

function toggleSenha(id, btn) {
    const inputPass = document.getElementById(id);
    const btnShowPass = document.getElementById(btn);

    if (inputPass.type === 'password') {
        inputPass.setAttribute('type', 'text');
        btnShowPass.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
    } else {
        inputPass.setAttribute('type', 'password');
        btnShowPass.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
    }
}

// FUNÇÕES DE VALIDAÇÃO
function validarSenha(senha) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/;
    return regex.test(senha);
}

function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let Soma = 0, Resto;

    for (let i = 1; i <= 9; i++) {
        Soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(cpf.substring(9, 10))) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++) {
        Soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// FUNÇÕES DE CADASTRO E LOGIN
document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById("form-cadastro");
    const formLogin = document.getElementById("form-login");

    if (formCadastro) {
        formCadastro.addEventListener("submit", function(e) {
            e.preventDefault();
            salvar();
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", function(e) {
            e.preventDefault();
            logar();
        });
    }
});

async function salvar() {
    console.log('[CADASTRO] Iniciando processo de cadastro');
    
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirma-senha").value;
    const erroSenha = document.getElementById("senha-erro");

    // Validações
    if (!nome) {
        alert("Por favor, insira seu nome completo.");
        return;
    }

    if (!validarEmail(email)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    if (!validarCPF(cpf)) {
        alert("Por favor, insira um CPF completo.");
        return;
    }

    if (!validarSenha(senha)) {
        erroSenha.innerText = "A senha deve ter 8+ caracteres, uma letra maiúscula, um número e um caractere especial.";
        return;
    } else {
        erroSenha.innerText = "";
    }

    if (senha !== confirmaSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    const data = { nome, email, cpf, telefone, senha };

    try {
        console.log('[CADASTRO] Enviando dados para o servidor');
        const res = await fetch("http://localhost:5000/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const response = await res.json();
        console.log('[CADASTRO] Resposta do servidor:', response);

        if (response.sucesso) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "/termos";
        } else {
            alert(response.erro || "Erro ao cadastrar usuário.");
        }
    } catch (err) {
        console.error('[CADASTRO] Erro na requisição:', err);
        alert("Erro de conexão com o servidor. Por favor, tente novamente.");
    }
}

async function logar() {
    console.log('[LOGIN] Iniciando processo de login');
    
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha.");
        return;
    }

    try {
        console.log('[LOGIN] Enviando credenciais para autenticação');
        const res = await fetch("http://localhost:5000/autenticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const resposta = await res.json();
        console.log('[LOGIN] Resposta do servidor:', resposta);

        if (resposta.sucesso) {
            console.log('[LOGIN] Autenticação bem-sucedida, armazenando ID do usuário:', resposta.id);
            localStorage.setItem('userId', resposta.id);
            window.location.href = "/homepage";
        } else {
            alert(resposta.erro || "Email ou senha inválidos.");
        }
    } catch (err) {
        console.error('[LOGIN] Erro na requisição:', err);
        alert("Erro ao conectar com o servidor. Por favor, tente novamente.");
    }
}