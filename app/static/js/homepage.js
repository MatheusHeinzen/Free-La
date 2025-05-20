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
            // Ordena por avaliação média (desc), depois total avaliações (desc), depois ID_User (desc)
            data.freelancers.sort((a, b) => {
                const ma = Number(a.MediaAvaliacoes) || 0;
                const mb = Number(b.MediaAvaliacoes) || 0;
                const ta = Number(a.TotalAvaliacoes) || 0;
                const tb = Number(b.TotalAvaliacoes) || 0;
                if (tb > 0 || ta > 0) {
                    if (mb !== ma) return mb - ma;
                    if (tb !== ta) return tb - ta;
                }
                return (b.ID_User || 0) - (a.ID_User || 0);
            });

            // Para cada freelancer, busca a média de avaliações via AJAX (garante dados atualizados)
            await Promise.all(data.freelancers.map(async (freelancer) => {
                try {
                    const resp = await fetch(`/profile/obter_perfil/${freelancer.ID_User}`);
                    if (resp.ok) {
                        const { perfil } = await resp.json();
                        if (perfil) {
                            freelancer.MediaAvaliacoes = perfil.MediaAvaliacoes;
                            freelancer.TotalAvaliacoes = perfil.TotalAvaliacoes;
                        }
                    }
                } catch (e) {
                    // Se der erro, mantém os dados originais
                }
            }));

            // Reordena após atualizar médias
            data.freelancers.sort((a, b) => {
                const ma = Number(a.MediaAvaliacoes) || 0;
                const mb = Number(b.MediaAvaliacoes) || 0;
                const ta = Number(a.TotalAvaliacoes) || 0;
                const tb = Number(b.TotalAvaliacoes) || 0;
                if (tb > 0 || ta > 0) {
                    if (mb !== ma) return mb - ma;
                    if (tb !== ta) return tb - ta;
                }
                return (b.ID_User || 0) - (a.ID_User || 0);
            });

            data.freelancers.forEach(freelancer => {
                let estrelasHtml = '';
                const media = Number(freelancer.MediaAvaliacoes) || 0;
                const total = Number(freelancer.TotalAvaliacoes) || 0;
                if (total > 0 && media > 0) {
                    for (let i = 1; i <= 5; i++) {
                        estrelasHtml += i <= Math.round(media)
                            ? '<i class="bi bi-star-fill text-warning"></i>'
                            : '<i class="bi bi-star text-secondary"></i>';
                    }
                    estrelasHtml += ` <span class="ml-2">${media.toFixed(2)}/5.0</span>`;
                    estrelasHtml += ` <span class="text-muted" style="font-size:0.95em">(${total} ${total === 1 ? 'avaliação' : 'avaliações'})</span>`;
                } else {
                    estrelasHtml = '<span class="text-muted" style="font-size:0.95em">Sem avaliações</span>';
                }

                container.innerHTML += `
                    <div class="card mb-4 shadow-sm .col-sm-4">
                        <img class="card-img-top" src="/profile/imagem/${freelancer.ID_User}" alt="Foto de Perfil" style="height: 280px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${freelancer.Nome}</h5>
                            <p class="card-text">${freelancer.Bio || 'Sem descrição disponível.'}</p>
                            <div>${estrelasHtml}</div>
                            <a href="/perfilPublico/${freelancer.ID_User}" class="btn btn-primary">Ver Perfil</a>
                        </div>
                    </div>
                `;
            });
        } else {
            document.getElementById('perfis-container').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">Erro ao carregar perfis. Tente recarregar a página.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        document.getElementById('perfis-container').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">Erro ao carregar perfis. Tente recarregar a página.</div>
                </div>
            `;
    }
}

//Função para pesquisar freelancers
async function pesquisar() {
    try {
        const termo = document.getElementById("campo-pesquisa").value.trim();
        const categoria = document.getElementById("categoriaDropdown")?.value || "";

        const response = await fetch(`/search/buscarFreelancers?termo=${encodeURIComponent(termo)}&categoria=${encodeURIComponent(categoria)}`);
        if (!response.ok) throw new Error('Erro ao buscar freelancers');
        const data = await response.json();

        const container = document.getElementById('freelancersContainer');
        container.innerHTML = '';

        if (data.sucesso && Array.isArray(data.freelancers) && data.freelancers.length > 0) {
            // Ordena por avaliação média (desc), depois total avaliações (desc), depois ID_User (desc)
            data.freelancers.sort((a, b) => {
                const ma = Number(a.MediaAvaliacoes) || 0;
                const mb = Number(b.MediaAvaliacoes) || 0;
                const ta = Number(a.TotalAvaliacoes) || 0;
                const tb = Number(b.TotalAvaliacoes) || 0;
                if (tb > 0 || ta > 0) {
                    if (mb !== ma) return mb - ma;
                    if (tb !== ta) return tb - ta;
                }
                return (b.ID_User || 0) - (a.ID_User || 0);
            });

            // Para cada freelancer, busca a média de avaliações via AJAX (garante dados atualizados)
            await Promise.all(data.freelancers.map(async (freelancer) => {
                try {
                    const resp = await fetch(`/profile/obter_perfil/${freelancer.ID_User}`);
                    if (resp.ok) {
                        const { perfil } = await resp.json();
                        if (perfil) {
                            freelancer.MediaAvaliacoes = perfil.MediaAvaliacoes;
                            freelancer.TotalAvaliacoes = perfil.TotalAvaliacoes;
                        }
                    }
                } catch (e) {
                    // Se der erro, mantém os dados originais
                }
            }));

            // Reordena após atualizar médias
            data.freelancers.sort((a, b) => {
                const ma = Number(a.MediaAvaliacoes) || 0;
                const mb = Number(b.MediaAvaliacoes) || 0;
                const ta = Number(a.TotalAvaliacoes) || 0;
                const tb = Number(b.TotalAvaliacoes) || 0;
                if (tb > 0 || ta > 0) {
                    if (mb !== ma) return mb - ma;
                    if (tb !== ta) return tb - ta;
                }
                return (b.ID_User || 0) - (a.ID_User || 0);
            });

            data.freelancers.forEach(freelancer => {
                let estrelasHtml = '';
                const media = Number(freelancer.MediaAvaliacoes) || 0;
                const total = Number(freelancer.TotalAvaliacoes) || 0;
                if (total > 0 && media > 0) {
                    for (let i = 1; i <= 5; i++) {
                        estrelasHtml += i <= Math.round(media)
                            ? '<i class="bi bi-star-fill text-warning"></i>'
                            : '<i class="bi bi-star text-secondary"></i>';
                    }
                    estrelasHtml += ` <span class="ml-2">${media.toFixed(2)}/5.0</span>`;
                    estrelasHtml += ` <span class="text-muted" style="font-size:0.95em">(${total} ${total === 1 ? 'avaliação' : 'avaliações'})</span>`;
                } else {
                    estrelasHtml = '<span class="text-muted" style="font-size:0.95em">Sem avaliações</span>';
                }

                container.innerHTML += `
                    <div class="card mb-4 shadow-sm .col-sm-4">
                        <img class="card-img-top" src="/profile/imagem/${freelancer.ID_User}" alt="Foto de Perfil" style="height: 250px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${freelancer.Nome}</h5>
                            <p class="card-text">${freelancer.Bio || 'Sem descrição disponível.'}</p>
                            <div>${estrelasHtml}</div>
                            <a href="/perfilPublico/${freelancer.ID_User}" class="btn btn-primary">Ver Perfil</a>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">Nenhum freelancer encontrado com os critérios de pesquisa.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao buscar freelancers:', error);
        const container = document.getElementById('freelancersContainer');
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">Erro ao buscar freelancers. Tente novamente.</div>
            </div>
        `;
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
        const categorias = await response.json();
        const select = document.getElementById('categoriaDropdown');
        if (select) {
            select.innerHTML = '<option value="">Todas as categorias</option>';
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.NomeCategoria;
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

        // Carregar categorias (caso não esteja no HTML)
        const select = document.getElementById('categoriaDropdown');
        if (select) {
            const response = await fetch('/category');
            const data = await response.json();
            if (data.sucesso && Array.isArray(data.categorias)) {
                select.innerHTML = '<option value="">Todas as categorias</option>';
                data.categorias.forEach(cat => {
                    select.innerHTML += `<option value="${cat.NomeCategoria}">${cat.NomeCategoria}</option>`;
                });
            }
        }
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

