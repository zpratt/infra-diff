export class Plan {
	constructor(
		public readonly formatVersion: string,
		public readonly terraformVersion: string,
		public readonly resourceChanges: ResourceChange[],
	) {}
}

export class ResourceChange {
	constructor(
		public readonly address: string,
		public readonly type: string,
		public readonly name: string,
		public readonly actions: string[],
		public readonly before: Record<string, unknown> | null,
		public readonly after: Record<string, unknown> | null,
	) {}
}
