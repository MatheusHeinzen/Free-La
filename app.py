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
    'password': '',
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


@app.route('/homepage')
def homepage():
    return render_template('homepage.html')

@app.route('/perfil')
def perfil():
    return render_template('perfil.html')

if __name__ == '__main__':
    app.run(debug=True)
