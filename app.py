from datetime import datetime
from flask import Flask, request, render_template, redirect, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import mysql.connector
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# configuração do banco de dados
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'freela'
}

# Sessão
app.secret_key = 'senha_da_sessao'

# Caminho para o arquivo de habilidades
CAMINHO_JSON = 'habilidades.json'

@app.context_processor
def obter_nome_usuario():
    if 'user_id' in session:
        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("SELECT Nome FROM Usuario WHERE ID_User = %s", (session['user_id'],))
            usuario = cursor.fetchone()
            
            if usuario:
                return {'obter_nome_usuario': lambda: usuario['Nome']}
                
        except mysql.connector.Error as err:
            print(f"Erro ao obter nome do usuário: {err}")
        finally:
            if 'conn' in locals() and conn.is_connected():
                cursor.close()
                conn.close()
    
    return {'obter_nome_usuario': lambda: ''}

# rotas básicas
@app.route('/')
def index():
    return render_template('index.html', session=session)

@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/perfil')
def perfil():
    return render_template('perfil.html')

@app.route('/alterarDados')
def alterar_dados():
    return render_template('alterarDados.html')

@app.route('/termos')
def termos():
    return render_template('termos.html')

# autenticação e cadastro
@app.route('/autenticar', methods=['POST'])
def autenticar():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Usuario WHERE Email = %s", (email,))
        usuario = cursor.fetchone()

        if usuario and check_password_hash(usuario['Senha'], senha):
            session['user_id'] = usuario['ID_User']
            return jsonify({"sucesso": True, "mensagem": "Login realizado com sucesso!", "id": usuario['ID_User']})
        else:
            return jsonify({"sucesso": False, "mensagem": "Email ou senha incorretos."})
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "mensagem": f"Erro no banco de dados: {err}"})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    data = request.get_json()
    
    # valida dados obrigatórios
    campos_obrigatorios = ['nome', 'email', 'cpf', 'senha', 'dataNascimento']
    if not all(data.get(campo) for campo in campos_obrigatorios):
        return jsonify({"sucesso": False, "erro": "dados obrigatórios faltando"}), 400

    # valida formato da data
    try:
        datetime.strptime(data['dataNascimento'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"sucesso": False, "erro": "formato de data inválido. use YYYY-MM-DD"}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Usuario (Nome, Email, CPF, Senha, DataNascimento) 
            VALUES (%s, %s, %s, %s, %s);
        """, (
            data['nome'],
            data['email'],
            data['cpf'],
            generate_password_hash(data['senha']),
            data['dataNascimento']
        ))
        
        conn.commit()
        return jsonify({"sucesso": True, "id": cursor.lastrowid})

    except mysql.connector.Error as err:
        if err.errno == 1062:
            campo = err.msg.split("'")[1]
            return jsonify({"sucesso": False, "erro": f"{campo} já está em uso"}), 400
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# operações com usuários
@app.route('/usuario/<int:user_id>', methods=['GET'])
def obter_usuario(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT u.*, e.* 
            FROM Usuario u
            LEFT JOIN Endereco e ON u.ID_Endereco = e.ID_Endereco
            WHERE u.ID_User = %s
        """, (user_id,))
        
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"sucesso": False, "erro": "usuário não encontrado"}), 404
        
        usuario.pop('Senha', None)
        return jsonify({"sucesso": True, "usuario": usuario})

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/usuario/<int:user_id>/dados', methods=['GET'])
def obter_dados_basicos(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT Nome, Email, Telefone FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"sucesso": False, "erro": "usuário não encontrado"}), 404
        
        cursor.execute("SELECT Bio FROM Perfil WHERE ID_Usuario = %s", (user_id,))
        usuario = cursor.fetchone()

        return jsonify({"sucesso": True, "usuario": usuario})

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


