
-- TODO: these patches have to be included inside base_schema scripts

-- patch 2.5.0-01
-- BIM module functions revision

DROP FUNCTION public._bim_create_function_for_export();
DROP FUNCTION public._bim_update_coordinates(character varying, character varying, character varying, character varying, character varying);
DROP FUNCTION public._bim_store_data(integer, character varying, character varying, character varying, character varying, character varying);
DROP FUNCTION public._bim_set_coordinates(character varying, character varying, character varying);
DROP FUNCTION public._bim_set_room_geometry(character varying, character varying, character varying, character varying);

ALTER TABLE public."_BimProject" DROP COLUMN "ExportMapping";
ALTER TABLE public."_BimProject" DROP COLUMN "ExportProjectId";
ALTER TABLE public."_BimProject" DROP COLUMN "ShapesProjectId";
ALTER TABLE public."_BimProject" DROP COLUMN "Synchronized";

ALTER TABLE public."_BimLayer" DROP COLUMN "Export";
ALTER TABLE public."_BimLayer" DROP COLUMN "Container";

CREATE OR REPLACE FUNCTION public._bim_carddata_from_globalid(IN globalid character varying, OUT "Id" integer, OUT "IdClass" integer, OUT "Description" character varying, OUT "ClassName" character varying)
  RETURNS record AS
$BODY$
DECLARE
	query varchar;
	table_name varchar;
	tables CURSOR FOR SELECT tablename FROM pg_tables WHERE schemaname = 'bim' ORDER BY tablename;
	
