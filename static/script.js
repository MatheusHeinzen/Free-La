//Máscaras
document.addEventListener('DOMContentLoaded', () => {
    $("#telefone").mask("(00) 00000-0000");
    $("#cpf").mask("000.000.000-00");

    document.getElementById("senha").addEventListener("input", validarSenha);
});

//Alternar entre login e cadastro
function alternarModo(modo) {
    const container = document.getElementById("container");
    if (modo === "login") {
        container.classList.remove("right-panel-active");
    } else {
        container.classList.add("right-panel-active");
    }
}

//Visualizar/ocultar senha
function toggleSenha(id, btn) {
    var inputPass = document.getElementById(id);
    var btnShowPass = document.getElementById(btn);

    if (inputPass.type === 'password') {
        inputPass.setAttribute('type', 'text');
        btnShowPass.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
    } else {
        inputPass.setAttribute('type', 'password');
        btnShowPass.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
    }
}

//Validar senha
function validarSenha(senha) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/;
    return regex.test(senha);
}

//Validar email
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

//Validar CPF completo (000.000.000-00)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, ""); // Remove pontos e traços

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Verifica tamanho e CPFs inválidos

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


//Função para salvar o cadastro
async function salvar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirma-senha").value;
    const erroSenha = document.getElementById("senha-erro");

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

    await fetch("http://localhost:5000/cadastrar", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
.then(res => res.json())
.then(response => {
  if (response.sucesso) {
    window.location.href = "/homepage";
  } else {
    alert(response.erro);
  }
});
}
