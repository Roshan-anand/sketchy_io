/**
 * generates a random id of given size
 *
 * @param size - size of the id to be generated
 * @returns generated id
 */
export const generateId = (size: number) => {
	const random = "qwertyuiopasdfghjklzxcvbnm0987654321";
	let id = "";
	for (let i = 0; i < size; i++) {
		id += random[Math.floor(Math.random() * (random.length - 1))];
	}
	return id;
};

/** get random value from the given array */
export const getRandomArrVal = <T>(arr: T[]): T => {
	const ranLen = Math.floor(Math.random() * arr.length);
	return arr[ranLen];
};
