from flask import Blueprint, request, jsonify, session, url_for
from werkzeug.security import check_password_hash
from app.utils.db import get_db_connection
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = "senhaSegura!1234"

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        # O token pode vir no header Authorization: Bearer <token>
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'sucesso': False, 'mensagem': 'Token JWT ausente.'}), 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            # Você pode acessar payload['user_id'] e payload['tipo_usuario'] se necessário
        except jwt.ExpiredSignatureError:
            return jsonify({'sucesso': False, 'mensagem': 'Token expirado.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'sucesso': False, 'mensagem': 'Token inválido.'}), 401
        return f(*args, **kwargs)
    return decorated_function



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
            # Geração do JWT
            token = jwt.encode({
                'user_id': usuario['ID_User'],
                'tipo_usuario': usuario['TipoUsuario'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }, SECRET_KEY, algorithm='HS256')
            return jsonify({
                "sucesso": True,
                "mensagem": "Login realizado com sucesso!",
                "token": token
            })
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

@auth_bp.route('/usuario-info', methods=['GET'])
@jwt_required
def usuario_info():
    return jsonify({"mensagem": "Acesso autorizado com JWT!"})