document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector(".menu_lateral");
    const toggleButton = document.getElementById("toggleSidebar");

    toggleButton.addEventListener("click", function (event) {
        sidebar.classList.toggle("ativo");
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
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
    const userId = document.getElementById('userId').value;
    console.log('[DADOS] ID do usuário logado:', userId);

    if (!userId || isNaN(userId)) {
        console.error('[DADOS ERRO] ID de usuário inválido ou não encontrado');
        window.location.href = '/';
        return;
    }

    // Configura o switch Freelancer/Cliente
    const tipoUsuarioSwitch = document.getElementById('tipoUsuarioSwitch');
    if (tipoUsuarioSwitch) {
        tipoUsuarioSwitch.addEventListener('change', function () {
            document.getElementById('tipoUsuarioLabel').textContent =
                this.checked ? 'Freelancer' : 'Cliente';
        });
    }

    // Carrega os dados do usuário
    carregarDadosUsuario(userId);

    // Configura o envio do formulário
    const form = document.getElementById('form-edicao');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            atualizarDadosUsuario(userId);
        });
    }

    // Configura busca de CEP
    const cepInput = document.getElementById("cep");
    if (cepInput) {
        cepInput.addEventListener('blur', buscarCEP);
    }

    // Botão cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function () {
            try {
                Swal.fire({
                    icon: 'error',
                    title: 'Cancelar Alterações',
                    text: "Você está sendo redirecionado para a Homepage...",
                    timer: 2000,
                    showConfirmButton: true
                }).then(() => {
                    window.location.href = "/homepage";
                });
            } catch {
                throw new Error(data.erro || "Erro");
            }
        });
    }
});

// FUNÇÃO PARA ATUALIZAR DADOS
async function atualizarDadosUsuario(userId) {
    console.log('[DADOS] Iniciando atualização para usuário ID:', userId);

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

    try {
        const response = await fetch(`/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizacao)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.erro || `Erro HTTP! status: ${response.status}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();
        if (data.sucesso) {
            // Após atualizar, recarrega tudo (inclusive endereço)
            await carregarDadosUsuario(userId);
            Swal.fire({
                icon: 'success',
                title: 'Atualização bem sucedida',
                text: "Redirecionando...",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/homepage";
            });
        } else {
            throw new Error(data.erro || "Erro ao atualizar dados");
        }
    } catch (error) {
        console.error('[DADOS ERRO] Falha na atualização:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: error.message || 'Erro ao atualizar dados.'
        });
    }
}

// FUNÇÃO PARA CARREGAR DADOS DO USUÁRIO
async function carregarDadosUsuario(userId) {
    console.log('[DADOS] Carregando dados do usuário ID:', userId);

    try {
        const response = await fetch(`/user/${userId}`, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.erro || `Erro HTTP! status: ${response.status}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.sucesso) {
            preencherFormulario(data.usuario);

            // Busca endereço atualizado se ID_Endereco existir
            if (data.usuario.ID_Endereco) {
                try {
                    const enderecoResp = await fetch(`/user/endereco/${data.usuario.ID_Endereco}`);
                    if (enderecoResp.ok) {
                        const enderecoData = await enderecoResp.json();
                        if (enderecoData.sucesso && enderecoData.endereco) {
                            preencherEnderecoFormulario(enderecoData.endereco);
                        }
                    }
                } catch (e) {
                    console.warn('[DADOS] Não foi possível buscar endereço detalhado:', e);
                }
            }
        } else {
            throw new Error(data.erro || "Erro ao carregar dados");
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao carregar dados: ' + error.message
        });
    }
}

// NOVA FUNÇÃO PARA PREENCHER CAMPOS DE ENDEREÇO
function preencherEnderecoFormulario(endereco) {
    setValue('cep', endereco.CEP, 'name');
    setValue('logradouro', endereco.Logradouro, 'name');
    setValue('cidade', endereco.Cidade, 'name');
    setValue('bairro', endereco.Bairro, 'name');
    setValue('estado', endereco.Estado, 'name');
    setValue('numero', endereco.Numero, 'name');
    setValue('complemento', endereco.Complemento, 'name');
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

// VALIDA CPF COM ALGORITMO OFICIAL
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

// VALIDA TELEFONE COM DDD (10 ou 11 dígitos, 9º dígito se celular)
function validarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    if (!(telefone.length === 10 || telefone.length === 11)) return false;

    const dddValido = /^[1-9][0-9]/.test(telefone.substring(0, 2));
    const celularValido = telefone.length === 11 ? telefone[2] === '9' : true;

    return dddValido && celularValido;
}

// FUNÇÃO DE VALIDAÇÃO MELHORADA
function validarDadosAtualizacao(dados, tentandoVirarFreelancer) {
    if (!dados.nome || !dados.email || !dados.cpf) {
        Swal.fire({
            icon: 'error',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail e CPF).'
        });
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
        Swal.fire({
            icon: 'error',
            title: 'E-mail inválido!',
            text: 'Por favor, insira um e-mail válido.'
        });
        return false;
    }

    if (dados.telefone && !validarTelefone(dados.telefone)) {
        Swal.fire({
            icon: 'error',
            title: 'Telefone inválido!',
            text: 'Insira um telefone válido com DDD. Celulares devem conter 11 dígitos (incluindo 9).'
        });
        return false;
    }

    if (!validarCPF(dados.cpf)) {
        Swal.fire({
            icon: 'error',
            title: 'CPF inválido!',
            text: 'Por favor, insira um CPF válido.'
        });
        return false;
    }

    if (tentandoVirarFreelancer) {
        const endereco = dados.endereco;
        if (!endereco.CEP || !endereco.Logradouro || !endereco.Cidade ||
            !endereco.Bairro || !endereco.Estado || !endereco.Numero) {
            Swal.fire({
                icon: 'error',
                title: 'Endereço incompleto!',
                text: 'Para se tornar Freelancer, o endereço deve estar completo (CEP, Logradouro, Número, Bairro, Cidade e Estado).'
            });
            return false;
        }

        if (endereco.CEP.replace(/\D/g, '').length !== 8) {
            Swal.fire({
                icon: 'error',
                title: 'CEP inválido!',
                text: 'CEP deve conter exatamente 8 dígitos.'
            });
            return false;
        }
    }

    return true;
}

function mostrarErroInput(input, mensagem) {
    input.classList.add('erro');
    Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: mensagem
    });
}

// Função para limpar os erros
function limparErros() {
    const campos = document.querySelectorAll('input');
    campos.forEach(input => {
        input.classList.remove('erro');
    });
}

async function obterDadosUsuario(userId) {
    try {
        const response = await fetch(`/user/${userId}`);
        const data = await response.json();
        if (data.sucesso) {
            console.log("Dados do usuário:", data.usuario);
            return data.usuario;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: data.erro
            });
        }
    } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Erro ao obter dados do usuário.'
        });
    }
}

function showPopUpDeletar() {
    document.getElementById('pop-up-deletar').style.display = 'block';
    // document.getElementById("")
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
            timer: 5000,
            showConfirmButton: false
        }).then(() => {
            logout(); // Chama a função de logout
        });
    }, 10 * 60 * 1000); // 10 minutos
}

// Adiciona eventos para monitorar a atividade do usuário
document.addEventListener('mousemove', resetarInatividade);
document.addEventListener('keydown', resetarInatividade);
document.addEventListener('click', resetarInatividade);

// Inicializa o timer ao carregar a página
resetarInatividade();
