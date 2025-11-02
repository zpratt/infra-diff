import * as fs from "node:fs/promises";
import { PlanFile } from "../../domain/entities/PlanFile";
import type { IFileReader } from "../../domain/usecases/IFileReader";

export class FilesystemAdapter implements IFileReader {
	async read(filePath: string): Promise<PlanFile> {
		try {
			const stats = await fs.stat(filePath);

			if (!stats.isFile()) {
				throw new Error(`Path is not a file: ${filePath}`);
			}

			const content = await fs.readFile(filePath, "utf-8");

			return new PlanFile(filePath, content);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error(`Failed to read file: ${filePath}`);
		}
	}
}
