document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-avaliar-servico');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nota = document.getElementById('notaServico').value;
        const comentario = document.getElementById('comentarioServico').value.trim();
        const servicoId = form.dataset.servicoId;

        try {
            const response = await fetch(`/servicos/avaliar/${servicoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nota, comentario })
            });

            if (!response.ok) throw new Error('Erro ao avaliar serviço');
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
                text: 'Erro ao avaliar serviço.'
            });
        }
    });
});
