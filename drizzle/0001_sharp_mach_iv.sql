CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`announcement_date` date NOT NULL,
	`investor_name` varchar(255) NOT NULL,
	`investor_stock_code` varchar(50),
	`target_country` varchar(100),
	`target_company_name` varchar(255),
	`target_industry` varchar(100),
	`investment_type` enum('M&A','Greenfield') NOT NULL,
	`deal_size_usd` decimal(15,2),
	`status` enum('Completed','Pending','Terminated') NOT NULL DEFAULT 'Pending',
	`deal_specifics` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
