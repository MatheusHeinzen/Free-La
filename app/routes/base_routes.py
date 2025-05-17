from flask import Blueprint, render_template, session

base_bp = Blueprint('base', __name__)

@base_bp.route('/')
def index():
    return render_template('index.html', session=session)

@base_bp.route('/homepage')
def homepage():
    return render_template('homepage.html')

@base_bp.route('/perfil')
def perfil():
    return render_template('perfil.html')

@base_bp.route('/alterarDados')
def alterar_dados():
    return render_template('alterarDados.html')

@base_bp.route('/termos')
def termos():
    return render_template('termos.html')

@base_bp.route('/perfilPublico/<int:user_id>')
def perfil_publico(user_id):
    return render_template('perfil_publico.html', user_id=user_id)

@base_bp.route('/requisitarServico/<int:freelancer_id>')
def requisitar_servicos(freelancer_id):
    return render_template('requisitar_servico.html', freelancer_id=freelancer_id)

@base_bp.route('/servicosCliente')
def servicos_cliente():
    return render_template('servicos_cliente.html')

@base_bp.route('/servicosFreelancer')
def servicos_freelancer():
    return render_template('servicos_freelancer.html')