from datetime import datetime
from flask import Flask, request, render_template, redirect, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import mysql.connector
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configurações de conexão com o MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Root#963',
    'database': 'freela'
}

# Sessão
app.secret_key = 'senha_da_sessao'

# Caminho para o arquivo de habilidades
CAMINHO_JSON = 'habilidades.json'

# Rotas básicas
@app.route('/')
def index():
    return render_template('index.html')

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

# Autenticação e cadastro
@app.route('/autenticar', methods=['POST'])
def autenticar():
    """Autentica um usuário com email e senha"""
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
            return jsonify({"sucesso": True, "id": usuario['ID_User'], "session": session['user_id']})
        else:
            return jsonify({"sucesso": False, "erro": "Email ou senha incorretos."})
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"})
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    """Cadastra um novo usuário no sistema"""
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()

    # Dados obrigatórios
    nome = data.get('nome')
    email = data.get('email')
    cpf = data.get('cpf')
    senha = data.get('senha')
    data_nascimento = data.get('dataNascimento')

    # Validações básicas
    if not all([nome, email, cpf, data_nascimento, senha]):
        return jsonify({"sucesso": False, "erro": "Dados obrigatórios faltando"}), 400

    # Valida formato da data
    if data_nascimento:
        try:
            datetime.strptime(data_nascimento, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"sucesso": False, "erro": "Formato de data inválido. Use YYYY-MM-DD"}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        sql = """
            INSERT INTO Usuario 
                (Nome, Email, CPF, Senha, DataNascimento) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            nome, 
            email, 
            cpf, 
            generate_password_hash(senha),
            data_nascimento if data_nascimento else None
        ))
        
        conn.commit()
        novo_usuario_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({"sucesso": True, "id": novo_usuario_id})

    except mysql.connector.Error as err:
        if err.errno == 1062:
            campo = err.msg.split("'")[1]
            return jsonify({"sucesso": False, "erro": f"{campo} já está em uso"}), 400
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

@app.route('/logado', methods=['GET'])
def logado():
    """Verifica se o usuário está logado"""
    data = request.get_json()
    id = data.get('id')
    nome = data.get('nome')
    email = data.get('email')
    cpf = data.get('cpf')
    telefone = data.get('telefone')
    return jsonify({"sucesso": True})

# Operações com usuários
@app.route('/usuario/<int:user_id>', methods=['GET'])
def obter_usuario(user_id):
    """Obtém os dados completos de um usuário"""
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
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado"}), 404
        
        usuario.pop('Senha', None)
        return jsonify({"sucesso": True, "usuario": usuario})

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/usuario/<int:user_id>/dados', methods=['GET'])
def obter_dados_basicos(user_id):
    """Obtém apenas os dados básicos do usuário (nome, email, telefone)"""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT Nome, Email, Telefone FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado"}), 404
        
        return jsonify({"sucesso": True, "usuario": usuario})

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/obterDadosUsuario/<int:id>', methods=['GET'])
def obter_dados_usuario(id):
    """Obtém dados básicos do usuário (alternativa)"""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Usuario WHERE ID_User = %s", (id,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if usuario:
            usuario.pop('Senha', None)
            return jsonify({"sucesso": True, "usuario": usuario})
        else:
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado."}), 404
            
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

@app.route('/atualizarUsuario/<int:user_id>', methods=['PUT'])
def atualizar_usuario(user_id):
    """Atualiza os dados de um usuário"""
    data = request.get_json()
    
    # Validações básicas
    if not all(key in data for key in ['nome', 'email', 'telefone', 'tipoUsuario', 'endereco']):
        return jsonify({"sucesso": False, "erro": "Dados incompletos"}), 400
    
    # Validação adicional para freelancer
    if data['tipoUsuario'] == 'freelancer':
        if not data.get('cpf') or len(data['cpf'].replace('.', '').replace('-', '')) != 11:
            return jsonify({"sucesso": False, "erro": "CPF inválido para freelancer"}), 400
        
        endereco = data['endereco']
        campos_obrigatorios = ['CEP', 'Logradouro', 'Cidade', 'Bairro', 'Estado', 'Numero']
        if not all(endereco.get(campo) for campo in campos_obrigatorios):
            return jsonify({"sucesso": False, "erro": "Endereço incompleto para freelancer"}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # 1. Verifica se o usuário existe e obtém o ID_Endereco atual
        cursor.execute("SELECT ID_Endereco FROM Usuario WHERE ID_User = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado"}), 404
        
        id_endereco = usuario['ID_Endereco']
        endereco_data = data['endereco']
        
        # 2. Atualiza ou cria o endereço
        if id_endereco:
            # Atualiza endereço existente
            cursor.execute("""
                UPDATE Endereco SET 
                    CEP = %s,
                    Logradouro = %s,
                    Cidade = %s,
                    Bairro = %s,
                    Estado = %s,
                    Numero = %s,
                    Complemento = %s
                WHERE ID_Endereco = %s
            """, (
                endereco_data.get('CEP'),
                endereco_data.get('Logradouro'),
                endereco_data.get('Cidade'),
                endereco_data.get('Bairro'),
                endereco_data.get('Estado'),
                endereco_data.get('Numero'),
                endereco_data.get('Complemento'),
                id_endereco
            ))
        else:
            # Cria novo endereço
            cursor.execute("""
                INSERT INTO Endereco (
                    CEP, Logradouro, Cidade, Bairro, Estado, Numero, Complemento
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                endereco_data.get('CEP'),
                endereco_data.get('Logradouro'),
                endereco_data.get('Cidade'),
                endereco_data.get('Bairro'),
                endereco_data.get('Estado'),
                endereco_data.get('Numero'),
                endereco_data.get('Complemento')
            ))
            id_endereco = cursor.lastrowid
            
            # Atualiza usuário com o novo ID_Endereco
            cursor.execute("""
                UPDATE Usuario SET ID_Endereco = %s WHERE ID_User = %s
            """, (id_endereco, user_id))
        
        # 3. Atualiza dados básicos do usuário
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
        return jsonify({"sucesso": True, "mensagem": "Dados atualizados com sucesso"})
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# Deletar Usuario
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

        # Remove a sessão
        session.pop('user_id', None)

        return jsonify({"sucesso": True, "mensagem": "Usuário deletado com sucesso."}), 200

    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

