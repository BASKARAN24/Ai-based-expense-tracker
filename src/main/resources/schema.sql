-- Reference schema for the AI Expense Tracker.
-- Hibernate creates/updates these tables automatically (spring.jpa.hibernate.ddl-auto=update),
-- but this file is provided for manual database setup, migrations, or documentation.

CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(120)   NOT NULL,
    email           VARCHAR(150)   NOT NULL UNIQUE,
    password        VARCHAR(255)   NOT NULL,
    monthly_income  DECIMAL(12,2),
    created_at      DATETIME       NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT         NOT NULL,
    amount          DECIMAL(12,2)  NOT NULL,
    category        VARCHAR(30)    NOT NULL,
    description     VARCHAR(255),
    expense_date    DATE           NOT NULL,
    created_at      DATETIME       NOT NULL,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
