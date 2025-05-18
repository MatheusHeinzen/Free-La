document.addEventListener("DOMContentLoaded", async () => {
    try {
        const usuario = await carregarUsuario();
        const preferencias = await carregarPreferencias();

        atualizarInterface(usuario, preferencias);

        const btnContatos = document.getElementById('btnAdicionarContatos');
        if (btnContatos) {
            btnContatos.addEventListener('click', () => mostrarModalContatos(preferencias));
        }

        // Atualiza a foto do perfil
        const fotoPerfil = document.getElementById('fotoPerfil');
        if (fotoPerfil) {
            fotoPerfil.src = `/profile/imagem/${usuario.ID_User}?timestamp=${new Date().getTime()}`;
        }

        // Carrega bio e categoria do perfil
        await carregarPerfil(usuario.ID_User);

        // Carrega categorias no formulário de edição
        await carregarCategorias();

    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar perfil.',
            timer: 2000
        }).then(() => window.location.href = `/`)
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

    // Configura envio do formulário de imagem
    const formUploadImagem = document.getElementById('formUploadImagem');
    if (formUploadImagem) {
        formUploadImagem.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formUploadImagem);

            // Adiciona o user_id ao FormData
            const userId = document.querySelector('input[name="user_id"]').value;
            formData.append('user_id', userId);

            try {
                const response = await fetch('/profile/upload_imagem', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Erro ao atualizar imagem');
                Swal.fire({
                    icon: 'success',
                    title: 'Imagem atualizada com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => location.reload());
            } catch (error) {
                console.error('Erro ao atualizar imagem:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Erro ao atualizar imagem.'
                });
            }
        });
    }

    // Configura envio do formulário de bio e categoria
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.querySelector('input[name="user_id"]').value;
            const bio = document.getElementById('descricao')?.value || '';
            const categoriaId = document.getElementById('categoria')?.value || '';

            try {
                const response = await fetch('/profile/salvar_bio_categoria', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, bio, categoria_id: categoriaId })
                });

                if (!response.ok) throw new Error('Erro ao salvar bio e categoria');


                const categoria = document.getElementById("categoria").value;
                const descricao = document.getElementById("descricao").value;

                try {
                    await salvarPerfil(categoria, descricao);
                    modal.style.display = "none"; // Fecha o modal após salvar
                } catch (error) {
                    console.error("Erro ao salvar perfil:", error);
                };

                Swal.fire({
                    icon: 'success',
                    title: 'Bio e categoria atualizadas com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => location.reload());
            } catch (error) {
                console.error('Erro ao salvar bio e categoria:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Erro ao salvar bio e categoria.'
                });
            }
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
        const response = await fetch('/preference/get', { method: 'GET', credentials: 'include' });
        if (!response.ok) {
            if (response.status === 404) {
                console.warn('Preferências não encontradas, usando padrão');
                return { mostrarTelefone: true, mostrarEmail: true };
            }
            throw new Error('Erro ao carregar preferências');
        }

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

async function atualizarPreferencias(userId, preferencias) {
    try {
        const response = await fetch(`/preference/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferencias })
        });
        const data = await response.json();
        console.log('Preferências recebidas:', preferencias);
        console.log('Dados do usuário:', usuario);
        if (data.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: data.mensagem
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: data.erro
            });
        }
    } catch (error) {
        console.error("Erro ao atualizar preferências:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao atualizar preferências.'
        });
    }
}

function atualizarInterface(usuario, preferencias) {

    console.log('Dados do usuário:', usuario.Email, usuario.Telefone);

    const nomeEl = document.getElementById('nomeUsuario');
    const profissaoEl = document.getElementById('profissaoUsuario');
    const listaContatos = document.getElementById('listaContatos');

    if (nomeEl) nomeEl.textContent = usuario.Nome || 'Nome não informado';
    if (profissaoEl) profissaoEl.textContent = usuario.Profissao || usuario.Categoria || 'Perfil do Usuário';

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

        // Se nenhum contato for mostrado, exibe mensagem
        if (listaContatos.innerHTML === '') {
            listaContatos.innerHTML = `
                <li class="list-group-item">
                    <div class="list-details">
                        <span>Nenhum contato disponível</span>
                    </div>
                </li>`;
        }
    }
}

// Função para fechar o modal de preferências corretamente
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

        try {
            await salvarPreferencias(novasPrefs);
            document.getElementById('modalContatos').remove();

            // Recarrega as preferências e atualiza a interface
            const usuario = await carregarUsuario();
            const preferenciasAtualizadas = await carregarPreferencias();
            atualizarInterface(usuario, preferenciasAtualizadas);

        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao salvar preferências'
            });
        }
    }
    )
};


async function salvarPreferencias(preferencias) {
    try {
        const response = await fetch('/preference/put', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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


// Para aparecer as avaliações no perfil
const lista = document.getElementById('lista-avaliacoes');
function gerarEstrelasHTML(qtd) {
      let html = '';
      for (let i = 0; i < qtd; i++) {
        html += '<i class="bi bi-star-fill text-warning"></i>';
      }
      for (let i = qtd; i < 5; i++) {
        html += '<i class="bi bi-star text-secondary"></i>';
      }
      return html;
    }


function formatarTelefone(telefone) {
    const nums = telefone.replace(/\D/g, '');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
        const response = await fetch(`/profile/obter_perfil/${userId}`);
        if (!response.ok) throw new Error('Erro ao carregar perfil');
        const { perfil } = await response.json();

        // Atualiza a bio e a categoria na interface
        const descricaoEl = document.querySelector('#profile p');
        if (descricaoEl) {
            descricaoEl.textContent = perfil.Bio || 'Descrição não informada.';
        }

        const profissaoEl = document.getElementById('profissaoUsuario');
        if (profissaoEl) {
            profissaoEl.textContent = perfil.NomeCategoria || 'Categoria não informada.';
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar bio e categoria do perfil.'
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
                    window.location.href = "/perfil";
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
const imgInput = document.getElementById('image');
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

// Chamar categorias
async function carregarCategorias() {
    try {
        const response = await fetch('/profile/obter-categorias');
        if (!response.ok) throw new Error('Erro ao carregar categorias');

        const categorias = await response.json();
        const select = document.getElementById('categoria');
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
