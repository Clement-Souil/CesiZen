using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CESIZenAPI.Migrations
{
    public partial class AddIsActiveToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add IsActive column to Users
            migrationBuilder.Sql(@"
                ALTER TABLE `Users`
                ADD COLUMN `IsActive` tinyint(1) NOT NULL DEFAULT TRUE;
            ");

            // Ajout conditionnel de la contrainte unique sur Email
            migrationBuilder.Sql(@"
                SET @constraint_exists = (
                    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'Users'
                    AND CONSTRAINT_NAME = 'AK_Users_Email'
                );
                SET @sql = IF(@constraint_exists = 0,
                    'ALTER TABLE `Users` ADD CONSTRAINT `AK_Users_Email` UNIQUE (`Email`)',
                    'SELECT 1'
                );
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Création conditionnelle de Resources
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS `Resources` (
                    `Id` int NOT NULL AUTO_INCREMENT,
                    `Title` longtext CHARACTER SET utf8mb4 NOT NULL,
                    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
                    `Content` longtext CHARACTER SET utf8mb4 NOT NULL,
                    `Category` longtext CHARACTER SET utf8mb4 NULL,
                    `AuthorEmail` longtext CHARACTER SET utf8mb4 NULL,
                    `IsApproved` tinyint(1) NOT NULL DEFAULT FALSE,
                    `CreatedAt` datetime(6) NOT NULL,
                    CONSTRAINT `PK_Resources` PRIMARY KEY (`Id`)
                ) CHARACTER SET=utf8mb4;
            ");

            // Création conditionnelle de StressResults
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS `StressResults` (
                    `Id` int NOT NULL AUTO_INCREMENT,
                    `UserEmail` varchar(255) CHARACTER SET utf8mb4 NULL,
                    `Score` int NOT NULL,
                    `Level` longtext CHARACTER SET utf8mb4 NULL,
                    `CreatedAt` datetime(6) NOT NULL,
                    CONSTRAINT `PK_StressResults` PRIMARY KEY (`Id`),
                    CONSTRAINT `FK_StressResults_Users_UserEmail`
                        FOREIGN KEY (`UserEmail`) REFERENCES `Users` (`Email`)
                ) CHARACTER SET=utf8mb4;
            ");

            // Index conditionnel
            migrationBuilder.Sql(@"
                SET @index_exists = (
                    SELECT COUNT(*) FROM information_schema.STATISTICS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'StressResults'
                    AND INDEX_NAME = 'IX_StressResults_UserEmail'
                );
                SET @sql2 = IF(@index_exists = 0,
                    'CREATE INDEX `IX_StressResults_UserEmail` ON `StressResults` (`UserEmail`)',
                    'SELECT 1'
                );
                PREPARE stmt2 FROM @sql2;
                EXECUTE stmt2;
                DEALLOCATE PREPARE stmt2;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `StressResults`;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS `Resources`;");
            migrationBuilder.Sql("ALTER TABLE `Users` DROP CONSTRAINT IF EXISTS `AK_Users_Email`;");
            migrationBuilder.Sql("ALTER TABLE `Users` DROP COLUMN IF EXISTS `IsActive`;");
        }
    }
}
