-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: freela
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `endereco`
--

DROP TABLE IF EXISTS `endereco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endereco` (
  `ID_Endereco` int NOT NULL AUTO_INCREMENT,
  `Pais` varchar(20) NOT NULL DEFAULT 'Brasil',
  `CEP` varchar(10) DEFAULT NULL,
  `Logradouro` varchar(50) DEFAULT NULL,
  `Cidade` varchar(50) DEFAULT NULL,
  `Bairro` varchar(50) DEFAULT NULL,
  `Estado` char(2) DEFAULT NULL,
  `Numero` int DEFAULT NULL,
  `Complemento` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_Endereco`),
  CONSTRAINT `chk_cep_format` CHECK (regexp_like(`CEP`,_utf8mb4'^[0-9]{5}-?[0-9]{3}$')),
  CONSTRAINT `chk_estado_format` CHECK (regexp_like(`Estado`,_utf8mb4'^[A-Z]{2}$'))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endereco`
--

LOCK TABLES `endereco` WRITE;
/*!40000 ALTER TABLE `endereco` DISABLE KEYS */;
INSERT INTO `endereco` VALUES (1,'Brasil','83829-018','Avenida Nossa Senhora Aparecida','Fazenda Rio Grande','Santa Terezinha','PR',490,'Casa 04'),(2,'Brasil','83823-168','Rua Honduras','Fazenda Rio Grande','Nações','PR',18,'Casa 02'),(3,'Brasil','83823-212','Rua Libéria','Fazenda Rio Grande','Nações','PR',15,'N/A'),(4,'Brasil','82300-332','Avenida Vereador Toaldo Túlio','Curitiba','São Braz','PR',127,'N/A'),(5,'Brasil','74483-830','Rua LP1','Goiânia','Residencial Luana Park','GO',830,'Linkin Park'),(6,'Brasil','83407-235','Rua Luíz Colere','Colombo','São Gabriel','PR',234,'N/A'),(7,'Brasil','04474-390','Avenida Adhemar Gonzaga','São Paulo','Praia do Leblon','SP',12,'GOAT'),(8,'Brasil','65148-970','Praça da Saúde','Axixá','Centro','MA',148,'Casa do Patrick'),(9,'Brasil','79035-190','Rua Itami','Campo Grande','Jardim Montevidéu','MS',2,'Aquela Igreja to aqui na frente');
/*!40000 ALTER TABLE `endereco` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-25 21:26:45
