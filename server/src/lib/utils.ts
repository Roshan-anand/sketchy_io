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

/**
 * stops the execution for given milliseconds
 *
 * @param ms - milliseconds to sleep
 */
export const sleep = async (ms: number) => {
	await new Promise((resolve) => setTimeout(resolve, ms));
};
