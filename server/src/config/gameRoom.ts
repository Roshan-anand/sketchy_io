import {
	ChatMode,
	GameStatus,
	type GameType,
	type OneSetting,
	type Player,
	type Setting,
} from "../lib/types";
import { io } from "./socket";

class GameRoom {
	// general game data
	private roomId: string;
	private type: GameType;
	private status: GameStatus;
	private settings: Setting;
	private players: Map<string, Player>;
	private round: number;

	// each round data
	private remainingPlayers: string[]; // players who are yet to draw in the round

	// each match data
	private drawerId?: string;
	private word?: string; // word to be guessed
	private hiddenWord?: string; // word with hints shown to the guessers
	private matchTimeOutId?: NodeJS.Timeout;
	private correctGuessers: Map<string, number>; // id and score of the players who guessed correctly

	constructor(type: GameType, roomId: string) {
		this.roomId = roomId;
		this.type = type;
		this.players = new Map();
		this.status = GameStatus.WAITING;
		this.settings = {
			totalPlayers: 8,
			maxRounds: 3,
			drawTime: 80,
			hints: 2,
		};
		this.round = 0;
		this.remainingPlayers = [];
		this.correctGuessers = new Map();
	}

	/** get total players count */
	get playerCount() {
		return this.players.size;
	}

	/** update the game settings */
	set oneSetting(setting: OneSetting) {
		this.settings = {
			...this.settings,
			...setting,
		};
	}

	/** add a player to the room */
	addPlayer(player: Player) {
		const isEmpty = this.playerCount < this.settings.totalPlayers;
		if (isEmpty) this.players.set(player.id, player);
		return isEmpty;
	}

	/** get all players in the room */
	getAllPlayers() {
		return Array.from(this.players, ([_, player]) => {
			return player;
		});
	}

	/** remove a player from the room */
	removePlayer(playerId: string) {
		this.players.delete(playerId);
	}

	/** end the match */
	private async endMatch() {
		// set status back to in progress, so no more eveluation happens
		this.status = GameStatus.IN_PROGRESS;

		// update the scores
		this.correctGuessers.forEach((score, playerId) => {
			const player = this.players.get(playerId);
			if (player) player.score += score;
		});

		// emit the score list with correct word
		io.to(this.roomId).emit("endMatch");

		// set match information to default
		this.drawerId = undefined;
		this.word = undefined;
		this.hiddenWord = undefined;
		this.matchTimeOutId = undefined;
		this.correctGuessers.clear();

		await Bun.sleep(3000);

		if (this.remainingPlayers.length !== 0) this.chooseDrawer();
		else this.endRound(); // if all players have drawn, end the round
	}

	/** chooses a random player as drawer */
	private chooseDrawer() {
		// choose a drawer
		const drawerId = this.remainingPlayers.shift();
		const drawer = this.players.get(drawerId as string);
		if (!drawerId || !drawer) {
			//TODO: if no drawer is found, end the match
			return;
		}

		this.drawerId = drawerId;
		// TODO: replace with actual word generation logic
		// generate word choices
		const choices = ["apple", "banana", "cherry"];

		// emit word choice
		io.to(drawerId).emit("choosing", { isDrawer: true, choices });
		// TODO: if possible emit the whole data of the drawer
		io.to(this.roomId)
			.except(drawerId)
			.emit("choosing", { isDrawer: false, drawerName: drawer.name });
	}

	/** starts a new match when drawer selects the word */
	startMatch(word: string, drawerId: string) {
		if (!this.drawerId) this.drawerId = drawerId;
		this.word = word;
		// TODO: generate hidden word with underscores and spaces
		// eg. "apple pie" => "_____ ___"
		this.hiddenWord = "_".repeat(word.length);

		const time = this.settings.drawTime;
		// emit start match
		io.to(drawerId).emit("startMatch", { isDrawer: true, word }, time);
		io.to(this.roomId)
			.except(drawerId)
			.emit(
				"startMatch",
				{ isDrawer: false, hiddenWord: this.hiddenWord },
				time,
			);
		this.status = GameStatus.IN_MATCH;

		// set match timeout
		this.matchTimeOutId = setTimeout(
			() => this.endMatch(),
			this.settings.drawTime * 1000,
		);
	}

	/** end a round */
	private endRound() {
		this.round++;
		this.remainingPlayers = [];

		if (this.round === this.settings.maxRounds) {
			// TODO : end the game, because all rounds are over
		} else this.startRound();
	}

	/** starts a new round  */
	private async startRound() {
		io.to(this.roomId).emit("roundInfo", this.round); // emit the round info

		// add remaining players to the match
		this.remainingPlayers = Array.from(this.players.keys());
		await Bun.sleep(3000);
		this.chooseDrawer();
	}

	/** starts the game */
	startGame(settings: Setting) {
		this.settings = settings;
		this.status = GameStatus.IN_PROGRESS;
		this.round = 1;
		this.startRound();
	}

	// provide score
	private async evaluateScore(guesserId: string) {
		// TODO : calculate score based on time taken and place of guess
		this.correctGuessers.set(guesserId, 10);
		// TODO : check if all players have guessed correctly so we can end the match early
		if (this.correctGuessers.size === this.playerCount - 1) {
			clearTimeout(this.matchTimeOutId);
			this.endMatch();
		}
	}

	// validate the word
	vallidateWord(word: string, wsId: string): ChatMode {
		if (this.status === GameStatus.IN_MATCH && !this.correctGuessers.has(wsId))
			if (this.word && this.word === word) {
				this.evaluateScore(wsId);
				return ChatMode.SYSTEM_SUCCESS;
			}
		return ChatMode.NORMAL;
	}

	// TODO: remove log method when all the variable are in use
	log() {
		console.log(this.settings, this.type, this.matchTimeOutId, this.drawerId);
	}
}

export { GameRoom };
