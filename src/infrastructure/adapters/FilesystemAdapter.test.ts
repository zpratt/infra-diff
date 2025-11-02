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

		await expect(adapter.read(nonExistentPath)).rejects.toThrow("ENOENT");
	});

	it("should throw an error if path is a directory", async () => {
		const dirPath = path.join(testDir, "somedir");
		await fs.mkdir(dirPath, { recursive: true });

		const adapter = new FilesystemAdapter();

		await expect(adapter.read(dirPath)).rejects.toThrow(
			`Path is not a file: ${dirPath}`,
		);
	});
});
