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

@profile.route('/freelancers', methods=['GET'])
def listar_freelancers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.ID_User, u.Nome, u.Email, u.Telefone, p.Username, p.Bio, p.Foto
            FROM usuario u
            INNER JOIN perfil p ON u.ID_User = p.ID_Usuario
            WHERE u.TipoUsuario = 'freelancer' AND u.Ativo = TRUE
        """)
        freelancers = cursor.fetchall()
        return jsonify({"sucesso": True, "freelancers": freelancers}), 200
    except Exception as e:
        print(f"Erro ao listar freelancers: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao listar freelancers"}), 500
    finally:
        cursor.close()
        conn.close()

@profile.route('/perfil/<int:user_id>', methods=['GET'])
def perfil_publico(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.Nome, u.Email, u.Telefone, p.Username, p.Bio, p.Foto
            FROM usuario u
            INNER JOIN perfil p ON u.ID_User = p.ID_Usuario
            WHERE u.ID_User = %s AND u.TipoUsuario = 'freelancer' AND u.Ativo = TRUE
        """, (user_id,))
        perfil = cursor.fetchone()
        if not perfil:
            return "Perfil não encontrado", 404
        return jsonify({"sucesso": True, "perfil": perfil}), 200
    except Exception as e:
        print(f"Erro ao carregar perfil público: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao carregar perfil público"}), 500
    finally:
        cursor.close()
        conn.close()

@profile.route('/user/<int:user_id>', methods=['PUT'])
def atualizar_usuario(user_id):
    try:
        dados = request.get_json()
        nome = dados.get('nome')
        email = dados.get('email')
        telefone = dados.get('telefone')
        cpf = dados.get('cpf')
        tipo_usuario = dados.get('tipoUsuario')
        endereco = dados.get('endereco', {})

        conn = get_db_connection()
        cursor = conn.cursor()

        # Atualizar dados básicos do usuário
        cursor.execute("""
            UPDATE usuario
            SET Nome = %s, Email = %s, Telefone = %s, CPF = %s, TipoUsuario = %s
            WHERE ID_User = %s
        """, (nome, email, telefone, cpf, tipo_usuario, user_id))

        # Atualizar endereço
        cursor.execute("""
            UPDATE endereco
            SET CEP = %s, Logradouro = %s, Cidade = %s, Bairro = %s, Estado = %s, Numero = %s, Complemento = %s
            WHERE ID_Endereco = (SELECT ID_Endereco FROM usuario WHERE ID_User = %s)
        """, (endereco.get('CEP'), endereco.get('Logradouro'), endereco.get('Cidade'),
              endereco.get('Bairro'), endereco.get('Estado'), endereco.get('Numero'),
              endereco.get('Complemento'), user_id))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Dados atualizados com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao atualizar usuário: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao atualizar dados do usuário"}), 500
    finally:
        cursor.close()
        conn.close()
