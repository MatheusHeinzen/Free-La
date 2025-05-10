//SideBar (Entra e sai da tela)
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".menu_lateral");
    const toggleButton = document.getElementById("toggleSidebar");

    toggleButton.addEventListener("click", function (event) {
        sidebar.classList.toggle("ativo");
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
            sidebar.classList.remove("ativo");
        }
    });
});


//Função para exibir todos os freelancers ao carregar a página
function exibirTodosFreelancers() {
    let section = document.getElementById("resultados-pesquisa");
    section.innerHTML = "";

    trabalhosFreelancers.forEach(dado => {
        section.innerHTML += `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <img class="card-img-top" src="${dado.imagem}" alt="${dado.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${dado.nome}</h5>
                        <p class="card-text"><strong>${dado.especialidade}</strong></p>
                        <p class="card-text">${dado.descricao}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                                <a href="${dado.link}" class="btn btn-sm btn-outline-secondary">Ver Perfil</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

//Função para pesquisar freelancers
function pesquisar() {
    let section = document.getElementById("resultados-pesquisa");
    let campoPesquisa = document.getElementById("campo-pesquisa").value.toLowerCase();
    let resultados = "";

    if (!campoPesquisa) {
        exibirTodosFreelancers();
        return;
    }

    //Filtra os freelancers pelo termo de pesquisa
    trabalhosFreelancers.forEach(dado => {
        if (
            dado.nome.toLowerCase().includes(campoPesquisa) ||
            dado.especialidade.toLowerCase().includes(campoPesquisa) ||
            dado.descricao.toLowerCase().includes(campoPesquisa)
        ) {
            resultados += `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <img class="card-img-top" src="${dado.imagem}" alt="${dado.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${dado.nome}</h5>
                            <p class="card-text"><strong>${dado.especialidade}</strong></p>
                            <p class="card-text">${dado.descricao}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <a href="${dado.link}" class="btn btn-sm btn-outline-secondary">Ver Perfil</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    //Se nenhum resultado for encontrado
    section.innerHTML = resultados || "<p>Nenhum freelancer encontrado.</p>";
}

//Exibe todos os freelancers ao carregar a página
window.onload = exibirTodosFreelancers;


// Para deletar Usuario:

function showPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'block';
    // document.getElementById("")
    document.getElementById('overlay').style.display = 'block';
}

function fecharPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function confirmarDelecao() {
    fetch('/DeletarUsuario', {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                Swal.fire({
                    icon: 'success',
                    title: 'Perfil deletado com sucesso.',
                    text: "Redirecionando...",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops, algo deu errado.',
                    text: 'Ocorreu um problema para deletar.'
                });
                return false;
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops, algo deu errado.',
                text: 'Contate o suporte, por favor!'
            });
            return false;
        });
}


function mostrarErroInput(input, mensagem) {
    input.classList.add('erro');
    Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: mensagem
    });
}

// Função para limpar os erros
function limparErros() {
    const campos = document.querySelectorAll('input');
    campos.forEach(input => {
        input.classList.remove('erro');
    });
}

// Função para carregar categorias
async function carregarCategorias() {
    try {
        const response = await fetch('/category/', { //
            method: 'GET'
        });
        const data = await response.json();
        if (data.sucesso) {
            console.log("Categorias:", data.categorias);
            // Renderizar categorias na página
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar categorias.'
            });
        }
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar categorias.'
        });
    }
}

// Função para carregar habilidades
async function carregarHabilidades() {
    try {
        const response = await fetch('/skills/', { //
            method: 'GET'
        });
        const data = await response.json();
        if (data.sucesso) {
            console.log("Habilidades:", data.habilidades);
            // Renderizar habilidades na página
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao carregar habilidades.'
            });
        }
    } catch (error) {
        console.error("Erro ao carregar habilidades:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar habilidades.'
        });
    }
}

async function logout() {
    try {
        const response = await fetch('/auth/logout', { // Rota de logout no backend
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (data.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Logout realizado!',
                text: data.mensagem,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Redireciona para a página inicial ou de login
                window.location.href = "/";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível encerrar a sessão. Tente novamente.'
            });
        }
    } catch (error) {
        console.error("Erro ao realizar logout:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao realizar logout. Tente novamente.'
        });
    }
}

let inatividadeTimer;

// Função para redefinir o timer de inatividade
function resetarInatividade() {
    clearTimeout(inatividadeTimer);
    inatividadeTimer = setTimeout(() => {
        Swal.fire({
            icon: 'warning',
            title: 'Sessão expirada!',
            text: 'Você foi desconectado devido à inatividade.',
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            logout(); // Chama a função de logout
        });
    }, 30 * 60 * 1000); // 30 minutos
}

// Adiciona eventos para monitorar a atividade do usuário
document.addEventListener('mousemove', resetarInatividade);
document.addEventListener('keydown', resetarInatividade);
document.addEventListener('click', resetarInatividade);

// Inicializa o timer ao carregar a página
resetarInatividade();

// Chamar as funções ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarHabilidades();
});

