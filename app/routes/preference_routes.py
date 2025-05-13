from flask import Blueprint, request, jsonify, session
from app.services.preference_service import buscar_preferencias, atualizar_preferencias

preference_bp = Blueprint('preference', __name__)

@preference_bp.route('/', methods=['GET'])
def obter_preferencias():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Usuário não autenticado'}), 401

    preferencias = buscar_preferencias(user_id)
    if preferencias:
        return jsonify({'sucesso': True, 'preferencias': preferencias}), 200
    else:
        return jsonify({'sucesso': False, 'mensagem': 'Preferências não encontradas'}), 404

@preference_bp.route('/', methods=['PUT'])
def salvar_preferencias():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Usuário não autenticado'}), 401

        data = request.get_json()
        preferencias = data.get('preferencias', {})
        
        # Validar se 'preferencias' é um dicionário
        if not isinstance(preferencias, dict):
            return jsonify({'error': 'Formato inválido para preferencias'}), 400
        
        # Validar as chaves esperadas
        if 'mostrarTelefone' not in preferencias or 'mostrarEmail' not in preferencias:
            return jsonify({'error': 'Chaves ausentes em preferencias'}), 400

        atualizar_preferencias(user_id, preferencias)
        preferencias_atualizadas = buscar_preferencias(user_id)
        return jsonify({'sucesso': True, 'preferencias': preferencias_atualizadas}), 200
    except Exception as e:
        print(f"Erro ao salvar preferências: {e}")
        return jsonify({'error': 'Erro interno no servidor'}), 500