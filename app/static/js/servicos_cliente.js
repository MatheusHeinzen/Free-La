document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/servicos/listar', { credentials: 'include' });
        if (!response.ok) throw new Error('Erro ao carregar serviços');
        const data = await response.json();

        const pedidos = document.getElementById('servicosPedidos');
        const pedidosConcluidos = document.getElementById('servicosPedidosConcluidos');
        pedidos.innerHTML = '';
        if (pedidosConcluidos) pedidosConcluidos.innerHTML = '';

        if (data.servicosPedidos && data.servicosPedidos.length > 0) {
            data.servicosPedidos.forEach(servico => {
                pedidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${servico.Categoria}</small>
                        <small>Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-danger btn-sm" onclick="deletarServico(${servico.ID_Service})">Deletar</button>
                            <button class="btn btn-info btn-sm" onclick="editarServico(${servico.ID_Service}, '${servico.Nome.replace(/'/g, "\\'")}', '${servico.Descricao.replace(/'/g, "\\'")}', '${servico.Categoria ? servico.Categoria.replace(/'/g, "\\'") : ''}')">Editar</button>
                            <button class="btn btn-warning btn-sm" onclick="avaliarServico(${servico.ID_Service})">Avaliar</button>
                        </div>
                    </li>`;
            });
        } else {
            pedidos.innerHTML = '<li class="list-group-item">Nenhum serviço requisitado encontrado.</li>';
        }

        // Corrigido: garantir que a listagem de concluídos aparece
        if (pedidosConcluidos && data.servicosPedidosConcluidos && data.servicosPedidosConcluidos.length > 0) {
            data.servicosPedidosConcluidos.forEach(servico => {
                pedidosConcluidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${servico.Categoria}</small>
                        <small>Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-warning btn-sm" onclick="avaliarServico(${servico.ID_Service})">Avaliar</button>
                        </div>
                    </li>`;
            });
        } else if (pedidosConcluidos) {
            pedidosConcluidos.innerHTML = '<li class="list-group-item">Nenhum serviço concluído encontrado.</li>';
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
});

window.editarServico = function(servicoId, nome, descricao, categoria) {
    Swal.fire({
        title: 'Editar Serviço',
        html: `
            <label for="editNomeServico">Nome:</label>
            <input id="editNomeServico" class="form-control mb-2" value="${nome}">
            <label for="editDescricaoServico">Descrição:</label>
            <textarea id="editDescricaoServico" class="form-control mb-2">${descricao}</textarea>
            <label for="editCategoriaServico">Categoria:</label>
            <input id="editCategoriaServico" class="form-control mb-2" value="${categoria}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome: document.getElementById('editNomeServico').value,
                descricao: document.getElementById('editDescricaoServico').value,
                categoria: document.getElementById('editCategoriaServico').value
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            try {
                const response = await fetch(`/servicos/editar/${servicoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });
                if (!response.ok) throw new Error('Erro ao editar serviço');
                Swal.fire({
                    icon: 'success',
                    title: 'Serviço editado!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => location.reload());
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: error.message || 'Erro ao editar serviço.'
                });
            }
        }
    });
};

window.avaliarServico = async function(servicoId) {
    const { value: formValues } = await Swal.fire({
        title: 'Avaliar Serviço',
        html: `
            <label for="notaServico">Nota (1-5):</label>
            <input id="notaServico" type="number" min="1" max="5" class="form-control mb-2">
            <label for="comentarioServico">Comentário:</label>
            <textarea id="comentarioServico" class="form-control" rows="3"></textarea>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const nota = document.getElementById('notaServico').value;
            const comentario = document.getElementById('comentarioServico').value.trim();
            if (!nota || nota < 1 || nota > 5) {
                Swal.showValidationMessage('Por favor, insira uma nota válida entre 1 e 5.');
                return;
            }
            return { nota, comentario };
        }
    });

    if (formValues) {
        try {
            const response = await fetch(`/servicos/avaliar/${servicoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro ao avaliar serviço');
            }

            Swal.fire({
                icon: 'success',
                title: 'Serviço avaliado com sucesso!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => location.reload());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao avaliar serviço.'
            });
        }
    }
};

window.deletarServico = async function(servicoId) {
    const confirm = await Swal.fire({
        title: 'Deletar serviço?',
        text: 'Tem certeza que deseja deletar este serviço?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Voltar'
    });
    if (confirm.isConfirmed) {
        try {
            const response = await fetch(`/servicos/deletar/${servicoId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao deletar serviço');
            Swal.fire({
                icon: 'success',
                title: 'Serviço deletado!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => location.reload());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao deletar serviço.'
            });
        }
    }
};

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