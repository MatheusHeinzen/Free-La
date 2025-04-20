document.addEventListener("DOMContentLoaded", () => {
  const lista = document.getElementById("dados-usuario");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    for (const chave in usuario) {
      const item = document.createElement("li");
      item.textContent = `${chave}: ${usuario[chave]}`;
      lista.appendChild(item);
    }
  }
});

function adicionarContatos() {
  const contato = document.getElementById("contatos")
  const tipo = document.getElementById("")



  contato.innerHTML = `<li class="list-group-item">
                            <div class="list-icon">
                                <i class="fa fa-envelope"></i>
                            </div>
                            <div class="list-details">
                                <span>${contato}</span>
                                <small>${tipo}</small>
                            </div>
                        </li>`
}

function mostrarOpcoesHabilidades() {
  document.getElementById('showOpcoesHabilidades').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function fecharOpcoes() {
  document.getElementById('showOpcoesHabilidades').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

function validar() {
  if (checkbox.checked) {
    window.location.href = "/homepage";
  } else {
    mostrarAlerta();
  }


}


// Habilidades -> Perfil
async function carregarHabilidades() {
  const resposta = await fetch('./habilidades');
  const habilidades = await resposta.json();
  renderizarCheckboxes(habilidades);
}

function renderizarCheckboxes(habilidades) {
  const container = document.getElementById("checkboxContainer");
  container.innerHTML = "";
  habilidades.forEach(habilidade => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = habilidade;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habilidade));
    container.appendChild(label);
  });
}

async function adicionarHabilidade() {
  const input = document.getElementById("novaHabilidade");
  const nova = input.value.trim();

  if (nova === "") {
    alert("Digite uma habilidade!");
    return;
  }

  const resposta = await fetch('/adicionarHabilidade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ novaHabilidade: nova })
  });

  const resultado = await resposta.json();

  if (resposta.ok) {
    input.value = "";
    carregarHabilidades();
  } else {
    alert(resultado.erro);
  }
}

carregarHabilidades();


// FUNÇÃO PARA CARREGAR DADOS DO USUÁRIO
async function carregarDadosUsuario(userId) {
  console.log('[DADOS] Carregando dados do usuário ID:', userId);

  try {
    const response = await fetch(`/usuario/${userId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.erro || `Erro HTTP! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (data.sucesso) {
      console.log('[DADOS] Dados recebidos:', data.usuario);
      preencherFormulario(data.usuario);
    } else {
      throw new Error(data.erro || "Erro ao carregar dados");
    }
  } catch (error) {
    console.error('[DADOS ERRO] Falha ao carregar dados:', error);
    alert(`Erro ao carregar dados: ${error.message}`);
    console.error('Detalhes do erro:', error);
  }

  console.log('[DADOS] Preenchendo formulário com dados do usuário');
    
    setValue('nome', usuario.Nome);
}