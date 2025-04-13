DROP DATABASE IF EXISTS freela;
CREATE DATABASE freela;
USE freela;

/*CREATE TABLE Perfil (
    IdPerfil INT PRIMARY KEY AUTO_INCREMENT,
    Foto BLOB DEFAULT ,
    Categoria_Especificacao_ VARCHAR50,
    Bio VARCHAR250,
    fk_Usuario_IdUsuario INT
);*/


CREATE TABLE Servico (
    ID_Servico INT AUTO_INCREMENT PRIMARY KEY,
    NomeServico VARCHAR(100) NOT NULL,
    Descricao TEXT,
    DataCriacao DATE NOT NULL,
    Valor DECIMAL(10,2),
    Status ENUM('aberto', 'em_andamento', 'concluido') DEFAULT 'aberto'
);

CREATE TABLE Categoria (
    ID_Categoria INT AUTO_INCREMENT PRIMARY KEY,
    NomeCategoria VARCHAR(50) NOT NULL
);

CREATE TABLE Usuario (
    ID_User INT AUTO_INCREMENT PRIMARY KEY,
    CPF VARCHAR(14) NOT NULL UNIQUE,
    Nome VARCHAR(50) NOT NULL,
    Email VARCHAR(50) NOT NULL UNIQUE,
    Senha VARCHAR(200) NOT NULL,
    DataNasc DATE,
    Telefone VARCHAR(15),
    ImagemPerfil BLOB,
    TipoUsuario VARCHAR(20) CHECK (TipoUsuario IN ('freelancer', 'cliente')) NOT NULL DEFAULT('cliente')
);

CREATE TABLE Endereco (
    ID_Endereco INT AUTO_INCREMENT PRIMARY KEY,
    Pais VARCHAR(20) DEFAULT 'Brasil',
    CEP VARCHAR(10) NOT NULL,
    Logradouro VARCHAR(50) NOT NULL,
    Cidade VARCHAR(50) NOT NULL,
    Bairro VARCHAR(50) NOT NULL,
    Estado CHAR(2) NOT NULL,
    Numero INT NOT NULL,
    Complemento VARCHAR(50),
    fk_Servico_ID_Servico INT,
    fk_Usuario_ID_User INT,
    CONSTRAINT FK_Endereco_Servico FOREIGN KEY (fk_Servico_ID_Servico)
        REFERENCES Servico(ID_Servico)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	CONSTRAINT FK_Endereco_Usuario FOREIGN KEY (fk_Usuario_ID_User)
        REFERENCES Usuario(ID_User)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Usuario -> Categoria
CREATE TABLE Atua (
    fk_Categoria_ID_Categoria INT,
    fk_Usuario_ID_User INT,
    PRIMARY KEY (fk_Categoria_ID_Categoria, fk_Usuario_ID_User),
    CONSTRAINT FK_Atua_Categoria FOREIGN KEY (fk_Categoria_ID_Categoria)
        REFERENCES Categoria(ID_Categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT FK_Atua_Usuario FOREIGN KEY (fk_Usuario_ID_User)
        REFERENCES Usuario(ID_User)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Usuario -> Servico
CREATE TABLE Faz (
    fk_Servico_ID_Servico INT,
    fk_Usuario_ID_User INT,
    DataInicio DATE,
    DataFim DATE,
    PRIMARY KEY (fk_Servico_ID_Servico, fk_Usuario_ID_User),
    CONSTRAINT FK_Faz_Servico FOREIGN KEY (fk_Servico_ID_Servico)
        REFERENCES Servico(ID_Servico)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_Faz_Usuario FOREIGN KEY (fk_Usuario_ID_User)
        REFERENCES Usuario(ID_User)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

select * from usuario;