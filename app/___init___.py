from flask import Flask
from flask_cors import CORS
from app.utils.db import init_db

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config['DB_CONFIG'] = {
        'host': 'localhost',
        'user': 'root',
        'password': 'PUC@1234',
        'database': 'freela'
    }
    app.secret_key = 'senha_da_sessao'

    init_db(app)

    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/user')

    return app