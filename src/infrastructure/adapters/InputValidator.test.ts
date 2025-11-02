import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Chance } from "chance";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InputValidator } from "./InputValidator";

const chance = new Chance();

describe("InputValidator", () => {
	let testDir: string;
	let testFilePath: string;

	beforeEach(async () => {
		testDir = path.join(process.cwd(), `test-${chance.guid()}`);
		await fs.mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true });
	});

	it("should validate a valid file path successfully", async () => {
		const fileName = `plan-${chance.word()}.json`;
		testFilePath = path.join(testDir, fileName);
		await fs.writeFile(testFilePath, JSON.stringify({ test: "data" }), "utf-8");

		const validator = new InputValidator();

		await expect(
			validator.validatePlanFilePath(testFilePath),
		).resolves.not.toThrow();
	});

	it("should throw an error if file path is empty", async () => {
		const validator = new InputValidator();

		await expect(validator.validatePlanFilePath("")).rejects.toThrow(
			"Plan file path is required",
		);
	});

	it("should throw an error if file does not exist", async () => {
		const nonExistentPath = path.join(testDir, "nonexistent.json");
		const validator = new InputValidator();

		await expect(
			validator.validatePlanFilePath(nonExistentPath),
		).rejects.toThrow("File does not exist");
	});

	it("should throw an error if path is a directory", async () => {
		const dirPath = path.join(testDir, "somedir");
		await fs.mkdir(dirPath, { recursive: true });

		const validator = new InputValidator();

		await expect(validator.validatePlanFilePath(dirPath)).rejects.toThrow(
			"Path is a directory, not a file",
		);
	});
});
