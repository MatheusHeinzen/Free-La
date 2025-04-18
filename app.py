from flask import Flask, request, render_template, redirect, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configurações de conexão com o MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Root#963',
    'database': 'freela'
}

@app.route('/')
def index():
    return render_template('index.html')

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

        cursor.close()
        conn.close()

        if usuario and check_password_hash(usuario['Senha'], senha):
            return jsonify({"sucesso": True})
        else:
            return jsonify({"sucesso": False, "erro": "Email ou senha incorretos."})
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": f"Erro no banco de dados: {err}"})

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()

    nome = data.get('nome')
    email = data.get('email')
    cpf = data.get('cpf')
    telefone = data.get('telefone')
    senha = generate_password_hash(data.get('senha'))

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        sql = "INSERT INTO Usuario (Nome, Email, CPF, Telefone, Senha) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, cpf, telefone, senha))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"sucesso": True})
    except mysql.connector.Error as err:
        return jsonify({"sucesso": False, "erro": str(err)})

##############################
@app.route('/logado', methods=['GET'])
def logado():
    
    data = request.get_json()
    id = data.get('id')
    nome = data.get('nome')
    email = data.get('email')
    cpf = data.get('cpf')
    telefone = data.get('telefone')
    return jsonify({"sucesso": True})


@app.route('/atualizarCadastro', methods=['PUT'])
def atualizarCadastro(id):
    data = request.get_json()
    nome = data.get('nome')
    email = data.get('email')
    cpf = data.get('cpf')
    telefone = data.get('telefone')
   
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        query = "UPDATE Usuario SET (Nome, Email, CPF, Telefone) VALUES (%s, %s, %s, %s, %s) WHERE ID_User = %s"
        cursor.execute(query, (nome, email, cpf, telefone, id))
        conn.commit()

        cursor.close()
        conn.close()

        if cursor.rowcount == 0:
            return jsonify({"erro": "Usuário não encontrado."}), 404

        return jsonify({"mensagem": "Usuário atualizado com sucesso!"})
    except mysql.connector.Error as err:
        return jsonify({"erro": f"Erro no banco de dados: {err}"}), 500


@app.route('/cadastrar', methods=['DELETE'])



##############################


@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/perfil')
def perfil():
    return render_template('perfil.html')

@app.route('/alterarDados')
def alterarDados():
    return render_template('alterarDados.html')

@app.route('/termos')
def termos():
    return render_template('termos.html')

if __name__ == '__main__':
    app.run(debug=True)