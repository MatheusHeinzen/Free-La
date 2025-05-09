from flask import Blueprint, request, jsonify
from app.services.preference_service import buscar_preferencias, atualizar_preferencias

preference_bp = Blueprint('preference', __name__)

@preference_bp.route('/<int:user_id>', methods=['GET'])
def obter_preferencias(user_id):
    response, status = buscar_preferencias(user_id)
    return jsonify(response), status

@preference_bp.route('/<int:user_id>', methods=['PUT'])
def salvar_preferencias(user_id):
    data = request.get_json()
    response, status = atualizar_preferencias(user_id, data.get('preferencias', []))
    return jsonify(response), status