from flask import Blueprint, request, jsonify, session
from app.utils.db import get_db_connection
from app.utils.decorators import login_required

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
        service_id = cursor.lastrowid  # Pega o ID do serviço recém-criado

        # Salva a categoria na tabela de ligação
        cursor.execute("""
            SELECT ID_Categoria FROM categoria WHERE ID_Categoria = %s OR NomeCategoria = %s
        """, (categoria, categoria))
        cat = cursor.fetchone()
        if cat:
            cursor.execute("""
                INSERT INTO service_categoria (ID_Service, ID_Categoria) VALUES (%s, %s)
            """, (service_id, cat[0]))

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

@service_bp.route('/avaliar/<int:servico_id>', methods=['POST', 'PUT'])
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
        cursor = conn.cursor(dictionary=True)
        # Descobre se o usuário é cliente ou freelancer do serviço
        cursor.execute("SELECT ID_Cliente, ID_Freelancer FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"sucesso": False, "erro": "Serviço não encontrado."}), 404

        id_cliente = result['ID_Cliente']
        id_freelancer = result['ID_Freelancer']

        if str(user_id) == str(id_cliente):
            tipo_avaliador = 'cliente'
            id_avaliador = user_id
        elif str(user_id) == str(id_freelancer):
            tipo_avaliador = 'freelancer'
            id_avaliador = user_id
        else:
            return jsonify({"sucesso": False, "erro": "Não autorizado a avaliar este serviço."}), 403

        # Verifica se já existe avaliação desse usuário para esse serviço
        cursor.execute("""
            SELECT ID_Avaliacao FROM avaliacao 
            WHERE ID_Service = %s AND ID_Avaliador = %s AND TipoAvaliador = %s
        """, (servico_id, id_avaliador, tipo_avaliador))
        avaliacao_existente = cursor.fetchone()

        if request.method == 'POST':
            if avaliacao_existente:
                # Se já existe, faz update (reavaliar)
                cursor.execute("""
                    UPDATE avaliacao SET Nota = %s, Comentario = %s, DataAvaliacao = NOW()
                    WHERE ID_Avaliacao = %s
                """, (nota, comentario, avaliacao_existente['ID_Avaliacao']))
                conn.commit()
                return jsonify({"sucesso": True, "mensagem": "Avaliação atualizada com sucesso!"}), 200
            else:
                # Cria nova avaliação
                cursor.execute("""
                    INSERT INTO avaliacao (ID_Service, ID_Avaliador, TipoAvaliador, Nota, Comentario)
                    VALUES (%s, %s, %s, %s, %s)
                """, (servico_id, id_avaliador, tipo_avaliador, nota, comentario))
                conn.commit()
                return jsonify({"sucesso": True, "mensagem": "Serviço avaliado com sucesso!"}), 201

        elif request.method == 'PUT':
            if not avaliacao_existente:
                return jsonify({"sucesso": False, "erro": "Avaliação não encontrada para atualizar."}), 404
            cursor.execute("""
                UPDATE avaliacao SET Nota = %s, Comentario = %s, DataAvaliacao = NOW()
                WHERE ID_Avaliacao = %s
            """, (nota, comentario, avaliacao_existente['ID_Avaliacao']))
            conn.commit()
            return jsonify({"sucesso": True, "mensagem": "Avaliação atualizada com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao avaliar serviço: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao avaliar serviço"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/avaliar/<int:servico_id>', methods=['DELETE'])
@login_required
def deletar_avaliacao(servico_id):
    user_id = session.get('user_id')
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Descobre se o usuário é cliente ou freelancer do serviço
        cursor.execute("SELECT ID_Cliente, ID_Freelancer FROM service WHERE ID_Service = %s", (servico_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"sucesso": False, "erro": "Serviço não encontrado."}), 404

        id_cliente = result['ID_Cliente']
        id_freelancer = result['ID_Freelancer']

        if str(user_id) == str(id_cliente):
            tipo_avaliador = 'cliente'
            id_avaliador = user_id
        elif str(user_id) == str(id_freelancer):
            tipo_avaliador = 'freelancer'
            id_avaliador = user_id
        else:
            return jsonify({"sucesso": False, "erro": "Não autorizado a deletar esta avaliação."}), 403

        # Verifica se existe avaliação
        cursor.execute("""
            SELECT ID_Avaliacao FROM avaliacao 
            WHERE ID_Service = %s AND ID_Avaliador = %s AND TipoAvaliador = %s
        """, (servico_id, id_avaliador, tipo_avaliador))
        avaliacao = cursor.fetchone()
        if not avaliacao:
            return jsonify({"sucesso": False, "erro": "Avaliação não encontrada."}), 404

        cursor.execute("DELETE FROM avaliacao WHERE ID_Avaliacao = %s", (avaliacao['ID_Avaliacao'],))
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Avaliação deletada com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao deletar avaliação: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao deletar avaliação"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/avaliacoes/freelancer/<int:freelancer_id>', methods=['GET'])
def listar_avaliacoes_freelancer(freelancer_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.Nota, a.Comentario, a.DataAvaliacao, u.Nome, s.NomeService
            FROM avaliacao a
            JOIN usuario u ON a.ID_Avaliador = u.ID_User
            JOIN service s ON a.ID_Service = s.ID_Service
            WHERE s.ID_Freelancer = %s AND a.TipoAvaliador = 'cliente'
            ORDER BY a.DataAvaliacao DESC
        """, (freelancer_id,))
        avaliacoes = cursor.fetchall()
        return jsonify({"sucesso": True, "avaliacoes": avaliacoes}), 200
    except Exception as e:
        print(f"[ERROR] Erro ao listar avaliações do freelancer: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao listar avaliações"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@service_bp.route('/avaliacoes/usuario', methods=['GET'])
@login_required
def avaliacoes_usuario_para_servicos():
    """
    Retorna lista de avaliações do usuário logado para os serviços informados (por ID).
    Query param: ids=1,2,3
    """
    user_id = session.get('user_id')
    ids = request.args.get('ids', '')
    if not ids:
        return jsonify({"sucesso": True, "avaliacoes": []})
    id_list = [int(i) for i in ids.split(',') if i.isdigit()]
    if not id_list:
        return jsonify({"sucesso": True, "avaliacoes": []})
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Busca avaliações do usuário logado para esses serviços
        cursor.execute("""
            SELECT ID_Service, ID_Avaliacao, Nota, Comentario FROM avaliacao
            WHERE ID_Avaliador = %s AND ID_Service IN ({})
        """.format(','.join(['%s'] * len(id_list))), tuple([user_id] + id_list))
        avaliacoes = cursor.fetchall()
        return jsonify({"sucesso": True, "avaliacoes": avaliacoes})
    except Exception as e:
        print(f"[ERROR] Erro ao buscar avaliações do usuário: {e}")
        return jsonify({"sucesso": False, "erro": "Erro ao buscar avaliações"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
