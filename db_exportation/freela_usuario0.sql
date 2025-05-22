-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: freela
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `ID_User` int NOT NULL AUTO_INCREMENT,
  `CPF` varchar(14) NOT NULL,
  `Nome` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Senha` varchar(255) NOT NULL,
  `DataNascimento` date DEFAULT NULL,
  `Telefone` varchar(15) DEFAULT NULL,
  `TipoUsuario` enum('freelancer','cliente') NOT NULL DEFAULT 'cliente',
  `ID_Endereco` int DEFAULT NULL,
  `DataCadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID_User`),
  UNIQUE KEY `CPF` (`CPF`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `ID_Endereco` (`ID_Endereco`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`ID_Endereco`) REFERENCES `endereco` (`ID_Endereco`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_cpf_validacao` CHECK (((length(`CPF`) = 11) or (length(`CPF`) = 14))),
  CONSTRAINT `chk_email_valido` CHECK ((`Email` like _utf8mb4'%@%.%'))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'062.495.430-74','maria','maria@gmail.com','scrypt:32768:8:1$oTfaPqVp9lw6CjbV$372bb6bf355b05751f5749ab96b409fc0258264ff6a2426cda03605b1c170ef8bfc0102544212b04386bd3c3db15fd2cf69a8c1f953f51582db00e46d9f57895','2001-01-01',NULL,'cliente',NULL,'2025-05-12 23:29:13',1),(2,'073.754.440-64','madalena','madalena@gmail.com','scrypt:32768:8:1$MocalSypA3RUJsZJ$903b07e02b939c01e1ed4cece8e4546562b7ea0258bbaa99baad3df388de469b76953f50e934280b7a7b2c1021ebab8e58bcf7f0464ddc9c06f5a3738e97b791','2002-02-02',NULL,'cliente',NULL,'2025-05-12 23:29:58',1),(3,'564.976.810-27','pedro','pedro@gmail.com','scrypt:32768:8:1$IpcWlYCwabA43wDQ$98e6b62f603130fd47101de5ec34d3287a034e82f927ecc240acc9a90e1a6801e16b14d360f37e428867aa47e7f956f90dc0f3966e63afd2e2136ff1da67153c','2003-03-03',NULL,'cliente',NULL,'2025-05-12 23:30:52',1),(4,'085.092.450-29','paulo','paulo@gmail.com','scrypt:32768:8:1$2GSX8xBr7j9M358I$458ef0ace838f92586c31e19950e94ee8228a9227a0efbb8f9daf35da8b88175897d76601e2cd8d0d9e9574db3d438d25f95ee31544f0251d0348a7a0e3bc393','2004-04-04',NULL,'cliente',NULL,'2025-05-12 23:31:34',1),(5,'432.668.700-26','alex','alex@gmail.com','scrypt:32768:8:1$CsFV5wPir4lcXHXO$acafdb9dc02d94ba830f0d2eed5d3d3b5ddc034b4400b1d5b7abe633551c45cb824073c4206a3ae8213b2493aa56177a4384436705b22f4b13f91a2649a4361b','2005-05-05',NULL,'cliente',NULL,'2025-05-12 23:32:18',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-12 23:33:00
