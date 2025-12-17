import type { Members } from "./types";

/**
 * generates a random id of given size
 *
 * @param size - size of the id to be generated
 * @returns
 */
export const generateId = (size: number) => {
	const random = "qwertyuiopasdfghjklzxcvbnm0987654321";
	let id = "";
	for (let i = 0; i < size; i++) {
		id += random[Math.floor(Math.random() * (random.length - 1))];
	}
	return id;
};

/**
 * converts member map to array
 *
 * @param members - members of the room
 * @returns
 */
export const MemberMapToArray = (members: Members) => {
	const players = Array.from(members, ([_, player]) => {
		return player;
	});
	return players;
};
