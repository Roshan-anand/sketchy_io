import { sketchyWords, sketchyWordsKey } from "../config/words";
import { Domain } from "../lib/types";
import { getRandomArrVal } from "../lib/utils";

export class WordsCuration {
	private GuessedWords: Set<string> = new Set(); // set of words already guessed

	/** mark word as guessed */
	set wordGuessed(word: string) {
		this.GuessedWords.add(word);
	}

	/**
	 * returns list of words of given length
	 * @param len length of words to fetch
	 * @param domain optional domain to filter words
	 */
	getCuratedWords(len: number, domain: Domain): string[] {
		const curatedWords = new Set<string>();
		while (curatedWords.size < len) {
			// pick random domain if domain is ALL
			const currDomain =
				domain === Domain.ALL ? getRandomArrVal(sketchyWordsKey) : domain;

			const word = getRandomArrVal(sketchyWords[currDomain]);
			if (!this.GuessedWords.has(word) || !curatedWords.has(word))
				curatedWords.add(word);
		}
		return Array.from(curatedWords);
	}
}
