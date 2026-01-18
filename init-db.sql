-- ================================
-- Infinite Loopers Database Initialization
-- Creates separate schemas for each microservice
-- ================================

-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS tasks;
CREATE SCHEMA IF NOT EXISTS achievements;
CREATE SCHEMA IF NOT EXISTS shop;

-- Grant permissions
GRANT ALL ON SCHEMA users TO infiniteloopers;
GRANT ALL ON SCHEMA tasks TO infiniteloopers;
GRANT ALL ON SCHEMA achievements TO infiniteloopers;
GRANT ALL ON SCHEMA shop TO infiniteloopers;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Database schemas created successfully';
END $$;
