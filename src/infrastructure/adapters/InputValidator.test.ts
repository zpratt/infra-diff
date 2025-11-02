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

	it("should throw an error if file path is only whitespace", async () => {
		const validator = new InputValidator();

		await expect(validator.validatePlanFilePath("   ")).rejects.toThrow(
			"Plan file path is required",
		);
	});

	describe("file system error handling", () => {
		it("should throw with custom message when file does not exist (ENOENT)", async () => {
			const nonExistentPath = path.join(testDir, "nonexistent.json");
			const validator = new InputValidator();

			const error = await validator
				.validatePlanFilePath(nonExistentPath)
				.catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`File does not exist: ${nonExistentPath}`);
		});

		it("should throw with custom message when path is a directory (via isFile check)", async () => {
			const dirPath = path.join(testDir, "somedir");
			await fs.mkdir(dirPath, { recursive: true });

			const validator = new InputValidator();

			const error = await validator
				.validatePlanFilePath(dirPath)
				.catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe("Path is a directory, not a file");
		});

		it("should throw with custom message for EACCES error code (permission denied)", async () => {
			const filePath = "/test/file.json";
			const eaccessError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			eaccessError.code = "EACCES";

			const mockFileSystem = {
				stat: async () => {
					throw eaccessError;
				},
			};

			const validator = new InputValidator(mockFileSystem);

			const error = await validator
				.validatePlanFilePath(filePath)
				.catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`Permission denied: ${filePath}`);
		});

		it("should throw with custom message for EISDIR error code (is a directory)", async () => {
			const filePath = "/test/dir";
			const eisdirError = new Error("Is a directory") as NodeJS.ErrnoException;
			eisdirError.code = "EISDIR";

			const mockFileSystem = {
				stat: async () => {
					throw eisdirError;
				},
			};

			const validator = new InputValidator(mockFileSystem);

			const error = await validator
				.validatePlanFilePath(filePath)
				.catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe("Path is a directory, not a file");
		});

		it("should rethrow errors that are not recognized error codes", async () => {
			const filePath = "/test/file.json";
			const unknownError = new Error("Some unknown file system error");

			const mockFileSystem = {
				stat: async () => {
					throw unknownError;
				},
			};

			const validator = new InputValidator(mockFileSystem);

			const error = await validator
				.validatePlanFilePath(filePath)
				.catch((e) => e);

			expect(error).toBe(unknownError);
			expect(error.message).toBe("Some unknown file system error");
		});

		it("should include the file path in ENOENT error message", async () => {
			const customPath = path.join(testDir, "my-special-file.json");
			const validator = new InputValidator();

			const error = await validator
				.validatePlanFilePath(customPath)
				.catch((e) => e);

			expect(error.message).toContain("File does not exist:");
			expect(error.message).toContain(customPath);
		});

		it("should include the file path in EACCES error message", async () => {
			const filePath = "/restricted/file.json";
			const eaccessError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			eaccessError.code = "EACCES";

			const mockFileSystem = {
				stat: async () => {
					throw eaccessError;
				},
			};

			const validator = new InputValidator(mockFileSystem);

			const error = await validator
				.validatePlanFilePath(filePath)
				.catch((e) => e);

			expect(error.message).toContain("Permission denied:");
			expect(error.message).toContain(filePath);
		});

		it("should handle errors without code property by rethrowing", async () => {
			const filePath = "/test/file.json";
			const errorWithoutCode = new Error("Some error without code property");

			const mockFileSystem = {
				stat: async () => {
					throw errorWithoutCode;
				},
			};

			const validator = new InputValidator(mockFileSystem);

			const error = await validator
				.validatePlanFilePath(filePath)
				.catch((e) => e);

			expect(error).toBe(errorWithoutCode);
		});
	});
});
