document.addEventListener("DOMContentLoaded", async () => {
    try {
        const usuario = await carregarUsuario();
        const preferencias = await carregarPreferencias() || {
            mostrarTelefone: true,
            mostrarEmail: true
        };

        atualizarInterface(usuario, preferencias);

        const btnContatos = document.getElementById('btnAdicionarContatos');
        if (btnContatos) {
            btnContatos.addEventListener('click', () => mostrarModalContatos(preferencias));
        }

    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar perfil.'
        });
    }

    // Sidebar
    const sidebar = document.querySelector(".menu_lateral");
    const toggleButton = document.getElementById("toggleSidebar");
    if (sidebar && toggleButton) {
        toggleButton.addEventListener("click", function (event) {
            sidebar.classList.toggle("ativo");
            event.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
                sidebar.classList.remove("ativo");
            }
        });
    }

    // Edit modal
    const modal = document.getElementById("editModal");
    const btn = document.getElementById("editBtn");
    const span = document.querySelector(".close");

    if (btn && modal) btn.onclick = () => modal.style.display = "block";
    if (span && modal) span.onclick = () => modal.style.display = "none";

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    const form = document.getElementById("editForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const categoria = document.getElementById("categoria").value;
            const descricao = document.getElementById("descricao").value;

            console.log("Categoria:", categoria);
            console.log("Descrição:", descricao);

            modal.style.display = "none";
        });
    }
});

// Funções principais
async function carregarUsuario() {
    const response = await fetch('/user', { method: 'GET' });
    if (!response.ok) throw new Error('Erro ao carregar usuário');

    const { usuario } = await response.json();
    return usuario;
}

