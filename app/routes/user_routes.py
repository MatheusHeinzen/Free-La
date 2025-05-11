from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash
from app.utils.db import get_db_connection

user_bp = Blueprint('user', __name__)

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