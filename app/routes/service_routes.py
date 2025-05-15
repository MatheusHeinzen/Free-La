from flask import Blueprint, request, jsonify, session
from app.utils.db import get_db_connection
from app.utils.decorators import login_required  # Corrigido aqui

service_bp = Blueprint('service', __name__)

@service_bp.route('/criar', methods=['POST'])
@login_required
def criar_servico():
    data = request.get_json()
    nome = data.get('nome')
    descricao = data.get('descricao')
    categoria = data.get('categoria')
    id_freelancer = data.get('id_freelancer')
    id_cliente = data.get('id_cliente')

    # Log dos dados recebidos
    print(f"[DEBUG] Dados recebidos: nome={nome}, descricao={descricao}, categoria={categoria}, id_freelancer={id_freelancer}, id_cliente={id_cliente}")

    # Verificação de dados obrigatórios
    if not (nome and descricao and categoria and id_freelancer and id_cliente):
        print("[ERROR] Dados incompletos para criar o serviço")
        return jsonify({"sucesso": False, "erro": "Dados incompletos para criar o serviço"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Inserção do serviço
        cursor.execute("""
            INSERT INTO service (NomeService, Descricao, ID_Cliente, ID_Freelancer)
            VALUES (%s, %s, %s, %s)
        """, (nome, descricao, id_cliente, id_freelancer))
        conn.commit()

        print("[DEBUG] Serviço criado com sucesso")
        return jsonify({"sucesso": True, "mensagem": "Serviço criado com sucesso!"}), 201
    except Exception as e:
        print(f"[ERROR] Erro ao criar serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao criar serviço"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/listar', methods=['GET'])
@login_required
def listar_servicos():
    user_id = session.get('user_id')
    print(f"[DEBUG] user_id da sessão: {user_id}")

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, c.NomeCategoria AS Categoria, s.Status
            FROM service s
            LEFT JOIN service_categoria sc ON s.ID_Service = sc.ID_Service
            LEFT JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria
            WHERE s.ID_Cliente = %s
        """, (user_id,))
        servicos_pedidos = cursor.fetchall()

        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, c.NomeCategoria AS Categoria, s.Status
            FROM service s
            LEFT JOIN service_categoria sc ON s.ID_Service = sc.ID_Service
            LEFT JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria
            WHERE s.ID_Freelancer = %s
        """, (user_id,))
        servicos_recebidos = cursor.fetchall()

        print(f"[DEBUG] servicosPedidos: {servicos_pedidos}")
        print(f"[DEBUG] servicosRecebidos: {servicos_recebidos}")

        return jsonify({"sucesso": True, "servicosPedidos": servicos_pedidos, "servicosRecebidos": servicos_recebidos}), 200
    except Exception as e:
        print(f"[ERROR] Erro ao listar serviços: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao listar serviços"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/servicos/avaliar/<int:servico_id>', methods=['POST'])
@login_required
def avaliar_servico(servico_id):
    data = request.get_json()
    nota = data.get('nota')
    comentario = data.get('comentario')
    user_id = request.cookies.get('user_id')

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO avaliacao (ID_Service, ID_Cliente, Nota, Comentario)
            VALUES (%s, %s, %s, %s)
        """, (servico_id, user_id, nota, comentario))
        conn.commit()

        return jsonify({"sucesso": True, "mensagem": "Serviço avaliado com sucesso!"}), 201
    except Exception as e:
        print(f"Erro ao avaliar serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao avaliar serviço"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
