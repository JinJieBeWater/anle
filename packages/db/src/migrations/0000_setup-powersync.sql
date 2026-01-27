-- Custom SQL migration file, put your code below! --
-- 1. Enable logical replication (requires restart)
-- ALTER SYSTEM SET wal_level = logical;

-- 2. Create PowerSync database user/role with replication privileges and read-only access to your tables
CREATE ROLE powersync_role WITH REPLICATION BYPASSRLS LOGIN PASSWORD 'myhighlyrandompassword';

-- Set up permissions for the newly created role
-- Read-only (SELECT) access is required
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync_role;

-- Optionally, grant SELECT on all future tables (to cater for schema additions)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync_role;

-- 3. Create a publication to replicate tables. The publication must be named "powersync"
CREATE PUBLICATION powersync FOR ALL TABLES;
