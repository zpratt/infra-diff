import { existsSync, rmSync, unlinkSync } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
	GenericContainer,
	Network,
	type StartedNetwork,
	type StartedTestContainer,
} from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ParsePlanUseCase } from "../src/domain/usecases/ParsePlanUseCase";
import { ReadPlanFileUseCase } from "../src/domain/usecases/ReadPlanFileUseCase";
import { FilesystemAdapter } from "../src/infrastructure/adapters/FilesystemAdapter";

describe("E2E: Terraform Integration with moto", () => {
	const terraformDir = path.join(process.cwd(), "e2e", "terraform");
	const planFileRelative = "plan.bin";
	const planFile = path.join(terraformDir, planFileRelative);
	const planJsonFileRelative = "plan.json";
	const planJsonFile = path.join(terraformDir, planJsonFileRelative);
	let motoContainer: StartedTestContainer;
	let terraformContainer: StartedTestContainer;
	let network: StartedNetwork;
	const motoContainerName = "moto-server";

	// Read Terraform version from .terraform-version file
	const getTerraformVersion = async (): Promise<string> => {
		const versionFilePath = path.join(process.cwd(), ".terraform-version");
		const versionContent = await fs.readFile(versionFilePath, "utf-8");
		return versionContent.trim();
	};

	beforeAll(async () => {
		try {
			// Get Terraform version from .terraform-version file
			const terraformVersion = await getTerraformVersion();
			console.log(`Using Terraform version: ${terraformVersion}`);

			// Create a shared network for containers
			console.log("Creating Docker network...");
			network = await new Network().start();

			// Start moto server in the network
			console.log("Starting moto server...");
			motoContainer = await new GenericContainer("motoserver/moto:5.0.0")
				.withNetwork(network)
				.withNetworkAliases(motoContainerName)
				.withExposedPorts(5000)
				.withStartupTimeout(120000)
				.start();

			const motoPort = motoContainer.getFirstMappedPort();
			console.log(`Moto server is ready on port ${motoPort}`);

			// Start Terraform container in the same network
			console.log("Starting Terraform container...");
			terraformContainer = await new GenericContainer(
				`hashicorp/terraform:${terraformVersion}`,
			)
				.withNetwork(network)
				.withBindMounts([
					{
						source: terraformDir,
						target: "/terraform",
						mode: "rw",
					},
				])
				.withWorkingDir("/terraform")
				.withEntrypoint(["/bin/sh", "-c", "exec sleep infinity"])
				.withEnvironment({
					AWS_ACCESS_KEY_ID: "testing",
					AWS_SECRET_ACCESS_KEY: "testing",
					AWS_SECURITY_TOKEN: "testing",
					AWS_SESSION_TOKEN: "testing",
					AWS_EC2_METADATA_DISABLED: "true",
				})
				.withStartupTimeout(60000)
				.start();

			console.log("Terraform container started");

			// Initialize Terraform
			console.log("Initializing Terraform...");
			const initResult = await terraformContainer.exec(["terraform", "init"]);
			console.log("Init exit code:", initResult.exitCode);
			if (initResult.exitCode !== 0) {
				console.error("Init output:", initResult.output);
				throw new Error(`Terraform init failed: ${initResult.output}`);
			}

			// Generate plan using moto endpoint accessible from container
			console.log("Generating Terraform plan...");
			const planResult = await terraformContainer.exec([
				"terraform",
				"plan",
				`-out=${planFileRelative}`,
				"-var",
				`moto_endpoint=http://${motoContainerName}:5000`,
				"-no-color",
			]);
			console.log("Plan exit code:", planResult.exitCode);
			if (planResult.exitCode !== 0) {
				console.error("Plan output:", planResult.output);
				throw new Error(`Terraform plan failed: ${planResult.output}`);
			}

			// Convert plan to JSON
			console.log("Converting plan to JSON...");
			const showResult = await terraformContainer.exec([
				"terraform",
				"show",
				"-json",
				planFileRelative,
			]);
			console.log("Show exit code:", showResult.exitCode);
			if (showResult.exitCode !== 0) {
				console.error("Show output:", showResult.output);
				throw new Error(`Terraform show failed: ${showResult.output}`);
			}

			// Write the JSON output to file
			await fs.writeFile(planJsonFile, showResult.output);
		} catch (error) {
			console.error("Setup failed:", error);
			throw error;
		}
	}, 120000); // 2 minute timeout for setup

	afterAll(async () => {
		// Cleanup
		console.log("Cleaning up...");

		// Have terraform container clean up its own files with proper permissions
		try {
			if (terraformContainer) {
				console.log("Cleaning up terraform files from container...");
				await terraformContainer.exec([
					"sh",
					"-c",
					"rm -rf /terraform/.terraform /terraform/plan.bin /terraform/plan.json /terraform/.terraform.lock.hcl",
				]);
				console.log("Terraform files cleaned from container");
			}
		} catch (error) {
			console.warn("Failed to cleanup from container:", error);
		}

		// Stop and remove terraform container
		try {
			if (terraformContainer) {
				await terraformContainer.stop();
				console.log("Terraform container stopped");
			}
		} catch (error) {
			console.error("Failed to stop terraform container:", error);
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

		// Stop and remove network
		try {
			if (network) {
				await network.stop();
				console.log("Network stopped");
			}
		} catch (error) {
			console.error("Failed to stop network:", error);
		}

		// Remove plan files from host
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
				console.log(".terraform directory cleaned up");
			}
		} catch (error) {
			// Log error but don't fail - permissions issues in CI can be expected
			console.warn("Failed to cleanup .terraform directory:", error);
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
