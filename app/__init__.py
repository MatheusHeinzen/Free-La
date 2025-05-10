from flask import Flask
from flask_cors import CORS
from app.utils.db import init_db
from datetime import timedelta

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

    # Configuração de expiração da sessão
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

    init_db(app)

    # Registrar blueprints
    from app.routes.user_routes import user_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.category_routes import category_bp
    from app.routes.base_routes import base_bp
    from app.routes.skill_routes import skill_bp
    from app.routes.preference_routes import preference_bp
    from app.utils.session_helpers import obter_nome_usuario


    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(category_bp, url_prefix='/category')
    app.register_blueprint(base_bp)
    app.register_blueprint(skill_bp, url_prefix='/skills')
    app.register_blueprint(preference_bp, url_prefix='/preferences')
    app.context_processor(lambda: {'obter_nome_usuario': obter_nome_usuario})

    return app