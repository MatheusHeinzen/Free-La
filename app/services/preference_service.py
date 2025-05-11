from app.models.preference_model import obter_preferencias_por_usuario, salvar_preferencias

def buscar_preferencias(user_id):
    preferencias = obter_preferencias_por_usuario(user_id)
    return {"sucesso": True, "preferencias": preferencias}, 200

def atualizar_preferencias(user_id, preferencias):
    try:
        # Pass the dictionary directly to the model function
        salvar_preferencias(user_id, preferencias)
        return {'message': 'Preferências atualizadas com sucesso'}, 200
    except Exception as e:
        print(f"Erro no serviço de preferências: {e}")
        return {'error': 'Erro ao atualizar preferências'}, 500