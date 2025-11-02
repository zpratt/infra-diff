import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { ParsePlanUseCase } from "../src/domain/usecases/ParsePlanUseCase";
import { TextFormatterUseCase } from "../src/domain/usecases/TextFormatterUseCase";

describe("E2E: JSON Parsing", () => {
	describe("Plan parsing", () => {
		it("should parse a plan with no changes", async () => {
			const content = await readFile("./fixtures/sample-plan.json", "utf-8");
			const parser = new ParsePlanUseCase();

			const plan = await parser.parse(content);

			expect(plan.resourceChanges).toHaveLength(0);
		});

		it("should parse a plan with additions", async () => {
			const content = await readFile(
				"./fixtures/plan-with-changes.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();

			const plan = await parser.parse(content);

			expect(plan.resourceChanges).toHaveLength(1);
			expect(plan.resourceChanges[0].actions).toContain("create");
		});

		it("should parse a plan with updates", async () => {
			const content = await readFile(
				"./fixtures/plan-with-updates.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();

			const plan = await parser.parse(content);

			expect(plan.resourceChanges).toHaveLength(1);
			expect(plan.resourceChanges[0].actions).toContain("update");
		});

		it("should parse a plan with deletions", async () => {
			const content = await readFile(
				"./fixtures/plan-with-deletions.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();

			const plan = await parser.parse(content);

			expect(plan.resourceChanges).toHaveLength(1);
			expect(plan.resourceChanges[0].actions).toContain("delete");
		});

		it("should parse a plan with mixed changes", async () => {
			const content = await readFile(
				"./fixtures/plan-with-mixed-changes.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();

			const plan = await parser.parse(content);

			expect(plan.resourceChanges).toHaveLength(3);

			const creates = plan.resourceChanges.filter((rc) =>
				rc.actions.includes("create"),
			);
			const updates = plan.resourceChanges.filter((rc) =>
				rc.actions.includes("update"),
			);
			const deletes = plan.resourceChanges.filter((rc) =>
				rc.actions.includes("delete"),
			);

			expect(creates).toHaveLength(1);
			expect(updates).toHaveLength(1);
			expect(deletes).toHaveLength(1);
		});

		it("should reject malformed JSON with descriptive error", async () => {
			const content = await readFile("./fixtures/malformed-plan.json", "utf-8");
			const parser = new ParsePlanUseCase();

			await expect(parser.parse(content)).rejects.toThrow(
				"Invalid JSON in plan file",
			);
		});
	});

	describe("Text formatting", () => {
		it("should format a plan with no changes", async () => {
			const content = await readFile("./fixtures/sample-plan.json", "utf-8");
			const parser = new ParsePlanUseCase();
			const formatter = new TextFormatterUseCase();

			const plan = await parser.parse(content);
			const result = formatter.format(plan);

			expect(result).toContain("No changes");
			expect(result).toContain("0 to add");
			expect(result).toContain("0 to change");
			expect(result).toContain("0 to destroy");
		});

		it("should format a plan with additions", async () => {
			const content = await readFile(
				"./fixtures/plan-with-changes.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();
			const formatter = new TextFormatterUseCase();

			const plan = await parser.parse(content);
			const result = formatter.format(plan);

			expect(result).toContain("1 to add");
			expect(result).toContain("aws_s3_bucket.example");
			expect(result).toContain("create");
		});

		it("should format a plan with updates", async () => {
			const content = await readFile(
				"./fixtures/plan-with-updates.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();
			const formatter = new TextFormatterUseCase();

			const plan = await parser.parse(content);
			const result = formatter.format(plan);

			expect(result).toContain("1 to change");
			expect(result).toContain("aws_s3_bucket.updated");
			expect(result).toContain("update");
		});

		it("should format a plan with deletions", async () => {
			const content = await readFile(
				"./fixtures/plan-with-deletions.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();
			const formatter = new TextFormatterUseCase();

			const plan = await parser.parse(content);
			const result = formatter.format(plan);

			expect(result).toContain("1 to destroy");
			expect(result).toContain("aws_s3_bucket.deleted");
			expect(result).toContain("delete");
		});

		it("should format a plan with mixed changes", async () => {
			const content = await readFile(
				"./fixtures/plan-with-mixed-changes.json",
				"utf-8",
			);
			const parser = new ParsePlanUseCase();
			const formatter = new TextFormatterUseCase();

			const plan = await parser.parse(content);
			const result = formatter.format(plan);

			expect(result).toContain("1 to add");
			expect(result).toContain("1 to change");
			expect(result).toContain("1 to destroy");

			expect(result).toContain("aws_s3_bucket.new");
			expect(result).toContain("aws_s3_bucket.updated");
			expect(result).toContain("aws_s3_bucket.deleted");
		});
	});
});
