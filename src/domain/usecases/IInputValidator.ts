export interface IInputValidator {
	validatePlanFilePath(filePath: string): Promise<void>;
}
