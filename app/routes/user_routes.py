from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.db import get_db_connection
from app.utils.decorators import login_required
from flask_cors import CORS

user_bp = Blueprint('user', __name__)
CORS(user_bp, supports_credentials=True)

# Decorador para verificar autenticação 
def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            # Se for uma requisição API, retorne JSON
            if request.is_json:
                return jsonify({"sucesso": False, "mensagem": "Não autenticado"}), 401
            # Caso contrário, redirecione para homepage
            return redirect(url_for('homepage.exibir_homepage'))
        return func(*args, **kwargs)
    return decorated_function

# Rota de exemplo que usa a sessão 
@user_bp.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('user.obter_usuario', user_id=session['user_id']))
    return "Bem-vindo! Faça login para continuar."



@user_bp.route('/register', methods=['POST'])
def cadastrar():
    data = request.get_json()
    campos_obrigatorios = ['nome', 'email', 'cpf', 'senha', 'dataNascimento']
    if not all(data.get(campo) for campo in campos_obrigatorios):
        return jsonify({"sucesso": False, "erro": "dados obrigatórios faltando"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Usuario (Nome, Email, CPF, Senha, DataNascimento) 
            VALUES (%s, %s, %s, %s, %s);
        """, (
            data['nome'],
            data['email'],
            data['cpf'],
            generate_password_hash(data['senha']),
            data['dataNascimento']
        ))
        conn.commit()
        return jsonify({"sucesso": True, "id": cursor.lastrowid})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@user_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def obter_usuario(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT u.*, e.* 
            FROM Usuario u
            LEFT JOIN Endereco e ON u.ID_Endereco = e.ID_Endereco
            WHERE u.ID_User = %s
        """, (user_id,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"sucesso": False, "erro": "usuário não encontrado"}), 404

        usuario.pop('Senha', None)
        return jsonify({"sucesso": True, "usuario": usuario})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@user_bp.route('/', methods=['GET'])
@login_required
def obter_usuario_atual():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Usuário não autenticado'}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()

        if usuario:
            return jsonify({'sucesso': True, 'usuario': usuario})
        else:
            return jsonify({'sucesso': False, 'mensagem': 'Usuário não encontrado'}), 404
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@user_bp.route('/<int:user_id>', methods=['PUT'])
@login_required
def atualizar_usuario(user_id):
    conn = None
    cursor = None
    try:
        dados = request.get_json()
        if not isinstance(dados, dict):
            return jsonify({"sucesso": False, "erro": "Dados inválidos"}), 400

        nome = dados.get('nome')
        email = dados.get('email')
        telefone = dados.get('telefone', None)
        cpf = dados.get('cpf')
        tipo_usuario = dados.get('tipoUsuario')
        endereco = dados.get('endereco', {})

        conn = get_db_connection()
        cursor = conn.cursor()

        # Atualizar dados básicos do usuário
        cursor.execute("""
            UPDATE usuario
            SET Nome = %s, Email = %s, Telefone = %s, CPF = %s, TipoUsuario = %s
            WHERE ID_User = %s
        """, (nome, email, telefone, cpf, tipo_usuario, user_id))

        # Busca se já existe um endereço igual (CEP + Logradouro + Numero)
        cursor.execute("""
            SELECT ID_Endereco FROM endereco
            WHERE CEP = %s AND Logradouro = %s AND Numero = %s
            LIMIT 1
        """, (
            endereco.get('CEP'),
            endereco.get('Logradouro'),
            endereco.get('Numero')
        ))
        endereco_existente = cursor.fetchone()

        if endereco_existente:
            id_endereco = endereco_existente[0]
            # Atualiza o endereço existente (caso queira atualizar dados de complemento, bairro, etc)
            cursor.execute("""
                UPDATE endereco SET
                    Cidade = %s,
                    Bairro = %s,
                    Estado = %s,
                    Complemento = %s
                WHERE ID_Endereco = %s
            """, (
                endereco.get('Cidade'),
                endereco.get('Bairro'),
                endereco.get('Estado'),
                endereco.get('Complemento'),
                id_endereco
            ))
        else:
            # Cria novo endereço
            cursor.execute("""
                INSERT INTO endereco (CEP, Logradouro, Cidade, Bairro, Estado, Numero, Complemento)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                endereco.get('CEP'),
                endereco.get('Logradouro'),
                endereco.get('Cidade'),
                endereco.get('Bairro'),
                endereco.get('Estado'),
                endereco.get('Numero'),
                endereco.get('Complemento')
            ))
            id_endereco = cursor.lastrowid

        # Associa o endereço ao usuário (agora pode ser compartilhado)
        cursor.execute("""
            UPDATE usuario
            SET ID_Endereco = %s
            WHERE ID_User = %s
        """, (id_endereco, user_id))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Dados atualizados com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao atualizar usuário: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao atualizar dados do usuário"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@user_bp.route('/deletarUsuario', methods=['DELETE'])
@login_required 
def deletar_usuario():
    if 'user_id' not in session:
        return jsonify({"sucesso": False, "erro": "Não autorizado"}), 401
    
    user_id = session['user_id']

    if not user_id:
        return jsonify({
            "sucesso": False,
            "erro": "Usuário não está logado."
        }), 401
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verifica se o usuário existe
        cursor.execute("SELECT * FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({
                "sucesso": False,
                "erro": "Usuário não encontrado."
            }), 404
        
        # Deleta o Usuario logado
        cursor.execute("DELETE FROM Usuario WHERE ID_User = %s", (user_id,))
        conn.commit()

        session.clear()

        return jsonify({
            "sucesso": True,
            "mensagem": "Conta deletada com sucesso."
        }), 200

    except Exception as err:
        return jsonify({
            "sucesso": False,
            "erro": f"Erro no banco de dados: {str(err)}"
        }), 500

    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@user_bp.route('/endereco/<int:endereco_id>', methods=['GET'])
@login_required
def obter_endereco(endereco_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Endereco WHERE ID_Endereco = %s", (endereco_id,))
        endereco = cursor.fetchone()
        if endereco:
            return jsonify({'sucesso': True, 'endereco': endereco})
        else:
            return jsonify({'sucesso': False, 'erro': 'Endereço não encontrado'}), 404
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@user_bp.route('/alterarSenha', methods=['GET', 'POST'])
@login_required
def alterar_senha():
    if request.method == 'GET':
        return render_template('alterarSenha.html')
    # POST
    data = request.get_json()
    senha_atual = data.get('senha_atual')
    nova_senha = data.get('nova_senha')
    user_id = session.get('user_id')

    if not senha_atual or not nova_senha:
        return jsonify({'sucesso': False, 'erro': 'Preencha todos os campos.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT Senha FROM usuario WHERE ID_User = %s", (user_id,))
        user = cursor.fetchone()
        if not user or not check_password_hash(user['Senha'], senha_atual):
            return jsonify({'sucesso': False, 'erro': 'Senha atual incorreta.'}), 400

        nova_hash = generate_password_hash(nova_senha)
        cursor.execute("UPDATE usuario SET Senha = %s WHERE ID_User = %s", (nova_hash, user_id))
        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Senha alterada com sucesso!'})
    except Exception as e:
        print(f"[ERRO alterar_senha] {e}")
        return jsonify({'sucesso': False, 'erro': 'Erro ao alterar senha.'}), 500
    finally:
        cursor.close()
        conn.close()