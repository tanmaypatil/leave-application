CREATE USER hasurauser WITH PASSWORD 'hasurauser';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS hdb_catalog;
CREATE SCHEMA IF NOT EXISTS hdb_views;

ALTER SCHEMA hdb_catalog OWNER TO hasurauser;
ALTER SCHEMA hdb_views OWNER TO hasurauser;

GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO hasurauser;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO hasurauser;

GRANT hasurauser to postgres;

GRANT USAGE ON SCHEMA public TO hasurauser;


CREATE EXTENSION IF NOT EXISTS pgcrypto;

select * from pg_available_extensions;




