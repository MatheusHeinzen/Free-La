# Centraliza funções de sessão e expiração

from flask import session, redirect, url_for, jsonify, request
from functools import wraps

def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            if request.is_json:
                return jsonify({"sucesso": False, "mensagem": "Não autenticado"}), 401
            return redirect(url_for('/homepage'))
        return func(*args, **kwargs)
    return decorated_function

def expirar_sessao():
    session.clear()
    return redirect(url_for('auth.login'))
