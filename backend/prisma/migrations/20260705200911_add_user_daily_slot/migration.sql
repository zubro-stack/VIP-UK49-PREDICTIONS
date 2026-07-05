-- Add a permanent, sequential slot per user for the Daily Triplet feature.
CREATE SEQUENCE IF NOT EXISTS "users_daily_slot_seq";

ALTER TABLE "users" ADD COLUMN "daily_slot" INTEGER;

UPDATE "users" SET "daily_slot" = nextval('users_daily_slot_seq') WHERE "daily_slot" IS NULL;

ALTER TABLE "users" ALTER COLUMN "daily_slot" SET DEFAULT nextval('users_daily_slot_seq');
ALTER TABLE "users" ALTER COLUMN "daily_slot" SET NOT NULL;

ALTER SEQUENCE "users_daily_slot_seq" OWNED BY "users"."daily_slot";

CREATE UNIQUE INDEX "users_daily_slot_key" ON "users"("daily_slot");
