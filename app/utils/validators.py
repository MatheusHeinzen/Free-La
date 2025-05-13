from datetime import datetime

def validar_campos_obrigatorios(data, campos_obrigatorios):
    return all(data.get(campo) for campo in campos_obrigatorios)

def validar_formato_data(data, formato='%Y-%m-%d'):
    try:
        datetime.strptime(data, formato)
        return True
    except ValueError:
        return False