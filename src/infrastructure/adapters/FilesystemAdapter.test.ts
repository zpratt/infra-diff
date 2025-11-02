import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Chance } from "chance";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FilesystemAdapter } from "./FilesystemAdapter";

const chance = new Chance();

describe("FilesystemAdapter", () => {
	let testDir: string;
	let testFilePath: string;

	beforeEach(async () => {
		testDir = path.join(process.cwd(), `test-${chance.guid()}`);
		await fs.mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true });
	});

	it("should read a file successfully", async () => {
		const fileName = `plan-${chance.word()}.json`;
		testFilePath = path.join(testDir, fileName);
		const expectedContent = JSON.stringify({
			test: chance.word(),
			value: chance.integer(),
		});

		await fs.writeFile(testFilePath, expectedContent, "utf-8");

		const adapter = new FilesystemAdapter();

		const result = await adapter.read(testFilePath);

		expect(result.path).toBe(testFilePath);
		expect(result.content).toBe(expectedContent);
	});

	it("should throw an error if file does not exist", async () => {
		const nonExistentPath = path.join(testDir, "nonexistent.json");
		const adapter = new FilesystemAdapter();

		const error = await adapter.read(nonExistentPath).catch((e) => e);

		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe(`File does not exist: ${nonExistentPath}`);
	});

	it("should throw an error if path is a directory", async () => {
		const dirPath = path.join(testDir, "somedir");
		await fs.mkdir(dirPath, { recursive: true });

		const adapter = new FilesystemAdapter();

		const error = await adapter.read(dirPath).catch((e) => e);

		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe(`Path is not a file: ${dirPath}`);
	});

	describe("file system error handling", () => {
		it("should throw with custom message for ENOENT error code", async () => {
			const filePath = "/test/file.json";
			const enoentError = new Error("No such file") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";

			const mockFileSystem = {
				stat: async () => {
					throw enoentError;
				},
				readFile: async () => "",
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`File does not exist: ${filePath}`);
		});

		it("should throw with custom message for EACCES error code from stat", async () => {
			const filePath = "/test/file.json";
			const eaccessError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			eaccessError.code = "EACCES";

			const mockFileSystem = {
				stat: async () => {
					throw eaccessError;
				},
				readFile: async () => "",
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`Permission denied: ${filePath}`);
		});

		it("should throw with custom message for ENOENT error code from readFile", async () => {
			const filePath = "/test/file.json";
			const enoentError = new Error("No such file") as NodeJS.ErrnoException;
			enoentError.code = "ENOENT";

			const mockFileSystem = {
				stat: async () => ({ isFile: () => true }),
				readFile: async () => {
					throw enoentError;
				},
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`File does not exist: ${filePath}`);
		});

		it("should throw with custom message for EACCES error code from readFile", async () => {
			const filePath = "/test/file.json";
			const eaccessError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			eaccessError.code = "EACCES";

			const mockFileSystem = {
				stat: async () => ({ isFile: () => true }),
				readFile: async () => {
					throw eaccessError;
				},
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(`Permission denied: ${filePath}`);
		});

		it("should rethrow unknown errors", async () => {
			const filePath = "/test/file.json";
			const unknownError = new Error("Some unknown error");

			const mockFileSystem = {
				stat: async () => {
					throw unknownError;
				},
				readFile: async () => "",
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBe(unknownError);
		});

		it("should rethrow errors without code property", async () => {
			const filePath = "/test/file.json";
			const errorWithoutCode = new Error("Some error without code");

			const mockFileSystem = {
				stat: async () => {
					throw errorWithoutCode;
				},
				readFile: async () => "",
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error).toBe(errorWithoutCode);
		});

		it("should include file path in ENOENT error message", async () => {
			const customPath = path.join(testDir, "my-file.json");
			const adapter = new FilesystemAdapter();

			const error = await adapter.read(customPath).catch((e) => e);

			expect(error.message).toContain("File does not exist:");
			expect(error.message).toContain(customPath);
		});

		it("should include file path in EACCES error message", async () => {
			const filePath = "/restricted/file.json";
			const eaccessError = new Error(
				"Permission denied",
			) as NodeJS.ErrnoException;
			eaccessError.code = "EACCES";

			const mockFileSystem = {
				stat: async () => {
					throw eaccessError;
				},
				readFile: async () => "",
			};

			const adapter = new FilesystemAdapter(mockFileSystem);

			const error = await adapter.read(filePath).catch((e) => e);

			expect(error.message).toContain("Permission denied:");
			expect(error.message).toContain(filePath);
		});
	});
});
