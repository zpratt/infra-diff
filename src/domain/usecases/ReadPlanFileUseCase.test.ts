import { describe, expect, it } from "vitest";
import type { PlanFile } from "../entities/PlanFile";
import type { IFileReader } from "./IFileReader";
import { ReadPlanFileUseCase } from "./ReadPlanFileUseCase";

describe("ReadPlanFileUseCase", () => {
	it("should read a file successfully", async () => {
		const mockFilePath = "/path/to/plan.json";
		const mockContent = '{"test": "content"}';

		const mockFileReader: IFileReader = {
			read: async (filePath: string): Promise<PlanFile> => {
				return {
					path: filePath,
					content: mockContent,
				};
			},
		};

		const useCase = new ReadPlanFileUseCase(mockFileReader);

		const result = await useCase.execute(mockFilePath);

		expect(result.path).toBe(mockFilePath);
		expect(result.content).toBe(mockContent);
	});

	it("should throw an error if file cannot be read", async () => {
		const mockFilePath = "/path/to/nonexistent.json";
		const errorMessage = "File not found";

		const mockFileReader: IFileReader = {
			read: async (_filePath: string): Promise<PlanFile> => {
				throw new Error(errorMessage);
			},
		};

		const useCase = new ReadPlanFileUseCase(mockFileReader);

		await expect(useCase.execute(mockFilePath)).rejects.toThrow(errorMessage);
	});
});
