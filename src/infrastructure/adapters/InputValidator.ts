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
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.message.includes("Path is a directory") ||
					error.message.includes("required")
				) {
					throw error;
				}

				if ("code" in error && error.code === "ENOENT") {
					throw new Error(`File does not exist: ${filePath}`);
				}
			}
			throw error;
		}
	}
}
