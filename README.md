# Free'la

**Status**: Em desenvolvimento 🚧 | Estágio Final - Últimos ajustes

## Colaboradores:
- Edmund Soares de Souza
- Bruna da Silva Carnelossi
- Matheus Henrique Heinzen
- Vinicius Lima Teider

## Sobre o projeto
Free'la é uma plataforma para freelancers, dedicada à divulgação de trabalhadores informais e seus serviços. O projeto foi criado para a matéria de "Experiência Criativa: Implementação de Sistemas de Informação" e será escalonado para outros semestres, sendo usado como TCC da equipe.

A plataforma conecta freelancers e consumidores, permitindo avaliações mútuas, mas não é um marketplace (não inclui chat interno, gateway de pagamento ou publicações no primeiro momento).

---

## Objetivos
1. Permitir que usuários/profissionais ofereçam seus serviços livremente.
2. Apresentar aos consumidores uma variedade de prestadores de serviço.
3. Centralizar profissionais de diferentes nichos em uma única rede social.

---

## Funcionalidades
### Implementadas
- **Cadastro e autenticação de usuário**: CRUD completo para usuários, com login seguro (hash de senha).
- **Gestão de perfis**: Atualização de dados pessoais, endereço, habilidades e preferências de contato.
- **Integração com API externa**: Consulta automática de endereço por CEP.
- **Preferências de contato**: Usuário escolhe se exibe email/telefone no perfil público.
- **CRUD de serviços**: Clientes requisitam, editam e deletam serviços; freelancers aceitam ou recusam.
- **Avaliação de freelancers**: Clientes avaliam freelancers após conclusão do serviço (média e comentários).
- **Interface responsiva**: HTML, CSS e JS com navegação adaptada para desktop e mobile.
- **Página de perfil público**: Exibe dados, contatos (conforme preferências), habilidades e avaliações.
- **Atualização de senha**: Usuário pode alterar sua senha com confirmação da senha atual.
- **Deleção de conta**: Usuário pode excluir seu perfil e todos os dados associados.
- **Validação de dados**: CPF, email, telefone e endereço validados no front e back-end.
- **Sessão segura**: Controle de sessão e logout.

### Futuras
- **JWT no login**: Planejado para substituir sessões por autenticação baseada em token JWT.
- **CRUD de avaliações**: Transformar avaliações em um CRUD completo (criar, listar, editar, deletar avaliações).
- **Filtros e busca avançada**: Por especialidade, localização e tipo de serviço.

---

## Tecnologias
- **Front-end**: HTML, CSS, JavaScript.
- **Back-end**: Flask (Python).
- **Banco de Dados**: MySQL.

---

## Estrutura do Projeto
### Principais diretórios
- **`/app`**: Lógica principal (models, routes, services).
  - `models/`: Definição de entidades (usuários, categorias, etc.).
  - `routes/`: Endpoints da API (autenticação, perfis, habilidades, serviços, avaliações).
  - `services/`: Regras de negócio e integração com o banco de dados.
  - `/utils`: Auxiliares (validação, sessão, conexão com banco de dados).
- **`/static`**: Arquivos estáticos (CSS, JS, imagens).
- **`/templates`**: Páginas HTML (homepage, perfil, etc.).


### Arquivos críticos
- **`run.py`**: Ponto de entrada da aplicação (ignorar `app.py`).
- **`sql_freela.sql`**: Script de criação do banco de dados.

---

## Pré-requisitos e Execução
1. Instale as dependências:
   ```bash
   pip install flask flask-cors mysql-connector-python bcrypt
   ```
2. Configure o banco de dados MySQL usando `sql_freela.sql`.
3. Execute o projeto:
   ```bash
   python run.py
   ```
   Acesse via `http://localhost:5000`.

---

## Contribuição  
Acompanhe o progresso e contribua com sugestões:  
**Trello**: [Link para o board](https://trello.com/invite/b/67be564609ead710a8ad4cd7/ATTI209ac0b23196682f9f6e65f3239080859571DAA2/projeto-ex2).  

---

**Próximos passos:**  
- Adicionar autenticação JWT no login.
- Transformar avaliações em um CRUD completo (criar, listar, editar, deletar).

---  
*Documentação atualizada em maio de 2025.*