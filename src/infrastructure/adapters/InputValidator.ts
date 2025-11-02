import * as fs from "node:fs/promises";
import type { IInputValidator } from "../../domain/usecases/IInputValidator";

export class InputValidator implements IInputValidator {
	async validatePlanFilePath(filePath: string): Promise<void> {
		if (!filePath || filePath.trim() === "") {
			throw new Error("Plan file path is required");
		}

		try {
			const stats = await fs.stat(filePath);

			if (!stats.isFile()) {
				throw new Error("Path is a directory, not a file");
			}

			await fs.access(filePath, fs.constants.R_OK);
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.message.includes("Path is a directory") ||
					error.message.includes("required")
				) {
					throw error;
				}

				if ("code" in error) {
					if (error.code === "ENOENT") {
						throw new Error(`File does not exist: ${filePath}`);
					}
					if (error.code === "EACCES") {
						throw new Error(`File is not readable: ${filePath}`);
					}
				}
			}
			throw error;
		}
	}
}
