document.addEventListener('DOMContentLoaded', function() {
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

    // Configura o switch Freelancer/Cliente
    const tipoUsuarioSwitch = document.getElementById('tipoUsuarioSwitch');
    if (tipoUsuarioSwitch) {
        tipoUsuarioSwitch.addEventListener('change', function() {
            document.getElementById('tipoUsuarioLabel').textContent = 
                this.checked ? 'Freelancer' : 'Cliente';
        });
    }

    // Carrega os dados do usuário
    carregarDadosUsuario(userId);

    // Configura o envio do formulário
    const form = document.getElementById('form-edicao');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            atualizarDadosUsuario(userId);
        });
    }

    // Configura busca de CEP
    const cepInput = document.getElementById("cep");
    if (cepInput) {
        cepInput.addEventListener('blur', buscarCEP);
    }

    // Botão cancelar - MODIFICADO para redirecionar para homepage
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja descartar as alterações?')) {
                window.location.href = '/homepage'; // Redireciona para homepage
            }
        });
    }
});

// FUNÇÃO PARA ATUALIZAR DADOS - MODIFICADA para redirecionar após salvar
async function atualizarDadosUsuario(userId) {
    console.log('[DADOS] Iniciando atualização para usuário ID:', userId);
    
    // Coleta os dados do formulário
    const dadosAtualizacao = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cpf: document.getElementById('cpf').value,
        tipoUsuario: document.getElementById('tipoUsuarioSwitch').checked ? 'freelancer' : 'cliente',
        endereco: {
            CEP: document.querySelector('input[name="cep"]').value,
            Logradouro: document.querySelector('input[name="logradouro"]').value,
            Cidade: document.querySelector('input[name="cidade"]').value,
            Bairro: document.querySelector('input[name="bairro"]').value,
            Estado: document.querySelector('input[name="estado"]').value,
            Numero: document.querySelector('input[name="numero"]').value,
            Complemento: document.querySelector('input[name="complemento"]').value
        }
    };

    // Valida se está tentando virar freelancer
    const tentandoVirarFreelancer = document.getElementById('tipoUsuarioSwitch').checked;
    
    // Validações
    if (!validarDadosAtualizacao(dadosAtualizacao, tentandoVirarFreelancer)) {
        return;
    }

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
            // MODIFICADO: Redireciona para homepage após salvar
            window.location.href = '/homepage';
        } else {
            throw new Error(data.erro || "Erro ao atualizar dados");
        }
    } catch (error) {
        console.error('[DADOS ERRO] Falha na atualização:', error);
        alert('Erro ao atualizar dados: ' + error.message);
    }
}

