import type { Plan } from "../entities/Plan";
import type { ITextFormatter } from "./ITextFormatter";

export class TextFormatterUseCase implements ITextFormatter {
	format(plan: Plan): string {
		const { additions, changes, deletions } = plan.resourceChanges.reduce(
			(acc, rc) => {
				if (rc.actions.includes("create")) {
					acc.additions.push(rc);
				} else if (rc.actions.includes("update")) {
					acc.changes.push(rc);
				} else if (rc.actions.includes("delete")) {
					acc.deletions.push(rc);
				}
				return acc;
			},
			{
				additions: [] as typeof plan.resourceChanges,
				changes: [] as typeof plan.resourceChanges,
				deletions: [] as typeof plan.resourceChanges,
			},
		);

		const addCount = additions.length;
		const changeCount = changes.length;
		const deleteCount = deletions.length;

		let summary = "";

		if (addCount === 0 && changeCount === 0 && deleteCount === 0) {
			summary += "No changes. Infrastructure is up-to-date.\n\n";
			summary += `Plan: ${addCount} to add, ${changeCount} to change, ${deleteCount} to destroy.\n`;
			return summary;
		}

		summary += "Terraform will perform the following actions:\n\n";

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
