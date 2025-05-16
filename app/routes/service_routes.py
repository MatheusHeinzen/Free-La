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

        # Serviços pedidos em andamento
        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, 
                   (SELECT c.NomeCategoria FROM service_categoria sc 
                    JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria 
                    WHERE sc.ID_Service = s.ID_Service LIMIT 1) AS Categoria,
                   s.Status
            FROM service s
            WHERE s.ID_Cliente = %s AND s.Status != 'concluido'
        """, (user_id,))
        servicos_pedidos = cursor.fetchall()

        # Serviços pedidos concluídos
        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, 
                   (SELECT c.NomeCategoria FROM service_categoria sc 
                    JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria 
                    WHERE sc.ID_Service = s.ID_Service LIMIT 1) AS Categoria,
                   s.Status
            FROM service s
            WHERE s.ID_Cliente = %s AND s.Status = 'concluido'
        """, (user_id,))
        servicos_pedidos_concluidos = cursor.fetchall()

        # Serviços recebidos em andamento
        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, 
                   (SELECT c.NomeCategoria FROM service_categoria sc 
                    JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria 
                    WHERE sc.ID_Service = s.ID_Service LIMIT 1) AS Categoria,
                   s.Status
            FROM service s
            WHERE s.ID_Freelancer = %s AND s.Status != 'concluido'
        """, (user_id,))
        servicos_recebidos = cursor.fetchall()

        # Serviços recebidos concluídos
        cursor.execute("""
            SELECT s.ID_Service, s.NomeService AS Nome, s.Descricao, 
                   (SELECT c.NomeCategoria FROM service_categoria sc 
                    JOIN categoria c ON sc.ID_Categoria = c.ID_Categoria 
                    WHERE sc.ID_Service = s.ID_Service LIMIT 1) AS Categoria,
                   s.Status
            FROM service s
            WHERE s.ID_Freelancer = %s AND s.Status = 'concluido'
        """, (user_id,))
        servicos_recebidos_concluidos = cursor.fetchall()

        print(f"[DEBUG] servicosPedidos: {servicos_pedidos}")
        print(f"[DEBUG] servicosPedidosConcluidos: {servicos_pedidos_concluidos}")
        print(f"[DEBUG] servicosRecebidos: {servicos_recebidos}")
        print(f"[DEBUG] servicosRecebidosConcluidos: {servicos_recebidos_concluidos}")

        return jsonify({
            "sucesso": True,
            "servicosPedidos": servicos_pedidos,
            "servicosPedidosConcluidos": servicos_pedidos_concluidos,
            "servicosRecebidos": servicos_recebidos,
            "servicosRecebidosConcluidos": servicos_recebidos_concluidos
        }), 200
    except Exception as e:
        print(f"[ERROR] Erro ao listar serviços: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao listar serviços"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/deletar/<int:servico_id>', methods=['DELETE'])
@login_required
def deletar_servico(servico_id):
    user_id = session.get('user_id')
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Só o cliente pode deletar o serviço
        cursor.execute("SELECT ID_Cliente FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result or str(result[0]) != str(user_id):
            return jsonify({"sucesso": False, "erro": "Não autorizado a deletar este serviço."}), 403

        # Remove dependências na tabela service_categoria
        cursor.execute("DELETE FROM service_categoria WHERE ID_Service = %s", (servico_id,))
        # Remove o serviço
        cursor.execute("DELETE FROM service WHERE ID_Service = %s", (servico_id,))
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Serviço deletado com sucesso!"}), 200
    except Exception as e:
        print(f"[ERROR] Erro ao deletar serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao deletar serviço"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/concluir/<int:servico_id>', methods=['POST'])
@login_required
def concluir_servico(servico_id):
    user_id = session.get('user_id')
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Só o freelancer pode concluir o serviço
        cursor.execute("SELECT ID_Freelancer FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result or str(result[0]) != str(user_id):
            return jsonify({"sucesso": False, "erro": "Não autorizado a concluir este serviço."}), 403

        cursor.execute("""
            UPDATE service SET Status = 'concluido', DataConclusao = NOW() WHERE ID_Service = %s
        """, (servico_id,))
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Serviço concluído com sucesso!"}), 200
    except Exception as e:
        print(f"[ERROR] Erro ao concluir serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao concluir serviço"}), 500
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
    user_id = session.get('user_id')

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Descobre se o usuário é cliente ou freelancer do serviço
        cursor.execute("SELECT ID_Cliente, ID_Freelancer FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"sucesso": False, "erro": "Serviço não encontrado."}), 404

        id_cliente, id_freelancer = result
        if str(user_id) == str(id_cliente):
            cursor.execute("""
                INSERT INTO avaliacao (ID_Service, ID_Cliente, Nota, Comentario)
                VALUES (%s, %s, %s, %s)
            """, (servico_id, user_id, nota, comentario))
        elif str(user_id) == str(id_freelancer):
            cursor.execute("""
                INSERT INTO avaliacao (ID_Service, ID_Freelancer, Nota, Comentario)
                VALUES (%s, %s, %s, %s)
            """, (servico_id, user_id, nota, comentario))
        else:
            return jsonify({"sucesso": False, "erro": "Não autorizado a avaliar este serviço."}), 403

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

@service_bp.route('/editar/<int:servico_id>', methods=['PUT'])
@login_required
def editar_servico(servico_id):
    user_id = session.get('user_id')
    data = request.get_json()
    nome = data.get('nome')
    descricao = data.get('descricao')
    categoria = data.get('categoria')

    if not (nome and descricao and categoria):
        return jsonify({"sucesso": False, "erro": "Dados incompletos para editar o serviço"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Só o cliente pode editar o serviço
        cursor.execute("SELECT ID_Cliente FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result or str(result[0]) != str(user_id):
            return jsonify({"sucesso": False, "erro": "Não autorizado a editar este serviço."}), 403

        cursor.execute("""
            UPDATE service SET NomeService = %s, Descricao = %s WHERE ID_Service = %s
        """, (nome, descricao, servico_id))
        # Atualiza categoria na tabela de ligação
        cursor.execute("""
            SELECT ID_Categoria FROM categoria WHERE NomeCategoria = %s
        """, (categoria,))
        cat = cursor.fetchone()
        if cat:
            cursor.execute("""
                DELETE FROM service_categoria WHERE ID_Service = %s
            """, (servico_id,))
            cursor.execute("""
                INSERT INTO service_categoria (ID_Service, ID_Categoria) VALUES (%s, %s)
            """, (servico_id, cat[0]))
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Serviço editado com sucesso!"}), 200
    except Exception as e:
        print(f"[ERROR] Erro ao editar serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao editar serviço"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