// FUNÇÃO PARA CARREGAR DADOS DO USUÁRIO
async function carregarDadosUsuario(userId) {
    console.log('[DADOS] Carregando dados do usuário ID:', userId);
    
    try {
        const response = await fetch(`/usuario/${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.erro || `Erro HTTP! status: ${response.status}`;
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        if (data.sucesso) {
            console.log('[DADOS] Dados recebidos:', data.usuario);
            preencherFormulario(data.usuario);
        } else {
            throw new Error(data.erro || "Erro ao carregar dados");
        }
    } catch (error) {
        console.error('[DADOS ERRO] Falha ao carregar dados:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        console.error('Detalhes do erro:', error);
    }
}

// FUNÇÃO PARA PREENCHER FORMULÁRIO
function preencherFormulario(usuario) {
    console.log('[DADOS] Preenchendo formulário com dados do usuário');
    
    // Dados básicos
    setValue('nome', usuario.Nome);
    setValue('email', usuario.Email);
    setValue('telefone', usuario.Telefone);
    setValue('cpf', usuario.CPF);

    // Switch Freelancer/Cliente
    const tipoUsuarioSwitch = document.getElementById('tipoUsuarioSwitch');
    if (tipoUsuarioSwitch) {
        const isFreelancer = usuario.TipoUsuario === 'freelancer';
        tipoUsuarioSwitch.checked = isFreelancer;
        document.getElementById('tipoUsuarioLabel').textContent = 
            isFreelancer ? 'Freelancer' : 'Cliente';
    }

    // Endereço
    if (usuario.Endereco) {
        const endereco = usuario.Endereco;
        setValue('cep', endereco.CEP, 'name');
        setValue('logradouro', endereco.Logradouro, 'name');
        setValue('cidade', endereco.Cidade, 'name');
        setValue('bairro', endereco.Bairro, 'name');
        setValue('estado', endereco.Estado, 'name');
        setValue('numero', endereco.Numero, 'name');
        setValue('complemento', endereco.Complemento, 'name');
    }
}

// FUNÇÃO AUXILIAR PARA PREENCHER CAMPOS
function setValue(elementId, value, attribute = 'id') {
    const element = attribute === 'id' 
        ? document.getElementById(elementId)
        : document.querySelector(`input[${attribute}="${elementId}"]`);
    
    if (element) {
        element.value = value || '';
    } else {
        console.warn(`[DADOS] Elemento não encontrado: ${attribute}="${elementId}"`);
    }
}

// FUNÇÃO PARA BUSCAR CEP
async function buscarCEP(event) {
    const cepInput = event.target;
    const cep = cepInput.value.replace(/\D/g, "");
    const cepError = document.getElementById('cep-error');
    
    console.log('[CEP] Buscando endereço para CEP:', cep);
    
    if (cep.length !== 8) {
        cepError.style.display = 'block';
        cepError.textContent = 'CEP inválido! Deve conter 8 dígitos.';
        return;
    }

    try {
        cepError.style.display = 'none';
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        console.log('[CEP] Resposta da API:', data);

        if (data.erro) {
            cepError.style.display = 'block';
            cepError.textContent = 'CEP não encontrado';
        } else {
            setValue('logradouro', data.logradouro, 'name');
            setValue('cidade', data.localidade, 'name');
            setValue('bairro', data.bairro, 'name');
            setValue('estado', data.uf, 'name');
        }
    } catch (error) {
        console.error('[CEP ERRO] Falha na busca:', error);
        cepError.style.display = 'block';
        cepError.textContent = 'Erro ao buscar CEP. Tente novamente.';
    }
}

// FUNÇÃO DE VALIDAÇÃO MELHORADA
function validarDadosAtualizacao(dados, tentandoVirarFreelancer) {
    // Campos obrigatórios para todos
    if (!dados.nome || !dados.email || !dados.telefone) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Telefone).');
        return false;
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
        alert('Por favor, insira um e-mail válido.');
        return false;
    }

    // Validação de telefone
    const telefoneLimpo = dados.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        alert('Por favor, insira um telefone válido com DDD (10 ou 11 dígitos).');
        return false;
    }

    // Se está tentando virar freelancer, valida campos adicionais
    if (tentandoVirarFreelancer) {
        // Valida CPF
        if (!dados.cpf || dados.cpf.replace(/\D/g, '').length !== 11) {
            alert('Para se tornar Freelancer, informe um CPF válido (11 dígitos).');
            return false;
        }

        // Valida endereço completo
        const endereco = dados.endereco;
        if (!endereco.CEP || !endereco.Logradouro || !endereco.Cidade || 
            !endereco.Bairro || !endereco.Estado || !endereco.Numero) {
            alert('Para se tornar Freelancer, seu endereço deve estar completo (CEP, Logradouro, Número, Bairro, Cidade e Estado).');
            return false;
        }

        // Valida CEP
        if (endereco.CEP.replace(/\D/g, '').length !== 8) {
            document.getElementById('cep-error').style.display = 'block';
            document.getElementById('cep-error').textContent = 'CEP inválido! Deve conter 8 dígitos.';
            return false;
        }
    }

    return true;
}
