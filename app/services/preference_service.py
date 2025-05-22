from app.models.preference_model import obter_preferencias_por_usuario, salvar_preferencias

def buscar_preferencias(user_id):
    preferencias = obter_preferencias_por_usuario(user_id)
    # Corrige: sempre retorna dicionário simples, não um tuple (dict, status)
    return preferencias

def atualizar_preferencias(user_id, preferencias):
    try:
        salvar_preferencias(user_id, preferencias)
        return True
    except Exception as e:
        print(f"Erro no serviço de preferências: {e}")
        return False