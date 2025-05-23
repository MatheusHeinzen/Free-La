from flask import Blueprint, request, redirect, url_for, jsonify, send_file, render_template, session, Response
import io
from app.utils.db import get_db_connection
from werkzeug.utils import secure_filename
from app.utils.decorators import login_required

profile = Blueprint('profile', __name__)

# Atualizar apenas a imagem de perfil
@profile.route('/upload_imagem', methods=['POST'])
@login_required
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
@login_required
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

@profile.route('/perfilPublico/<int:freelancer_id>', methods=['GET'])
def perfil_publico(freelancer_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT u.ID_User, u.Nome, p.Bio, c.NomeCategoria
            FROM usuario u
            JOIN perfil p ON u.ID_User = p.ID_Usuario
            LEFT JOIN perfil_categoria pc ON p.IdPerfil = pc.ID_Perfil
            LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE u.ID_User = %s AND u.TipoUsuario = 'freelancer'
        """, (freelancer_id,))
        freelancer = cursor.fetchone()

        if not freelancer:
            return "Freelancer não encontrado", 404

        return render_template('requisitar_servico.html', freelancer_id=freelancer_id, freelancer=freelancer)
    except Exception as e:
        print(f"Erro ao carregar perfil público: {e}")
        return "Erro ao carregar perfil público", 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@profile.route('/user/<int:user_id>', methods=['PUT'])
@login_required
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
@login_required
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
@login_required
def salvar_bio_categoria():
    data = request.get_json()
    user_id = data.get('user_id')
    bio = data.get('bio')
    categoria_id = data.get('categoria_id')

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Atualiza bio
        cursor.execute("UPDATE perfil SET Bio = %s WHERE ID_Usuario = %s", (bio, user_id))

        # Remove todas as categorias antigas do perfil
        cursor.execute("""
            DELETE FROM perfil_categoria
            WHERE ID_Perfil = (SELECT IdPerfil FROM perfil WHERE ID_Usuario = %s)
        """, (user_id,))

        # Adiciona a nova categoria (ou várias, se vier como lista)
        id_perfil = None
        cursor.execute("SELECT IdPerfil FROM perfil WHERE ID_Usuario = %s", (user_id,))
        row = cursor.fetchone()
        if row:
            id_perfil = row[0]

        if id_perfil:
            # Permite múltiplas categorias se categoria_id for lista
            if isinstance(categoria_id, list):
                for cat_id in categoria_id:
                    cursor.execute("""
                        INSERT IGNORE INTO perfil_categoria (ID_Perfil, ID_Categoria) VALUES (%s, %s)
                    """, (id_perfil, cat_id))
            elif categoria_id:
                cursor.execute("""
                    INSERT IGNORE INTO perfil_categoria (ID_Perfil, ID_Categoria) VALUES (%s, %s)
                """, (id_perfil, categoria_id))

        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Bio e categoria(s) atualizadas com sucesso!'})
    except Exception as e:
        conn.rollback()
        print(f"Erro ao salvar bio/categoria: {e}")
        return jsonify({'sucesso': False, 'erro': 'Erro ao salvar bio/categoria.'}), 500
    finally:
        cursor.close()
        conn.close()

@profile.route('/obter_perfil/<int:user_id>')
def obter_perfil(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Busca dados principais do perfil
        cursor.execute("""
            SELECT 
                u.Nome, 
                u.Email,
                u.Telefone,
                p.Bio, 
                IFNULL(p.MediaAvaliacoes, 0) AS MediaAvaliacoes, 
                IFNULL(p.TotalAvaliacoes, 0) AS TotalAvaliacoes
            FROM perfil p
            JOIN usuario u ON p.ID_Usuario = u.ID_User
            WHERE p.ID_Usuario = %s
            LIMIT 1
        """, (user_id,))
        perfil = cursor.fetchone()

        # Busca até duas categorias
        cursor.execute("""
            SELECT c.NomeCategoria
            FROM perfil_categoria pc
            JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE pc.ID_Perfil = (SELECT IdPerfil FROM perfil WHERE ID_Usuario = %s)
            LIMIT 2
        """, (user_id,))
        categorias = [row['NomeCategoria'] for row in cursor.fetchall()]

        # Monta frase amigável para categoria
        if categorias:
            if len(categorias) == 1:
                perfil['Categoria'] = categorias[0]
            else:
                perfil['Categoria'] = f"{categorias[0]} e {categorias[1]}"
        else:
            perfil['Categoria'] = 'Categoria não informada'

        # Todas as habilidades (para o badge)
        cursor.execute("""
            SELECT c.NomeCategoria
            FROM perfil_categoria pc
            JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
            WHERE pc.ID_Perfil = (SELECT IdPerfil FROM perfil WHERE ID_Usuario = %s)
        """, (user_id,))
        habilidades = [row['NomeCategoria'] for row in cursor.fetchall()]
        perfil['Habilidades'] = habilidades

        if perfil is None:
            return jsonify({"sucesso": False, "erro": "Perfil não encontrado"}), 404
        return jsonify({"perfil": perfil, "sucesso": True})
    except Exception as e:
        print(f"[ERRO obter_perfil] {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao obter perfil"}), 500
    finally:
        cursor.close()
        conn.close()

@profile.route('/api/perfis', methods=['GET'])
def obter_perfis():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT u.ID_User, u.Nome, p.Bio
            FROM usuario u
            JOIN perfil p ON u.ID_User = p.ID_Usuario
            WHERE u.TipoUsuario = 'freelancer' AND u.Ativo = TRUE
        """)
        perfis = cursor.fetchall()
        return jsonify(perfis), 200
    except Exception as e:
        print(f"Erro ao obter perfis: {e}")
        return jsonify({"erro": "Erro ao obter perfis"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@profile.route('/homepage')
def exibir_homepage():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            u.ID_User, 
            u.Nome, 
            c.NomeCategoria, 
            p.Bio, 
            IFNULL(p.MediaAvaliacoes, 0) AS MediaAvaliacoes, 
            IFNULL(p.TotalAvaliacoes, 0) AS TotalAvaliacoes
        FROM perfil p
        JOIN usuario u ON p.ID_Usuario = u.ID_User
        LEFT JOIN perfil_categoria pc ON pc.ID_Perfil = p.IdPerfil
        LEFT JOIN categoria c ON pc.ID_Categoria = c.ID_Categoria
        WHERE u.TipoUsuario = 'freelancer'
        ORDER BY u.ID_User DESC
    """)
    perfis = cursor.fetchall()
    cursor.close()
    conn.close()
    # DEBUG: Veja o que está sendo enviado para o template
    print("[DEBUG] Perfis enviados para homepage:", perfis)
    return render_template('homepage.html', perfis=perfis)