# Atualizar cadastro do usuario
@app.route('/atualizarUsuario/<int:user_id>', methods=['PUT'])
def atualizar_usuario(user_id):
    data = request.get_json()
    
    # validações básicas
    if not all(key in data for key in ['nome', 'email', 'telefone', 'tipoUsuario', 'endereco']):
        return jsonify({"sucesso": False, "erro": "dados incompletos"}), 400
    
    # validação adicional para freelancer
    if data['tipoUsuario'] == 'freelancer':
        if not data.get('cpf') or len(data['cpf'].replace('.', '').replace('-', '')) != 11:
            return jsonify({"sucesso": False, "erro": "cpf inválido para freelancer"}), 400
        
        endereco = data['endereco']
        campos_obrigatorios = ['CEP', 'Logradouro', 'Cidade', 'Bairro', 'Estado', 'Numero']
        if not all(endereco.get(campo) for campo in campos_obrigatorios):
            return jsonify({"sucesso": False, "erro": "endereço incompleto para freelancer"}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # atualiza endereço
        endereco_data = data['endereco']
        cursor.execute("""
            INSERT INTO Endereco (
                CEP, Logradouro, Cidade, Bairro, Estado, Numero, Complemento
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                CEP = VALUES(CEP),
                Logradouro = VALUES(Logradouro),
                Cidade = VALUES(Cidade),
                Bairro = VALUES(Bairro),
                Estado = VALUES(Estado),
                Numero = VALUES(Numero),
                Complemento = VALUES(Complemento)
        """, (
            endereco_data.get('CEP'),
            endereco_data.get('Logradouro'),
            endereco_data.get('Cidade'),
            endereco_data.get('Bairro'),
            endereco_data.get('Estado'),
            endereco_data.get('Numero'),
            endereco_data.get('Complemento')
        ))
        
        # atualiza dados do usuário
        cursor.execute("""
            UPDATE Usuario SET 
                Nome = %s,
                Email = %s,
                Telefone = %s,
                CPF = %s,
                TipoUsuario = %s
            WHERE ID_User = %s
        """, (
            data['nome'],
            data['email'],
            data['telefone'],
            data.get('cpf'),
            data['tipoUsuario'],
            user_id
        ))
        
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "dados atualizados com sucesso"})

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# categorias
@app.route('/categorias', methods=['GET'])
def obter_categorias():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Categoria")
        categorias = cursor.fetchall()
        
        return jsonify({"sucesso": True, "categorias": categorias})

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/usuario/<int:user_id>/preferencias', methods=['GET', 'PUT'])
def gerenciar_preferencias(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        if request.method == 'GET':
            # Verifica se existe registro para o usuário
            cursor.execute("""
                SELECT MostrarTelefone, MostrarEmail 
                FROM PreferenciaContato  
                WHERE fk_Usuario_ID_User = %s
            """, (user_id,))
            
            preferencias = cursor.fetchone()
            
            # Se não existir, cria com valores padrão
            if not preferencias:
                cursor.execute("""
                    INSERT INTO PreferenciaContato
                        (fk_Usuario_ID_User, MostrarTelefone, MostrarEmail)
                    VALUES (%s, %s, %s)
                """, (user_id, True, True))
                conn.commit()
                preferencias = {'MostrarTelefone': True, 'MostrarEmail': True}
            
            return jsonify({
                "sucesso": True,
                "mostrarTelefone": preferencias['MostrarTelefone'],
                "mostrarEmail": preferencias['MostrarEmail']
            })
            
        elif request.method == 'PUT':
            data = request.get_json()
            
            cursor.execute("""
                INSERT INTO PreferenciaContato
                    (fk_Usuario_ID_User, MostrarTelefone, MostrarEmail)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    MostrarTelefone = VALUES(MostrarTelefone),
                    MostrarEmail = VALUES(MostrarEmail)
            """, (
                user_id,
                data.get('mostrarTelefone', True),
                data.get('mostrarEmail', True)
            ))
            
            conn.commit()
            return jsonify({"sucesso": True, "mensagem": "Preferências atualizadas"})
            
    except Exception as err:
        conn.rollback()
        return jsonify({"sucesso": False, "erro": str(err)}), 500
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# Deletar usuario logado (Falta tratamento de sessão porém foi inicializado)
@app.route('/DeletarUsuario', methods=['DELETE'])
def deletar_usuario_logado():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({"sucesso": False, "erro": "Usuário não está logado."}), 401

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Verifica se o usuário existe
        cursor.execute("SELECT * FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()

        if not usuario:
            cursor.close()
            conn.close()
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado."}), 404

        # Deleta o usuário
        cursor.execute("DELETE FROM Usuario WHERE ID_User = %s", (user_id,))
        conn.commit()

        cursor.close()
        conn.close()
        session.pop('user_id', None)

        return jsonify({"sucesso": True, "mensagem": "Usuário deletado com sucesso."}), 200

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500


@app.route('/usuario/<int:user_id>/preferencias', methods=['PUT'])
def salvar_preferencias(user_id):
    try:
        data = request.get_json()
        
        # Valida os dados recebidos
        if not all(key in data for key in ['mostrarTelefone', 'mostrarEmail']):
            return jsonify({"sucesso": False, "erro": "dados incompletos"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Atualiza as preferências no banco de dados
        cursor.execute("""
            INSERT INTO PreferenciaContato
                (fk_Usuario_ID_User, MostrarTelefone, MostrarEmail) 
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                MostrarTelefone = VALUES(MostrarTelefone),
                MostrarEmail = VALUES(MostrarEmail)
        """, (
            user_id,
            data['mostrarTelefone'],
            data['mostrarEmail']
        ))
        
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "preferências atualizadas"})

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# Gerenciador de Categorias
@app.route('/usuario/<int:user_id>/categorias', methods=['GET', 'PUT'])
def gerenciar_categorias_usuario(user_id):
    if request.method == 'GET':
        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT c.* FROM Categoria c
                JOIN Usuario_Categoria uc ON c.ID_Categoria = uc.fk_Categoria_ID_Categoria
                WHERE uc.fk_Usuario_ID_User = %s
            """, (user_id,))
            
            categorias = cursor.fetchall()
            return jsonify({"sucesso": True, "categorias": categorias})

        except mysql.connector.Error as err:
            return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
        finally:
            if 'conn' in locals() and conn.is_connected():
                cursor.close()
                conn.close()
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        if not data.get('categorias'):
            return jsonify({"sucesso": False, "erro": "nenhuma categoria fornecida"}), 400
        
        try:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor()
            
            # remove categorias atuais
            cursor.execute("DELETE FROM Usuario_Categoria WHERE fk_Usuario_ID_User = %s", (user_id,))
            
            # adiciona novas categorias
            for categoria_id in data['categorias']:
                cursor.execute("""
                    INSERT INTO Usuario_Categoria (fk_Usuario_ID_User, fk_Categoria_ID_Categoria)
                    VALUES (%s, %s)
                """, (user_id, categoria_id))
            
            conn.commit()
            return jsonify({"sucesso": True, "mensagem": "categorias atualizadas com sucesso"})

        except mysql.connector.Error as err:
            conn.rollback()
            return jsonify({"sucesso": False, "erro": f"erro no banco de dados: {err}"}), 500
        finally:
            if 'conn' in locals() and conn.is_connected():
                cursor.close()
                conn.close()

# habilidades
def ler_habilidades():
    if os.path.exists(CAMINHO_JSON):
        with open(CAMINHO_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def salvar_habilidades(habilidades):
    with open(CAMINHO_JSON, 'w', encoding='utf-8') as f:
        json.dump(habilidades, f, ensure_ascii=False, indent=2)

@app.route('/habilidades', methods=['GET'])
def get_habilidades():
    habilidades = ler_habilidades()
    return jsonify(habilidades)

@app.route('/habilidades/adicionar', methods=['POST'])
def adicionar_habilidade():
    nova = request.json.get('novaHabilidade', '').strip()
    
    if not nova:
        return jsonify({'erro': 'nome inválido'}), 400

    habilidades = ler_habilidades()
    if nova not in habilidades:
        habilidades.append(nova)
        salvar_habilidades(habilidades)
        return jsonify({'mensagem': 'adicionado com sucesso'}), 200
    
    return jsonify({'erro': 'habilidade já existe'}), 400

# @app.route('/habilidades/salvar', methods=['POST'])
# def salvar_habilidades_perfil(user_id):
#      data = 1234
#      try:
#         conn = mysql.connector.connect(**db_config)
#         cursor = conn.cursor()
        
#         # remove categorias atuais
#         cursor.execute("DELETE FROM Usuario_Categoria WHERE fk_Usuario_ID_User = %s", (user_id,))
        
#         # adiciona novas categorias
#         for categoria_id in data['']:
#             cursor.execute("""
#                 INSERT INTO  (fk_Usuario_ID_User, fk_Categoria_ID_Categoria)
#                 VALUES (%s, %s)
#             """, (user_id, categoria_id))
        
#         conn.commit()
#         return jsonify({"sucesso": True, "mensagem": "categorias atualizadas com sucesso"})
#      except:
#         return data


# configuração CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)