from werkzeug.security import check_password_hash
from app.utils.db import get_db_connection

def autenticar_usuario(email, senha):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Usuario WHERE Email = %s", (email,))
        usuario = cursor.fetchone()

        if usuario and check_password_hash(usuario['Senha'], senha):
            return {"sucesso": True, "usuario": usuario}
        return {"sucesso": False, "mensagem": "Email ou senha incorretos"}
    finally:
        cursor.close()
        conn.close()