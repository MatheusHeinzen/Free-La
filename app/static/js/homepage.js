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
                            <img src="/profile/imagem/${freelancer.ID_User}" alt="Foto de Perfil" width="100" height="100">
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
        console.error('Erro ao carregar perfis:', error);
            document.getElementById('perfis-container').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">Erro ao carregar perfis. Tente recarregar a página.</div>
                </div>
            `;
        };
        
}

//Função para pesquisar freelancers
async function pesquisar() {
    try {
        const termo = document.getElementById("campo-pesquisa").value.trim();
        const categoria = document.getElementById("categoriaDropdown")?.value || "";

        const response = await fetch(`/search/buscarFreelancers?termo=${encodeURIComponent(termo)}&categoria=${encodeURIComponent(categoria)}`);
        if (!response.ok) throw new Error('Erro ao buscar freelancers');
        const data = await response.json();

        const section = document.getElementById("resultados-pesquisa") || document.getElementById('freelancersContainer');
        section.innerHTML = '';

        if (data.sucesso && Array.isArray(data.freelancers) && data.freelancers.length > 0) {
            data.freelancers.forEach(freelancer => {
                section.innerHTML += `
                    <div class="col-md-4">
                        <div class="card mb-4 shadow-sm">
                            <img class="card-img-top" src="/profile/imagem/${freelancer.ID_User}" alt="${freelancer.Nome}" style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${freelancer.Nome}</h5>
                                <p class="card-text">${freelancer.Bio || 'Sem descrição disponível.'}</p>
                                <a href="/perfilPublico/${freelancer.ID_User}" class="btn btn-primary">Ver Perfil</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            section.innerHTML = '<p>Nenhum freelancer encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar freelancers:', error);
        const section = document.getElementById("resultados-pesquisa") || document.getElementById('freelancersContainer');
        section.innerHTML = '<p>Erro ao buscar freelancers.</p>';
    }
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
    fetch('user/deletarUsuario', {
        method: 'DELETE',
        headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' 
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
        const response = await fetch('/profile/obter-categorias');
        if (!response.ok) throw new Error('Erro ao carregar categorias');
            console.log("categorias não estão sendo chamadas")

        const categorias = await response.json();
        const select = document.getElementById('categoriaDropdown');
        if (select) {
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.ID_Categoria;
                option.textContent = categoria.NomeCategoria;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

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

