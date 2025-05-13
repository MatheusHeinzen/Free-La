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
async function exibirTodosFreelancers() {
    try {
        const response = await fetch('/search/buscarFreelancers');
        if (!response.ok) throw new Error('Erro ao carregar freelancers');
        const data = await response.json();

        const container = document.getElementById('freelancersContainer');
        container.innerHTML = '';

        if (data.sucesso && Array.isArray(data.freelancers) && data.freelancers.length > 0) {
            data.freelancers.forEach(freelancer => {
                container.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${freelancer.Nome}</h5>
                            <p class="card-text">${freelancer.Bio || 'Sem descrição disponível.'}</p>
                            <a href="/perfilPublico/${freelancer.ID_User}" class="btn btn-primary">Ver Perfil</a>
                        </div>
                    </div>`;
            });
        } else {
            container.innerHTML = '<p>Nenhum freelancer encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar freelancers:', error);
    }
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

// Para deletar Usuario:

function showPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'block';
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
        const response = await fetch('/category');
        if (!response.ok) throw new Error('Erro ao carregar categorias');
        const data = await response.json();

        if (data.sucesso && Array.isArray(data.categorias)) {
            const dropdown = document.getElementById('categoriaDropdown');
            dropdown.innerHTML = '<option value="">Todas as categorias</option>'; // Reset dropdown
            data.categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.NomeCategoria;
                option.textContent = categoria.NomeCategoria;
                dropdown.appendChild(option);
            });
        } else {
            console.error('Categorias inválidas ou não encontradas.');
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Função para carregar habilidades (se necessário)
function carregarHabilidades() {
    console.log('Função carregarHabilidades chamada.');
    // Adicione lógica aqui se necessário
}

async function carregarFreelancers() {
    try {
        const response = await fetch('/freelancers', { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao carregar freelancers');

        const data = await response.json();
        if (data.sucesso) {
            exibirFreelancers(data.freelancers);
        } else {
            throw new Error(data.erro || 'Erro ao carregar freelancers');
        }
    } catch (error) {
        console.error('Erro ao carregar freelancers:', error);
        document.getElementById('resultados-pesquisa').innerHTML = '<p>Erro ao carregar freelancers.</p>';
    }
}

function exibirFreelancers(freelancers) {
    const section = document.getElementById('resultados-pesquisa');
    section.innerHTML = '';

    freelancers.forEach(freelancer => {
        section.innerHTML += `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <img class="card-img-top" src="data:image/jpeg;base64,${freelancer.Foto || ''}" alt="${freelancer.Username}">
                    <div class="card-body">
                        <h5 class="card-title">${freelancer.Username || freelancer.Nome}</h5>
                        <p class="card-text">${freelancer.Bio || 'Sem descrição disponível.'}</p>
                        <a href="/perfil/${freelancer.ID_User}" class="btn btn-primary">Ver Perfil</a>
                    </div>
                </div>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/perfis')
        .then(response => response.json())
        .then(perfis => {
            const container = document.getElementById('perfis-container');
            
            perfis.forEach(perfil => {
                const cardHtml = `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <img class="card-img-top" 
                                 src="${perfil.Foto ? '' + perfil.Foto : ''}" 
                                 alt="Foto de ${perfil.Nome}"
                                 style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${perfil.Nome}</h5>
                                <p class="card-text flex-grow-1">${perfil.Bio || 'Sem descrição'}</p>
                                ${perfil.Categorias ? `<small class="text-muted mb-2">Categorias: ${perfil.Categorias}</small>` : ''}
                                <div class="d-flex justify-content-between align-items-center mt-auto">
                                    <a href="/perfil/${perfil.ID_User}" class="btn btn-sm btn-outline-primary">Ver Perfil</a>
                                    <small class="text-muted">Novo</small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                container.innerHTML += cardHtml;
            });
        })
        .catch(error => {
            console.error('Erro ao carregar perfis:', error);
            document.getElementById('perfis-container').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">Erro ao carregar perfis. Tente recarregar a página.</div>
                </div>
            `;
        });
});

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await carregarCategorias();
        await exibirTodosFreelancers();
    } catch (error) {
        console.error('Erro ao carregar a homepage:', error);
    }
});

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
    }, 10 * 60 * 1000); // 10 minutos
}

// Adiciona eventos para monitorar a atividade do usuário
document.addEventListener('mousemove', resetarInatividade);
document.addEventListener('keydown', resetarInatividade);
document.addEventListener('click', resetarInatividade);

// Inicializa o timer ao carregar a página
resetarInatividade();

