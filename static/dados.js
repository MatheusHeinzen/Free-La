document.addEventListener('DOMContentLoaded', () => {
    console.log('[DADOS] Página carregada - Iniciando script');
    
    // Configura máscaras
    $("#telefone").mask("(00) 00000-0000");
    $("#cpf").mask("000.000.000-00");
    $("#cep").mask("00000-000");

    // Verifica se o usuário está logado
    const userId = localStorage.getItem('userId');
    console.log('[DADOS] ID do usuário no localStorage:', userId);
    
    if (!userId || isNaN(userId)) {
        console.error('[DADOS ERRO] ID de usuário inválido ou não encontrado');
        alert('Sessão expirada ou inválida. Redirecionando para login...');
        window.location.href = '/';
        return;
    }

    // Carrega os dados do usuário
    carregarDadosUsuario(userId);

    // Configura o envio do formulário
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        atualizarDadosUsuario(userId);
    });

    // Configura busca de CEP
    const cepInput = document.getElementById("cep");
    cepInput.addEventListener('blur', buscarCEP);

    // Transforma o botão de "Salvar Alterações" em submit
    const btnSalvar = document.querySelector('.btn-primary');
    btnSalvar.type = 'submit';
});

// FUNÇÃO PARA CARREGAR DADOS DO USUÁRIO
async function carregarDadosUsuario(userId) {
    console.log('[DADOS] Carregando dados do usuário ID:', userId);
    
    try {
        const response = await fetch(`/usuario/${userId}`);
        console.log('[DADOS] Resposta da API - Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[DADOS] Dados recebidos:', data);
        
        if (data.sucesso) {
            preencherFormulario(data.usuario);
        } else {
            throw new Error(data.erro || "Erro ao carregar dados");
        }
    } catch (error) {
        console.error('[DADOS ERRO] Falha ao carregar dados:', error);
        alert('Erro ao carregar dados do usuário. Verifique o console para detalhes.');
    }
}

// FUNÇÃO PARA PREENCHER FORMULÁRIO
function preencherFormulario(usuario) {
    console.log('[DADOS] Preenchendo formulário com dados do usuário');
    
    // Dados básicos
    document.getElementById('nome').value = usuario.Nome || '';
    document.getElementById('email').value = usuario.Email || '';
    
    // Campos adicionais (verifica existência antes de preencher)
    if (document.getElementById('cpf')) {
        document.getElementById('cpf').value = usuario.CPF || '';
    }
    
    if (document.getElementById('telefone')) {
        document.getElementById('telefone').value = usuario.Telefone || '';
    }
    
    if (document.getElementById('dataNascimento')) {
        // Formata a data para o input type="date" (YYYY-MM-DD)
        const dataNasc = usuario.DataNascimento ? new Date(usuario.DataNascimento).toISOString().split('T')[0] : '';
        document.getElementById('dataNascimento').value = dataNasc;
    }

    // Endereço (preenche apenas se os campos existirem)
    if (usuario.Endereco) {
        const endereco = usuario.Endereco;
        document.querySelector('input[name=cep]').value = endereco.CEP || '';
        document.querySelector('input[name=logradouro]').value = endereco.Logradouro || '';
        document.querySelector('input[name=cidade]').value = endereco.Cidade || '';
        document.querySelector('input[name=bairro]').value = endereco.Bairro || '';
        document.querySelector('input[name=estado]').value = endereco.Estado || '';
        
        // Verifica existência dos campos antes de preencher
        const numeroInput = document.querySelector('input[placeholder="Número"]');
        if (numeroInput) numeroInput.value = endereco.Numero || '';
        
        const complementoInput = document.querySelector('input[placeholder="Complemento"]');
        if (complementoInput) complementoInput.value = endereco.Complemento || '';
    }
}

// FUNÇÃO PARA BUSCAR CEP
async function buscarCEP(event) {
    const cep = event.target.value.replace(/\D/g, "");
    console.log('[CEP] Buscando endereço para CEP:', cep);
    
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        console.log('[CEP] Resposta da API:', data);

        if (!data.erro) {
            document.querySelector('input[name=logradouro]').value = data.logradouro || '';
            document.querySelector('input[name=cidade]').value = data.localidade || '';
            document.querySelector('input[name=bairro]').value = data.bairro || '';
            document.querySelector('input[name=estado]').value = data.uf || '';
        } else {
            alert('CEP não encontrado');
        }
    } catch (error) {
        console.error('[CEP ERRO] Falha na busca:', error);
        alert('Erro ao buscar CEP. Verifique o console para detalhes.');
    }
}

// FUNÇÃO PARA ATUALIZAR DADOS
async function atualizarDadosUsuario(userId) {
    console.log('[DADOS] Iniciando atualização para usuário ID:', userId);
    
    // Coleta os dados do formulário com os nomes CORRETOS das colunas
    const dadosAtualizacao = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cpf: document.getElementById('cpf').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        endereco: {
            CEP: document.querySelector('input[name=cep]').value,
            Logradouro: document.querySelector('input[name=logradouro]').value,
            Cidade: document.querySelector('input[name=cidade]').value,
            Bairro: document.querySelector('input[name=bairro]').value,
            Estado: document.querySelector('input[name=estado]').value,
            Numero: document.querySelector('input[placeholder="Número"]').value,
            Complemento: document.querySelector('input[placeholder="Complemento"]').value
        }
    };

    console.log('[DADOS] Dados para atualização:', dadosAtualizacao);

    try {
        const response = await fetch(`/atualizarUsuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizacao)
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            alert('Dados atualizados com sucesso!');
            carregarDadosUsuario(userId); // Recarrega os dados
        } else {
            throw new Error(data.erro || "Erro ao atualizar dados");
        }
    } catch (error) {
        console.error('[DADOS ERRO] Falha na atualização:', error);
        alert('Erro ao atualizar: ' + error.message);
    }
}