BEGIN
	query='';
	FOR table_record IN tables LOOP
		query= query || '
		SELECT	b."Master" as "Id" , 
			p."Description" AS "Description", 
			p."IdClass"::integer as "IdClass" ,
			replace(p."IdClass"::text,''"'','''') as "ClassName"
		FROM bim."' || table_record.tablename || '" AS b 
			JOIN public."' ||  table_record.tablename || '" AS p 
			ON b."Master"=p."Id" 
		WHERE p."Status"=''A'' AND b."GlobalId" = ''' || globalid || ''' UNION ALL';
	END LOOP;

	SELECT substring(query from 0 for LENGTH(query)-9) INTO query;
	RAISE NOTICE 'execute query : %', query;
	EXECUTE(query) INTO "Id","Description","IdClass","ClassName";
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
COMMENT ON FUNCTION public._bim_carddata_from_globalid(character varying) IS 'TYPE: function';

-- patch 2.5.0-02
-- Add columns to User table for password expiration policy, fix User and Role columns visibility

SELECT * FROM cm_create_class_attribute('User', 'PasswordExpiration', 'timestamp without time zone', null, false, false, 'MODE: read|DESCR: Password expiration date|INDEX: 11|BASEDSP: true|STATUS: active');
SELECT * FROM cm_create_class_attribute('User', 'LastPasswordChange', 'timestamp without time zone', null, false, false, 'MODE: read|DESCR: Last password change date|INDEX: 12|BASEDSP: false|STATUS: active');
SELECT * FROM cm_create_class_attribute('User', 'LastExpiringNotification', 'timestamp without time zone', null, false, false, 'MODE: read|DESCR: Last expiring notification|INDEX: 13|BASEDSP: false|STATUS: active');

COMMENT ON COLUMN "User"."Id" IS 'MODE: reserved';
COMMENT ON COLUMN "User"."IdClass" IS 'MODE: reserved';
COMMENT ON COLUMN "User"."Code" IS 'MODE: hidden|DESCR: Code|INDEX: 1|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."Description" IS 'MODE: read|DESCR: Description|INDEX: 2|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "User"."Status" IS 'MODE: reserved';
COMMENT ON COLUMN "User"."User" IS 'MODE: reserved';
COMMENT ON COLUMN "User"."BeginDate" IS 'MODE: reserved';
COMMENT ON COLUMN "User"."Notes" IS 'MODE: read|DESCR: Notes|INDEX: 3';
COMMENT ON COLUMN "User"."Username" IS 'MODE: read|DESCR: Username|INDEX: 5|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "User"."Password" IS 'MODE: hidden|DESCR: Password|INDEX: 6|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."Email" IS 'MODE: read|DESCR: Email|INDEX: 7|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "User"."Active" IS 'MODE: read|DESCR: Active|INDEX: 8|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "User"."Service" IS 'MODE: hidden|DESCR: Service|INDEX: 9|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."Privileged" IS 'MODE: hidden|DESCR: Privileged|INDEX: 10|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."PasswordExpiration" IS 'MODE: hidden|DESCR: Password expiration date|INDEX: 11|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."LastPasswordChange" IS 'MODE: hidden|DESCR: Last password change date|INDEX: 12|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "User"."LastExpiringNotification" IS 'MODE: hidden|DESCR: Last expiring notification|INDEX: 13|BASEDSP: false|STATUS: active|GROUP: |FIELDMODE: hidden';

COMMENT ON COLUMN "Role"."Id" IS 'MODE: reserved';
COMMENT ON COLUMN "Role"."IdClass" IS 'MODE: reserved';
COMMENT ON COLUMN "Role"."Code" IS 'MODE: read|DESCR: Code|INDEX: 1|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "Role"."Description" IS 'MODE: read|DESCR: Description|INDEX: 2|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';
COMMENT ON COLUMN "Role"."Status" IS 'MODE: reserved';
COMMENT ON COLUMN "Role"."User" IS 'MODE: reserved';
COMMENT ON COLUMN "Role"."BeginDate" IS 'MODE: reserved';
COMMENT ON COLUMN "Role"."Notes" IS 'MODE: read|DESCR: Notes|INDEX: 3';
COMMENT ON COLUMN "Role"."Administrator" IS 'MODE: hidden|DESCR: Administrator|INDEX: 5|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."startingClass" IS 'MODE: hidden|DESCR: Starting Class|INDEX: 6|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."Email" IS 'MODE: hidden|DESCR: Email|INDEX: 7|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."DisabledModules" IS  'MODE: hidden|DESCR: DisabledModules|INDEX: 8|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."DisabledCardTabs" IS  'MODE: hidden|DESCR: DisabledCardTabs|INDEX: 9|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."DisabledProcessTabs" IS  'MODE: hidden|DESCR: DisabledProcessTabs|INDEX: 10|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."HideSidePanel" IS  'MODE: hidden|DESCR: HideSidePanel|INDEX: 11|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."FullScreenMode" IS  'MODE: hidden|DESCR: FullScreenMode|INDEX: 12|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."SimpleHistoryModeForCard" IS  'MODE: hidden|DESCR: SimpleHistoryModeForCard|INDEX: 13|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."SimpleHistoryModeForProcess" IS  'MODE: hidden|DESCR: SimpleHistoryModeForProcess|INDEX: 14|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."ProcessWidgetAlwaysEnabled" IS  'MODE: hidden|DESCR: ProcessWidgetAlwaysEnabled|INDEX: 15|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."CloudAdmin" IS  'MODE: hidden|DESCR: CloudAdmin|INDEX: 16|STATUS: active|GROUP: |FIELDMODE: hidden';
COMMENT ON COLUMN "Role"."Active" IS  'MODE: read|DESCR: Active|INDEX: 17|BASEDSP: true|STATUS: active|GROUP: |FIELDMODE: read';


-- patch 2.5.0-03
-- Create quartz schema

CREATE SCHEMA IF NOT EXISTS quartz;

drop table if exists quartz.qrtz_fired_triggers;
drop table if exists quartz.qrtz_scheduler_state;
drop table if exists quartz.qrtz_locks;
drop table if exists quartz.qrtz_simple_triggers;
drop table if exists quartz.qrtz_cron_triggers;
drop table if exists quartz.qrtz_blob_triggers;
drop table if exists quartz.qrtz_simprop_triggers;
drop table if exists quartz.qrtz_paused_trigger_grps;
drop table if exists quartz.qrtz_triggers;
drop table if exists quartz.qrtz_job_details;
drop table if exists quartz.qrtz_calendars;

CREATE TABLE quartz.qrtz_job_details
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    JOB_NAME  VARCHAR(200) NOT NULL,
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    JOB_CLASS_NAME   VARCHAR(250) NOT NULL, 
    IS_DURABLE BOOL NOT NULL,
    IS_NONCONCURRENT BOOL NOT NULL,
    IS_UPDATE_DATA BOOL NOT NULL,
    REQUESTS_RECOVERY BOOL NOT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME,JOB_NAME,JOB_GROUP)
);

