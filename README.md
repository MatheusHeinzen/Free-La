# Free'la

**Status**: Em desenvolvimento 🚧

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
- **Cadastro de usuário**: CRUD para gestão de usuários e entidades.
- **Autenticação segura**: Login com sessões protegidas e criptografia de dados sensíveis.
- **Interface responsiva**: Design intuitivo com HTML, CSS e JavaScript.
- **Gerenciamento de perfis**: Atualização de dados pessoais e habilidades.

### Futuras
- **Filtros e busca**: Por especialidade e tipo de serviço.
- **Avaliações**: Sistema de feedback para freelancers e clientes.

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
  - `routes/`: Endpoints da API (autenticação, perfis, habilidades).
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
*Documentação atualizada em maio de 2025.*