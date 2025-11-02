import { execSync } from "node:child_process";
import { existsSync, rmSync, unlinkSync } from "node:fs";
import * as path from "node:path";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ParsePlanUseCase } from "../src/domain/usecases/ParsePlanUseCase";
import { ReadPlanFileUseCase } from "../src/domain/usecases/ReadPlanFileUseCase";
import { FilesystemAdapter } from "../src/infrastructure/adapters/FilesystemAdapter";

describe("E2E: Terraform Integration with moto", () => {
	const terraformDir = path.join(process.cwd(), "e2e", "terraform");
	const planFile = path.join(terraformDir, "plan.bin");
	const planJsonFile = path.join(terraformDir, "plan.json");
	let motoContainer: StartedTestContainer;
	let motoPort: number;

	beforeAll(async () => {
		// Start moto server using testcontainers
		console.log("Starting moto server...");
		try {
			motoPort = 50000;
			motoContainer = await new GenericContainer("motoserver/moto:5.0.0")
				.withExposedPorts({ container: 5000, host: motoPort })
				.withStartupTimeout(120000)
				.start();

			console.log(`Moto server is ready on port ${motoPort}`);

			// Initialize Terraform
			console.log("Initializing Terraform...");
			execSync("terraform init", { cwd: terraformDir, stdio: "pipe" });

			// Generate plan
			console.log("Generating Terraform plan...");
			execSync(`terraform plan -out=${planFile}`, {
				cwd: terraformDir,
				stdio: "pipe",
			});

			// Convert plan to JSON
			console.log("Converting plan to JSON...");
			execSync(`terraform show -json ${planFile} > ${planJsonFile}`, {
				cwd: terraformDir,
				stdio: "pipe",
				shell: "/bin/bash",
			});
		} catch (error) {
			console.error("Setup failed:", error);
			throw error;
		}
	}, 120000); // 2 minute timeout for setup

	afterAll(async () => {
		// Cleanup
		console.log("Cleaning up...");

		// Remove plan files
		try {
			if (existsSync(planFile)) {
				unlinkSync(planFile);
			}
			if (existsSync(planJsonFile)) {
				unlinkSync(planJsonFile);
			}
		} catch (error) {
			console.error("Failed to cleanup plan files:", error);
		}

		// Remove .terraform directory
		try {
			const terraformStateDir = path.join(terraformDir, ".terraform");
			if (existsSync(terraformStateDir)) {
				rmSync(terraformStateDir, { recursive: true, force: true });
			}
		} catch (error) {
			console.error("Failed to cleanup .terraform directory:", error);
		}

		// Remove lock file
		try {
			const lockFile = path.join(terraformDir, ".terraform.lock.hcl");
			if (existsSync(lockFile)) {
				unlinkSync(lockFile);
			}
		} catch (error) {
			console.error("Failed to cleanup lock file:", error);
		}

		// Stop and remove moto container
		try {
			if (motoContainer) {
				await motoContainer.stop();
				console.log("Moto container stopped");
			}
		} catch (error) {
			console.error("Failed to stop moto container:", error);
		}
	}, 60000); // 1 minute timeout for cleanup

	it("should parse real Terraform plan output", async () => {
		// Verify plan JSON file was created
		expect(existsSync(planJsonFile)).toBe(true);

		// Read the plan file
		const fileReader = new FilesystemAdapter();
		const readUseCase = new ReadPlanFileUseCase(fileReader);
		const readResult = await readUseCase.execute(planJsonFile);

		expect(readResult.path).toBe(planJsonFile);
		expect(readResult.content).toBeTruthy();
		expect(readResult.content.length).toBeGreaterThan(0);

		// Parse the plan
		const parseUseCase = new ParsePlanUseCase();
		const plan = await parseUseCase.parse(readResult.content);

		// Verify plan structure
		expect(plan).toBeDefined();
		expect(plan.formatVersion).toBeTruthy();
		expect(plan.terraformVersion).toBeTruthy();
		expect(plan.resourceChanges).toBeDefined();
		expect(Array.isArray(plan.resourceChanges)).toBe(true);

		// Verify we have the expected SQS queue resource change
		expect(plan.resourceChanges.length).toBeGreaterThan(0);

		const sqsQueue = plan.resourceChanges.find(
			(rc) => rc.type === "aws_sqs_queue" && rc.name === "queue",
		);

		expect(sqsQueue).toBeDefined();
		expect(sqsQueue?.address).toBe("aws_sqs_queue.queue");
		expect(sqsQueue?.actions).toContain("create");

		// Verify the queue has expected configuration
		expect(sqsQueue?.after).toBeDefined();
		expect(sqsQueue?.after?.name).toBe("test-queue");
		expect(sqsQueue?.after?.tags).toBeDefined();
	});
});
