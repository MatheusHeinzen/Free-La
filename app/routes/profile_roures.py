from flask import Blueprint, request, redirect, url_for, jsonify
import mysql.connector
import io
from app.utils.db import get_db_connection

profile = Blueprint('profile', __name__)

# Atualizar apenas a imagem de perfil
@profile.route('/upload', methods=['POST'])
def upload_imagem():
    imagem = request.files.get('image')
    user_id = request.form.get('user_id')  

    if not user_id:
        return "ID de usuário ausente", 400

    if imagem:
        blob = imagem.read()

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE perfil SET Foto = %s WHERE ID_Usuario = %s", (blob, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return "Imagem enviada com sucesso!"

    return "Nenhuma imagem enviada", 400

# Atualizar bio e categoria
@profile.route('/editar_perfil', methods=['POST'])
def editar_perfil():
    categoria = request.form.get('categoria')
    descricao = request.form.get('descricao')
    user_id = request.form.get('user_id')

    if not user_id:
        return "ID de usuário ausente", 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE perfil 
        SET Username = %s, Bio = %s 
        WHERE ID_Usuario = %s
    """, (categoria, descricao, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Perfil atualizado com sucesso!"})
