from flask import Blueprint, request, jsonify, session, redirect, url_for
from functools import wraps
from werkzeug.security import generate_password_hash
from app.utils.db import get_db_connection

user_bp = Blueprint('user', __name__)

# Decorador para verificar autenticação 
def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            # Se for uma requisição API, retorne JSON
            if request.is_json:
                return jsonify({"sucesso": False, "mensagem": "Não autenticado"}), 401
            # Caso contrário, redirecione para login
            return redirect(url_for('/login'))  # Ajuste a rota conforme necessário
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

        # Atualizar ou criar endereço
        cursor.execute("""
            INSERT INTO endereco (CEP, Logradouro, Cidade, Bairro, Estado, Numero, Complemento)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                Logradouro = VALUES(Logradouro),
                Cidade = VALUES(Cidade),
                Bairro = VALUES(Bairro),
                Estado = VALUES(Estado),
                Numero = VALUES(Numero),
                Complemento = VALUES(Complemento)
        """, (endereco.get('CEP'), endereco.get('Logradouro'), endereco.get('Cidade'),
              endereco.get('Bairro'), endereco.get('Estado'), endereco.get('Numero'),
              endereco.get('Complemento')))

        # Associar o endereço ao usuário
        cursor.execute("""
            UPDATE usuario
            SET ID_Endereco = (SELECT ID_Endereco FROM endereco WHERE CEP = %s AND Logradouro = %s)
            WHERE ID_User = %s
        """, (endereco.get('CEP'), endereco.get('Logradouro'), user_id))

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