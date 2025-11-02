import type { PlanFile } from "../entities/PlanFile";
import type { IFileReader } from "./IFileReader";

export class ReadPlanFileUseCase {
	constructor(private readonly fileReader: IFileReader) {}

	async execute(filePath: string): Promise<PlanFile> {
		return await this.fileReader.read(filePath);
	}
}
