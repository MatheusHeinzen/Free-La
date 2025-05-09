from app.models.preference_model import obter_preferencias_por_usuario, salvar_preferencias

def buscar_preferencias(user_id):
    preferencias = obter_preferencias_por_usuario(user_id)
    return {"sucesso": True, "preferencias": preferencias}, 200

def atualizar_preferencias(user_id, preferencias):
    salvar_preferencias(user_id, preferencias)
    return {"sucesso": True, "mensagem": "Preferências atualizadas com sucesso"}, 200