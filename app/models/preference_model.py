from app.utils.db import get_db_connection

def salvar_preferencias(user_id, preferencias):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        mostrar_telefone = bool(preferencias.get('mostrarTelefone', True))
        mostrar_email = bool(preferencias.get('mostrarEmail', True))

        cursor.execute("""
            INSERT INTO preferenciacontato (fk_Usuario_ID_User, MostrarTelefone, MostrarEmail)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                MostrarTelefone = VALUES(MostrarTelefone),
                MostrarEmail = VALUES(MostrarEmail)
        """, (user_id, mostrar_telefone, mostrar_email))
        conn.commit()
    except Exception as e:
        print(f"Erro ao salvar preferências: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def obter_preferencias_por_usuario(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT MostrarTelefone, MostrarEmail FROM preferenciacontato WHERE fk_Usuario_ID_User = %s
        """, (user_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()