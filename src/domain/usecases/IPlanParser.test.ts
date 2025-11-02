import Chance from "chance";
import { describe, expect, it } from "vitest";
import type { Plan } from "../entities/Plan";
import type { IPlanParser } from "./IPlanParser";

const chance = new Chance();

describe("IPlanParser", () => {
	it("should parse a valid JSON plan string into a Plan object", async () => {
		const formatVersion = "1.0";
		const terraformVersion = "1.5.0";
		const jsonContent = JSON.stringify({
			format_version: formatVersion,
			terraform_version: terraformVersion,
			resource_changes: [],
		});

		const mockParser: IPlanParser = {
			parse: async (content: string): Promise<Plan> => {
				const parsed = JSON.parse(content);
				return {
					formatVersion: parsed.format_version,
					terraformVersion: parsed.terraform_version,
					resourceChanges: [],
				};
			},
		};

		const result = await mockParser.parse(jsonContent);

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
					address: address,
					type: type,
					name: name,
					change: {
						actions: ["create"],
						before: null,
						after: { key: "value" },
					},
				},
			],
		});

		const mockParser: IPlanParser = {
			parse: async (content: string): Promise<Plan> => {
				const parsed = JSON.parse(content);
				const resourceChanges = parsed.resource_changes.map(
					(rc: {
						address: string;
						type: string;
						name: string;
						change: {
							actions: string[];
							before: Record<string, unknown> | null;
							after: Record<string, unknown> | null;
						};
					}) => ({
						address: rc.address,
						type: rc.type,
						name: rc.name,
						actions: rc.change.actions,
						before: rc.change.before,
						after: rc.change.after,
					}),
				);
				return {
					formatVersion: parsed.format_version,
					terraformVersion: parsed.terraform_version,
					resourceChanges: resourceChanges,
				};
			},
		};

		const result = await mockParser.parse(jsonContent);

		expect(result.resourceChanges).toHaveLength(1);
		expect(result.resourceChanges[0].address).toBe(address);
		expect(result.resourceChanges[0].type).toBe(type);
		expect(result.resourceChanges[0].name).toBe(name);
		expect(result.resourceChanges[0].actions).toEqual(["create"]);
	});

	it("should handle malformed JSON by throwing an error", async () => {
		const malformedJson = "{ invalid json }";

		const mockParser: IPlanParser = {
			parse: async (content: string): Promise<Plan> => {
				JSON.parse(content);
				throw new Error("Should have thrown during parse");
			},
		};

		await expect(mockParser.parse(malformedJson)).rejects.toThrow();
	});
});
