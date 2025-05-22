document.addEventListener('DOMContentLoaded', async () => {
    await carregarCategorias();

    const form = document.getElementById('form-requisitar-servico');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeServico').value.trim();
        const descricao = document.getElementById('descricaoServico').value.trim();
        const categoria = document.getElementById('categoriaServico').value;
        const freelancerId = document.getElementById('freelancerId').value;
        const userId = document.getElementById('userId').value;

        console.log("[DEBUG] Dados do formulário:", { nome, descricao, categoria, freelancerId, userId });

        if (!nome || !descricao || !categoria || !freelancerId || !userId) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Por favor, preencha todos os campos antes de enviar.'
            });
            return;
        }

        try {
            const response = await fetch('/servicos/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, descricao, categoria, id_freelancer: freelancerId, id_cliente: userId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("[ERROR] Erro ao criar serviço:", errorData);
                throw new Error(errorData.erro || 'Erro ao criar serviço');
            }

            Swal.fire({
                icon: 'success',
                title: 'Serviço criado com sucesso!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => window.location.href = '/homepage');
        } catch (error) {
            console.error("[ERROR] Erro ao criar serviço:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao criar serviço.'
            });
        }
    });
});

async function carregarCategorias() {
    try {
        const response = await fetch('/category');
        if (!response.ok) throw new Error('Erro ao carregar categorias');
        const data = await response.json();

        const dropdown = document.getElementById('categoriaServico');
        data.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.ID_Categoria;
            option.textContent = categoria.NomeCategoria;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
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
