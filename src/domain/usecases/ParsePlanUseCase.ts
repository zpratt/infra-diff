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
		const parsed: TerraformPlanJson = JSON.parse(content);

		const resourceChanges = parsed.resource_changes.map(
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
			parsed.format_version,
			parsed.terraform_version,
			resourceChanges,
		);
	}
}
