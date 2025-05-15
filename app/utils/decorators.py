from flask import redirect, session, url_for

def login_required(view_func):
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return redirect(url_for('base_bp.index'))
        return view_func(*args, **kwargs)
    wrapper.__name__ = view_func.__name__
    return wrapper
