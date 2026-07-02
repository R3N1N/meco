-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: eyecare_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment_slots`
--

DROP TABLE IF EXISTS `appointment_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `slot_date` date NOT NULL,
  `start_time` varchar(20) NOT NULL,
  `end_time` varchar(20) NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  `appointment_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `appointment_slots_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_slots_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_slots`
--

LOCK TABLES `appointment_slots` WRITE;
/*!40000 ALTER TABLE `appointment_slots` DISABLE KEYS */;
INSERT INTO `appointment_slots` VALUES (1,1,'2026-06-22','10:00','10:15',1,2,'2026-06-19 13:26:08','2026-06-21 15:46:21'),(2,1,'2026-06-22','10:15','10:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(3,1,'2026-06-22','10:30','10:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(4,1,'2026-06-22','10:45','11:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(5,1,'2026-06-22','11:00','11:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(6,1,'2026-06-22','11:15','11:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(7,1,'2026-06-22','11:30','11:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(8,1,'2026-06-22','11:45','12:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(9,1,'2026-06-22','12:00','12:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(10,1,'2026-06-22','12:15','12:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(11,1,'2026-06-22','12:30','12:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(12,1,'2026-06-22','12:45','13:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(13,1,'2026-06-22','13:00','13:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(14,1,'2026-06-22','13:15','13:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(15,1,'2026-06-22','13:30','13:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(16,1,'2026-06-22','13:45','14:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(17,1,'2026-06-22','14:00','14:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(18,1,'2026-06-22','14:15','14:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(19,1,'2026-06-22','14:30','14:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(20,1,'2026-06-22','14:45','15:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(21,1,'2026-06-22','15:00','15:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(22,1,'2026-06-22','15:15','15:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(23,1,'2026-06-22','15:30','15:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(24,1,'2026-06-22','15:45','16:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(25,1,'2026-06-22','16:00','16:15',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(26,1,'2026-06-22','16:15','16:30',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(27,1,'2026-06-22','16:30','16:45',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(28,1,'2026-06-22','16:45','17:00',0,NULL,'2026-06-19 13:26:08','2026-06-19 13:26:08'),(29,1,'2026-06-21','10:00','10:00',0,NULL,'2026-06-19 13:47:45','2026-06-19 13:47:53'),(30,1,'2026-06-20','10:00','10:00',0,NULL,'2026-06-19 13:47:53','2026-06-21 15:46:21'),(31,1,'2026-06-24','10:00','10:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(32,1,'2026-06-24','10:15','10:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(33,1,'2026-06-24','10:30','10:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(34,1,'2026-06-24','10:45','11:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(35,1,'2026-06-24','11:00','11:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(36,1,'2026-06-24','11:15','11:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(37,1,'2026-06-24','11:30','11:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(38,1,'2026-06-24','11:45','12:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(39,1,'2026-06-24','12:00','12:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(40,1,'2026-06-24','12:15','12:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(41,1,'2026-06-24','12:30','12:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(42,1,'2026-06-24','12:45','13:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(43,1,'2026-06-24','13:00','13:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(44,1,'2026-06-24','13:15','13:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(45,1,'2026-06-24','13:30','13:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(46,1,'2026-06-24','13:45','14:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(47,1,'2026-06-24','14:00','14:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(48,1,'2026-06-24','14:15','14:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(49,1,'2026-06-24','14:30','14:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(50,1,'2026-06-24','14:45','15:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(51,1,'2026-06-24','15:00','15:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(52,1,'2026-06-24','15:15','15:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(53,1,'2026-06-24','15:30','15:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(54,1,'2026-06-24','15:45','16:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(55,1,'2026-06-24','16:00','16:15',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(56,1,'2026-06-24','16:15','16:30',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(57,1,'2026-06-24','16:30','16:45',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(58,1,'2026-06-24','16:45','17:00',0,NULL,'2026-06-22 15:04:36','2026-06-22 15:04:36'),(59,1,'2026-06-26','10:00','10:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(60,1,'2026-06-26','10:15','10:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(61,1,'2026-06-26','10:30','10:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(62,1,'2026-06-26','10:45','11:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(63,1,'2026-06-26','11:00','11:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(64,1,'2026-06-26','11:15','11:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(65,1,'2026-06-26','11:30','11:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(66,1,'2026-06-26','11:45','12:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(67,1,'2026-06-26','12:00','12:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(68,1,'2026-06-26','12:15','12:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(69,1,'2026-06-26','12:30','12:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(70,1,'2026-06-26','12:45','13:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(71,1,'2026-06-26','13:00','13:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(72,1,'2026-06-26','13:15','13:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(73,1,'2026-06-26','13:30','13:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(74,1,'2026-06-26','13:45','14:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(75,1,'2026-06-26','14:00','14:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(76,1,'2026-06-26','14:15','14:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(77,1,'2026-06-26','14:30','14:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(78,1,'2026-06-26','14:45','15:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(79,1,'2026-06-26','15:00','15:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(80,1,'2026-06-26','15:15','15:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(81,1,'2026-06-26','15:30','15:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(82,1,'2026-06-26','15:45','16:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(83,1,'2026-06-26','16:00','16:15',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(84,1,'2026-06-26','16:15','16:30',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(85,1,'2026-06-26','16:30','16:45',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(86,1,'2026-06-26','16:45','17:00',0,NULL,'2026-06-22 15:04:42','2026-06-22 15:04:42'),(87,3,'2026-06-24','10:00','10:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(88,3,'2026-06-24','10:15','10:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(89,3,'2026-06-24','10:30','10:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(90,3,'2026-06-24','10:45','11:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(91,3,'2026-06-24','11:00','11:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(92,3,'2026-06-24','11:15','11:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(93,3,'2026-06-24','11:30','11:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(94,3,'2026-06-24','11:45','12:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(95,3,'2026-06-24','12:00','12:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(96,3,'2026-06-24','12:15','12:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(97,3,'2026-06-24','12:30','12:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(98,3,'2026-06-24','12:45','13:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(99,3,'2026-06-24','13:00','13:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(100,3,'2026-06-24','13:15','13:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(101,3,'2026-06-24','13:30','13:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(102,3,'2026-06-24','13:45','14:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(103,3,'2026-06-24','14:00','14:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(104,3,'2026-06-24','14:15','14:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(105,3,'2026-06-24','14:30','14:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(106,3,'2026-06-24','14:45','15:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(107,3,'2026-06-24','15:00','15:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(108,3,'2026-06-24','15:15','15:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(109,3,'2026-06-24','15:30','15:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(110,3,'2026-06-24','15:45','16:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(111,3,'2026-06-24','16:00','16:15',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(112,3,'2026-06-24','16:15','16:30',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(113,3,'2026-06-24','16:30','16:45',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(114,3,'2026-06-24','16:45','17:00',0,NULL,'2026-06-22 15:08:09','2026-06-22 15:08:09'),(115,3,'2026-06-26','10:00','10:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(116,3,'2026-06-26','10:15','10:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(117,3,'2026-06-26','10:30','10:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(118,3,'2026-06-26','10:45','11:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(119,3,'2026-06-26','11:00','11:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(120,3,'2026-06-26','11:15','11:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(121,3,'2026-06-26','11:30','11:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(122,3,'2026-06-26','11:45','12:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(123,3,'2026-06-26','12:00','12:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(124,3,'2026-06-26','12:15','12:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(125,3,'2026-06-26','12:30','12:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(126,3,'2026-06-26','12:45','13:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(127,3,'2026-06-26','13:00','13:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(128,3,'2026-06-26','13:15','13:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(129,3,'2026-06-26','13:30','13:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(130,3,'2026-06-26','13:45','14:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(131,3,'2026-06-26','14:00','14:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(132,3,'2026-06-26','14:15','14:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(133,3,'2026-06-26','14:30','14:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(134,3,'2026-06-26','14:45','15:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(135,3,'2026-06-26','15:00','15:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(136,3,'2026-06-26','15:15','15:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(137,3,'2026-06-26','15:30','15:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(138,3,'2026-06-26','15:45','16:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(139,3,'2026-06-26','16:00','16:15',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(140,3,'2026-06-26','16:15','16:30',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(141,3,'2026-06-26','16:30','16:45',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(142,3,'2026-06-26','16:45','17:00',0,NULL,'2026-06-22 15:08:14','2026-06-22 15:08:14'),(143,3,'2026-06-29','10:00','10:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(144,3,'2026-06-29','10:15','10:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(145,3,'2026-06-29','10:30','10:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(146,3,'2026-06-29','10:45','11:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(147,3,'2026-06-29','11:00','11:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(148,3,'2026-06-29','11:15','11:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(149,3,'2026-06-29','11:30','11:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(150,3,'2026-06-29','11:45','12:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(151,3,'2026-06-29','12:00','12:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(152,3,'2026-06-29','12:15','12:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(153,3,'2026-06-29','12:30','12:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(154,3,'2026-06-29','12:45','13:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(155,3,'2026-06-29','13:00','13:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(156,3,'2026-06-29','13:15','13:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(157,3,'2026-06-29','13:30','13:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(158,3,'2026-06-29','13:45','14:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(159,3,'2026-06-29','14:00','14:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(160,3,'2026-06-29','14:15','14:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(161,3,'2026-06-29','14:30','14:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(162,3,'2026-06-29','14:45','15:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(163,3,'2026-06-29','15:00','15:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(164,3,'2026-06-29','15:15','15:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(165,3,'2026-06-29','15:30','15:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(166,3,'2026-06-29','15:45','16:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(167,3,'2026-06-29','16:00','16:15',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(168,3,'2026-06-29','16:15','16:30',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(169,3,'2026-06-29','16:30','16:45',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17'),(170,3,'2026-06-29','16:45','17:00',0,NULL,'2026-06-22 15:08:17','2026-06-22 15:08:17');
/*!40000 ALTER TABLE `appointment_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `doctor_id` int DEFAULT NULL,
  `appointment_type` enum('clinic','home') NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(20) NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `address` text,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,NULL,'zzz','zz@gmail.com','123',1,'home','2026-06-22','10:15','completed','Naya Naikap, Chandragiri-14, Bhaltaar, Chandragiri Municipality, Kathmandu, Bagamati Province, 44618, Nepal',27.69222397,85.26707267,'','2026-06-19 13:29:20','2026-06-21 15:56:46'),(2,NULL,'sfaF','AA@gmail.com','12',1,'clinic','2026-06-22','10:00','completed',NULL,NULL,NULL,'','2026-06-19 13:46:40','2026-06-21 15:57:32');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_schedules`
--

DROP TABLE IF EXISTS `doctor_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` varchar(20) NOT NULL,
  `end_time` varchar(20) NOT NULL,
  `slot_duration` int DEFAULT '15',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `doctor_schedules_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_schedules`
--

LOCK TABLES `doctor_schedules` WRITE;
/*!40000 ALTER TABLE `doctor_schedules` DISABLE KEYS */;
INSERT INTO `doctor_schedules` VALUES (1,1,'Monday','10:00','17:00',15,'2026-06-19 13:20:28','2026-06-19 13:20:28'),(2,1,'Wednesday','10:00','17:00',15,'2026-06-19 13:20:28','2026-06-19 13:20:28'),(3,1,'Friday','10:00','17:00',15,'2026-06-19 13:20:28','2026-06-19 13:20:28'),(4,3,'Monday','10:00','17:00',15,'2026-06-22 15:07:44','2026-06-22 15:07:44'),(5,3,'Wednesday','10:00','17:00',15,'2026-06-22 15:07:47','2026-06-22 15:07:47'),(6,3,'Friday','10:00','17:00',15,'2026-06-22 15:07:50','2026-06-22 15:07:50');
/*!40000 ALTER TABLE `doctor_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialization` varchar(150) NOT NULL,
  `experience_years` int DEFAULT '0',
  `biography` text,
  `consultation_fee` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,2,'Optometrist & Contact Lens Specialist',12,'Dr. Sarah Miller has over 12 years of experience providing comprehensive eye exams, fitting specialty contact lenses, and managing dry eye diseases.',75.00,'2026-06-19 13:20:28','2026-06-19 13:20:28'),(2,3,'Ophthalmologist & Eye Surgeon',15,'Dr. John Watson specializes in advanced cataract surgery and glaucoma treatments.',120.00,'2026-06-19 13:20:28','2026-06-19 13:20:28'),(3,5,'Eye Surgon',5,'5 yrs in surgery',500.00,'2026-06-22 15:06:35','2026-06-22 15:06:35');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_name` varchar(150) NOT NULL,
  `dosage` varchar(50) NOT NULL,
  `frequency` varchar(100) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `prescription_id` (`prescription_id`),
  CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (1,1,'Systane Ultra','1 drop','Three times daily','30 days','2026-06-21 15:51:21');
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `doctor_id` int NOT NULL,
  `diagnosis` text NOT NULL,
  `notes` text,
  `sph_od` decimal(4,2) DEFAULT NULL,
  `cyl_od` decimal(4,2) DEFAULT NULL,
  `axis_od` int DEFAULT NULL,
  `sph_os` decimal(4,2) DEFAULT NULL,
  `cyl_os` decimal(4,2) DEFAULT NULL,
  `axis_os` int DEFAULT NULL,
  `pd` decimal(4,1) DEFAULT NULL,
  `add_power` decimal(4,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `va_unaided_od` varchar(20) DEFAULT NULL,
  `va_aided_od` varchar(20) DEFAULT NULL,
  `va_unaided_os` varchar(20) DEFAULT NULL,
  `va_aided_os` varchar(20) DEFAULT NULL,
  `add_od` decimal(4,2) DEFAULT NULL,
  `add_os` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescriptions_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,NULL,4,1,'Presbyopia with mild astigmatism - updated','Adding lubricating drops.',1.25,-0.50,90,1.50,-0.25,85,63.0,NULL,'2026-06-21 15:51:00','2026-06-21 15:51:21','6/9','6/6','6/12','6/6',2.75,2.50),(2,1,NULL,1,'Severe Myopia (Guest)','Recommend immediate checkup.',-3.50,-1.25,180,-3.25,-1.50,175,64.0,NULL,'2026-06-21 15:56:46','2026-06-21 15:56:46','6/60','6/6','6/60','6/6',0.00,0.00),(3,2,NULL,1,'ASSAD','',0.00,0.00,0,0.00,0.00,0,62.0,NULL,'2026-06-21 15:57:32','2026-06-21 15:57:32','6/6','6/6','6/6','6/6',0.00,0.00);
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('patient','doctor','admin') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Admin','admin@eyecare.com','$2a$10$mgnc8Jt/tPZ1mFfCnbyQ9.HQPu33zSZDWRuyyzvgbF7Z8jOqBvsQ2','admin','555-0100','123 EyeCare HQ, Vision City','active','2026-06-19 13:20:28','2026-06-19 13:20:28'),(2,'Dr. Sarah Miller','doctor@eyecare.com','$2a$10$4/7nX..6OtpAIWtOgojp5OL3KQUNeXXLJjo5KSW9Bh1tuy3ATGg3K','doctor','555-0101','Clinic Suite 4A, Medical Center','active','2026-06-19 13:20:28','2026-06-22 14:47:47'),(3,'Dr. John Watson','doctor2@eyecare.com','$2a$10$AK0/2HK56nKK3TrGiA15Ze66cVJVkNlrMbTIjF36/IdH2bS1H5iCW','doctor','555-0103','Clinic Suite 4B, Medical Center','inactive','2026-06-19 13:20:28','2026-06-22 15:05:26'),(4,'Mark Davis','patient@eyecare.com','$2a$10$OGxOSFY/TCceJEfWAzO6BO2bYQye8cr4FGn5tF.QcJU1EkaqHInOW','patient','555-0102','742 Evergreen Terrace, Springfield','active','2026-06-19 13:20:28','2026-06-19 13:20:28'),(5,'Dr. ABC','abc@eyecare.com','$2a$10$lQXd9MPrcpy1f8OoCHbCO.Od3rcNZua8ErQCMzbpcSFLnW1Jdka96','doctor',NULL,NULL,'active','2026-06-22 15:06:35','2026-06-22 15:06:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `va_tests`
--

DROP TABLE IF EXISTS `va_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `va_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `right_eye_va` varchar(10) NOT NULL,
  `left_eye_va` varchar(10) NOT NULL,
  `interpretation` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `va_tests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `va_tests`
--

LOCK TABLES `va_tests` WRITE;
/*!40000 ALTER TABLE `va_tests` DISABLE KEYS */;
/*!40000 ALTER TABLE `va_tests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-23 21:59:34
