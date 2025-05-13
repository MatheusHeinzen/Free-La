from app.utils.db import get_db_connection

def obter_todas_categorias():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Categoria")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()