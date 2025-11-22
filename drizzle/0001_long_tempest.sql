ALTER TABLE "survey_questions" ADD COLUMN "section_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "survey_requests" ADD COLUMN "brand_description" text;--> statement-breakpoint
ALTER TABLE "survey_requests" ADD COLUMN "brand_category" text;--> statement-breakpoint
ALTER TABLE "survey_requests" ADD COLUMN "brand_market" text;--> statement-breakpoint
CREATE INDEX "idx_survey_questions_section" ON "survey_questions" USING btree ("survey_request_id","section_id");