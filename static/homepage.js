
//SideBar (Entra e sai da tela)
document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.querySelector(".menu_lateral");
    const toggleButton = document.getElementById("toggleSidebar");

    toggleButton.addEventListener("click", function(event) {
        sidebar.classList.toggle("ativo");
        event.stopPropagation(); 
    });

    document.addEventListener("click", function(event) {
        if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
            sidebar.classList.remove("ativo");
        }
    });
});

//Dados fictícios de freelancers só para exemplo
const trabalhosFreelancers = [
    {
        nome: "Rogério Silva",
        especialidade: "Designer Gráfico",
        descricao: "Criação de logos, banners e identidade visual.",
        imagem: "../imgs/designer.jpg",
        link: "../Cadastro/index.html"
    },
    {
        nome: "Antônio Mendes",
        especialidade: "Desenvolvedor Web",
        descricao: "Sites responsivos, landing pages e sistemas personalizados.",
        imagem: "../imgs/dev.jpg",
        link: "../Cadastro/index.html"
    },
    {
        nome: "Valentina Lima",
        especialidade: "Pintora",
        descricao: "Pinturas realistas em interior e exterior de casas e empresas.",
        imagem: "../imgs/pintora.jpg",
        link: "../Cadastro/index.html"
    },
    {
        nome: "Fernanda Santana",
        especialidade: "Designer Gráfico",
        descricao: "Design de sites e landing pages, identidade visual de empresas.",
        imagem: "../imgs/designer2.jpg",
        link: "../Cadastro/index.html"
    },
    {
        nome: "Jorge Rasmussen",
        especialidade: "Encanador",
        descricao: "Reparo e planejamento de encanamentos, pias, privadas de forma profissional.",
        imagem: "../imgs/encanador.jpg",
        link: "../Cadastro/index.html"
    }
];

//Função para exibir todos os freelancers ao carregar a página
function exibirTodosFreelancers() {
    let section = document.getElementById("resultados-pesquisa");
    section.innerHTML = ""; // Limpa a seção

    trabalhosFreelancers.forEach(dado => {
        section.innerHTML += `
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
    });
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

    // Se nenhum resultado for encontrado
    section.innerHTML = resultados || "<p>Nenhum freelancer encontrado.</p>";
}

// Exibe todos os freelancers ao carregar a página
window.onload = exibirTodosFreelancers;
