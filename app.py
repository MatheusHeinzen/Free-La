from flask import Flask, request, render_template, redirect
import mysql.connector
import os

app = Flask(__name__)

# Configurações de conexão com o MySQL
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'PUC@1234',
    'database': 'freela'
}

# Rota para exibir o formulário
@app.route('/')
def index():
    return render_template('index.html')  # Certifique-se de ter esse arquivo dentro da pasta /templates

# Rota para receber e salvar os dados do cadastro
@app.route('/salvar', methods=['POST'])
def salvar():
    nome = request.form['nome']
    email = request.form['email']
    cpf = request.form['cpf']
    telefone = request.form['telefone']
    senha = request.form['senha']

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        sql = """
            INSERT INTO Usuario (Nome, Email, CPF, Senha)
            VALUES (%s, %s, %s, %s)
        """
        valores = (nome, email, cpf, senha)
        cursor.execute(sql, valores)
        conn.commit()

        cursor.close()
        conn.close()
        return redirect('/sucesso')  # cria uma rota simples pra sucesso se quiser
    except mysql.connector.Error as err:
        return f"Erro ao salvar no banco: {err}"

# Rota de sucesso (opcional)
@app.route('/sucesso')
def sucesso():
    return "<h1>Cadastro realizado com sucesso!</h1>"

@app.route('/homepage')
def homepage():
    return "/HomePage/homepage.html"

# Rodar app
if __name__ == '__main__':
    app.run(debug=True)
