from werkzeug.security import generate_password_hash
from app.models.user_model import criar_usuario, obter_usuario_por_id
from app.utils.validators import validar_campos_obrigatorios, validar_formato_data

def registrar_usuario(data):
    campos_obrigatorios = ['nome', 'email', 'cpf', 'senha', 'dataNascimento']
    if not validar_campos_obrigatorios(data, campos_obrigatorios):
        return {"sucesso": False, "erro": "dados obrigatórios faltando"}, 400

    if not validar_formato_data(data['dataNascimento']):
        return {"sucesso": False, "erro": "formato de data inválido. use YYYY-MM-DD"}, 400

    usuario = criar_usuario(data)
    return {"sucesso": True, "usuario": usuario}, 201

def buscar_usuario(user_id):
    usuario = obter_usuario_por_id(user_id)
    if not usuario:
        return {"sucesso": False, "erro": "usuário não encontrado"}, 404
    usuario.pop('Senha', None)
    return {"sucesso": True, "usuario": usuario}, 200