CREATE TABLE quartz.qrtz_triggers
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    JOB_NAME  VARCHAR(200) NOT NULL, 
    JOB_GROUP VARCHAR(200) NOT NULL,
    DESCRIPTION VARCHAR(250) NULL,
    NEXT_FIRE_TIME BIGINT NULL,
    PREV_FIRE_TIME BIGINT NULL,
    PRIORITY INTEGER NULL,
    TRIGGER_STATE VARCHAR(16) NOT NULL,
    TRIGGER_TYPE VARCHAR(8) NOT NULL,
    START_TIME BIGINT NOT NULL,
    END_TIME BIGINT NULL,
    CALENDAR_NAME VARCHAR(200) NULL,
    MISFIRE_INSTR SMALLINT NULL,
    JOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,JOB_NAME,JOB_GROUP) 
	REFERENCES quartz.QRTZ_JOB_DETAILS(SCHED_NAME,JOB_NAME,JOB_GROUP) 
);

CREATE TABLE quartz.qrtz_simple_triggers
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    REPEAT_COUNT BIGINT NOT NULL,
    REPEAT_INTERVAL BIGINT NOT NULL,
    TIMES_TRIGGERED BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP) 
	REFERENCES quartz.QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE quartz.qrtz_cron_triggers
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    CRON_EXPRESSION VARCHAR(120) NOT NULL,
    TIME_ZONE_ID VARCHAR(80),
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP) 
	REFERENCES quartz.QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE quartz.qrtz_simprop_triggers
  (          
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    STR_PROP_1 VARCHAR(512) NULL,
    STR_PROP_2 VARCHAR(512) NULL,
    STR_PROP_3 VARCHAR(512) NULL,
    INT_PROP_1 INT NULL,
    INT_PROP_2 INT NULL,
    LONG_PROP_1 BIGINT NULL,
    LONG_PROP_2 BIGINT NULL,
    DEC_PROP_1 NUMERIC(13,4) NULL,
    DEC_PROP_2 NUMERIC(13,4) NULL,
    BOOL_PROP_1 BOOL NULL,
    BOOL_PROP_2 BOOL NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP) 
    REFERENCES quartz.QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE quartz.qrtz_blob_triggers
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    BLOB_DATA BYTEA NULL,
    PRIMARY KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP),
    FOREIGN KEY (SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP) 
	REFERENCES quartz.QRTZ_TRIGGERS(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP)
);

CREATE TABLE quartz.qrtz_calendars
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    CALENDAR_NAME  VARCHAR(200) NOT NULL, 
    CALENDAR BYTEA NOT NULL,
    PRIMARY KEY (SCHED_NAME,CALENDAR_NAME)
);


CREATE TABLE quartz.qrtz_paused_trigger_grps
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    TRIGGER_GROUP  VARCHAR(200) NOT NULL, 
    PRIMARY KEY (SCHED_NAME,TRIGGER_GROUP)
);

