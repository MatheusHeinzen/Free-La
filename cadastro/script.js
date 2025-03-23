//Máscaras
document.addEventListener('DOMContentLoaded', () => {
    $("#telefone").mask("(00) 00000-0000");
    $("#cpf").mask("000.000.000-00");
    $("#cep").mask("00000-000");

    // Evento para validar senha em tempo real
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
function toggleSenha(id) {
    const campo = document.getElementById(id);
    campo.type = campo.type === "password" ? "text" : "password";
}

//Validar senha
function validarSenha() {
    const senha = document.getElementById("senha").value;
    const erro = document.getElementById("senha-erro");
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!regex.test(senha)) {
        erro.innerText = "A senha deve ter 8+ caracteres, uma letra maiúscula, um número e um caractere especial.";
    } else {
        erro.innerText = "";
    }
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

    if (senha !== confirmaSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    const data = { nome, email, telefone, cpf, cep, senha };

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("Conta criada com sucesso!");
        } else {
            alert("Erro ao criar conta.");
        }
    } catch (error) {
        console.error("Erro ao salvar usuário:", error);
    }
}
