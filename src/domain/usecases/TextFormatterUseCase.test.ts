import Chance from "chance";
import { describe, expect, it } from "vitest";
import { Plan, ResourceChange } from "../entities/Plan";
import { TextFormatterUseCase } from "./TextFormatterUseCase";

const chance = new Chance();

describe("TextFormatterUseCase", () => {
	it("should format a plan with no changes", () => {
		const formatVersion = chance.word();
		const terraformVersion = chance.word();
		const plan = new Plan(formatVersion, terraformVersion, []);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain("No changes");
		expect(result).toContain("0 to add");
		expect(result).toContain("0 to change");
		expect(result).toContain("0 to destroy");
	});

	it("should count resources to be added", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["create"],
			null,
			{ key: "value" },
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain("1 to add");
		expect(result).toContain("0 to change");
		expect(result).toContain("0 to destroy");
	});

	it("should count resources to be changed", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["update"],
			{ key: "old" },
			{ key: "new" },
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain("0 to add");
		expect(result).toContain("1 to change");
		expect(result).toContain("0 to destroy");
	});

	it("should count resources to be destroyed", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["delete"],
			{ key: "value" },
			null,
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain("0 to add");
		expect(result).toContain("0 to change");
		expect(result).toContain("1 to destroy");
	});

	it("should handle mixed changes", () => {
		const resourceToAdd = new ResourceChange(
			chance.word(),
			chance.word(),
			chance.word(),
			["create"],
			null,
			{ key: "value" },
		);
		const resourceToUpdate = new ResourceChange(
			chance.word(),
			chance.word(),
			chance.word(),
			["update"],
			{ key: "old" },
			{ key: "new" },
		);
		const resourceToDelete = new ResourceChange(
			chance.word(),
			chance.word(),
			chance.word(),
			["delete"],
			{ key: "value" },
			null,
		);
		const plan = new Plan("1.0", "1.5.0", [
			resourceToAdd,
			resourceToUpdate,
			resourceToDelete,
		]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain("1 to add");
		expect(result).toContain("1 to change");
		expect(result).toContain("1 to destroy");
	});

	it("should list resources being added", () => {
		const address = "aws_s3_bucket.example";
		const type = "aws_s3_bucket";
		const name = "example";
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["create"],
			null,
			{ key: "value" },
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain(address);
		expect(result).toContain("create");
	});

	it("should list resources being changed", () => {
		const address = "aws_s3_bucket.example";
		const type = "aws_s3_bucket";
		const name = "example";
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["update"],
			{ key: "old" },
			{ key: "new" },
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain(address);
		expect(result).toContain("update");
	});

	it("should list resources being destroyed", () => {
		const address = "aws_s3_bucket.example";
		const type = "aws_s3_bucket";
		const name = "example";
		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			["delete"],
			{ key: "value" },
			null,
		);
		const plan = new Plan("1.0", "1.5.0", [resourceChange]);

		const formatter = new TextFormatterUseCase();
		const result = formatter.format(plan);

		expect(result).toContain(address);
		expect(result).toContain("delete");
	});
});