CREATE TABLE quartz.qrtz_fired_triggers 
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    ENTRY_ID VARCHAR(95) NOT NULL,
    TRIGGER_NAME VARCHAR(200) NOT NULL,
    TRIGGER_GROUP VARCHAR(200) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    FIRED_TIME BIGINT NOT NULL,
    SCHED_TIME BIGINT NOT NULL,
    PRIORITY INTEGER NOT NULL,
    STATE VARCHAR(16) NOT NULL,
    JOB_NAME VARCHAR(200) NULL,
    JOB_GROUP VARCHAR(200) NULL,
    IS_NONCONCURRENT BOOL NULL,
    REQUESTS_RECOVERY BOOL NULL,
    PRIMARY KEY (SCHED_NAME,ENTRY_ID)
);

CREATE TABLE quartz.qrtz_scheduler_state 
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    INSTANCE_NAME VARCHAR(200) NOT NULL,
    LAST_CHECKIN_TIME BIGINT NOT NULL,
    CHECKIN_INTERVAL BIGINT NOT NULL,
    PRIMARY KEY (SCHED_NAME,INSTANCE_NAME)
);

CREATE TABLE quartz.qrtz_locks
  (
    SCHED_NAME VARCHAR(120) NOT NULL,
    LOCK_NAME  VARCHAR(40) NOT NULL, 
    PRIMARY KEY (SCHED_NAME,LOCK_NAME)
);

create index idx_qrtz_j_req_recovery on quartz.qrtz_job_details(SCHED_NAME,REQUESTS_RECOVERY);
create index idx_qrtz_j_grp on quartz.qrtz_job_details(SCHED_NAME,JOB_GROUP);

create index idx_qrtz_t_j on quartz.qrtz_triggers(SCHED_NAME,JOB_NAME,JOB_GROUP);
create index idx_qrtz_t_jg on quartz.qrtz_triggers(SCHED_NAME,JOB_GROUP);
create index idx_qrtz_t_c on quartz.qrtz_triggers(SCHED_NAME,CALENDAR_NAME);
create index idx_qrtz_t_g on quartz.qrtz_triggers(SCHED_NAME,TRIGGER_GROUP);
create index idx_qrtz_t_state on quartz.qrtz_triggers(SCHED_NAME,TRIGGER_STATE);
create index idx_qrtz_t_n_state on quartz.qrtz_triggers(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP,TRIGGER_STATE);
create index idx_qrtz_t_n_g_state on quartz.qrtz_triggers(SCHED_NAME,TRIGGER_GROUP,TRIGGER_STATE);
create index idx_qrtz_t_next_fire_time on quartz.qrtz_triggers(SCHED_NAME,NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st on quartz.qrtz_triggers(SCHED_NAME,TRIGGER_STATE,NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_misfire on quartz.qrtz_triggers(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME);
create index idx_qrtz_t_nft_st_misfire on quartz.qrtz_triggers(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME,TRIGGER_STATE);
create index idx_qrtz_t_nft_st_misfire_grp on quartz.qrtz_triggers(SCHED_NAME,MISFIRE_INSTR,NEXT_FIRE_TIME,TRIGGER_GROUP,TRIGGER_STATE);

create index idx_qrtz_ft_trig_inst_name on quartz.qrtz_fired_triggers(SCHED_NAME,INSTANCE_NAME);
create index idx_qrtz_ft_inst_job_req_rcvry on quartz.qrtz_fired_triggers(SCHED_NAME,INSTANCE_NAME,REQUESTS_RECOVERY);
create index idx_qrtz_ft_j_g on quartz.qrtz_fired_triggers(SCHED_NAME,JOB_NAME,JOB_GROUP);
create index idx_qrtz_ft_jg on quartz.qrtz_fired_triggers(SCHED_NAME,JOB_GROUP);
create index idx_qrtz_ft_t_g on quartz.qrtz_fired_triggers(SCHED_NAME,TRIGGER_NAME,TRIGGER_GROUP);
create index idx_qrtz_ft_tg on quartz.qrtz_fired_triggers(SCHED_NAME,TRIGGER_GROUP);
