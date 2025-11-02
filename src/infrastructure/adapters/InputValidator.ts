import * as fs from "node:fs/promises";
import type { IInputValidator } from "../../domain/usecases/IInputValidator";

interface FileSystemAdapter {
	stat(filePath: string): Promise<{ isFile(): boolean }>;
}

export class DirectoryPathError extends Error {
	constructor(message: string = "Path is a directory, not a file") {
		super(message);
		this.name = "DirectoryPathError";
	}
}

export class InputValidator implements IInputValidator {
	private fileSystem: FileSystemAdapter;

	constructor(fileSystem?: FileSystemAdapter) {
		this.fileSystem = fileSystem || {
			stat: (filePath: string) => fs.stat(filePath),
		};
	}

	async validatePlanFilePath(filePath: string): Promise<void> {
		if (!filePath || filePath.trim() === "") {
			throw new Error("Plan file path is required");
		}

		try {
			const stats = await this.fileSystem.stat(filePath);

			if (!stats.isFile()) {
				throw new DirectoryPathError();
			}
		} catch (error) {
			if (error instanceof DirectoryPathError) {
				throw error;
			}

			if (error instanceof Error && "code" in error) {
				const code = (error as NodeJS.ErrnoException).code;
				if (code === "ENOENT") {
					throw new Error(`File does not exist: ${filePath}`);
				}
				if (code === "EACCES") {
					throw new Error(`Permission denied: ${filePath}`);
				}
				if (code === "EISDIR") {
					throw new DirectoryPathError();
				}
			}
			throw error;
		}
	}
}
