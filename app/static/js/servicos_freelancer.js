document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/servicos/listar', { credentials: 'include' });
        if (!response.ok) throw new Error('Erro ao carregar serviços');
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
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${renderCategoria(servico)}</small>
                        <small>Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-success btn-sm" onclick="concluirServico(${servico.ID_Service})">Concluir</button>
                        </div>
                    </li>`;
            });
        } else {
            recebidos.innerHTML = '<li class="list-group-item">Nenhum serviço recebido encontrado.</li>';
        }

        // Serviços concluídos
        if (recebidosConcluidos && Array.isArray(data.servicosRecebidosConcluidos) && data.servicosRecebidosConcluidos.length > 0) {
            data.servicosRecebidosConcluidos.forEach(servico => {
                recebidosConcluidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${renderCategoria(servico)}</small>
                        <small>Status: ${servico.Status}</small>
                        <div class="mt-2">
                            <button class="btn btn-warning btn-sm" onclick="avaliarServico(${servico.ID_Service})">Avaliar</button>
                        </div>
                    </li>`;
            });
        } else if (recebidosConcluidos) {
            recebidosConcluidos.innerHTML = '<li class="list-group-item">Nenhum serviço concluído encontrado.</li>';
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

window.avaliarServico = async function (servicoId) {
    console.log("Serviço ID:", servicoId);
    const { value: formValues } = await Swal.fire({
        title: 'Avaliar Serviço',
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
        <textarea id="comentarioServico" class="form-control" rows="3"></textarea>
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
                const text = await response.text(); // pega como string
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