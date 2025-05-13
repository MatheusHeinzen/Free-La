from flask import Blueprint, jsonify, request
from app.utils.db import get_db_connection

category_bp = Blueprint('category', __name__)

@category_bp.route('/', methods=['GET'])
def obter_categorias():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Categoria")
        categorias = cursor.fetchall()

        return jsonify({"sucesso": True, "categorias": categorias})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()