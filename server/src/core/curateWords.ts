import { type Domain, sketchyWords } from "../config/words";

export class WordsCuration {
	private GuessedWords: Set<string> = new Set(); // set of words already guessed

	/** get random number for the given lenth */
	private getRandomLen(len: number) {
		return Math.floor(Math.random() * len);
	}

	/** mark word as guessed */
	set wordGuessed(word: string) {
		this.GuessedWords.add(word);
	}

	/**
	 * returns list of words of given length
	 * @param len length of words to fetch
	 * @param domain optional domain to filter words
	 */
	getCuratedWords(len: number, domain?: Domain): string[] {
		const curatedWords: string[] = [];
		while (curatedWords.length < len) {
			const currDomain =
				domain ||
				(this.getRandomLen(Object.keys(sketchyWords).length) as Domain); // either given domain or random domain
			const domainWords = sketchyWords[currDomain];
			const word = domainWords[this.getRandomLen(domainWords.length)];
			if (!this.GuessedWords.has(word)) curatedWords.push(word);
		}
		return curatedWords;
	}
}
