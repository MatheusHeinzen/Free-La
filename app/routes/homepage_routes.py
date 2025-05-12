from flask import Blueprint, render_template
from app.utils.db import get_db_connection

homepage = Blueprint('homepage', __name__)

@homepage.route('/homepage', methods=['GET'])
def exibir_homepage():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Consulta para obter os perfis ativos
        cursor.execute("""
            SELECT u.ID_User, u.Nome, p.Bio, c.NomeCategoria
            FROM usuario u
            LEFT JOIN perfil p ON u.ID_User = p.ID_Usuario
            LEFT JOIN perfil_categoria pc ON p.IdPerfil = pc.ID_Perfil
            LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE u.Ativo = TRUE
        """)
        perfis = cursor.fetchall()

        return render_template('homepage.html', perfis=perfis)
    except Exception as e:
        print(f"Erro ao exibir homepage: {e}")
        return render_template('500.html'), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
