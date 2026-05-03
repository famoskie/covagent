CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`covenantResultId` int NOT NULL,
	`borrowerId` int NOT NULL,
	`loanId` int NOT NULL,
	`covenantType` varchar(64) NOT NULL,
	`severity` enum('Warning','Breach') NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `borrowers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(128),
	`riskRating` enum('Low','Medium','High','Watch') NOT NULL DEFAULT 'Medium',
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `borrowers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `covenant_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`covenantId` int NOT NULL,
	`borrowerId` int NOT NULL,
	`loanId` int NOT NULL,
	`calculatedValue` decimal(18,4),
	`thresholdValue` decimal(18,4) NOT NULL,
	`operator` varchar(4) NOT NULL,
	`covenantType` varchar(64) NOT NULL,
	`status` enum('Compliant','Warning','Breach') NOT NULL,
	`evaluatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `covenant_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `covenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`borrowerId` int NOT NULL,
	`covenantType` enum('DSCR','Leverage Ratio','Current Ratio','Interest Coverage','Debt to EBITDA','Minimum Liquidity') NOT NULL,
	`operator` enum('>=','<=','>','<','=') NOT NULL,
	`thresholdValue` decimal(18,4) NOT NULL,
	`reportingFrequency` enum('Monthly','Quarterly','Semi-Annual','Annual') NOT NULL DEFAULT 'Quarterly',
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `covenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`borrowerId` int NOT NULL,
	`loanId` int NOT NULL,
	`submittedByUserId` int NOT NULL,
	`periodLabel` varchar(64) NOT NULL,
	`periodEndDate` timestamp NOT NULL,
	`statementType` enum('Quarterly','Annual','Monthly') NOT NULL DEFAULT 'Quarterly',
	`revenue` decimal(18,2),
	`ebitda` decimal(18,2),
	`ebit` decimal(18,2),
	`interestExpense` decimal(18,2),
	`netIncome` decimal(18,2),
	`totalAssets` decimal(18,2),
	`currentAssets` decimal(18,2),
	`currentLiabilities` decimal(18,2),
	`totalDebt` decimal(18,2),
	`totalEquity` decimal(18,2),
	`operatingCashFlow` decimal(18,2),
	`debtServicePayments` decimal(18,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`borrowerId` int NOT NULL,
	`facilityName` varchar(255) NOT NULL,
	`facilityAmount` decimal(18,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'USD',
	`effectiveDate` timestamp NOT NULL,
	`maturityDate` timestamp NOT NULL,
	`status` enum('Active','Closed','Defaulted') NOT NULL DEFAULT 'Active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','analyst','rm') NOT NULL DEFAULT 'rm';