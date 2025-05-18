from flask import Blueprint, request, jsonify, session, url_for
from werkzeug.security import check_password_hash
from app.utils.db import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def autenticar():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Usuario WHERE Email = %s", (email,))
        usuario = cursor.fetchone()

        if usuario and check_password_hash(usuario['Senha'], senha):
            session['user_id'] = usuario['ID_User']
            session['TipoUsuario'] = usuario['TipoUsuario']
            return jsonify({"sucesso": True, "mensagem": "Login realizado com sucesso!"})
        else:
            return jsonify({"sucesso": False, "mensagem": "Email ou senha incorretos."})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"sucesso": True, "mensagem": "Sessão encerrada com sucesso!"})