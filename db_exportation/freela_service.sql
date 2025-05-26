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
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `ID_Service` int NOT NULL AUTO_INCREMENT,
  `NomeService` varchar(100) NOT NULL,
  `Descricao` text NOT NULL,
  `DataCriacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('disponivel','em_andamento','concluido','cancelado','pausado') NOT NULL DEFAULT 'disponivel',
  `ID_Cliente` int NOT NULL,
  `ID_Freelancer` int DEFAULT NULL,
  `DataConclusao` datetime DEFAULT NULL,
  PRIMARY KEY (`ID_Service`),
  KEY `ID_Cliente` (`ID_Cliente`),
  KEY `ID_Freelancer` (`ID_Freelancer`),
  CONSTRAINT `service_ibfk_1` FOREIGN KEY (`ID_Cliente`) REFERENCES `usuario` (`ID_User`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `service_ibfk_2` FOREIGN KEY (`ID_Freelancer`) REFERENCES `usuario` (`ID_User`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_data_conclusao_valida` CHECK (((`DataConclusao` is null) or (`DataConclusao` >= `DataCriacao`))),
  CONSTRAINT `chk_nome_service_valido` CHECK ((length(`NomeService`) >= 5))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (1,'Adestre a minha capivara chamada Caio','Ela é muito doida e quase matou 3 senhoras aqui da rua.','2025-05-25 14:56:50','concluido',10,2,'2025-05-25 14:57:26');
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-25 21:26:44
