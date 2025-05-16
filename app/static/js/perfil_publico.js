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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userId = window.location.pathname.split('/').pop();
        console.log('Tentando buscar perfil para ID:', userId);
        
        const response = await fetch(`/profile/perfilPublico/${userId}`);
        
        // Verifica se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não é JSON:', text);
            throw new Error('Resposta do servidor não é JSON');
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.sucesso) {
            throw new Error(data.erro || 'Erro ao carregar perfil');
        }

        if (data.sucesso) {
            // Atualiza as informações do perfil
            document.getElementById('fotoPerfil').src = `/profile/imagem/${userId}?timestamp=${new Date().getTime()}`;
            document.getElementById('nomeUsuario').textContent = data.perfil.Nome || 'Nome não informado';
            document.getElementById('profissaoUsuario').textContent = data.perfil.Categoria || 'Categoria não informada';
            document.getElementById('descricaoUsuario').textContent = data.perfil.Bio || 'Sem descrição disponível.';

            // Atualiza os contatos
            const listaContatos = document.getElementById('listaContatos');
            listaContatos.innerHTML = '';
            if (data.perfil.Telefone) {
                listaContatos.innerHTML += `
                    <li class="list-group-item">
                        <div class="list-icon"><i class="bi bi-telephone"></i></div>
                        <div class="list-details">
                            <span>${data.perfil.Telefone}</span>
                            <small>Telefone</small>
                        </div>
                    </li>`;
            }
            if (data.perfil.Email) {
                listaContatos.innerHTML += `
                    <li class="list-group-item">
                        <div class="list-icon"><i class="bi bi-envelope"></i></div>
                        <div class="list-details">
                            <span>${data.perfil.Email}</span>
                            <small>Email</small>
                        </div>
                    </li>`;
            }

            // Atualiza as habilidades
            const habilidadesContainer = document.getElementById('habilidadesContainer');
            habilidadesContainer.innerHTML = '';
            if (data.perfil.Habilidades && data.perfil.Habilidades.length > 0) {
                data.perfil.Habilidades.forEach(habilidade => {
                    habilidadesContainer.innerHTML += `<span class="badge badge-dark badge-pill">${habilidade}</span> `;
                });
            } else {
                habilidadesContainer.innerHTML = '<p>Sem habilidades cadastradas.</p>';
            }
        } else {
            throw new Error(data.erro || 'Erro ao carregar perfil público.');
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Não foi possível carregar o perfil. Consulte o console para mais detalhes.');
    }
});

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
                // Redireciona para a página de login
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
            window.location.href = "/";
        })
    }, 10 * 60 * 1000); // 10 minutos
}

// Adiciona eventos para monitorar a atividade do usuário
document.addEventListener('mousemove', resetarInatividade);
document.addEventListener('keydown', resetarInatividade);
document.addEventListener('click', resetarInatividade);

// Inicializa o timer ao carregar a página
resetarInatividade();