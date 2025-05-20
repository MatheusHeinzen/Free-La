from flask import Blueprint, request, jsonify, session
from app.services.preference_service import buscar_preferencias, atualizar_preferencias
from app.utils.decorators import login_required

preference_bp = Blueprint('preference', __name__)

@preference_bp.route('/preference/<int:user_id>', methods=['GET', 'PUT'])
@login_required
def preference(user_id):
    if request.method == 'GET':
        if not user_id:
            return jsonify({'error': 'Usuário não autenticado'}), 401

        preferencias = buscar_preferencias(user_id)
        # Garante sempre um dicionário simples
        if not preferencias:
            preferencias = {'mostrarTelefone': True, 'mostrarEmail': True}
        return jsonify({'sucesso': True, 'preferencias': preferencias}), 200

    if request.method == 'PUT':
        try:
            if not user_id:
                return jsonify({'error': 'Usuário não autenticado'}), 401

            data = request.get_json()
            preferencias = data.get('preferencias', {})
            if not isinstance(preferencias, dict):
                return jsonify({'error': 'Formato inválido para preferencias'}), 400
            if 'mostrarTelefone' not in preferencias or 'mostrarEmail' not in preferencias:
                return jsonify({'error': 'Chaves ausentes em preferencias'}), 400

            ok = atualizar_preferencias(user_id, preferencias)
            preferencias_atualizadas = buscar_preferencias(user_id)
            if ok:
                return jsonify({'sucesso': True, 'preferencias': preferencias_atualizadas}), 200
            else:
                return jsonify({'sucesso': False, 'erro': 'Erro ao atualizar preferências'}), 500
        except Exception as e:
            print(f"Erro ao salvar preferências: {e}")
            return jsonify({'error': 'Erro interno no servidor'}), 500