async function carregarPreferencias() {
    try {
        const response = await fetch('/preferences/', { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao carregar preferências');

        const data = await response.json();
        if (data.sucesso) {
            return data.preferencias; // Retorna as preferências do servidor
        } else {
            console.warn('Preferências não encontradas, usando padrão.');
            return { mostrarTelefone: true, mostrarEmail: true }; // Valores padrão
        }
    } catch (error) {
        console.error('Erro ao carregar preferências:', error);
        return { mostrarTelefone: true, mostrarEmail: true }; // Valores padrão
    }
}

function atualizarInterface(usuario, preferencias) {
    const nomeEl = document.querySelector('.profile-card-4 h5');
    const catEl = document.querySelector('.profile-card-4 h6');
    const listaContatos = document.querySelector('#contatos .list-group');

    if (nomeEl) nomeEl.textContent = usuario.Nome || 'Nome não informado';
    if (catEl) catEl.textContent = usuario.Profissao || usuario.Categoria || 'Perfil do Usuário';

    if (listaContatos) {
        listaContatos.innerHTML = '';

        if (preferencias.mostrarTelefone && usuario.Telefone) {
            listaContatos.innerHTML += `
                <li class="list-group-item">
                    <div class="list-icon"><i class="bi bi-telephone"></i></div>
                    <div class="list-details">
                        <span>${formatarTelefone(usuario.Telefone)}</span>
                        <small>Telefone</small>
                    </div>
                </li>`;
        }

        if (preferencias.mostrarEmail && usuario.Email) {
            listaContatos.innerHTML += `
                <li class="list-group-item">
                    <div class="list-icon"><i class="bi bi-envelope"></i></div>
                    <div class="list-details">
                        <span>${usuario.Email}</span>
                        <small>Email</small>
                    </div>
                </li>`;
        }
    }
}

function mostrarModalContatos(preferencias) {
    const existente = document.getElementById("modalContatos");
    if (existente) existente.remove();

    const modalHTML = `
      <div class="modal-contatos" id="modalContatos">
          <div class="modal-content">
              <h3>Exibir contatos</h3>
              <label><input type="checkbox" id="opt-telefone" ${preferencias.mostrarTelefone ? 'checked' : ''}> Telefone</label>
              <label><input type="checkbox" id="opt-email" ${preferencias.mostrarEmail ? 'checked' : ''}> Email</label>
              <button id="btnSalvarPrefs">Salvar</button>
          </div>
      </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('btnSalvarPrefs').addEventListener('click', async () => {
        const novasPrefs = {
            mostrarTelefone: document.getElementById('opt-telefone').checked,
            mostrarEmail: document.getElementById('opt-email').checked
        };

        await salvarPreferencias(novasPrefs);
        document.getElementById('modalContatos').remove();
        location.reload();
    });
}

async function salvarPreferencias(preferencias) {
    try {
        const response = await fetch('/preferences/', { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferencias }) // Enviar como objeto com chave 'preferencias'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao salvar preferências');
        }

        Swal.fire({
            icon: 'success',
            title: 'Preferências salvas!',
            text: 'Suas preferências foram atualizadas com sucesso.'
        });

        // Recarregar as preferências do backend e atualizar a interface
        const novasPreferencias = await carregarPreferencias();
        atualizarInterface(await carregarUsuario(), novasPreferencias);
    } catch (error) {
        console.error('Erro ao salvar preferências:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: error.message || 'Erro ao salvar preferências.'
        });
    }
}

// Habilidades
async function carregarHabilidades() {
    try {
        const response = await fetch('/habilidades');
        if (!response.ok) throw new Error('Erro ao carregar habilidades');

        const habilidades = await response.json();
        renderizarHabilidades(habilidades);
    } catch (error) {
        console.error('[perfil] erro ao carregar habilidades:', error);
    }
}

function renderizarHabilidades(habilidades) {
    const container = document.getElementById('checkboxContainer');
    if (!container) return;

    container.innerHTML = habilidades.map(hab => `
        <label class="habilidade-item">
            <input type="checkbox" value="${hab}">
            ${hab}
        </label>`).join('');
}

function mostrarOpcoesHabilidades() {
    document.getElementById('showOpcoesHabilidades').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    carregarHabilidades();
}

function fecharOpcoes() {
    document.getElementById('showOpcoesHabilidades').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function adicionarHabilidade() {
    const input = document.getElementById('novaHabilidade');
    const habilidade = input.value.trim();

    if (!habilidade) {
        return Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Digite uma habilidade válida.'
        });
    }

    try {
        const response = await fetch('/habilidades/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novaHabilidade: habilidade })
        });

        if (!response.ok) throw new Error('Erro ao adicionar habilidade');

        input.value = '';
        await carregarHabilidades();
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Habilidade adicionada com sucesso!'
        });
    } catch (error) {
        console.error('[perfil] erro ao adicionar habilidade:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao adicionar habilidade.'
        });
    }
}

function salvarHabilidades() {
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]');
    const botao = document.querySelector('.btn-primary');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            botao.disabled = !Array.from(checkboxes).some(cb => cb.checked);
        });
    });
}

function formatarTelefone(telefone) {
    const nums = telefone.replace(/\D/g, '');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Deletar usuário
function showPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function fecharPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function confirmarDelecao() {
    fetch('/DeletarUsuario', { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert("Perfil deletado com sucesso.");
                window.location.href = "/";
            } else {
                alert(data.erro || "Erro ao deletar.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro interno.");
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

async function carregarPerfil(userId) {
    try {
        const response = await fetch(`/user/${userId}`);
        const data = await response.json();
        if (data.sucesso) {
            console.log("Perfil do usuário:", data.usuario);
            // Preencher os campos do perfil com os dados do usuário
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: data.erro
            });
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar perfil.'
        });
    }
}

async function salvarPerfil(userId, dadosPerfil) {
    try {
        const response = await fetch(`/user/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPerfil)
        });
        const data = await response.json();
        if (data.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Perfil atualizado com sucesso!'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: data.erro
            });
        }
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao salvar perfil.'
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

// Para editar perfil
document.addEventListener('DOMContentLoaded', function () {

    // Envio da imagem de perfil
    const imageForm = document.querySelector('form[action="/upload"]');
    imageForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(imageForm);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const text = await response.text();

            if (text.sucesso) {
                Swal.fire({
                    icon: 'success',
                    title: 'Atualização feita com sucesso!',
                    text: text.mensagem,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Não foi possível atualizar o seu perfil! Por favor, Tente novamente.'
                });
            }
                
            } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao enviar imagem! Tente novamente.'
        });
        
        }
    });

    // Envio da bio/categoria
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(editForm);

        try {
            const response = await fetch('/editar_perfil', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.sucesso) {
                Swal.fire({
                    icon: 'success',
                    title: 'Atualização feita com sucesso!',
                    text: result.mensagem,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "/";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Não foi possível atualizar o seu perfil! Por favor, Tente novamente.'
                });
            }

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao salvar alterações! Tente novamente.'
            });
            }
    });

});

// Para ver a imagem
const imgInput = document.getElementById('img');
const preview = document.getElementById('preview');

imgInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block'; // Mostra a imagem
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

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
