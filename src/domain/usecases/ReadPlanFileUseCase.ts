import type { PlanFile } from "../entities/PlanFile";
import type { IFileReader } from "./IFileReader";

export class ReadPlanFileUseCase {
	constructor(private readonly fileReader: IFileReader) {}

	execute(filePath: string): Promise<PlanFile> {
		return this.fileReader.read(filePath);
	}
}
