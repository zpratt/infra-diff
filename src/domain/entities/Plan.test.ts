import Chance from "chance";
import { describe, expect, it } from "vitest";
import { Plan, ResourceChange } from "./Plan";

const chance = new Chance();

describe("Plan", () => {
	it("should create a plan with required properties", () => {
		const formatVersion = "1.0";
		const terraformVersion = "1.5.0";
		const resourceChanges: ResourceChange[] = [];

		const plan = new Plan(formatVersion, terraformVersion, resourceChanges);

		expect(plan.formatVersion).toBe(formatVersion);
		expect(plan.terraformVersion).toBe(terraformVersion);
		expect(plan.resourceChanges).toEqual(resourceChanges);
	});

	it("should create a plan with resource changes", () => {
		const formatVersion = "1.0";
		const terraformVersion = chance.word();
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const actions = ["create"];
		const before = null;
		const after = { bucket: chance.word() };

		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			actions,
			before,
			after,
		);
		const resourceChanges = [resourceChange];

		const plan = new Plan(formatVersion, terraformVersion, resourceChanges);

		expect(plan.resourceChanges).toHaveLength(1);
		expect(plan.resourceChanges[0].address).toBe(address);
		expect(plan.resourceChanges[0].type).toBe(type);
		expect(plan.resourceChanges[0].name).toBe(name);
		expect(plan.resourceChanges[0].actions).toEqual(actions);
		expect(plan.resourceChanges[0].before).toBe(before);
		expect(plan.resourceChanges[0].after).toEqual(after);
	});
});

describe("ResourceChange", () => {
	it("should create a resource change with all properties", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const actions = ["update"];
		const before = { key: "old-value" };
		const after = { key: "new-value" };

		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			actions,
			before,
			after,
		);

		expect(resourceChange.address).toBe(address);
		expect(resourceChange.type).toBe(type);
		expect(resourceChange.name).toBe(name);
		expect(resourceChange.actions).toEqual(actions);
		expect(resourceChange.before).toEqual(before);
		expect(resourceChange.after).toEqual(after);
	});

	it("should handle create action with null before", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const actions = ["create"];
		const before = null;
		const after = { key: chance.word() };

		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			actions,
			before,
			after,
		);

		expect(resourceChange.before).toBeNull();
		expect(resourceChange.after).toEqual(after);
	});

	it("should handle delete action with null after", () => {
		const address = chance.word();
		const type = chance.word();
		const name = chance.word();
		const actions = ["delete"];
		const before = { key: chance.word() };
		const after = null;

		const resourceChange = new ResourceChange(
			address,
			type,
			name,
			actions,
			before,
			after,
		);

		expect(resourceChange.before).toEqual(before);
		expect(resourceChange.after).toBeNull();
	});
});
