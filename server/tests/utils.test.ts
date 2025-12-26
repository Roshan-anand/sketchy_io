import { describe, expect, test } from "bun:test";
import { generateId } from "../src/lib/utils";

describe("generate id", () => {
	test("check id length", () => {
		const id = generateId(6);
		expect(id.length).toBe(6);
	});

	test("check id uniqueness", () => {
		const ids = new Set<string>();
		for (let i = 0; i < 1000; i++) {
			const id = generateId(6);
			expect(ids.has(id)).toBe(false);
			ids.add(id);
		}
	});
});
