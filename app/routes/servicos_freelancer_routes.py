from flask import Blueprint, render_template, session, redirect, url_for, flash

servicos_freelancer_bp = Blueprint('servicos_freelancer', __name__)

@servicos_freelancer_bp.route('/servicos_freelancer')
def servicos_freelancer():
    if 'user_id' not in session:
        flash('Você precisa fazer login primeiro', 'warning')
        return redirect('/homepage')  # Redireciona para homepage
    
    # Comparação mais robusta do tipo de usuário
    if session.get('TipoUsuario', '').lower() != 'freelancer':
        flash('Esta área é restrita apenas para freelancers', 'error')
        return redirect('/homepage')
    
    return render_template('servicos_freelancer.html')