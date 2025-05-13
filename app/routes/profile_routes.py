from flask import Blueprint, request, redirect, url_for, jsonify, send_file, render_template, session, Response
import io
from app.utils.db import get_db_connection
from werkzeug.utils import secure_filename

profile = Blueprint('profile', __name__)

# Atualizar apenas a imagem de perfil
@profile.route('/upload_imagem', methods=['POST'])
def salvar_imagem_perfil():
    conn = None
    cursor = None
    try:
        # Verifica se o arquivo foi enviado
        if 'image' not in request.files:
            return jsonify({"sucesso": False, "erro": "Nenhuma imagem enviada"}), 400

        imagem = request.files['image']
        if imagem.filename == '':
            return jsonify({"sucesso": False, "erro": "Nenhuma imagem selecionada"}), 400

        # Obtém o ID do usuário
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"sucesso": False, "erro": "ID do usuário não fornecido"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Atualiza a imagem no banco de dados
        cursor.execute("""
            UPDATE perfil
            SET Foto = %s
            WHERE ID_Usuario = %s
        """, (imagem.read(), user_id))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Imagem atualizada com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao salvar imagem do perfil: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao salvar imagem do perfil"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Atualizar bio e categoria
@profile.route('/editar_perfil', methods=['POST'])
def editar_perfil():
    try:
        dados = request.get_json()
        categoria = dados.get('categoria')
        descricao = dados.get('descricao')
        user_id = session.get('user_id')

        if not user_id:
            return jsonify({"sucesso": False, "erro": "Usuário não autenticado"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE perfil 
            SET Username = %s, Bio = %s 
            WHERE ID_Usuario = %s
        """, (categoria, descricao, user_id))
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Perfil atualizado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao editar perfil: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao editar perfil"}), 500
    finally:
        cursor.close()
        conn.close()

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

@profile.route('/perfilPublico/<int:user_id>', methods=['GET'])
def obter_perfil_publico(user_id):
    conn = None
    cursor = None
    try:
        print(f"▶️ Iniciando consulta para user_id: {user_id}")  # Log de início
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Primeiro verifica se o usuário existe
        cursor.execute("SELECT ID_User, Nome FROM usuario WHERE ID_User = %s AND Ativo = TRUE", (user_id,))
        usuario = cursor.fetchone()
        print(f"ℹ️ Dados do usuário: {usuario}")  # Log dos dados

        if not usuario:
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado"}), 404

        # 2. Consulta básica de perfil (simplificada para teste)
        cursor.execute("""
            SELECT p.Bio, c.NomeCategoria AS Categoria
            FROM perfil p
            LEFT JOIN perfil_categoria pc ON p.IdPerfil = pc.ID_Perfil
            LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE p.ID_Usuario = %s
            LIMIT 1
        """, (user_id,))
        perfil = cursor.fetchone()
        print(f"ℹ️ Dados do perfil: {perfil}")  # Log dos dados

        return jsonify({
            "sucesso": True,
            "perfil": {
                "Nome": usuario["Nome"],
                "Bio": perfil["Bio"] if perfil else "",
                "Categoria": perfil["Categoria"] if perfil else ""
            }
        })

    except Exception as e:
        print(f"🔥 ERRO CRÍTICO: {str(e)}")  # Log detalhado
        return jsonify({"sucesso": False, "erro": "Erro interno ao obter perfil"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
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

@profile.route('/imagem/<int:user_id>', methods=['GET'])
def obter_imagem_perfil(user_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Foto FROM perfil WHERE ID_Usuario = %s
        """, (user_id,))
        imagem = cursor.fetchone()

        if not imagem or not imagem[0]:
            return jsonify({"sucesso": False, "erro": "Imagem não encontrada"}), 404

        return Response(imagem[0], mimetype='image/jpeg')
    except Exception as e:
        print(f"Erro ao obter imagem do perfil: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao obter imagem do perfil"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Para capturar as categorias
@profile.route('/obter-categorias', methods=['GET'])
def obter_categorias():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT ID_Categoria, NomeCategoria FROM categoria ORDER BY NomeCategoria")
        categorias = cursor.fetchall()
        
        return jsonify(categorias)
    
    except Exception as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 500
    
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@profile.route('/salvar_bio_categoria', methods=['POST'])
def salvar_bio_categoria():
    conn = None
    cursor = None
    try:
        dados = request.get_json()
        user_id = dados.get('user_id')
        bio = dados.get('bio')
        categoria_id = dados.get('categoria_id')

        if not user_id:
            return jsonify({"sucesso": False, "erro": "ID do usuário não fornecido"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Atualizar a bio na tabela Perfil
        cursor.execute("""
            UPDATE perfil
            SET Bio = %s
            WHERE ID_Usuario = %s
        """, (bio, user_id))

        # Atualizar ou inserir a categoria na tabela perfil_categoria
        if categoria_id:
            cursor.execute("""
                INSERT INTO perfil_categoria (ID_Perfil, ID_Categoria)
                VALUES ((SELECT IdPerfil FROM perfil WHERE ID_Usuario = %s), %s)
                ON DUPLICATE KEY UPDATE ID_Categoria = VALUES(ID_Categoria)
            """, (user_id, categoria_id))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Bio e categoria atualizadas com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao salvar bio e categoria: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao salvar bio e categoria"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@profile.route('/obter_perfil/<int:user_id>', methods=['GET'])
def obter_perfil(user_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Consulta para obter bio e categoria do perfil
        cursor.execute("""
            SELECT p.Bio, c.NomeCategoria
            FROM perfil p
            LEFT JOIN perfil_categoria pc ON p.IdPerfil = pc.ID_Perfil
            LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE p.ID_Usuario = %s
        """, (user_id,))
        perfil = cursor.fetchone()

        if not perfil:
            return jsonify({"sucesso": False, "erro": "Perfil não encontrado"}), 404

        return jsonify({"sucesso": True, "perfil": perfil}), 200
    except Exception as e:
        print(f"Erro ao obter perfil: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao obter perfil"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
