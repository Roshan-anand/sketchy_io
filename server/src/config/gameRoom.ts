import {
	ChatMode,
	GameStatus,
	type GameType,
	type OneSetting,
	type Player,
	type Setting,
} from "../lib/types";
import { GameTimer } from "./gameTimer";
import { io } from "./socket";

type DurationList = {
	seventy: number;
	fourty: number;
	ten: number;
};

export class GameRoom {
	// general game data
	private roomId: string;
	private type: GameType;
	private status: GameStatus;
	private settings: Setting;
	private durationPercent: DurationList;
	private players: Map<string, Player>;
	private round: number;

	// each round data
	private remainingPlayers: string[]; // players who are yet to draw in the round

	// each match data
	private drawerId?: string;
	private word?: string; // word to be guessed
	private hiddenWord?: string; // word with hints shown to the guessers
	private gameTimer: GameTimer;
	private correctGuessers: Map<string, number>; // id and score of the players who guessed correctly

	/** default setting */
	private defaultSettings: Setting = {
		totalPlayers: 8,
		maxRounds: 3,
		drawTime: 80,
		hints: 2,
	};

	constructor(type: GameType, roomId: string) {
		this.roomId = roomId;
		this.type = type;
		this.players = new Map();
		this.status = GameStatus.WAITING;
		this.settings = this.defaultSettings;
		this.round = 0;
		this.remainingPlayers = [];
		this.correctGuessers = new Map();
		this.gameTimer = new GameTimer();
		this.durationPercent = {
			seventy: 0,
			fourty: 0,
			ten: 0,
		};
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
	addPlayer({ id, name }: { id: string; name: string }) {
		const isEmpty = this.playerCount < this.settings.totalPlayers;
		if (isEmpty) this.players.set(id, { id, name, score: 0 });
		return isEmpty;
	}

	/** get all players in the room */
	getAllPlayers() {
		const players = Array.from(this.players, ([_, player]) => {
			return player;
		});

		if (this.status !== GameStatus.WAITING)
			players.sort((a, b) => b.score - a.score);

		return players;
	}

	/** get percentage of players remaining to guess */
	private getPlayerPercent(type: "guessed" | "notGuessed") {
		if (type === "guessed")
			return (this.correctGuessers.size / (this.playerCount - 1)) * 100;
		else return (1 - this.correctGuessers.size / (this.playerCount - 1)) * 100;
	}

	/** remove a player from the room */
	removePlayer(playerId: string) {
		this.players.delete(playerId);
	}

	/** end the match */
	private async endMatch() {
		// set status back to in progress, so no more eveluation happens
		this.status = GameStatus.IN_PROGRESS;

		// TODO: calculate score for drawer based on the number of correct guessers
		this.correctGuessers.set(
			this.drawerId as string,
			this.getPlayerPercent("guessed"),
		);

		const scores: Player[] = [];

		// update the scores
		this.players.forEach((player) => {
			const currentScore = this.correctGuessers.get(player.id) || 0;
			scores.push({ ...player, score: currentScore });
			player.score += currentScore;
		});

		// emit the score list with correct word
		io.to(this.roomId).emit("endMatch", { scores, word: this.word as string });

		// emit updated scores
		io.to(this.roomId).emit("roomMembers", this.getAllPlayers());

		// set match information to default
		this.drawerId = undefined;
		this.word = undefined;
		this.hiddenWord = undefined;
		this.correctGuessers.clear();

		await Bun.sleep(5000);

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
		this.gameTimer.startTimer(() => this.endMatch(), this.settings.drawTime);
	}

	/** end a round */
	private async endRound() {
		if (this.round === this.settings.maxRounds) {
			// winner announcement
			io.to(this.roomId).emit("results", this.getAllPlayers());
			await Bun.sleep(4000);

			// set all values to default
			this.status = GameStatus.WAITING;
			this.settings = this.defaultSettings;
			this.round = 0;
			this.players.forEach((player) => {
				player.score = 0;
			});

			// emit settings
			io.to(this.roomId).emit("restart");
		} else {
			this.round++;
			this.remainingPlayers = [];
			this.startRound();
		}
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
		const duration = this.settings.drawTime;
		this.durationPercent = {
			seventy: Math.floor(duration * 0.72),
			fourty: Math.floor(duration * 0.42),
			ten: Math.floor(duration * 0.12),
		};
		this.round = 1;
		this.startRound();
	}

	/** vallidate the word guessed by a player */
	validateWord(msg: string, name: string, wsId: string) {
		let mode = ChatMode.NORMAL;

		if (this.status === GameStatus.IN_MATCH && !this.correctGuessers.has(wsId))
			if (this.word && this.word === msg) {
				io.to(wsId).emit("guessed", msg); // notify the guesser that they have guessed correctly
				msg = `${name} guessed the word`;
				mode = ChatMode.SYSTEM_SUCCESS;
			}

		io.in(this.roomId).emit("chatMsg", {
			name,
			msg,
			mode,
		});

		if (mode !== ChatMode.SYSTEM_SUCCESS) return;
		// evaluating later so that emit happens first
		// evaluates the score for the give player id
		const player = this.players.get(wsId);
		if (!player) return;

		// TODO : make a better logic for score calculation
		this.correctGuessers.set(
			player.id,
			Math.ceil(this.getPlayerPercent("notGuessed")),
		);

		// end the match early if all players have guessed correctly
		if (this.correctGuessers.size === this.playerCount - 1) {
			this.gameTimer.clearTimer();
			this.endMatch();
		} else {
			// TODO : find a better way to handle reduce timer logic
			// reduce the time
			const notGuessed = this.getPlayerPercent("notGuessed");

			const timeLeft = this.gameTimer.getTimeLeft();
			let newTime: number | undefined;

			if (notGuessed <= 70 && timeLeft > this.durationPercent.seventy)
				newTime = this.durationPercent.seventy;
			else if (notGuessed <= 40 && timeLeft > this.durationPercent.fourty)
				newTime = this.durationPercent.fourty;
			else if (notGuessed <= 10 && timeLeft > this.durationPercent.ten)
				newTime = this.durationPercent.ten;

			if (newTime) {
				io.to(this.roomId).emit("reduceTime", newTime);
				this.gameTimer.startTimer(() => this.endMatch(), newTime);
			}
		}
	}

	// TODO: remove log method when all the variable are in use
	log() {
		console.log(this.type);
	}
}
