from app.utils.db import get_db_connection

def obter_preferencias_por_usuario(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT * FROM Preferencias WHERE ID_Usuario = %s
        """, (user_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

def salvar_preferencias(user_id, preferencias):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Preferencias WHERE ID_Usuario = %s", (user_id,))
        for preferencia in preferencias:
            cursor.execute("""
                INSERT INTO Preferencias (ID_Usuario, Preferencia) 
                VALUES (%s, %s)
            """, (user_id, preferencia))
        conn.commit()
    finally:
        cursor.close()
        conn.close()