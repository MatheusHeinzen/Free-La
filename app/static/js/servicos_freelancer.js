document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/servicos/listar', { credentials: 'include' });
        if (!response.ok) {
            // Se não autenticado, redireciona para homepage
            window.location.href = "/homepage";
            return;
        }
        const data = await response.json();

        const recebidos = document.getElementById('servicosRecebidos');
        const recebidosConcluidos = document.getElementById('servicosRecebidosConcluidos');
        recebidos.innerHTML = '';
        if (recebidosConcluidos) recebidosConcluidos.innerHTML = '';

        function renderCategoria(servico) {
            return servico.Categoria && servico.Categoria !== 'null' ? servico.Categoria : '<span class="text-danger">Sem categoria</span>';
        }

        if (Array.isArray(data.servicosRecebidos) && data.servicosRecebidos.length > 0) {
            data.servicosRecebidos.forEach(servico => {
                recebidos.innerHTML += `
                    <li class="list-group-item">
                        <div class="service-item">
                            <h5 class="service-title mb-2">${servico.Nome}</h5>
                            <p class="service-description mb-2">${servico.Descricao}</p>
                            <div class="service-meta d-flex flex-wrap mb-3" style="gap: 20px">
                                <small>Categoria: ${renderCategoria(servico)}</small>
                                <small>Status: ${servico.Status}</small>
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-success btn-sm" onclick="concluirServico(${servico.ID_Service})">Concluir</button>
                            </div>
                        </div>
                    </li>`;
            });
        } else {
            recebidos.innerHTML = `
            <li class="list-group-item py-3">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 2rem;"></i>
                Nenhum serviço requisitado encontrado.
            </li>`;
        }

        // Serviços concluídos - checa se já foi avaliado
        let avaliacoesUsuario = {};
        if (recebidosConcluidos && Array.isArray(data.servicosRecebidosConcluidos) && data.servicosRecebidosConcluidos.length > 0) {
            // Busca avaliações do usuário logado para os serviços concluídos
            const userId = window.session?.user_id || (window.sessionStorage && sessionStorage.getItem('user_id'));
            let ids = data.servicosRecebidosConcluidos.map(s => s.ID_Service);
            let avaliacoes = {};
            try {
                // Busca avaliações do usuário logado para esses serviços
                const resp = await fetch(`/servicos/avaliacoes/usuario?ids=${ids.join(',')}`, { credentials: 'include' });
                if (resp.ok) {
                    const result = await resp.json();
                    if (result.sucesso && result.avaliacoes) {
                        // Map: ID_Service -> true
                        result.avaliacoes.forEach(av => { avaliacoes[av.ID_Service] = true; });
                    }
                }
            } catch {}
            data.servicosRecebidosConcluidos.forEach(servico => {
                const jaAvaliado = avaliacoes[servico.ID_Service];
                recebidosConcluidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p class="mb-2" style="word-break: break-word">${servico.Descricao}</p>
                        <small class="d-block">Categoria: ${renderCategoria(servico)}</small>
                        <small class="d-block mb-2">Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-warning btn-sm" onclick="avaliarServico(${servico.ID_Service}, ${jaAvaliado ? JSON.stringify(jaAvaliado) : 'null'})">${jaAvaliado ? 'Reavaliar' : 'Avaliar'}</button>
                            ${jaAvaliado ? `<button class="btn btn-danger btn-sm ml-2" onclick="deletarAvaliacao(${servico.ID_Service})">Deletar Avaliação</button>` : ''}
                        </div>
                    </li>`;
            });
        } else if (recebidosConcluidos) {
            recebidosConcluidos.innerHTML = `
            <li class="list-group-item"> 
                <i class="bi bi-check-circle text-muted mb-2" style="font-size: 2rem;"></i>
                Nenhum serviço concluído encontrado.
            </li>`;
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        const recebidos = document.getElementById('servicosRecebidos');
        if (recebidos) {
            recebidos.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar serviços.</li>';
        }
    }
});

window.concluirServico = async function (servicoId) {
    const confirm = await Swal.fire({
        title: 'Concluir serviço?',
        text: 'Tem certeza que deseja marcar este serviço como concluído?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, concluir',
        cancelButtonText: 'Cancelar'
    });
    if (confirm.isConfirmed) {
        try {
            const response = await fetch(`/servicos/concluir/${servicoId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Erro ao concluir serviço');
            Swal.fire({
                icon: 'success',
                title: 'Serviço concluído!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => location.reload());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao concluir serviço.'
            });
        }
    }
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
            ${[5,4,3,2,1].map(i => `
                <input type="radio" id="estrela${i}" name="rating" value="${i}" ${notaAtual == i ? 'checked' : ''}>
                <label for="estrela${i}"><i class="bi bi-star-fill"></i></label>
            `).join('')}
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
                const text = await response.text();
                throw new Error(`Erro do servidor: ${text}`);
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