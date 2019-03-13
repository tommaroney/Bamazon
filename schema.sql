drop database if exists bamazondb;

CREATE DATABASE `bamazondb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;

USE 'bamazondb';

CREATE TABLE `departments` (
  `department_id` int(10) NOT NULL AUTO_INCREMENT,
  `department_name` varchar(25) DEFAULT NULL,
  `over_head_costs` int(10) DEFAULT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `products` (
  `item_id` int(10) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(50) NOT NULL,
  `department_name` varchar(25) NOT NULL,
  `price` float(20,2) NOT NULL,
  `stock_quantity` int(10) NOT NULL,
  `product_sales` float(20,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
