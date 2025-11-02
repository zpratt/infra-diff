import type { Plan } from "../entities/Plan";
import type { ITextFormatter } from "./ITextFormatter";

export class TextFormatterUseCase implements ITextFormatter {
	format(plan: Plan): string {
		const additions = plan.resourceChanges.filter((rc) =>
			rc.actions.includes("create"),
		);
		const changes = plan.resourceChanges.filter((rc) =>
			rc.actions.includes("update"),
		);
		const deletions = plan.resourceChanges.filter((rc) =>
			rc.actions.includes("delete"),
		);

		const addCount = additions.length;
		const changeCount = changes.length;
		const deleteCount = deletions.length;

		let summary = "";

		if (addCount === 0 && changeCount === 0 && deleteCount === 0) {
			summary += "No changes. Infrastructure is up-to-date.\n";
		} else {
			summary += "Terraform will perform the following actions:\n\n";
		}

		if (additions.length > 0) {
			summary += "Resources to be created:\n";
			for (const resource of additions) {
				summary += `  + ${resource.address} (${resource.actions.join(", ")})\n`;
			}
			summary += "\n";
		}

		if (changes.length > 0) {
			summary += "Resources to be updated:\n";
			for (const resource of changes) {
				summary += `  ~ ${resource.address} (${resource.actions.join(", ")})\n`;
			}
			summary += "\n";
		}

		if (deletions.length > 0) {
			summary += "Resources to be destroyed:\n";
			for (const resource of deletions) {
				summary += `  - ${resource.address} (${resource.actions.join(", ")})\n`;
			}
			summary += "\n";
		}

		summary += `Plan: ${addCount} to add, ${changeCount} to change, ${deleteCount} to destroy.\n`;

		return summary;
	}
}
