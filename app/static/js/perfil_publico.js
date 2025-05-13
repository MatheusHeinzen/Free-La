document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userId = window.location.pathname.split('/').pop();
        console.log('Tentando buscar perfil para ID:', userId);
        
        const response = await fetch(`/profile/perfilPublico/${userId}`);
        
        // Verifica se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não é JSON:', text);
            throw new Error('Resposta do servidor não é JSON');
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!data.sucesso) {
            throw new Error(data.erro || 'Erro ao carregar perfil');
        }

        if (data.sucesso) {
            // Atualiza as informações do perfil
            document.getElementById('fotoPerfil').src = `/profile/imagem/${userId}?timestamp=${new Date().getTime()}`;
            document.getElementById('nomeUsuario').textContent = data.perfil.Nome || 'Nome não informado';
            document.getElementById('profissaoUsuario').textContent = data.perfil.Categoria || 'Categoria não informada';
            document.getElementById('descricaoUsuario').textContent = data.perfil.Bio || 'Sem descrição disponível.';

            // Atualiza os contatos
            const listaContatos = document.getElementById('listaContatos');
            listaContatos.innerHTML = '';
            if (data.perfil.Telefone) {
                listaContatos.innerHTML += `
                    <li class="list-group-item">
                        <div class="list-icon"><i class="bi bi-telephone"></i></div>
                        <div class="list-details">
                            <span>${data.perfil.Telefone}</span>
                            <small>Telefone</small>
                        </div>
                    </li>`;
            }
            if (data.perfil.Email) {
                listaContatos.innerHTML += `
                    <li class="list-group-item">
                        <div class="list-icon"><i class="bi bi-envelope"></i></div>
                        <div class="list-details">
                            <span>${data.perfil.Email}</span>
                            <small>Email</small>
                        </div>
                    </li>`;
            }

            // Atualiza as habilidades
            const habilidadesContainer = document.getElementById('habilidadesContainer');
            habilidadesContainer.innerHTML = '';
            if (data.perfil.Habilidades && data.perfil.Habilidades.length > 0) {
                data.perfil.Habilidades.forEach(habilidade => {
                    habilidadesContainer.innerHTML += `<span class="badge badge-dark badge-pill">${habilidade}</span> `;
                });
            } else {
                habilidadesContainer.innerHTML = '<p>Sem habilidades cadastradas.</p>';
            }
        } else {
            throw new Error(data.erro || 'Erro ao carregar perfil público.');
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Não foi possível carregar o perfil. Consulte o console para mais detalhes.');
    }
});
