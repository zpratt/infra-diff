import * as fs from "node:fs/promises";
import { PlanFile } from "../../domain/entities/PlanFile";
import type { IFileReader } from "../../domain/usecases/IFileReader";
import type { FileSystemAdapter } from "../interfaces/FileSystemAdapter";

const DEFAULT_FILE_SYSTEM: FileSystemAdapter = {
	stat: (filePath: string) => fs.stat(filePath),
	readFile: (filePath: string) => fs.readFile(filePath, "utf-8"),
};

export class FilesystemAdapter implements IFileReader {
	private readonly fileSystem: FileSystemAdapter;

	constructor(fileSystem: FileSystemAdapter = DEFAULT_FILE_SYSTEM) {
		this.fileSystem = fileSystem;
	}

	async read(filePath: string): Promise<PlanFile> {
		const stats = await this.getFileStats(filePath);
		this.validateIsFile(stats, filePath);

		const content = await this.readFileContent(filePath);

		return new PlanFile(filePath, content);
	}

	private async getFileStats(filePath: string): Promise<{ isFile(): boolean }> {
		try {
			return await this.fileSystem.stat(filePath);
		} catch (error) {
			throw this.handleFileSystemError(error, filePath);
		}
	}

	private validateIsFile(stats: { isFile(): boolean }, filePath: string): void {
		if (!stats.isFile()) {
			throw new Error(`Path is not a file: ${filePath}`);
		}
	}

	private async readFileContent(filePath: string): Promise<string> {
		try {
			return await this.fileSystem.readFile(filePath);
		} catch (error) {
			throw this.handleFileSystemError(error, filePath);
		}
	}

	private handleFileSystemError(error: unknown, filePath: string): Error {
		if (error instanceof Error && "code" in error) {
			const code = (error as NodeJS.ErrnoException).code;
			if (code === "ENOENT") {
				return new Error(`File does not exist: ${filePath}`);
			}
			if (code === "EACCES") {
				return new Error(`Permission denied: ${filePath}`);
			}
		}

		return error instanceof Error
			? error
			: new Error(`Unknown error: ${String(error)}`);
	}
}
