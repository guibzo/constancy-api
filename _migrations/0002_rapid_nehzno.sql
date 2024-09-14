ALTER TABLE "goal_completions" RENAME TO "goal_conclusions";--> statement-breakpoint
ALTER TABLE "goal_conclusions" DROP CONSTRAINT "goal_completions_goal_id_goals_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_conclusions" ADD CONSTRAINT "goal_conclusions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
