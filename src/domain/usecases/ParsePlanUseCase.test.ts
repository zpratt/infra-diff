import Chance from "chance";
import { describe, expect, it } from "vitest";
import { Plan, ResourceChange } from "../entities/Plan";
import { ParsePlanUseCase } from "./ParsePlanUseCase";

const chance = new Chance();

describe("ParsePlanUseCase", () => {
	it("should parse a valid JSON plan string into a Plan object", async () => {
		const formatVersion = "1.0";
		const terraformVersion = "1.5.0";
		const jsonContent = JSON.stringify({
			format_version: formatVersion,
			terraform_version: terraformVersion,
			resource_changes: [],
		});

		const parser = new ParsePlanUseCase();
		const result = await parser.parse(jsonContent);

		expect(result).toBeInstanceOf(Plan);
		expect(result.formatVersion).toBe(formatVersion);
		expect(result.terraformVersion).toBe(terraformVersion);
		expect(result.resourceChanges).toEqual([]);
	});

	it("should parse a plan with resource changes", async () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const jsonContent = JSON.stringify({
			format_version: "1.0",
			terraform_version: "1.5.0",
			resource_changes: [
				{
					address,
					type,
					name,
					change: {
						actions: ["create"],
						before: null,
						after: { key: "value" },
					},
				},
			],
		});

		const parser = new ParsePlanUseCase();
		const result = await parser.parse(jsonContent);

		expect(result.resourceChanges).toHaveLength(1);
		expect(result.resourceChanges[0]).toBeInstanceOf(ResourceChange);
		expect(result.resourceChanges[0].address).toBe(address);
		expect(result.resourceChanges[0].type).toBe(type);
		expect(result.resourceChanges[0].name).toBe(name);
		expect(result.resourceChanges[0].actions).toEqual(["create"]);
		expect(result.resourceChanges[0].before).toBeNull();
		expect(result.resourceChanges[0].after).toEqual({ key: "value" });
	});

	it("should handle malformed JSON by throwing an error", async () => {
		const malformedJson = "{ invalid json }";
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(malformedJson)).rejects.toThrow(
			"Invalid JSON in plan file",
		);
	});

	it("should throw descriptive error when plan is missing format_version", async () => {
		const invalidPlan = JSON.stringify({
			terraform_version: "1.5.0",
			resource_changes: [],
		});
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(invalidPlan)).rejects.toThrow(
			"Invalid plan structure: missing or invalid required field 'format_version'",
		);
	});

	it("should throw descriptive error when plan is missing terraform_version", async () => {
		const invalidPlan = JSON.stringify({
			format_version: "1.0",
			resource_changes: [],
		});
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(invalidPlan)).rejects.toThrow(
			"Invalid plan structure: missing or invalid required field 'terraform_version'",
		);
	});

	it("should throw descriptive error when format_version is empty string", async () => {
		const invalidPlan = JSON.stringify({
			format_version: "",
			terraform_version: "1.5.0",
			resource_changes: [],
		});
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(invalidPlan)).rejects.toThrow(
			"Invalid plan structure: missing or invalid required field 'format_version'",
		);
	});

	it("should throw descriptive error when terraform_version is empty string", async () => {
		const invalidPlan = JSON.stringify({
			format_version: "1.0",
			terraform_version: "",
			resource_changes: [],
		});
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(invalidPlan)).rejects.toThrow(
			"Invalid plan structure: missing or invalid required field 'terraform_version'",
		);
	});

	it("should throw descriptive error when plan is missing resource_changes", async () => {
		const invalidPlan = JSON.stringify({
			format_version: "1.0",
			terraform_version: "1.5.0",
		});
		const parser = new ParsePlanUseCase();

		await expect(parser.parse(invalidPlan)).rejects.toThrow(
			"Invalid plan structure: missing required field 'resource_changes'",
		);
	});
});
