import { Plan, ResourceChange } from "../entities/Plan";
import type { IPlanParser } from "./IPlanParser";

type TerraformResourceChange = {
	address: string;
	type: string;
	name: string;
	change: {
		actions: string[];
		before: Record<string, unknown> | null;
		after: Record<string, unknown> | null;
	};
};

type TerraformPlanJson = {
	format_version: string;
	terraform_version: string;
	resource_changes: TerraformResourceChange[];
};

export class ParsePlanUseCase implements IPlanParser {
	async parse(content: string): Promise<Plan> {
		let parsed: unknown;

		try {
			parsed = JSON.parse(content);
		} catch (error) {
			throw new Error(
				`Invalid JSON in plan file: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		if (typeof parsed !== "object" || parsed === null) {
			throw new Error("Invalid plan structure: expected an object");
		}

		const planData = parsed as Record<string, unknown>;

		if (
			!("format_version" in planData) ||
			typeof planData.format_version !== "string" ||
			planData.format_version.trim() === ""
		) {
			throw new Error(
				"Invalid plan structure: missing or invalid required field 'format_version'",
			);
		}

		if (
			!("terraform_version" in planData) ||
			typeof planData.terraform_version !== "string" ||
			planData.terraform_version.trim() === ""
		) {
			throw new Error(
				"Invalid plan structure: missing or invalid required field 'terraform_version'",
			);
		}

		if (
			!("resource_changes" in planData) ||
			planData.resource_changes === undefined ||
			!Array.isArray(planData.resource_changes)
		) {
			throw new Error(
				"Invalid plan structure: missing required field 'resource_changes'",
			);
		}

		const typedPlan = planData as TerraformPlanJson;

		// Validate resource changes structure
		for (const rc of typedPlan.resource_changes) {
			if (!rc.address || !rc.type || !rc.name || !rc.change) {
				throw new Error(
					"Invalid plan structure: resource change missing required fields (address, type, name, or change)",
				);
			}
			if (!Array.isArray(rc.change.actions)) {
				throw new Error(
					"Invalid plan structure: resource change actions must be an array",
				);
			}
		}

		const resourceChanges = typedPlan.resource_changes.map(
			(rc) =>
				new ResourceChange(
					rc.address,
					rc.type,
					rc.name,
					rc.change.actions,
					rc.change.before,
					rc.change.after,
				),
		);

		return new Plan(
			typedPlan.format_version,
			typedPlan.terraform_version,
			resourceChanges,
		);
	}
}