# Categorias
@app.route('/categorias', methods=['GET'])
def obter_categorias():
    """Obtém todas as categorias disponíveis"""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM Categoria")
        categorias = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"sucesso": True, "categorias": categorias})
        
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

@app.route('/usuario/<int:id>/categorias', methods=['GET'])
def obter_categorias_usuario(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT c.* FROM Categoria c
            JOIN Usuario_Categoria uc ON c.ID_Categoria = uc.fk_Categoria_ID_Categoria
            WHERE uc.fk_Usuario_ID_User = %s
        """, (id,))
        categorias = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({"sucesso": True, "categorias": categorias})
        
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

@app.route('/usuario/<int:id>/categorias', methods=['PUT'])
def atualizar_categorias_usuario(id):
    data = request.get_json()
    
    if not data.get('categorias'):
        return jsonify({"sucesso": False, "erro": "Nenhuma categoria fornecida."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Remove todas as categorias atuais do usuário
        cursor.execute("DELETE FROM Usuario_Categoria WHERE fk_Usuario_ID_User = %s", (id,))
        
        # Adiciona as novas categorias
        for categoria_id in data['categorias']:
            cursor.execute(
                "INSERT INTO Usuario_Categoria (fk_Usuario_ID_User, fk_Categoria_ID_Categoria) VALUES (%s, %s)",
                (id, categoria_id)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"sucesso": True, "mensagem": "Categorias atualizadas com sucesso!"})
        
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

# Rota para obter dados completos do usuário (incluindo perfil)
@app.route('/usuario/<int:id>/completo', methods=['GET'])
def obter_usuario_completo(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Dados básicos do usuário
        cursor.execute("SELECT * FROM Usuario WHERE ID_User = %s", (id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"sucesso": False, "erro": "Usuário não encontrado."}), 404
        
        # Remove a senha por segurança
        usuario.pop('Senha', None)
        
        # Dados do perfil
        cursor.execute("SELECT * FROM Perfil WHERE fk_Usuario_IdUsuario = %s", (id,))
        usuario['perfil'] = cursor.fetchone()
        
        # Endereço do usuário
        cursor.execute("SELECT * FROM Endereco WHERE fk_Usuario_ID_User = %s", (id,))
        usuario['endereco'] = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({"sucesso": True, "usuario": usuario})
        
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"}), 500

# Habilidades
def ler_habilidades():
    if os.path.exists(CAMINHO_JSON):
        with open(CAMINHO_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def salvar_habilidades(habilidades):
    with open(CAMINHO_JSON, 'w', encoding='utf-8') as f:
        json.dump(habilidades, f, ensure_ascii=False, indent=2)

@app.route('/habilidades/perfil')
def skills():
    return render_template('')

@app.route('/habilidades')
def get_habilidades():
    habilidades = ler_habilidades()
    return jsonify(habilidades)

@app.route('/adicionarHabilidade', methods=['POST'])
def adicionar_habilidade():
    nova = request.json.get('novaHabilidade', '').strip()
    if not nova:
        return jsonify({'erro': 'Nome inválido'}), 400

    habilidades = ler_habilidades()
    if nova not in habilidades:
        habilidades.append(nova)
        salvar_habilidades(habilidades)
        return jsonify({'mensagem': 'Adicionado com sucesso'}), 200
    else:
        return jsonify({'erro': 'Habilidade já existe'}), 400

# Configuração CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)