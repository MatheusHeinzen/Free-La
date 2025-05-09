from flask import Blueprint, jsonify, request
from app.utils.db import get_db_connection

skill_bp = Blueprint('skill', __name__)

@skill_bp.route('/', methods=['GET'])
def obter_habilidades():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Habilidades")
        habilidades = cursor.fetchall()
        return jsonify({"sucesso": True, "habilidades": habilidades})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()