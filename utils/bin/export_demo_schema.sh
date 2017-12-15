#!/bin/bash

target='cmdbuild/src/main/webapp/WEB-INF/sql/sample_schemas/demo_schema.sql'
source_database='cmdbuild'

[ -e "$target" ] || { echo "run this from cmdbuild-main/ project root dir";exit 1; }

sudo -u postgres pg_dump -U postgres --format=plain --schema='public|quartz' --no-owner --inserts $source_database | \
	egrep -v '^(--|REVOKE ALL ON SCHEMA|GRANT ALL ON SCHEMA|SET search_path|SET (statement_timeout|client_encoding|row_security))' | \
	sed -r -e 's/(ON|ALTER TABLE ONLY|INSERT INTO|CREATE TABLE|REFERENCES) qrtz_/\1 quartz.qrtz_/g' | \
	cat -s \
	> $target

echo "schema exported to $(du -sh "$target")"


