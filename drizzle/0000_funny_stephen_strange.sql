CREATE TABLE "survey_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_request_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"options" jsonb,
	"config" jsonb,
	"rationale" text NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" text NOT NULL,
	"context" text NOT NULL,
	"goals" text NOT NULL,
	"audience" text NOT NULL,
	"question_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_survey_request_id_survey_requests_id_fk" FOREIGN KEY ("survey_request_id") REFERENCES "public"."survey_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_survey_questions_request_id" ON "survey_questions" USING btree ("survey_request_id");--> statement-breakpoint
CREATE INDEX "idx_survey_questions_order" ON "survey_questions" USING btree ("survey_request_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_survey_requests_created_at" ON "survey_requests" USING btree ("created_at");