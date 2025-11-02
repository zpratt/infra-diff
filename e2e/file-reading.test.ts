import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { ReadPlanFileUseCase } from "../src/domain/usecases/ReadPlanFileUseCase";
import { FilesystemAdapter } from "../src/infrastructure/adapters/FilesystemAdapter";
import { InputValidator } from "../src/infrastructure/adapters/InputValidator";

describe("E2E: File Reading", () => {
	it("should read a sample JSON plan file successfully", async () => {
		const fixturePath = path.join(
			process.cwd(),
			"fixtures",
			"sample-plan.json",
		);
		const fileReader = new FilesystemAdapter();
		const validator = new InputValidator();
		const useCase = new ReadPlanFileUseCase(fileReader);

		await validator.validatePlanFilePath(fixturePath);

		const result = await useCase.execute(fixturePath);

		expect(result.path).toBe(fixturePath);
		expect(result.content).toBeTruthy();
		expect(result.content.length).toBeGreaterThan(0);

		const parsed = JSON.parse(result.content);
		expect(parsed).toHaveProperty("format_version");
		expect(parsed).toHaveProperty("terraform_version");
	});

	it("should read a plan file with changes successfully", async () => {
		const fixturePath = path.join(
			process.cwd(),
			"fixtures",
			"plan-with-changes.json",
		);
		const fileReader = new FilesystemAdapter();
		const validator = new InputValidator();
		const useCase = new ReadPlanFileUseCase(fileReader);

		await validator.validatePlanFilePath(fixturePath);
		const result = await useCase.execute(fixturePath);

		expect(result.path).toBe(fixturePath);
		expect(result.content).toBeTruthy();

		const parsed = JSON.parse(result.content);
		expect(parsed).toHaveProperty("resource_changes");
		expect(Array.isArray(parsed.resource_changes)).toBe(true);
	});

	it("should fail validation for non-existent file", async () => {
		const nonExistentPath = path.join(
			process.cwd(),
			"fixtures",
			"nonexistent.json",
		);
		const validator = new InputValidator();

		await expect(
			validator.validatePlanFilePath(nonExistentPath),
		).rejects.toThrow("File does not exist");
	});
});
