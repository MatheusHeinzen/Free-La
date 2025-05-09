from app.utils.db import get_db_connection

def criar_usuario(nome, email, cpf, senha, data_nascimento):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Usuario (Nome, Email, CPF, Senha, DataNascimento) 
            VALUES (%s, %s, %s, %s, %s);
        """, (nome, email, cpf, senha, data_nascimento))
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()

def obter_usuario_por_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.*, e.* 
            FROM Usuario u
            LEFT JOIN Endereco e ON u.ID_Endereco = e.ID_Endereco
            WHERE u.ID_User = %s
        """, (user_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()