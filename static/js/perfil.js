document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('user_id');
    if (!userId) {
        window.location.href = '/';
        return;
    }

    try {
        const usuario = await carregarUsuario(userId);
        const preferencias = await carregarPreferencias(userId) || {
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
async function carregarUsuario(userId) {
    const response = await fetch(`/usuario/${userId}`);
    if (!response.ok) throw new Error('Erro ao carregar usuário');

    const { usuario } = await response.json();
    return usuario;
}

async function carregarPreferencias(userId) {
    try {
        const response = await fetch(`/usuario/${userId}/preferencias`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch {
        console.warn('[perfil] usando preferências padrão');
        return null;
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

        await salvarPreferencias(localStorage.getItem('userId'), novasPrefs);
        document.getElementById('modalContatos').remove();
        location.reload();
    });
}

async function salvarPreferencias(userId, preferencias) {
    const response = await fetch(`/usuario/${userId}/preferencias`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencias)
    });

    if (!response.ok) throw new Error('Falha ao salvar');
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
