import type { Plan } from "../entities/Plan";

export interface IPlanParser {
	parse(content: string): Promise<Plan>;
}
