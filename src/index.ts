import * as core from "@actions/core";
import { ParsePlanUseCase } from "./domain/usecases/ParsePlanUseCase";
import { ReadPlanFileUseCase } from "./domain/usecases/ReadPlanFileUseCase";
import { TextFormatterUseCase } from "./domain/usecases/TextFormatterUseCase";
import { FilesystemAdapter } from "./infrastructure/adapters/FilesystemAdapter";
import { InputValidator } from "./infrastructure/adapters/InputValidator";

async function run(): Promise<void> {
	try {
		const planFilePath = core.getInput("plan-file-path", { required: true });

		core.info(`Processing plan file: ${planFilePath}`);

		const validator = new InputValidator();
		const fileReader = new FilesystemAdapter();
		const readPlanFileUseCase = new ReadPlanFileUseCase(fileReader);
		const parsePlanUseCase = new ParsePlanUseCase();
		const textFormatterUseCase = new TextFormatterUseCase();

		core.info("Validating plan file path...");
		await validator.validatePlanFilePath(planFilePath);
		core.info("✓ Plan file path is valid");

		core.info("Reading plan file...");
		const planFile = await readPlanFileUseCase.execute(planFilePath);
		core.info(
			`✓ Successfully read plan file (${planFile.content.length} bytes)`,
		);

		core.info("Parsing plan file...");
		const plan = await parsePlanUseCase.parse(planFile.content);
		core.info(
			`✓ Successfully parsed plan (${plan.resourceChanges.length} resource changes)`,
		);

		core.info("Formatting plan summary...");
		const formattedSummary = textFormatterUseCase.format(plan);
		core.info("✓ Successfully formatted plan summary");

		// Output to step summary
		await core.summary
			.addHeading("Infrastructure Changes")
			.addCodeBlock(formattedSummary, "terraform")
			.write();

		core.setOutput("changes-summary", formattedSummary);

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
