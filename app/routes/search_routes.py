from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection

search = Blueprint('search', __name__)

@search.route('/category', methods=['GET'])
def obter_categorias():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT NomeCategoria FROM categoria WHERE Ativa = TRUE")
        categorias = cursor.fetchall()

        return jsonify({"sucesso": True, "categorias": categorias}), 200
    except Exception as e:
        print(f"Erro ao obter categorias: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao obter categorias"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@search.route('/buscarFreelancers', methods=['GET'])
def buscar_freelancers():
    termo = request.args.get('termo', '').strip()
    categoria = request.args.get('categoria', '').strip()

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT DISTINCT u.ID_User, u.Nome, p.Bio
            FROM usuario u
            JOIN perfil p ON u.ID_User = p.ID_Usuario
            LEFT JOIN perfil_categoria pc ON p.IdPerfil = pc.ID_Perfil
            LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE u.TipoUsuario = 'freelancer' AND u.Ativo = TRUE
        """
        params = []

        if termo:
            query += " AND (u.Nome LIKE %s OR p.Bio LIKE %s)"
            params.extend([f"%{termo}%", f"%{termo}%"])

        if categoria:
            query += " AND c.NomeCategoria = %s"
            params.append(categoria)

        cursor.execute(query, params)
        freelancers = cursor.fetchall()

        return jsonify({"sucesso": True, "freelancers": freelancers}), 200
    except Exception as e:
        print(f"Erro ao buscar freelancers: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao buscar freelancers"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
