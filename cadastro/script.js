//Máscaras
document.addEventListener('DOMContentLoaded', () => {
    $("#telefone").mask("(00) 00000-0000");
    $("#cpf").mask("000.000.000-00");
    $("#cep").mask("00000-000");

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

//Função para salvar o cadastro
async function salvar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const cpf = document.getElementById("cpf").value;
    const cep = document.getElementById("cep").value;
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirma-senha").value;
    const erroSenha = document.getElementById("senha-erro");

    if (!validarEmail(email)) {
        alert("Por favor, insira um e-mail válido.");
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

    const data = { nome, email, telefone, cpf, cep, senha };

    localStorage.setItem("usuario", JSON.stringify(data));

    window.location.href = "../HomePage/homepage.html";
}

//     try {
//         const response = await fetch('http://localhost:3000/api/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data),
//         });

//         if (response.ok) {
//             alert("Conta criada com sucesso!");
//         } else {
//             alert("Erro ao criar conta.");
//         }
//     } catch (error) {
//         console.error("Erro ao salvar usuário:", error);
//     }
//}
