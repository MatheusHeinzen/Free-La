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
-- Table structure for table `avaliacao`
--

DROP TABLE IF EXISTS `avaliacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacao` (
  `ID_Avaliacao` int NOT NULL AUTO_INCREMENT,
  `ID_Service` int NOT NULL,
  `ID_Avaliador` int NOT NULL,
  `TipoAvaliador` enum('cliente','freelancer') NOT NULL,
  `Nota` tinyint NOT NULL,
  `Comentario` text,
  `DataAvaliacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_Avaliacao`),
  KEY `ID_Service` (`ID_Service`),
  KEY `ID_Avaliador` (`ID_Avaliador`),
  CONSTRAINT `avaliacao_ibfk_1` FOREIGN KEY (`ID_Service`) REFERENCES `service` (`ID_Service`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `avaliacao_ibfk_2` FOREIGN KEY (`ID_Avaliador`) REFERENCES `usuario` (`ID_User`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_nota_valida` CHECK ((`Nota` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacao`
--

LOCK TABLES `avaliacao` WRITE;
/*!40000 ALTER TABLE `avaliacao` DISABLE KEYS */;
INSERT INTO `avaliacao` VALUES (1,1,10,'cliente',4,'Chutou minha capivara','2025-05-25 14:58:04'),(2,2,10,'freelancer',3,'Me pagou com uma coxinha','2025-05-26 19:21:54'),(3,2,4,'cliente',5,'Serviço bom e barato','2025-05-26 19:22:46'),(4,5,1,'freelancer',5,'Fiquei orgulhoso do trabalho q eu fiz','2025-05-26 19:43:01'),(5,5,4,'cliente',2,'Não roda no meu pc','2025-05-26 19:43:44'),(6,4,7,'freelancer',4,'O gato me mordeu mas ele é fofo','2025-05-26 19:47:00'),(7,4,4,'cliente',5,'Meu gato amou!','2025-05-26 19:47:53');
/*!40000 ALTER TABLE `avaliacao` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `atualizar_media_avaliacoes` AFTER INSERT ON `avaliacao` FOR EACH ROW BEGIN
	DECLARE freelancer_id INT;
    IF NEW.TipoAvaliador = 'cliente' THEN
        
        SELECT ID_Freelancer INTO freelancer_id FROM service WHERE ID_Service = NEW.ID_Service;
        
        IF freelancer_id IS NOT NULL THEN
            UPDATE perfil p
            SET 
                p.MediaAvaliacoes = (
                    SELECT AVG(a.Nota) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                ),
                p.TotalAvaliacoes = (
                    SELECT COUNT(*) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                )
            WHERE p.ID_Usuario = freelancer_id;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `atualizar_media_avaliacoes_update` AFTER UPDATE ON `avaliacao` FOR EACH ROW BEGIN
    DECLARE freelancer_id INT;
    
    IF NEW.TipoAvaliador = 'cliente' OR OLD.TipoAvaliador = 'cliente' THEN
        SELECT ID_Freelancer INTO freelancer_id FROM service WHERE ID_Service = NEW.ID_Service;
        
        IF freelancer_id IS NOT NULL THEN
            UPDATE perfil p
            SET 
                p.MediaAvaliacoes = (
                    SELECT AVG(a.Nota) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                ),
                p.TotalAvaliacoes = (
                    SELECT COUNT(*) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                )
            WHERE p.ID_Usuario = freelancer_id;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `atualizar_media_avaliacoes_delete` AFTER DELETE ON `avaliacao` FOR EACH ROW BEGIN
    DECLARE freelancer_id INT;
    
    IF OLD.TipoAvaliador = 'cliente' THEN
        SELECT ID_Freelancer INTO freelancer_id FROM service WHERE ID_Service = OLD.ID_Service;
        
        IF freelancer_id IS NOT NULL THEN
            UPDATE perfil p
            SET 
                p.MediaAvaliacoes = (
                    SELECT AVG(a.Nota) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                ),
                p.TotalAvaliacoes = (
                    SELECT COUNT(*) 
                    FROM avaliacao a
                    JOIN service s ON a.ID_Service = s.ID_Service
                    WHERE s.ID_Freelancer = freelancer_id AND a.TipoAvaliador = 'cliente'
                )
            WHERE p.ID_Usuario = freelancer_id;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-27 11:59:03
