import mysql.connector

def get_db_connection():
    from flask import current_app
    return mysql.connector.connect(**current_app.config['DB_CONFIG'])

def init_db(app):
    with app.app_context():
        conn = get_db_connection()
        conn.close()