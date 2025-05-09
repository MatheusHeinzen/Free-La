from flask import session
from app.utils.db import get_db_connection

def obter_nome_usuario():
    if 'user_id' in session:
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT Nome FROM Usuario WHERE ID_User = %s", (session['user_id'],))
            usuario = cursor.fetchone()
            if usuario:
                return usuario['Nome']
        finally:
            if 'conn' in locals() and conn.is_connected():
                cursor.close()
                conn.close()
    return ''