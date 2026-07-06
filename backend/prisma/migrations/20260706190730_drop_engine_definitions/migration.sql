-- The engine_definitions table only ever existed to satisfy an FK on
-- patterns.engine_code. Nothing reads the table - engine codes/labels are
-- validated and defined in code (src/engines/catalog.js) before a Pattern
-- row is ever touched, so the FK duplicated validation that already
-- happens at the application layer.
ALTER TABLE "patterns" DROP CONSTRAINT "patterns_engine_code_fkey";

DROP TABLE "engine_definitions";
