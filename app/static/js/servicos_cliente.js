document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/servicos/listar', { credentials: 'include' });
        if (!response.ok) {
            window.location.href = "/homepage";
            return;
        }
        const data = await response.json();

        const pedidos = document.getElementById('servicosPedidos');
        const pedidosConcluidos = document.getElementById('servicosPedidosConcluidos');
        pedidos.innerHTML = '';
        if (pedidosConcluidos) pedidosConcluidos.innerHTML = '';

        if (data.servicosPedidos && data.servicosPedidos.length > 0) {
            data.servicosPedidos.forEach(servico => {
                // Se não tem freelancer, marca como indisponível
                const nomeServico = servico.ID_Freelancer === null || servico.ID_Freelancer === undefined
                    ? `${servico.Nome} <span class="text-danger font-italic"></span>`
                    : servico.Nome;
                pedidos.innerHTML += `
                        <li class="list-group-item">
                            <div class="service-item">
                                <h5 class="service-title mb-2">${nomeServico}</h5>
                                <p class="service-description mb-2">${servico.Descricao}</p>
                                <div class="service-meta d-flex flex-wrap mb-3" style="gap: 20px">
                                    <small class="d-block">Categoria: ${servico.Categoria || '<span class="text-danger">Sem categoria</span>'}</small> 
                                    <small class="d-block mb-2">Status: ${servico.Status}</small>
                                </div>
                                <div class="d-flex mt-2" style="gap: 20px">
                                    <button class="btn btn-danger btn-sm" onclick="deletarServico(${servico.ID_Service})">Deletar</button>
                                    <button class="btn btn-info btn-sm" onclick="editarServico(${servico.ID_Service}, '${servico.Nome.replace(/'/g, "\\'")}', '${servico.Descricao.replace(/'/g, "\\'")}', '${servico.Categoria ? servico.Categoria.replace(/'/g, "\\'") : ''}')">Editar</button>
                                </div>
                            </div>
                        </li>
                    `;
            });
        } else {
            pedidos.innerHTML = `
            <li class="list-group-item py-3">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 2rem;"></i>
                Nenhum serviço requisitado encontrado.
            </li>`;
        }

        // Serviços concluídos - checa se já foi avaliado
        if (pedidosConcluidos && data.servicosPedidosConcluidos && data.servicosPedidosConcluidos.length > 0) {
            let ids = data.servicosPedidosConcluidos.map(s => s.ID_Service);
            let avaliacoes = {};
            try {
                const resp = await fetch(`/servicos/avaliacoes/usuario?ids=${ids.join(',')}`, { credentials: 'include' });
                if (resp.ok) {
                    const result = await resp.json();
                    if (result.sucesso && result.avaliacoes) {
                        result.avaliacoes.forEach(av => { avaliacoes[av.ID_Service] = true; });
                    }
                }
            } catch {}
            data.servicosPedidosConcluidos.forEach(servico => {
                const jaAvaliado = avaliacoes[servico.ID_Service];
                const avaliacaoId = jaAvaliado && jaAvaliado.ID_Avaliacao;
                pedidosConcluidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p class="mb-2" style="word-break: break-word">${servico.Descricao}</p>
                        <small class="d-block">Categoria: ${servico.Categoria || '<span class="text-danger">Sem categoria</span>'}</small>
                        <small class="d-block mb-2">Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-warning btn-sm" onclick="avaliarServico(${servico.ID_Service}, ${jaAvaliado ? JSON.stringify(jaAvaliado) : 'null'})">${jaAvaliado ? 'Reavaliar' : 'Avaliar'}</button>
                            ${jaAvaliado ? `<button class="btn btn-danger btn-sm ml-2" onclick="deletarAvaliacao(${servico.ID_Service})">Deletar Avaliação</button>` : ''}
                        </div>
                    </li>`;
            });
        } else if (pedidosConcluidos) {
            pedidosConcluidos.innerHTML = `
            <li class="list-group-item">
                <i class="bi bi-check-circle text-muted mb-2" style="font-size: 2rem;"></i>
                Nenhum serviço concluído encontrado.
            </li>`;
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
});

window.editarServico = function (servicoId, nome, descricao, categoria) {
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

window.avaliarServico = async function (servicoId, avaliacaoExistente = null) {
    let notaAtual = '';
    let comentarioAtual = '';
    if (avaliacaoExistente) {
        notaAtual = avaliacaoExistente.Nota;
        comentarioAtual = avaliacaoExistente.Comentario || '';
    }
    const { value: formValues } = await Swal.fire({
        title: avaliacaoExistente ? 'Reavaliar Serviço' : 'Avaliar Serviço',
        html: `
        <div class="mb-3">
            <label class="form-label">Nota:</label><br>
            <div class="rating">
                <input type="radio" id="estrela5" name="rating" value="5">
                <label for="estrela5"><i class="bi bi-star-fill"></i></label>
                <input type="radio" id="estrela4" name="rating" value="4">
                <label for="estrela4"><i class="bi bi-star-fill"></i></label>
                <input type="radio" id="estrela3" name="rating" value="3">
                <label for="estrela3"><i class="bi bi-star-fill"></i></label>
                <input type="radio" id="estrela2" name="rating" value="2">
                <label for="estrela2"><i class="bi bi-star-fill"></i></label>
                <input type="radio" id="estrela1" name="rating" value="1">
                <label for="estrela1"><i class="bi bi-star-fill"></i></label>
            </div>
        </div>
        <label for="comentarioServico">Comentário:</label>
        <textarea id="comentarioServico" class="form-control" rows="3">${comentarioAtual}</textarea>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const checked = document.querySelector('input[name="rating"]:checked');
            const nota = checked ? checked.value : null;
            const comentario = document.getElementById('comentarioServico').value.trim();

            if (!nota) {
                Swal.showValidationMessage('Por favor, selecione uma nota de 1 a 5.');
                return false;
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

window.deletarAvaliacao = async function(servicoId) {
    const confirm = await Swal.fire({
        title: 'Deletar avaliação?',
        text: 'Tem certeza que deseja deletar sua avaliação deste serviço?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar'
    });
    if (confirm.isConfirmed) {
        try {
            const response = await fetch(`/servicos/avaliar/${servicoId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao deletar avaliação');
            Swal.fire({
                icon: 'success',
                title: 'Avaliação deletada!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => location.reload());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao deletar avaliação.'
            });
        }
    }
};

window.deletarServico = async function (servicoId) {
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



// Adiciona eventos para monitorar a atividade do usuário
document.addEventListener('mousemove', resetarInatividade);
document.addEventListener('keydown', resetarInatividade);
document.addEventListener('click', resetarInatividade);

// Inicializa o timer ao carregar a página
resetarInatividade();