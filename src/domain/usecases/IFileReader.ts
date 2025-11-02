import type { PlanFile } from "../entities/PlanFile";

export interface IFileReader {
	read(filePath: string): Promise<PlanFile>;
}
