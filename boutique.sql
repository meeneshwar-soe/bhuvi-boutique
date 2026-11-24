-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 24, 2026 at 02:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `boutique`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `size` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `userId`, `productId`, `size`, `color`, `quantity`, `createdAt`, `updatedAt`) VALUES
(14, 1, 16, 'M', 'Red', 1, '2026-10-22 13:53:53', '2026-10-22 13:53:53'),
(15, 1, 17, 'M', 'Red', 1, '2026-10-22 13:53:55', '2026-10-22 13:53:55'),
(16, 1, 26, 'Standard', 'Standard', 1, '2026-10-22 16:28:15', '2026-10-22 16:28:15'),
(50, 1, 27, 'XS', 'Black', 3, '2026-10-23 07:46:13', '2026-10-23 07:46:16'),
(77, 6, 35, 'M', 'White', 1, '2026-11-23 16:32:03', '2026-11-23 16:32:03'),
(78, 6, 34, 'XS', 'Black', 1, '2026-11-23 17:36:28', '2026-11-23 17:36:28');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(10,2) DEFAULT 0.00,
  `maxDiscount` decimal(10,2) DEFAULT 1000000.00,
  `usageLimit` int(11) DEFAULT 1000,
  `usedCount` int(11) DEFAULT 0,
  `expiresAt` datetime NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `minOrder` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `maxDiscount`, `usageLimit`, `usedCount`, `expiresAt`, `active`, `createdAt`, `updatedAt`, `minOrder`) VALUES
