document.addEventListener('DOMContentLoaded', async () => {
    await carregarCategorias();
    await carregarServicos();

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
            }).then(() => location.reload());
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

async function carregarServicos() {
    try {
        const response = await fetch('/servicos/listar');
        if (!response.ok) throw new Error('Erro ao carregar serviços');
        const data = await response.json();

        console.log("[DEBUG] Dados recebidos da API:", data);

        const pedidos = document.getElementById('servicosPedidos');
        const recebidos = document.getElementById('servicosRecebidos');
        pedidos.innerHTML = '';
        recebidos.innerHTML = '';

        if (data.servicosPedidos && data.servicosPedidos.length > 0) {
            data.servicosPedidos.forEach(servico => {
                pedidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${servico.Categoria}</small>
                        <small>Status: ${servico.Status}</small>
                        <button class="btn btn-primary btn-sm mt-2" onclick="avaliarServico(${servico.ID_Service})">Avaliar</button>
                    </li>`;
            });
        } else {
            pedidos.innerHTML = '<li class="list-group-item">Nenhum serviço solicitado encontrado.</li>';
        }

        if (data.servicosRecebidos && data.servicosRecebidos.length > 0) {
            data.servicosRecebidos.forEach(servico => {
                recebidos.innerHTML += `
                    <li class="list-group-item">
                        <strong>${servico.Nome}</strong>
                        <p>${servico.Descricao}</p>
                        <small>Categoria: ${servico.Categoria}</small>
                        <small>Status: ${servico.Status}</small>
                    </li>`;
            });
        } else {
            recebidos.innerHTML = '<li class="list-group-item">Nenhum serviço recebido encontrado.</li>';
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

async function avaliarServico(servicoId) {
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
            console.error('Erro ao avaliar serviço:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: error.message || 'Erro ao avaliar serviço.'
            });
        }
    }
}
