DROP DATABASE IF EXISTS freela;
CREATE DATABASE freela;
USE freela;

-- =============================================
-- Tabela: endereco
-- Armazena informações de endereço dos usuários
-- =============================================
CREATE TABLE endereco (
    ID_Endereco INT AUTO_INCREMENT PRIMARY KEY,
    Pais VARCHAR(20) NOT NULL DEFAULT 'Brasil',
    CEP VARCHAR(10) NOT NULL,
    Logradouro VARCHAR(50) NOT NULL,
    Cidade VARCHAR(50) NOT NULL,
    Bairro VARCHAR(50) NOT NULL,
    Estado CHAR(2) NOT NULL,
    Numero INT NOT NULL,
    Complemento VARCHAR(50),
    CONSTRAINT chk_cep_format CHECK (CEP REGEXP '^[0-9]{5}-?[0-9]{3}$'),
    CONSTRAINT chk_estado_format CHECK (Estado REGEXP '^[A-Z]{2}$')
) ;

-- =============================================
-- Tabela: usuario
-- Armazena os dados principais dos usuários
-- =============================================
CREATE TABLE usuario (
    ID_User INT AUTO_INCREMENT PRIMARY KEY,
    CPF VARCHAR(14) NOT NULL UNIQUE,
    Nome VARCHAR(50) NOT NULL,
    Email VARCHAR(50) NOT NULL UNIQUE,
    Senha VARCHAR(255) NOT NULL,
    DataNascimento DATE,
    Telefone VARCHAR(15),
    TipoUsuario ENUM('freelancer', 'cliente') NOT NULL DEFAULT 'cliente',
    ID_Endereco INT UNIQUE,
    DataCadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (ID_Endereco) REFERENCES endereco(ID_Endereco)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_cpf_validacao CHECK (LENGTH(CPF) = 11 OR LENGTH(CPF) = 14),
    CONSTRAINT chk_email_valido CHECK (Email LIKE '%@%.%')
    );

-- =============================================
-- Tabela: categoria
-- Armazena as categorias de serviços disponíveis
-- =============================================
CREATE TABLE categoria (
    ID_Categoria INT AUTO_INCREMENT PRIMARY KEY,
    NomeCategoria VARCHAR(50) NOT NULL UNIQUE,
    Descricao TEXT,
    DataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Ativa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Tabela: perfil
-- Armazena informações complementares dos freelancers
-- =============================================
CREATE TABLE perfil (
    IdPerfil INT AUTO_INCREMENT PRIMARY KEY,
    Foto VARCHAR(255),
    Categoria_Especificacao VARCHAR(50),
    Bio TEXT,
    ID_Usuario INT NOT NULL UNIQUE,
    DataAtualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Usuario) REFERENCES usuario(ID_User)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_bio_tamanho CHECK (LENGTH(Bio) <= 500)
);

-- =============================================
-- Tabela: service
-- Armazena os serviços oferecidos no sistema
-- =============================================
CREATE TABLE service (
    ID_Service INT AUTO_INCREMENT PRIMARY KEY,
    NomeService VARCHAR(100) NOT NULL,
    Descricao TEXT NOT NULL,
    DataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('disponivel', 'em_andamento', 'concluido', 'cancelado', 'pausado') NOT NULL DEFAULT 'disponivel',
    ID_Usuario INT NOT NULL,
    DataConclusao DATETIME,
    FOREIGN KEY (ID_Usuario) REFERENCES usuario(ID_User)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_nome_service_valido CHECK (LENGTH(NomeService) >= 5),
    CONSTRAINT chk_data_conclusao_valida CHECK (DataConclusao IS NULL OR DataConclusao >= DataCriacao)
);

-- =============================================
-- Tabela: usuario_categoria
-- Relacionamento N:N entre usuários e categorias
-- =============================================
CREATE TABLE usuario_categoria (
    ID_Usuario INT NOT NULL,
    ID_Categoria INT NOT NULL,
    DataAssociacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Usuario, ID_Categoria),
    FOREIGN KEY (ID_Usuario) REFERENCES usuario(ID_User)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (ID_Categoria) REFERENCES categoria(ID_Categoria)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- Tabela: avaliacao
-- Armazena as avaliações dos serviços
-- =============================================
CREATE TABLE avaliacao (
    ID_Avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    ID_Service INT NOT NULL,
    ID_Cliente INT NOT NULL,
    ID_Freelancer INT NOT NULL,
    Nota TINYINT NOT NULL,
    Comentario TEXT,
    DataAvaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Resposta TEXT,
    DataResposta DATETIME,
    FOREIGN KEY (ID_Service) REFERENCES service(ID_Service)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (ID_Cliente) REFERENCES usuario(ID_User)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (ID_Freelancer) REFERENCES usuario(ID_User)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_nota_valida CHECK (Nota BETWEEN 1 AND 5),
    CONSTRAINT uc_avaliacao_unica UNIQUE (ID_Service, ID_Cliente),
    CONSTRAINT chk_data_resposta_valida CHECK (DataResposta IS NULL OR DataResposta >= DataAvaliacao)
);

-- =============================================
-- Índices adicionais para melhor performance
-- =============================================
CREATE INDEX idx_usuario_tipo ON usuario(TipoUsuario);
CREATE INDEX idx_service_status ON service(Status);
CREATE INDEX idx_service_usuario ON service(ID_Usuario);
CREATE INDEX idx_avaliacao_freelancer ON avaliacao(ID_Freelancer);
CREATE INDEX idx_avaliacao_data ON avaliacao(DataAvaliacao);