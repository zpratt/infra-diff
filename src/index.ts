import * as core from "@actions/core";
import { ReadPlanFileUseCase } from "./domain/usecases/ReadPlanFileUseCase";
import { FilesystemAdapter } from "./infrastructure/adapters/FilesystemAdapter";
import { InputValidator } from "./infrastructure/adapters/InputValidator";

async function run(): Promise<void> {
	try {
		const planFilePath = core.getInput("plan-file-path", { required: true });

		core.info(`Processing plan file: ${planFilePath}`);

		const validator = new InputValidator();
		const fileReader = new FilesystemAdapter();
		const readPlanFileUseCase = new ReadPlanFileUseCase(fileReader);

		core.info("Validating plan file path...");
		await validator.validatePlanFilePath(planFilePath);
		core.info("✓ Plan file path is valid");

		core.info("Reading plan file...");
		const planFile = await readPlanFileUseCase.execute(planFilePath);
		core.info(
			`✓ Successfully read plan file (${planFile.content.length} bytes)`,
		);

		core.setOutput(
			"changes-summary",
			`Plan file read successfully: ${planFilePath}`,
		);

		core.info("✓ Action completed successfully");
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message);
		} else {
			core.setFailed("An unknown error occurred");
		}
	}
}

run();
