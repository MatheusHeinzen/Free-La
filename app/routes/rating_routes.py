from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.utils.decorators import login_required

rating = Blueprint('rating', __name__)

@rating.route('/avaliarServico/<int:service_id>', methods=['POST'])
@login_required
def avaliar_servico(service_id):
    nota = request.form.get('nota', type=int)
    comentario = request.form.get('comentario', '').strip()

    if not (1 <= nota <= 5):
        return "Nota inválida. Deve ser entre 1 e 5.", 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO avaliacao (ID_Service, Nota, Comentario)
            VALUES (%s, %s, %s)
        """, (service_id, nota, comentario))
        conn.commit()

        return "Avaliação enviada com sucesso!", 200
    except Exception as e:
        print(f"Erro ao avaliar serviço: {e}")
        return "Erro ao avaliar serviço.", 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
