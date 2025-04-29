
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

