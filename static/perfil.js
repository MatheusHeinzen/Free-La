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
    const resposta = await fetch('./habilidades.json');
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

    const resposta = await fetch('/adicionar', {
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