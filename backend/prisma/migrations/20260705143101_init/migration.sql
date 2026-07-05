-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'user');

-- CreateEnum
CREATE TYPE "DrawType" AS ENUM ('lunch', 'tea');

-- CreateEnum
CREATE TYPE "DrawSource" AS ENUM ('manual', 'import');

-- CreateEnum
CREATE TYPE "PatternStatus" AS ENUM ('active', 'warning', 'failed');

-- CreateEnum
CREATE TYPE "BacktestStatus" AS ENUM ('queued', 'running', 'done', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draws" (
    "id" TEXT NOT NULL,
    "draw_date" DATE NOT NULL,
    "draw_type" "DrawType" NOT NULL,
    "numbers" INTEGER[],
    "bonus" INTEGER NOT NULL,
    "source" "DrawSource" NOT NULL DEFAULT 'manual',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engine_definitions" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "config" JSONB,

    CONSTRAINT "engine_definitions_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "patterns" (
    "id" TEXT NOT NULL,
    "engine_code" TEXT NOT NULL,
    "draw_type" "DrawType",
    "position_a" INTEGER NOT NULL,
    "position_b" INTEGER NOT NULL,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "status" "PatternStatus" NOT NULL DEFAULT 'active',
    "occurrences" INTEGER NOT NULL DEFAULT 0,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_history" (
    "id" TEXT NOT NULL,
    "pattern_id" TEXT NOT NULL,
    "source_draw_id" TEXT NOT NULL,
    "target_draw_id" TEXT,
    "add_preds" INTEGER[],
    "sub_preds" INTEGER[],
    "add_hit" BOOLEAN NOT NULL,
    "sub_hit" BOOLEAN NOT NULL,
    "hit" BOOLEAN NOT NULL,
    "add_direct_hit" BOOLEAN,
    "sub_direct_hit" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_snapshots" (
    "id" TEXT NOT NULL,
    "engine_code" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "as_of_draw_id" TEXT,
    "payload" JSONB NOT NULL,

    CONSTRAINT "prediction_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "numbers" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_runs" (
    "id" TEXT NOT NULL,
    "engine_code" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "status" "BacktestStatus" NOT NULL DEFAULT 'queued',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "backtest_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_results" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "backtest_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "draws_draw_date_draw_type_key" ON "draws"("draw_date", "draw_type");

-- CreateIndex
CREATE INDEX "patterns_engine_code_status_idx" ON "patterns"("engine_code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "patterns_engine_code_draw_type_position_a_position_b_key" ON "patterns"("engine_code", "draw_type", "position_a", "position_b");

-- CreateIndex
CREATE INDEX "pattern_history_pattern_id_idx" ON "pattern_history"("pattern_id");

-- CreateIndex
CREATE INDEX "prediction_snapshots_engine_code_generated_at_idx" ON "prediction_snapshots"("engine_code", "generated_at");

-- AddForeignKey
ALTER TABLE "draws" ADD CONSTRAINT "draws_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_engine_code_fkey" FOREIGN KEY ("engine_code") REFERENCES "engine_definitions"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_history" ADD CONSTRAINT "pattern_history_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "patterns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_history" ADD CONSTRAINT "pattern_history_source_draw_id_fkey" FOREIGN KEY ("source_draw_id") REFERENCES "draws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_history" ADD CONSTRAINT "pattern_history_target_draw_id_fkey" FOREIGN KEY ("target_draw_id") REFERENCES "draws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_snapshots" ADD CONSTRAINT "prediction_snapshots_as_of_draw_id_fkey" FOREIGN KEY ("as_of_draw_id") REFERENCES "draws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_runs" ADD CONSTRAINT "backtest_runs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_results" ADD CONSTRAINT "backtest_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "backtest_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