(1, 'WELCOME10', 'percent', 10.00, 500.00, 100, 0, '2027-12-31 00:00:00', 1, '2026-10-16 16:53:40', '2026-10-16 16:53:40', 0.00),
(2, 'FLAT200', 'fixed', 200.00, 1000000.00, 50, 0, '2027-12-31 00:00:00', 1, '2026-10-16 16:53:40', '2026-10-16 16:53:40', 0.00),
(3, 'SAVE25', 'percent', 25.00, 1000.00, 30, 0, '2027-12-31 00:00:00', 1, '2026-10-16 16:53:40', '2026-10-16 16:53:40', 0.00),
(5, 'SAVE100', 'percent', 100.00, 10000000.00, 100, 4, '2026-12-01 19:31:00', 1, '2026-10-22 19:43:42', '2026-11-10 22:30:20', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `shippingName` varchar(255) DEFAULT NULL,
  `shippingPhone` varchar(255) DEFAULT NULL,
  `shippingStreet` varchar(255) DEFAULT NULL,
  `shippingCity` varchar(255) DEFAULT NULL,
  `shippingState` varchar(255) DEFAULT NULL,
  `shippingZip` varchar(255) DEFAULT NULL,
  `shippingCountry` varchar(255) DEFAULT NULL,
  `selectedSize` varchar(50) DEFAULT NULL,
  `selectedColor` varchar(50) DEFAULT NULL,
  `specialInstructions` text DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT 'Razorpay',
  `paymentStatus` enum('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  `razorpayOrderId` varchar(255) DEFAULT NULL,
  `razorpayPaymentId` varchar(255) DEFAULT NULL,
  `razorpaySignature` text DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `couponCode` varchar(255) DEFAULT NULL,
  `shippingFee` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `status` enum('Pending','Confirmed','Shipped','OutForDelivery','Delivered','Cancelled','Returned','Replaced') DEFAULT 'Pending',
  `trackingNumber` varchar(255) DEFAULT NULL,
  `returnRequested` tinyint(1) DEFAULT 0,
  `returnType` enum('Return','Replace') DEFAULT NULL,
  `returnReason` text DEFAULT NULL,
  `returnStatus` enum('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
  `returnCreatedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `userId`, `shippingName`, `shippingPhone`, `shippingStreet`, `shippingCity`, `shippingState`, `shippingZip`, `shippingCountry`, `selectedSize`, `selectedColor`, `specialInstructions`, `paymentMethod`, `paymentStatus`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `subtotal`, `discount`, `couponCode`, `shippingFee`, `total`, `status`, `trackingNumber`, `returnRequested`, `returnType`, `returnReason`, `returnStatus`, `returnCreatedAt`, `createdAt`, `updatedAt`) VALUES
(11, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_Tr4IpzIWUqM7pQ', 'pay_Tr4J68TrVSudw6', 'ed80050052c5e0a43c63e01d0f25401268f7eeb3a5b140b36168fd6ac00adc3a', 5812.00, 0.00, '', 0.00, 5812.00, 'Returned', NULL, 1, 'Return', 'dont like the product', 'Completed', '2026-10-22 20:00:20', '2026-10-22 19:24:51', '2026-11-21 12:35:39'),
(12, 19, 'Abhishek Yadav', '9555395114', '368 barak hostel ', 'NEW DELHI', 'DELHI', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 736413.00, 736413.00, 'SAVE100', 0.00, 0.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 19:43:54', '2026-10-22 19:43:54'),
(13, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 6101.00, 6101.00, 'SAVE100', 0.00, 0.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 19:49:32', '2026-10-22 19:49:32'),
(14, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_Tr4ouDuPjvxmUk', 'pay_Tr4tFuB7gixxVO', 'fd8c16f5620c7a5599d62fbd2673e1af9586ecfc0c4b3ae3e149c371c14c9677', 211.00, 211.00, 'SAVE100', 49.00, 49.00, 'Confirmed', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 19:55:12', '2026-10-22 19:59:36'),
(15, 19, 'Abhishek Yadav', '9555395114', '368 barak hostel ', 'NEW DELHI', 'DELHI', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_Tr4qOsnVR86R4v', 'pay_Tr4qotb1wcDkuj', '92f70a18b2129baed8bd74c411fb65a20030d6114062c96003827baa93dedd74', 322.00, 322.00, 'SAVE100', 49.00, 49.00, 'Delivered', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 19:56:37', '2026-11-23 12:44:43'),
(16, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 45.00, 0.00, '', 49.00, 94.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 20:04:43', '2026-10-22 20:04:43'),
(17, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 45.00, 45.00, 'SAVE100', 49.00, 49.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 20:15:29', '2026-10-22 20:15:29'),
(18, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_Tr5BoAnSSGqzUp', 'pay_Tr5DOOFBfRl3ci', 'dee0a49f8deb3f8844acbdff2de3cb46df5a9a62548cd377ace2892e6fc04cdb', 100.00, 100.00, 'SAVE100', 49.00, 49.00, 'Cancelled', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 20:16:53', '2026-10-23 05:48:59'),
(19, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 5601.00, 5601.00, 'SAVE100', 0.00, 0.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-22 20:57:05', '2026-10-22 20:57:05'),
(20, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 626564.00, 626564.00, 'SAVE100', 0.00, 0.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 04:55:22', '2026-10-23 04:55:22'),
(21, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 710.00, 710.00, 'SAVE100', 75.00, 75.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 05:02:03', '2026-10-23 05:02:03'),
(22, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 710.00, 710.00, 'SAVE100', 75.00, 75.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 05:02:14', '2026-10-23 05:02:14'),
(23, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 710.00, 710.00, 'SAVE100', 75.00, 75.00, 'Cancelled', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 05:02:25', '2026-10-23 05:42:44'),
(24, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_TrE9VJcYW2GbOg', 'pay_TrEA2FAXf4VmNB', '40a86e42b483e5fa968a5c35c2fc36730bc9c88430ce16b742ea3157e329ab34', 710.00, 0.00, '', 75.00, 785.00, 'Delivered', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 05:02:57', '2026-10-23 07:21:41'),
(25, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 4004.00, 0.00, '', 0.00, 4004.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 06:32:18', '2026-10-23 06:32:18'),
(26, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'Standard', 'Standard', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 4004.00, 0.00, '', 0.00, 4004.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 06:33:34', '2026-10-23 06:33:34'),
(27, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Paid', 'order_TrGMI7sXsFfweZ', 'pay_TrGMh6xpsajQpc', '5b7a522a1a00f1a3c38123cb9f36b0b86d4f257e81f8ad971402b91303b5660b', 5568.00, 0.00, '', 0.00, 5568.00, 'Delivered', NULL, 1, '', 'sahi nahi hai', 'Pending', '2026-11-24 06:31:52', '2026-10-23 07:12:26', '2026-11-24 06:31:52'),
(28, 1, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'M', 'Red', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 17505.00, 0.00, '', 0.00, 17505.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 07:46:25', '2026-10-23 07:46:25'),
(29, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Red', NULL, 'Razorpay', 'Paid', 'order_TrIkYlLm4Mj0FQ', 'pay_TrIkfqSXGCgT1K', 'a6bbf6b51f9ec5eb5aeed3005772bf15f241cc7bcb214bd23ffe2df970335a2e', 5446.00, 0.00, '', 0.00, 5446.00, 'Delivered', NULL, 1, '', 'hyfyy', 'Pending', '2026-11-23 12:45:39', '2026-10-23 09:32:49', '2026-11-23 12:45:39'),
(30, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Blue', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 626364.00, 0.00, '', 0.00, 626364.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 09:35:44', '2026-10-23 09:35:44'),
(31, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Blue', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 626364.00, 0.00, '', 0.00, 626364.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 09:35:47', '2026-10-23 09:35:47'),
(32, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Blue', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 626364.00, 0.00, '', 0.00, 626364.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 09:35:59', '2026-10-23 09:35:59'),
(33, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Blue', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 626364.00, 0.00, '', 0.00, 626364.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 09:36:28', '2026-10-23 09:36:28'),
(34, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'L', 'Red', NULL, 'Razorpay', 'Paid', 'order_TrIqgsemiMl9YI', 'pay_TrIqlng64keoCD', '7ce6977e45d3fd20c67ee78504ebdfc22ec61c24dc229fad20fbad020b9e3fbb', 99999.00, 0.00, '', 0.00, 99999.00, 'Delivered', NULL, 1, '', 'accha hai', 'Pending', '2026-11-24 06:40:28', '2026-10-23 09:38:37', '2026-11-24 06:40:28'),
(35, 21, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'S', 'Black', NULL, 'Razorpay', 'Paid', 'order_TrJJn0460qkGX1', 'pay_TrJJtkkUjP3sXy', '0618140c374a65bf231da129f615215ff857f09c8914d9a24a9e833cd4af6bc1', 999.00, 0.00, '', 75.00, 1074.00, 'OutForDelivery', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 10:06:10', '2026-10-24 00:00:22'),
(36, 22, 'Rishabh Mishra', '8081813490', 'A61 ', 'Delhi', 'Delhi', '110093', 'India', 'XS', 'Black', NULL, 'Razorpay', 'Paid', 'order_TrJoge0XBzPSxp', 'pay_TrJpFxR64PErXh', 'afd5c60232b5e9e1b8c65520d3253c59f5e7a544dbafeffcb14ad200d2ee707a', 999.00, 0.00, '', 75.00, 1074.00, 'OutForDelivery', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 10:35:24', '2026-10-24 00:00:18'),
(37, 23, 'Rishabh Mishra', '67879768', 'gfhhj', 'vhghgh', 'delhi', '111899', 'India', 'XL', 'Blue', NULL, 'Razorpay', 'Paid', 'order_TrQ56PqWLJfUSP', 'pay_TrQ5Yf89WKcWti', 'e369bba6fc24a2e1fd6e035eb4f24020dbc67ebbf64678309673d1c224d975ef', 1499.00, 0.00, '', 75.00, 1574.00, 'OutForDelivery', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-10-23 11:13:07', '2026-10-24 00:00:06'),
(38, 24, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'XS', 'Black', NULL, 'Razorpay', 'Paid', 'order_TyjEBEgYhEnbeS', 'pay_TyjEMMWiNGy5PK', '80c4195d6ca62950ea16d7e85e4b38cbcadc3af548480931f5722b660e957212', 1999.00, 1999.00, 'SAVE100', 75.00, 75.00, 'OutForDelivery', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-11-10 22:29:54', '2026-11-23 12:46:23'),
(39, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'XS', 'Black', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 1599.00, 0.00, '', 75.00, 1674.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-11-23 16:25:58', '2026-11-23 16:25:58'),
(40, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'XS', 'Black', NULL, 'Razorpay', 'Pending', NULL, NULL, NULL, 1599.00, 0.00, '', 75.00, 1674.00, 'Pending', NULL, 0, NULL, NULL, 'Pending', NULL, '2026-11-23 16:26:38', '2026-11-23 16:26:38'),
(41, 6, 'Meeneshwar', '09555835047', 'Barak, jnu', 'New Delhi', 'Delhi', '110067', 'India', 'XS', 'Black', NULL, 'Razorpay', 'Paid', 'order_U3gMz1NDm5zhZc', 'pay_U3gN8QwM0MOJvJ', '32ca5dc3ad035815c995fab2c3b8b54a3411f8e83181cc2deade63cc838ab590', 1599.00, 0.00, '', 75.00, 1674.00, 'Cancelled', NULL, 1, '', 'mnk', 'Approved', '2026-11-23 17:36:47', '2026-11-23 16:27:08', '2026-11-24 09:14:19');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `size` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `productId`, `name`, `image`, `size`, `color`, `quantity`, `price`, `createdAt`, `updatedAt`) VALUES
(11, 11, 16, 'golu', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247721/boutique/products/pfps4snbqnhyejtb2iis.png', 'M', 'Red', 3, 122.00, '2026-10-22 19:24:51', '2026-10-22 19:24:51'),
(12, 11, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'L', 'White', 1, 5446.00, '2026-10-22 19:24:51', '2026-10-22 19:24:51'),
(13, 12, 29, 'haldwani', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692328/boutique/products/knpkqzvbvngoxigazroe.png', 'Standard', 'Standard', 1, 99999.00, '2026-10-22 19:43:54', '2026-10-22 19:43:54'),
(14, 12, 25, 'bjj', '', 'Standard', 'Standard', 1, 626364.00, '2026-10-22 19:43:54', '2026-10-22 19:43:54'),
(15, 12, 19, 'Golu', '', 'Standard', 'Standard', 1, 10050.00, '2026-10-22 19:43:54', '2026-10-22 19:43:54'),
(16, 13, 5, 'fhuhufee', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243915/boutique/products/d3mfcu1qo4whp6ksy2iq.png', 'M', 'Red', 1, 100.00, '2026-10-22 19:49:32', '2026-10-22 19:49:32'),
(17, 13, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'Standard', 'Standard', 1, 5446.00, '2026-10-22 19:49:32', '2026-10-22 19:49:32'),
(18, 13, 11, 'esnks', '', 'M', 'Red', 1, 555.00, '2026-10-22 19:49:32', '2026-10-22 19:49:32'),
(19, 14, 15, 'golu', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247717/boutique/products/bza43q3t3p14gdtqdylh.png', 'M', 'Red', 1, 122.00, '2026-10-22 19:55:12', '2026-10-22 19:55:12'),
(20, 14, 26, 'hh', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png', 'Standard', 'Standard', 1, 45.00, '2026-10-22 19:55:12', '2026-10-22 19:55:12'),
(21, 14, 23, 'hj', '', 'Standard', 'Standard', 1, 44.00, '2026-10-22 19:55:12', '2026-10-22 19:55:12'),
(22, 15, 5, 'fhuhufee', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243915/boutique/products/d3mfcu1qo4whp6ksy2iq.png', 'M', 'Red', 1, 100.00, '2026-10-22 19:56:37', '2026-10-22 19:56:37'),
(23, 15, 15, 'golu', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247717/boutique/products/bza43q3t3p14gdtqdylh.png', 'M', 'Red', 1, 122.00, '2026-10-22 19:56:37', '2026-10-22 19:56:37'),
(24, 15, 6, 'fhuhufee', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243917/boutique/products/ytbnt2lmmehpou8ramcm.png', 'M', 'Red', 1, 100.00, '2026-10-22 19:56:37', '2026-10-22 19:56:37'),
(25, 16, 26, 'hh', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png', 'Standard', 'Standard', 1, 45.00, '2026-10-22 20:04:43', '2026-10-22 20:04:43'),
(26, 17, 26, 'hh', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png', 'Standard', 'Standard', 1, 45.00, '2026-10-22 20:15:29', '2026-10-22 20:15:29'),
(27, 18, 5, 'fhuhufee', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243915/boutique/products/d3mfcu1qo4whp6ksy2iq.png', 'M', 'Red', 1, 100.00, '2026-10-22 20:16:53', '2026-10-22 20:16:53'),
(28, 19, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'Standard', 'Standard', 1, 5446.00, '2026-10-22 20:57:05', '2026-10-22 20:57:05'),
(29, 19, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-22 20:57:05', '2026-10-22 20:57:05'),
(30, 20, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-23 04:55:22', '2026-10-23 04:55:22'),
(31, 20, 26, 'hh', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png', 'Standard', 'Standard', 1, 45.00, '2026-10-23 04:55:22', '2026-10-23 04:55:22'),
(32, 20, 25, 'bjj', '', 'Standard', 'Standard', 1, 626364.00, '2026-10-23 04:55:22', '2026-10-23 04:55:22'),
(33, 21, 11, 'esnks', '', 'M', 'Red', 1, 555.00, '2026-10-23 05:02:03', '2026-10-23 05:02:03'),
(34, 21, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-23 05:02:03', '2026-10-23 05:02:03'),
(35, 22, 11, 'esnks', '', 'M', 'Red', 1, 555.00, '2026-10-23 05:02:14', '2026-10-23 05:02:14'),
(36, 22, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-23 05:02:14', '2026-10-23 05:02:14'),
(37, 23, 11, 'esnks', '', 'M', 'Red', 1, 555.00, '2026-10-23 05:02:25', '2026-10-23 05:02:25'),
(38, 23, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-23 05:02:25', '2026-10-23 05:02:25'),
(39, 24, 11, 'esnks', '', 'M', 'Red', 1, 555.00, '2026-10-23 05:02:57', '2026-10-23 05:02:57'),
(40, 24, 28, 'jaipur', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png', 'Standard', 'Standard', 1, 155.00, '2026-10-23 05:02:57', '2026-10-23 05:02:57'),
(41, 25, 23, 'hj', '', 'Standard', 'Standard', 91, 44.00, '2026-10-23 06:32:18', '2026-10-23 06:32:18'),
(42, 26, 23, 'hj', '', 'Standard', 'Standard', 91, 44.00, '2026-10-23 06:33:34', '2026-10-23 06:33:34'),
(43, 27, 15, 'golu', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247717/boutique/products/bza43q3t3p14gdtqdylh.png', 'M', 'Red', 1, 122.00, '2026-10-23 07:12:26', '2026-10-23 07:12:26'),
(44, 27, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'Standard', 'Standard', 1, 5446.00, '2026-10-23 07:12:26', '2026-10-23 07:12:26'),
(45, 28, 16, 'golu', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247721/boutique/products/pfps4snbqnhyejtb2iis.png', 'M', 'Red', 1, 122.00, '2026-10-23 07:46:25', '2026-10-23 07:46:25'),
(46, 28, 17, 'meeneshwar', '', 'M', 'Red', 1, 1000.00, '2026-10-23 07:46:25', '2026-10-23 07:46:25'),
(47, 28, 26, 'hh', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png', 'Standard', 'Standard', 1, 45.00, '2026-10-23 07:46:25', '2026-10-23 07:46:25'),
(48, 28, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'XS', 'Black', 3, 5446.00, '2026-10-23 07:46:25', '2026-10-23 07:46:25'),
(49, 29, 27, 'kssm', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png', 'L', 'Red', 1, 5446.00, '2026-10-23 09:32:49', '2026-10-23 09:32:49'),
(50, 30, 25, 'bjj', '', 'L', 'Blue', 1, 626364.00, '2026-10-23 09:35:44', '2026-10-23 09:35:44'),
(51, 31, 25, 'bjj', '', 'L', 'Blue', 1, 626364.00, '2026-10-23 09:35:47', '2026-10-23 09:35:47'),
(52, 32, 25, 'bjj', '', 'L', 'Blue', 1, 626364.00, '2026-10-23 09:35:59', '2026-10-23 09:35:59'),
(53, 33, 25, 'bjj', '', 'L', 'Blue', 1, 626364.00, '2026-10-23 09:36:29', '2026-10-23 09:36:29'),
(54, 34, 29, 'haldwani', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692328/boutique/products/knpkqzvbvngoxigazroe.png', 'L', 'Red', 1, 99999.00, '2026-10-23 09:38:37', '2026-10-23 09:38:37'),
(55, 35, 37, 'Traditional Saree Lehenga', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749671/boutique/products/jriaejl6mlo4cnheeldk.jpg', 'S', 'Black', 1, 999.00, '2026-10-23 10:06:10', '2026-10-23 10:06:10'),
(56, 36, 37, 'Traditional Saree Lehenga', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749671/boutique/products/jriaejl6mlo4cnheeldk.jpg', 'XS', 'Black', 1, 999.00, '2026-10-23 10:35:24', '2026-10-23 10:35:24'),
(57, 37, 30, 'Traditional Bridal Lehenga', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748807/boutique/products/bpkoltjhmc1mn8bvcfai.jpg', 'XL', 'Blue', 1, 1499.00, '2026-10-23 11:13:07', '2026-10-23 11:13:07'),
(58, 38, 36, 'Indian Wedding Lehenga', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749596/boutique/products/xgprwug94dc8qtvblgmi.jpg', 'XS', 'Black', 1, 1999.00, '2026-11-10 22:29:54', '2026-11-10 22:29:54'),
(59, 39, 35, 'BLue Lehenga CHoli', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749420/boutique/products/u2499xzyb2fpn8qlhrfs.jpg', 'XS', 'Black', 1, 1599.00, '2026-11-23 16:25:58', '2026-11-23 16:25:58'),
(60, 40, 35, 'BLue Lehenga CHoli', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749420/boutique/products/u2499xzyb2fpn8qlhrfs.jpg', 'XS', 'Black', 1, 1599.00, '2026-11-23 16:26:38', '2026-11-23 16:26:38'),
(61, 41, 35, 'BLue Lehenga CHoli', 'https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749420/boutique/products/u2499xzyb2fpn8qlhrfs.jpg', 'XS', 'Black', 1, 1599.00, '2026-11-23 16:27:08', '2026-11-23 16:27:08');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sizes` text DEFAULT NULL,
  `colors` text DEFAULT NULL,
  `images` text DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `avgRating` decimal(2,1) DEFAULT 0.0,
  `totalRatings` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deliveryInfo` varchar(255) DEFAULT 'Fast & Secure Delivery',
  `returnPolicy` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `category`, `brand`, `price`, `stock`, `sizes`, `colors`, `images`, `featured`, `active`, `avgRating`, `totalRatings`, `createdAt`, `updatedAt`, `deliveryInfo`, `returnPolicy`) VALUES
(1, 'Silk Evening Gown', 'Luxurious silk gown for special occasions.', 'Dresses', 'Luxe', 4999.00, 13, 'S,M,L', 'Black,Red,Navy', '[]', 1, 0, 0.0, 0, '2026-10-16 16:53:40', '2026-10-17 15:37:05', 'Fast & Secure Delivery', 1),
(2, 'Floral Summer Dress', 'Lightweight floral dress perfect for summer.', 'Dresses', 'Luxe', 1499.00, 30, 'XS,S,M,L', 'Pink,Yellow', '[]', 1, 0, 0.0, 0, '2026-10-16 16:53:40', '2026-10-17 15:37:02', 'Fast & Secure Delivery', 1),
(3, 'Embroidered Kurti', 'Traditional embroidered kurti with elegant work.', 'Kurtis', 'Ethnic Wear', 1199.00, 50, 'S,M,L,XL', 'White,Green', '[]', 0, 0, 0.0, 0, '2026-10-16 16:53:40', '2026-10-17 15:37:11', 'Fast & Secure Delivery', 1),
(4, 'Casual Cotton Top', 'Comfortable everyday cotton top.', 'Tops', 'Daily Wear', 799.00, 100, 'S,M,L', 'White,Blue,Grey', '[]', 0, 0, 0.0, 0, '2026-10-16 16:53:40', '2026-10-17 15:36:59', 'Fast & Secure Delivery', 1),
(5, 'fhuhufee', 'ashuaisa', 'e7tfdwbdg', 'xaguu', 100.00, 10, 'M', 'Red', '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243915/boutique/products/d3mfcu1qo4whp6ksy2iq.png\"]', 0, 0, 0.0, 0, '2026-10-17 13:31:56', '2026-10-23 10:02:38', 'Fast & Secure Delivery', 1),
(6, 'fhuhufee', 'ashuaisa', 'e7tfdwbdg', 'xaguu', 100.00, 11, 'M', 'Red', '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792243917/boutique/products/ytbnt2lmmehpou8ramcm.png\"]', 0, 0, 0.0, 0, '2026-10-17 13:31:57', '2026-10-23 10:02:34', 'Fast & Secure Delivery', 1),
(7, 'ehhis', 'abjjz', 'anjj', 'abja', 441.00, 1, 'M', 'red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:51:26', '2026-10-17 15:37:14', 'Fast & Secure Delivery', 1),
(8, 'ehhis', 'abjjz', 'anjj', 'abja', 441.00, 1, 'M', 'red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:51:28', '2026-10-17 15:37:21', 'Fast & Secure Delivery', 1),
(9, 'ehhis', 'abjjz', 'anjj', 'abja', 441.00, 1, 'M', 'red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:51:30', '2026-10-17 15:37:18', 'Fast & Secure Delivery', 1),
(10, 'ehhis', 'abjjz', 'anjj', 'abja', 441.00, 1, 'M', 'red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:51:32', '2026-10-17 15:37:23', 'Fast & Secure Delivery', 1),
(11, 'esnks', 'heushsha', 'wjbju', 'ahjzhs', 555.00, 11, 'M', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:52:32', '2026-10-23 10:02:31', 'Fast & Secure Delivery', 1),
(12, 'esnks', 'heushsha', 'wjbju', 'ahjzhs', 555.00, 12, 'M', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:52:33', '2026-10-17 15:37:26', 'Fast & Secure Delivery', 1),
(13, 'esnks', 'heushsha', 'wjbju', 'ahjzhs', 555.00, 12, 'M', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:52:37', '2026-10-17 15:37:29', 'Fast & Secure Delivery', 1),
(14, 'esnks', 'heushsha', 'wjbju', 'ahjzhs', 555.00, 12, 'M', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-17 13:52:38', '2026-10-17 15:37:31', 'Fast & Secure Delivery', 1),
(15, 'golu', 'sxc mdcmnn', 'e7tfdwbdg', 'ftrf', 122.00, 9, 'M', 'Red', '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247717/boutique/products/bza43q3t3p14gdtqdylh.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247718/boutique/products/aqz1iqufdcwdp4pnnsuo.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247719/boutique/products/am439qmdlmjlcz1lfe0q.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247720/boutique/products/ep606qktuy9pivoaghtn.png\"]', 0, 0, 0.0, 0, '2026-10-17 14:35:19', '2026-10-23 10:02:28', 'Fast & Secure Delivery', 1),
(16, 'golu', 'sxc mdcmnn', 'e7tfdwbdg', 'ftrf', 122.00, 9, 'M', 'Red', '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247721/boutique/products/pfps4snbqnhyejtb2iis.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247722/boutique/products/lymmz3ntnfn8ptivpkhj.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247722/boutique/products/mfmp5dn4vyoljshacvuk.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792247723/boutique/products/uyayvmdytlyep5n1qg70.png\"]', 0, 0, 0.0, 0, '2026-10-17 14:35:22', '2026-10-23 10:02:25', 'Fast & Secure Delivery', 1),
(17, 'meeneshwar', 'dwjhsws nxz', 'man', 'royal', 1000.00, 19, 'M', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-18 18:00:05', '2026-10-23 10:02:22', 'Fast & Secure Delivery', 0),
(18, 'meena', 'i am hero', 'lahenga', 'famous', 1200.00, 10, 'M,S', 'Red', '[]', 0, 0, 0.0, 0, '2026-10-18 18:08:21', '2026-10-23 10:02:18', 'Fast & Secure Delivery', 0),
(19, 'Golu', 'hello my boys', 'wjbju', NULL, 10050.00, 13, '', '', '[]', 0, 0, 0.0, 0, '2026-10-22 15:13:19', '2026-10-23 10:02:12', 'Fast & Secure Delivery', 0),
(20, 'Golu', 'hello my boys', 'wjbju', NULL, 10050.00, 13, '', '', '[]', 0, 0, 0.0, 0, '2026-10-22 15:13:23', '2026-10-22 15:13:31', 'Fast & Secure Delivery', 0),
(21, 'Golu', 'hello my boys', 'wjbju', NULL, 10050.00, 13, '', '', '[]', 0, 0, 0.0, 0, '2026-10-22 15:13:23', '2026-10-22 15:13:44', 'Fast & Secure Delivery', 0),
(22, 'fhuhufee', 'bhghyfxfgvh', 'wjbju', NULL, 1203.00, 14, '', '', '[]', 0, 0, 0.0, 0, '2026-10-22 15:16:40', '2026-10-23 10:02:10', 'Fast & Secure Delivery', 0),
(23, 'hj', 'njzbjx', ' b', NULL, 44.00, 0, NULL, NULL, '[]', 0, 0, 0.0, 0, '2026-10-22 16:10:33', '2026-10-23 10:02:07', 'Fast & Secure Delivery', 0),
(24, 'njjm', 'bujuggu', ' g', NULL, 56.00, 18, NULL, NULL, '[]', 0, 0, 0.0, 0, '2026-10-22 16:11:42', '2026-10-23 10:02:05', 'Fast & Secure Delivery', 0),
(25, 'bjj', 'vhhy', 'hvh', NULL, 626364.00, 121, NULL, NULL, '[]', 0, 0, 0.0, 0, '2026-10-22 16:17:53', '2026-10-23 10:02:02', 'Fast & Secure Delivery', 0),
(26, 'hh', 'jjhj', ' nvh', NULL, 45.00, 0, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686479/boutique/products/jkg2str8rtmalufvddgj.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686480/boutique/products/j1oanbmlqhjmzqifidtc.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686480/boutique/products/kyc8nfcas8f6rjcoklkt.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792686481/boutique/products/ylib6ne8utwtpkjqlqwx.png\"]', 0, 0, 0.0, 0, '2026-10-22 16:28:01', '2026-10-23 10:01:59', 'Fast & Secure Delivery', 0),
(27, 'kssm', 'sxnx', 'smk', NULL, 5446.00, 8, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687331/boutique/products/ioe3sjec40fpgczt1z3m.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687332/boutique/products/ewqmkbebcz9da7nzck3t.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687333/boutique/products/ur0mec71ctkulmjqslh9.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792687334/boutique/products/fdofcjqgs3dzxs0x9qqf.png\"]', 0, 0, 0.0, 0, '2026-10-22 16:42:14', '2026-10-23 10:01:53', 'Fast & Secure Delivery', 0),
(28, 'jaipur', 'sjssiswki', 'anjj', NULL, 155.00, 12, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690084/boutique/products/ohksw01dr4rzc9p34xbl.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792690085/boutique/products/ykl2le2j9fsdlkjltk5j.png\"]', 0, 0, 0.0, 0, '2026-10-22 17:28:05', '2026-10-23 10:01:56', '2 days from now', 1),
(29, 'haldwani', 'hello my boys', 'ranglal', NULL, 99999.00, 14, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692328/boutique/products/knpkqzvbvngoxigazroe.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692329/boutique/products/bu7h08l8uupunkkxrg21.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692330/boutique/products/mtdf4ojvwk0vmpdstqfr.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692331/boutique/products/hrdxnm7c2zr3vouazdhr.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692331/boutique/products/ivdiy2vhcdwhzm8kenmk.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692332/boutique/products/nbbccgzuedl5nx9xo44b.png\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792692333/boutique/products/hfwugfdn5zmn9ebnoniz.png\"]', 0, 0, 0.0, 0, '2026-10-22 18:05:33', '2026-10-23 10:01:50', 'in 3 days', 0),
(30, 'Traditional Bridal Lehenga', 'Pure Silk Bridal Lehenga For occasions', 'Lehenga ', NULL, 1499.00, 29, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748807/boutique/products/bpkoltjhmc1mn8bvcfai.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748809/boutique/products/sbvqcxsuzxszruvbjb0t.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748810/boutique/products/bueyw1dwib3tbukfwwwi.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:46:51', '2026-10-23 11:13:49', '4-5 Days Estimated Delivery', 0),
(31, 'Lehenga-Choli', 'Best Ethnic Wear to Make your occasions Memorable', 'Ethnic Wear', NULL, 1399.00, 32, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748964/boutique/products/a8lsbv9utrnxrptfmaqe.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748965/boutique/products/oufnd7qxbpdx1275vokp.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792748966/boutique/products/wp4dzqpmsmfv3j5zf9ym.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:49:27', '2026-10-23 09:49:27', '4-6 Buissness days Estimated Delivery', 0),
(32, 'Printed Lehenga ', 'Printed Lehenga To wear as an ethnic wear ', 'Ethnic Wear', NULL, 1299.00, 47, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749082/boutique/products/raozjjeurznvxrbo0fze.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749084/boutique/products/nylcqydwubi3gxarywjv.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749085/boutique/products/xylfr0rxe6wsplbruvph.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:51:26', '2026-11-24 05:28:23', '4-5 Days Estimated Delivery', 0),
(33, 'Lehenga', 'Traditional Lehenga Set', 'Ethnic Wear', NULL, 1599.00, 24, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749196/boutique/products/mdtdtqgcbe6f0xjhcgw4.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749196/boutique/products/llzrymcolvvrpxhevzvi.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749198/boutique/products/gl7k5vnm1huqh90ffqyw.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:53:19', '2026-10-23 09:53:19', '4-5 Days Estimated Delivery', 0),
(34, 'Semi-Stiched Lehenga Choli', 'Semi Stiched Lehenga choli For Occasions', 'Ethnic Wear', NULL, 1099.00, 24, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749314/boutique/products/uu76r1yo7povbfswoqlv.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:55:15', '2026-10-23 09:55:15', '4-6 Buissness days Estimated Delivery', 0),
(35, 'BLue Lehenga CHoli', 'Lehenga Choli in blue colour as per your need for Ocassions', 'Ethnic Wear', NULL, 1599.00, 22, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749420/boutique/products/u2499xzyb2fpn8qlhrfs.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749421/boutique/products/faj1pzebqwbgftiyni8b.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 09:57:02', '2026-11-23 16:27:34', 'Estimated Delivery 4-6 Buissness days', 0),
(36, 'Indian Wedding Lehenga', 'Indian Wedding Lehenga To wear in Weddings', 'Ethnic Wear', NULL, 1999.00, 33, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749596/boutique/products/xgprwug94dc8qtvblgmi.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749597/boutique/products/gkzsjhngnxwpatamrf1p.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749598/boutique/products/tlqsd3mwb3opildsdkjq.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749599/boutique/products/b1xmcwjk2kzwtvsnfjw9.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 10:00:00', '2026-11-10 22:30:20', '4-5 Days Estimated Delivery', 0),
(37, 'Traditional Saree Lehenga', 'Saree Traditional Lehenga ', 'Ethnic Wear', NULL, 999.00, 43, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1792749671/boutique/products/jriaejl6mlo4cnheeldk.jpg\"]', 0, 1, 0.0, 0, '2026-10-23 10:01:12', '2026-10-23 10:36:15', '4-6 Buissness days Estimated Delivery', 0),
(38, 'kurti ', 'kurt', 'casual', NULL, 599.00, 10, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263045/boutique/products/unl9vs0lonco24vsuc67.jpg\"]', 0, 0, 0.0, 0, '2026-11-21 12:10:45', '2026-11-21 12:10:58', '3-5', 0),
(39, 'kurti ', 'kurt', 'casual', NULL, 599.00, 10, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263046/boutique/products/g9cn8kq0rt6y7zbjivuu.jpg\"]', 0, 0, 0.0, 0, '2026-11-21 12:10:47', '2026-11-21 12:11:57', '3-5', 0),
(40, 'kurti ', 'kurt', 'casual', NULL, 599.00, 10, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263047/boutique/products/htk4ci2fsvfm0f80fzbe.jpg\"]', 0, 0, 0.0, 0, '2026-11-21 12:10:48', '2026-11-21 12:10:55', '3-5', 0),
(41, 'kurti', 'kurti', 'casual', NULL, 599.00, 10, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263237/boutique/products/p91upfd740pdavrhfh4d.jpg\"]', 0, 0, 0.0, 0, '2026-11-21 12:13:58', '2026-11-21 12:16:25', '3-5', 0),
(42, 'Golu', 's hs', 'cd ', NULL, 255.00, 45455, NULL, NULL, '[\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263264/boutique/products/it7lit0gonxi6lsyr1qt.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263268/boutique/products/gc5m096z2zs5hut5pqbo.jpg\",\"https://res.cloudinary.com/ncoc4qbe/image/upload/v1795263272/boutique/products/kpmu7i4a8nygarf9agyk.jpg\"]', 0, 1, 0.0, 0, '2026-11-21 12:14:33', '2026-11-24 05:41:39', 'wjjaj', 0);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `approved` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `rating`, `comment`, `approved`, `createdAt`, `updatedAt`, `userId`, `productId`) VALUES
(1, 2, 'fantasting', 1, '2026-10-23 06:59:40', '2026-10-23 06:59:40', 6, 23),
(2, 2, 'this product is very good', 1, '2026-10-23 07:25:30', '2026-10-23 07:25:30', 6, 15),
(3, 5, 'fantastic', 1, '2026-10-23 07:26:05', '2026-10-23 07:26:05', 6, 27),
(4, 3, 'wa', 1, '2026-10-23 09:40:04', '2026-10-23 09:40:04', 6, 29),
(5, 5, 'bahut badiya', 1, '2026-11-24 07:32:06', '2026-11-24 07:32:06', 6, 35);

-- --------------------------------------------------------

--
-- Table structure for table `shipping_zones`
--

CREATE TABLE `shipping_zones` (
  `id` int(11) NOT NULL,
  `zoneName` varchar(255) NOT NULL,
  `zoneType` enum('city','state','country','pincode') NOT NULL DEFAULT 'city',
  `country` varchar(255) DEFAULT 'India',
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL COMMENT 'Single or comma separated: 400001,400002',
  `isActive` tinyint(1) DEFAULT 1,
  `baseShippingCost` decimal(10,2) DEFAULT 0.00,
  `freeShippingAbove` decimal(10,2) DEFAULT NULL,
  `estimatedDeliveryDays` varchar(255) DEFAULT '3-5 business days',
  `maxWeightKg` decimal(6,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipping_zones`
--

INSERT INTO `shipping_zones` (`id`, `zoneName`, `zoneType`, `country`, `state`, `city`, `pincode`, `isActive`, `baseShippingCost`, `freeShippingAbove`, `estimatedDeliveryDays`, `maxWeightKg`, `createdAt`, `updatedAt`) VALUES
(2, 'All Delhi Delivery', 'state', 'India', 'Delhi', NULL, NULL, 1, 75.00, 1999.00, '2-3 Days', NULL, '2026-10-22 18:45:14', '2026-10-22 18:45:14'),
(3, 'All Rajasthan Delivery', 'state', 'India', 'Rajasthan', NULL, NULL, 1, 60.00, 1599.00, '1-2 Days', NULL, '2026-10-22 18:46:26', '2026-10-22 18:46:26'),
(4, 'Mumbai Local', 'city', 'India', 'Delhi', 'New Delhi', '110067', 1, 100.00, 10000.00, '8days', NULL, '2026-11-24 06:12:10', '2026-11-24 06:12:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `phone` varchar(255) DEFAULT NULL,
  `suspended` tinyint(1) DEFAULT 0,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExpiry` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `suspended`, `resetToken`, `resetTokenExpiry`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', 'admin@boutique.com', '$2b$10$KnpSLoPKiNg53Te8oUKVRO/UK.vmt65nl9VD/B0zyJgE89YeBkHsa', 'admin', NULL, 0, NULL, NULL, '2026-10-16 16:53:39', '2026-10-16 16:53:39'),
(2, 'Demo Customer', 'customer@boutique.com', '$2b$10$zw89T1fMn7eXXRX6LxRpVeZM.Qht8xLGTTd/qTVAE2KgbDhmcv4/6', 'customer', NULL, 0, NULL, NULL, '2026-10-16 16:53:40', '2026-10-16 16:53:40'),
(6, 'Meeneshwar', 'meeneshwar2007@gmail.com', '$2b$10$P8JVHPPSmEQGdLNQiJBsSOFAs59AJKPNoDBH33rUUaBuY/Jarbs1K', 'customer', NULL, 0, NULL, NULL, '2026-10-17 10:44:23', '2026-11-21 12:10:30'),
(7, 'Rishabh', 'onlyrishabh@gmail.com', '$2b$10$2r3k0Kmq.QD1oblXDc5sleW0GcFnWiF3X0BP/4IPxLfW5rh0.Wyie', 'customer', NULL, 0, '210f26dcc2d340c1036cc97085b8deac013801944cf2deea67b9efa5815cbb12', '2026-10-21 09:00:20', '2026-10-21 07:59:58', '2026-10-22 14:14:32'),
(9, 'Himanshu', 'himaanshu2111@gmail.com', '$2b$10$pgX1HnM5bvTjQO/nLRvnqOz5ykB.r6/EK2sG2eNLzBS9yoXLbQW1q', 'customer', NULL, 0, NULL, NULL, '2026-10-21 08:05:08', '2026-10-21 08:05:08'),
(18, 'golu', 'g4326777@gmail.com', '$2b$10$UTc7kOCh0e1POFJAYYIAgOp6IkBdpL1zGgJJNGdrvSuUyn0PunD6m', 'customer', NULL, 0, NULL, NULL, '2026-10-22 13:42:16', '2026-10-22 18:07:26'),
(19, 'ABHISHEK YADAV', 'aabhishek759508@gmail.com', '$2b$10$YwvmDnMFbKWkKBDcivVN4ePd.xY7ivsHi2yR9daNiSoCELtqXOcNW', 'customer', NULL, 0, NULL, NULL, '2026-10-22 19:40:00', '2026-10-22 19:40:00'),
(20, 'Rishabh', 'onlyrisahbh@gmail.com', '$2b$10$ikkZtJ1PgkDeAyYCJFzmB.JzIr8ZukM1IQVQwuIY5oSPpAt8tJlNG', 'customer', NULL, 0, NULL, NULL, '2026-10-23 05:23:30', '2026-10-23 05:23:30'),
(21, 'hemant', 'hemanffcl@gmail.com', '$2b$10$Xvu4vLLAL9KGWwQk1OUgbOZWDj6FoAh0gylewqPgtw.ybQldbvEHG', 'customer', NULL, 0, '712e9202e9fc6c1cd6e75f58b87771ba83453b31401da3e1ce494780cae1c56b', '2026-10-23 11:06:53', '2026-10-23 10:05:34', '2026-10-23 10:06:53'),
(22, 'Rishabh ', 'ritikm2005@gmail.com', '$2b$10$vRj2T6eNQ5IWM9EUyKjLPu2xSv7e5RRYMQmoLomjuj0gsT6XJGM5C', 'customer', NULL, 0, NULL, NULL, '2026-10-23 10:33:20', '2026-10-23 10:52:46'),
(23, 'sandhya ', 'bhardwajsandhya05@gmail.com', '$2b$10$6feBolSyny1r7YB18TaD5OI7JvrXuRn5Cvc2kFzStxUwlfq3kjTEu', 'customer', NULL, 0, NULL, NULL, '2026-10-23 11:12:01', '2026-10-23 11:12:01'),
(24, 'Monika', 'monirsmeena@gmail.com', '$2b$10$YlSpVOMVLesECsXFNCxvr.j1AnvMXTdpqSeHVGBpVZUCS0QBHcAdS', 'customer', NULL, 0, NULL, NULL, '2026-11-10 22:29:07', '2026-11-10 22:29:07');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist_items`
--

INSERT INTO `wishlist_items` (`id`, `userId`, `productId`, `createdAt`, `updatedAt`) VALUES
(5, 6, 5, '2026-10-18 17:21:00', '2026-10-18 17:21:00'),
(6, 6, 11, '2026-10-18 17:21:02', '2026-10-18 17:21:02'),
(16, 6, 25, '2026-10-23 04:54:58', '2026-10-23 04:54:58'),
(17, 6, 26, '2026-10-23 04:55:00', '2026-10-23 04:55:00'),
(18, 6, 28, '2026-10-23 04:55:01', '2026-10-23 04:55:01'),
(19, 6, 27, '2026-10-23 07:12:11', '2026-10-23 07:12:11'),
(21, 1, 31, '2026-11-21 12:36:25', '2026-11-21 12:36:25'),
(25, 1, 35, '2026-11-21 12:36:25', '2026-11-21 12:36:25'),
(26, 6, 35, '2026-11-23 12:57:20', '2026-11-23 12:57:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_user_id_product_id_size_color` (`userId`,`productId`,`size`,`color`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD UNIQUE KEY `code_5` (`code`),
  ADD UNIQUE KEY `code_6` (`code`),
  ADD UNIQUE KEY `code_7` (`code`),
  ADD UNIQUE KEY `code_8` (`code`),
  ADD UNIQUE KEY `code_9` (`code`),
  ADD UNIQUE KEY `code_10` (`code`),
  ADD UNIQUE KEY `code_11` (`code`),
  ADD UNIQUE KEY `code_12` (`code`),
  ADD UNIQUE KEY `code_13` (`code`),
  ADD UNIQUE KEY `code_14` (`code`),
  ADD UNIQUE KEY `code_15` (`code`),
  ADD UNIQUE KEY `code_16` (`code`),
  ADD UNIQUE KEY `code_17` (`code`),
  ADD UNIQUE KEY `code_18` (`code`),
  ADD UNIQUE KEY `code_19` (`code`),
  ADD UNIQUE KEY `code_20` (`code`),
  ADD UNIQUE KEY `code_21` (`code`),
  ADD UNIQUE KEY `code_22` (`code`),
  ADD UNIQUE KEY `code_23` (`code`),
  ADD UNIQUE KEY `code_24` (`code`),
  ADD UNIQUE KEY `code_25` (`code`),
  ADD UNIQUE KEY `code_26` (`code`),
  ADD UNIQUE KEY `code_27` (`code`),
  ADD UNIQUE KEY `code_28` (`code`),
  ADD UNIQUE KEY `code_29` (`code`),
  ADD UNIQUE KEY `code_30` (`code`),
  ADD UNIQUE KEY `code_31` (`code`),
  ADD UNIQUE KEY `code_32` (`code`),
  ADD UNIQUE KEY `code_33` (`code`),
  ADD UNIQUE KEY `code_34` (`code`),
  ADD UNIQUE KEY `code_35` (`code`),
  ADD UNIQUE KEY `code_36` (`code`),
  ADD UNIQUE KEY `code_37` (`code`),
  ADD UNIQUE KEY `code_38` (`code`),
  ADD UNIQUE KEY `code_39` (`code`),
  ADD UNIQUE KEY `code_40` (`code`),
  ADD UNIQUE KEY `code_41` (`code`),
  ADD UNIQUE KEY `code_42` (`code`),
  ADD UNIQUE KEY `code_43` (`code`),
  ADD UNIQUE KEY `code_44` (`code`),
  ADD UNIQUE KEY `code_45` (`code`),
  ADD UNIQUE KEY `code_46` (`code`),
  ADD UNIQUE KEY `code_47` (`code`),
  ADD UNIQUE KEY `code_48` (`code`),
  ADD UNIQUE KEY `code_49` (`code`),
  ADD UNIQUE KEY `code_50` (`code`),
  ADD UNIQUE KEY `code_51` (`code`),
  ADD UNIQUE KEY `code_52` (`code`),
  ADD UNIQUE KEY `code_53` (`code`),
  ADD UNIQUE KEY `code_54` (`code`),
  ADD UNIQUE KEY `code_55` (`code`),
  ADD UNIQUE KEY `code_56` (`code`),
  ADD UNIQUE KEY `code_57` (`code`),
  ADD UNIQUE KEY `code_58` (`code`),
  ADD UNIQUE KEY `code_59` (`code`),
  ADD UNIQUE KEY `code_60` (`code`),
  ADD UNIQUE KEY `code_61` (`code`),
  ADD UNIQUE KEY `code_62` (`code`),
  ADD UNIQUE KEY `code_63` (`code`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `shipping_zones`
--
ALTER TABLE `shipping_zones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`);

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlist_items_user_id_product_id` (`userId`,`productId`),
  ADD KEY `productId` (`productId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shipping_zones`
--
ALTER TABLE `shipping_zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_135` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_136` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_135` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_136` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_57` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_58` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_ibfk_135` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlist_items_ibfk_136` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
