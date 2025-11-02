import type { Plan } from "../entities/Plan";

export interface ITextFormatter {
	format(plan: Plan): string;
}
