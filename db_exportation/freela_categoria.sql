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
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `ID_Categoria` int NOT NULL AUTO_INCREMENT,
  `NomeCategoria` varchar(50) NOT NULL,
  `Descricao` text,
  `DataCriacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Ativa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID_Categoria`),
  UNIQUE KEY `NomeCategoria` (`NomeCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Desenvolvimento WEB',NULL,'2025-05-25 14:01:23',1),(2,'Jardinagem',NULL,'2025-05-25 14:01:23',1),(3,'Eletrica',NULL,'2025-05-25 14:01:23',1),(4,'Mecânica',NULL,'2025-05-25 14:01:23',1),(5,'Limpeza',NULL,'2025-05-25 14:01:23',1),(6,'Fotografia',NULL,'2025-05-25 14:01:23',1),(7,'Design',NULL,'2025-05-25 14:01:23',1),(8,'Desenvolvimento de Jogos',NULL,'2025-05-25 14:01:23',1),(9,'Marketing Digital',NULL,'2025-05-25 14:01:23',1),(10,'Redação',NULL,'2025-05-25 14:01:23',1),(11,'Tradução',NULL,'2025-05-25 14:01:23',1),(12,'Consultoria',NULL,'2025-05-25 14:01:23',1),(13,'Educação',NULL,'2025-05-25 14:01:23',1),(14,'Saúde e Bem-estar',NULL,'2025-05-25 14:01:23',1),(15,'Adestrador',NULL,'2025-05-25 14:34:29',1),(16,'Músico',NULL,'2025-05-25 14:41:30',1),(17,'Piloto',NULL,'2025-05-25 14:41:30',1),(18,'Paleontólogo',NULL,'2025-05-25 14:47:56',1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-27 11:59:03
