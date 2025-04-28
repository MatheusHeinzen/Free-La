document.addEventListener('DOMContentLoaded', () => {
    // Máscara CPF
    if (document.getElementById("cpf")) {
        $("#cpf").mask("000.000.000-00");
    }

    // Validação de senha
    const senhaInput = document.getElementById("senha");
    if (senhaInput) {
        senhaInput.addEventListener("input", validarSenha);
    }

    // Formulários
    const formCadastro = document.getElementById("form-cadastro");
    const formLogin = document.getElementById("form-login");

    // Ações do formulário de cadastro
    if (formCadastro) {
        formCadastro.addEventListener("submit", function (e) {
            e.preventDefault();
            limparErros();
    
            const nome = document.getElementById('nome');
            const email = document.getElementById('email');
            const dataNascimento = document.getElementById('dataNascimento');
            const cpf = document.getElementById('cpf');
            const senha = document.getElementById('senha');
            const confirmaSenha = document.getElementById('confirma-senha');
            const checkbox = document.getElementById('checkbox');
    
            // Validação dos campos obrigatórios e suas regras específicas
            if (!nome.value.trim()) {
                mostrarErroInput(nome, 'Por favor, preencha seu nome.');
                return;
            }
    
            if (!email.value.trim()) {
                mostrarErroInput(email, 'Por favor, preencha seu e-mail.');
                return;
            }
    
            if (!validarEmail(email.value)) {
                mostrarErroInput(email, 'Por favor, insira um e-mail válido.');
                return;
            }
    
            if (!dataNascimento.value.trim()) {
                mostrarErroInput(dataNascimento, 'Informe sua data de nascimento.');
                return;
            }
    
            if (!validarIdade(dataNascimento.value)) {
                mostrarErroInput(dataNascimento, 'Você precisa ter entre 18 e 100 anos para se cadastrar.');
                return;
            }
    
            if (!cpf.value.trim()) {
                mostrarErroInput(cpf, 'Informe seu CPF.');
                return;
            }
    
            if (!validarCPF(cpf.value)) {
                mostrarErroInput(cpf, 'Por favor, insira um CPF válido.');
                return;
            }
    
            if (!senha.value.trim()) {
                mostrarErroInput(senha, 'Digite sua senha.');
                return;
            }
    
            if (!validarSenha(senha.value)) {
                mostrarErroInput(senha, 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial.');
                return;
            }
    
            if (!confirmaSenha.value.trim()) {
                mostrarErroInput(confirmaSenha, 'Confirme sua senha.');
                return;
            }
    
            if (senha.value !== confirmaSenha.value) {
                mostrarErroInput(confirmaSenha, 'As senhas não conferem!');
                return;
            }
    
            if (!checkbox.checked) {
                Swal.fire({
                    icon: 'error',
                    title: 'Atenção!',
                    text: 'Você precisa aceitar os termos de uso!',
                });
                return;
            }
    
            // Chama a função para salvar
            salvar();
        });
    }

    // Ações do formulário de login
    if (formLogin) {
        formLogin.addEventListener("submit", function (e) {
            e.preventDefault();
            limparErros();

            const emailLogin = document.getElementById("login-email");
            const senhaLogin = document.getElementById("login-senha");

            // Verificação dos campos obrigatórios
            if (!emailLogin.value.trim()) {
                mostrarErroInput(emailLogin, 'Por favor, preencha seu e-mail.');
                return;
            }
            if (!senhaLogin.value.trim()) {
                mostrarErroInput(senhaLogin, 'Digite sua senha.');
                return;
            }

            // Chama a função de login se tudo estiver correto
            logar();
        });
    }
});

// Função para alternar entre os modos (login/cadastro)
function alternarModo(modo) {
    const container = document.getElementById("container");
    if (modo === "login") {
        container.classList.remove("right-panel-active");
    } else {
        container.classList.add("right-panel-active");
    }
}

// Função para alternar visibilidade da senha
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

// Validação da senha (mínimo de 8 caracteres, números, letras maiúsculas/minúsculas e símbolos)
function validarSenha(senha) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/;
    return regex.test(senha);
}

// Validação de e-mail (formato padrão)
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Validação de CPF
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

// Função de validação de idade
function validarIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    if (nascimento > hoje) return false;

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade >= 18 && idade <= 100;
}

// Função para salvar os dados
// Função para salvar os dados
async function salvar() {
    console.log('[CADASTRO] Iniciando processo de cadastro');

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const dataNascimento = document.getElementById("dataNascimento").value;
    const senha = document.getElementById("senha").value;

    const data = { nome, email, cpf, dataNascimento, senha };

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
            Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado!',
                text: response.mensagem || "Usuário cadastrado com sucesso!",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar',
                text: response.erro || "Houve um erro ao cadastrar. Tente novamente mais tarde."
            });
        }
    } catch (err) {
        console.error('[CADASTRO] Erro na requisição:', err);
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: "Não foi possível conectar ao servidor. Tente novamente."
        });
    }
}
// Função de login atualizada
// Função de login atualizada
async function logar() {
    console.log('[LOGIN] Iniciando processo de login');

    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-senha").value.trim();

    if (!email || !senha) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção!',
            text: 'Por favor, preencha o e-mail e a senha.'
        });
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/autenticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const resposta = await res.json();
        console.log('[LOGIN] Resposta do servidor:', resposta);

        if (res.ok && resposta.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Login realizado!',
                text: resposta.mensagem || "Login feito com sucesso!",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                localStorage.setItem('userId', resposta.id);
                window.location.href = "/homepage";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro no login',
                text: resposta.mensagem || "E-mail ou senha inválidos. Tente novamente."
            });
        }
    } catch (err) {
        console.error('[LOGIN] Erro na requisição:', err);
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: "Não foi possível conectar ao servidor. Por favor, tente novamente."
        });
    }
}
