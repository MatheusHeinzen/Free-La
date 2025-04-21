document.addEventListener("DOMContentLoaded", async () => {
    try {
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('user_id');
        if (!userId) {
            window.location.href = '/';
            return;
        }

        // Carrega dados do usuário
        const response = await fetch(`/usuario/${userId}`);
        if (!response.ok) throw new Error('Erro ao carregar usuário');

        const { usuario } = await response.json();

        // Atualiza a interface
        document.querySelector('.profile-card-4 h5').textContent = usuario.Nome || 'Nome não informado';

        // Carrega preferências
        const prefResponse = await fetch(`/usuario/${userId}/preferencias`);
        const preferencias = prefResponse.ok ? await prefResponse.json() : {
            mostrarTelefone: true,
            mostrarEmail: true
        };

        // Atualiza contatos
        const listaContatos = document.querySelector('#contatos .list-group');
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

        // Configura eventos
        document.getElementById('btnAdicionarContatos').addEventListener('click', () => {
            mostrarModalContatos(preferencias);
        });

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar perfil');
    }
});

// Funções principais
async function carregarUsuario(userId) {
    const response = await fetch(`/usuario/${userId}/dados`);
    if (!response.ok) throw new Error('Erro ao carregar usuário');

    const data = await response.json();
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // Mostra dados do usuário na lista de debug (da versão anterior)
    const lista = document.getElementById("dados-usuario");
    if (lista) {
        lista.innerHTML = '';
        for (const chave in data.usuario) {
            const item = document.createElement("li");
            item.textContent = `${chave}: ${data.usuario[chave]}`;
            lista.appendChild(item);
        }
    }

    return data.usuario;
}

async function carregarPreferencias(userId) {
    try {
        const response = await fetch(`/usuario/${userId}/preferencias`);
        if (!response.ok) throw new Error('Erro ao carregar preferências');

        const data = await response.json();
        localStorage.setItem('preferenciasContato', JSON.stringify(data));
        return data;
    } catch (error) {
        console.warn('[perfil] usando preferências padrão');
        return null;
    }
}

function atualizarInterface(usuario, preferencias) {
    // Atualiza cabeçalho
    document.querySelector('.profile-card-4 h5').textContent = usuario.Nome || 'Nome não informado';
    document.querySelector('.profile-card-4 h6').textContent =
        usuario.Profissao || usuario.Categoria || 'Perfil do Usuário';

    // Atualiza contatos
    const listaContatos = document.querySelector('#contatos .list-group');
    listaContatos.innerHTML = '';

    if (preferencias.mostrarTelefone && usuario.Telefone) {
        listaContatos.innerHTML += `
          <li class="list-group-item">
              <div class="list-icon">
                  <i class="bi bi-telephone"></i>
              </div>
              <div class="list-details">
                  <span>${formatarTelefone(usuario.Telefone)}</span>
                  <small>Telefone</small>
              </div>
          </li>
      `;
    }

    if (preferencias.mostrarEmail && usuario.Email) {
        listaContatos.innerHTML += `
          <li class="list-group-item">
              <div class="list-icon">
                  <i class="bi bi-envelope"></i>
              </div>
              <div class="list-details">
                  <span>${usuario.Email}</span>
                  <small>Email</small>
              </div>
          </li>
      `;
    }
}

// Modal de contatos
function mostrarModalContatos(preferenciasAtuais) {
    const modalHTML = `
      <div class="modal-contatos" id="modalContatos">
          <div class="modal-content">
              <h3>Exibir contatos</h3>
              <label>
                  <input type="checkbox" id="opt-telefone" ${preferenciasAtuais.mostrarTelefone ? 'checked' : ''}>
                  Telefone
              </label>
              <label>
                  <input type="checkbox" id="opt-email" ${preferenciasAtuais.mostrarEmail ? 'checked' : ''}>
                  Email
              </label>
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
        location.reload(); // Recarrega para aplicar mudanças
    });
}

// Utilitários
async function salvarPreferencias(userId, preferencias) {
    const response = await fetch(`/usuario/${userId}/preferencias`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencias)
    });

    if (!response.ok) throw new Error('Falha ao salvar');
}

function formatarTelefone(telefone) {
    const nums = telefone.replace(/\D/g, '');
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Sistema de habilidades
async function carregarHabilidades() {
    try {
        const response = await fetch('/habilidades');
        if (!response.ok) throw new Error('erro ao carregar habilidades');

        const habilidades = await response.json();
        renderizarHabilidades(habilidades);

    } catch (error) {
        console.error('[perfil] erro ao carregar habilidades:', error);
    }
}

function renderizarHabilidades(habilidades) {
    const container = document.getElementById('checkboxContainer');
    if (!container) return;

    container.innerHTML = habilidades.map(habilidade => `
      <label class="habilidade-item">
          <input type="checkbox" value="${habilidade}">
          ${habilidade}
      </label>
  `).join('');
}

const checkbox = document.getElementById('checkbox');

function mostrarOpcoesHabilidades() {
    document.getElementById('showOpcoesHabilidades').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    carregarHabilidades();
}

function fecharOpcoes() {
    document.getElementById('showOpcoesHabilidades').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    // pensar futuramente -> criação de tabela sql para salvar as habilidades selecionadas
    // try {
    //     checkbox.addEventListener('change', function () {
    //         this.checked;
    //     });
    // } catch (error){

    // }

}

function salvarHabilidades() {

    const botao = document.querySelector('.btn-primary');

    checkbox.addEventListener('change', function () {
        botao.disabled = !this.checked;
    });

}

async function adicionarHabilidade() {
    const input = document.getElementById('novaHabilidade');
    const habilidade = input.value.trim();

    if (!habilidade) {
        alert('digite uma habilidade válida');
        return;
    }

    try {
        const response = await fetch('/habilidades/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novaHabilidade: habilidade })
        });

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'erro ao adicionar');
        }

        input.value = '';
        await carregarHabilidades();
        alert('habilidade adicionada com sucesso!');

    } catch (error) {
        console.error('[perfil] erro ao adicionar habilidade:', error);
        alert('erro: ' + error.message);
    }
}

// utilitários
function mostrarAlerta(mensagem) {
    alert(mensagem || 'operação não permitida');
}


// Para modo edição
const modal = document.getElementById("editModal");
const btn = document.getElementById("editBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}

document.getElementById("editForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;

    console.log("Categoria:", categoria);
    console.log("Descrição:", descricao);

    // Aqui você pode atualizar o DOM ou enviar para o backend via fetch/AJAX

    modal.style.display = "none"; // Fecha o modal após salvar
});