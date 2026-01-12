import { io } from "../config/socket";
import {
	ChatMode,
	GameStatus,
	type GameType,
	MatchStatus,
	type OneSetting,
	type Player,
	type RoomJoinedData,
	type RoomUtilData,
	type Setting,
} from "../lib/types";
import { WordsCuration } from "./curateWords";
import { GameTimer } from "./gameTimer";

type DurationList = {
	seventy: number;
	fourty: number;
	ten: number;
};

export class GameRoom {
	// general game data
	private roomId: string;
	private type: GameType;
	private _hostId: string;

	/** default setting */
	private defaultSettings: Setting = {
		totalPlayers: 8,
		maxRounds: 3,
		drawTime: 80,
		hints: 2,
		choiceCount: 3,
	};

	private status: GameStatus = GameStatus.WAITING;
	private settings: Setting = this.defaultSettings;
	private durationPercent: DurationList = {
		seventy: 0,
		fourty: 0,
		ten: 0,
	};
	private players: Map<string, Player> = new Map();
	private round: number = 0;
	private hintIntervals: number[] = []; // time stamps for providing hints

	// each round data
	private remainingPlayers: string[] = []; // players who are yet to draw in the round

	// each match data
	private matchStatus: MatchStatus = MatchStatus.NONE;
	private drawerId: string | null = null;
	private word: string | null = null; // word to be guessed
	private hiddenWord: string[] | null = null; // word with hints shown to the guessers
	private wordCuration: WordsCuration = new WordsCuration();
	private gameTimer: GameTimer = new GameTimer();
	private hintUsed: number = 0;
	private correctGuessers: Map<string, number> = new Map(); // id and score of the players who guessed correctly

	constructor(type: GameType, roomId: string, hostId: string) {
		this.roomId = roomId;
		this.type = type;
		this._hostId = hostId;
	}

	get hostId() {
		return this._hostId;
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
	addPlayer({ id, name, character }: { id: string; name: string; character?: string }): RoomJoinedData | null {
		if (this.playerCount > this.settings.totalPlayers) {
			return null;
		}

		this.players.set(id, { id, name, score: 0, character });

		let data: RoomUtilData = { matchStatus: MatchStatus.NONE };
		if (this.matchStatus === MatchStatus.DRAWING)
			data = {
				matchStatus: MatchStatus.DRAWING,
				startMatchData: {
					isDrawer: false,
					hiddenWord: this.hiddenWord as string[],
				},
				timer: this.gameTimer.getTimeLeft(),
			};
		else if (this.matchStatus === MatchStatus.CHOOSING)
			data = {
				matchStatus: MatchStatus.CHOOSING,
				choosingData: {
					isDrawer: false,
					drawerName: this.players.get(this.drawerId as string)?.name as string,
				},
			};

		return {
			roomId: this.roomId,
			players: this.getAllPlayers(),
			hostId: this._hostId,
			settings: this.settings,
			...data,
		};
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

		if (this.status === GameStatus.WAITING) return;

		// announce winner if only one player left
		if (this.playerCount === 1) {
			this.winnerAnnouncement();
			return;
		}

		const clearNend = () => {
			this.gameTimer.clearTimer();
			this.endMatch();
		};

		// check if player is choosing or drawing
		if (this.drawerId === playerId) {
			this.drawerId = null;
			if (this.matchStatus === MatchStatus.CHOOSING) this.chooseDrawer();
			else if (this.matchStatus === MatchStatus.DRAWING) {
				this.correctGuessers.clear(); // clear correct guessers so that no score is given
				clearNend();
			}
		} else if (this.correctGuessers.size === this.playerCount - 1) clearNend();

		// if player is host then choose a random player to be host
		if (this.hostId === playerId) {
			const hostId = this.players.keys().next().value;
			if (!hostId) return;
			this._hostId = hostId;
			io.to(this.roomId).except(hostId).emit("hostInfo", hostId);
			io.to(hostId).emit("setHost", hostId);
		}
	}

	/** end the match */
	private async endMatch() {
		// set status back to in progress, so no more eveluation happens
		this.status = GameStatus.IN_PROGRESS;
		this.matchStatus = MatchStatus.NONE;

		// if no drawerID that means he already left the game
		if (this.drawerId)
			// TODO: need more refined calculation for drawer score
			this.correctGuessers.set(
				this.drawerId as string,
				Math.floor(this.getPlayerPercent("guessed")),
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
		this.drawerId = null;
		this.word = null;
		this.hiddenWord = null;
		this.correctGuessers.clear();
		this.hintUsed = 0;

		await Bun.sleep(5000);

		if (this.remainingPlayers.length !== 0) this.chooseDrawer();
		else this.endRound(); // if all players have drawn, end the round
	}

	/** chooses a random player as drawer */
	private chooseDrawer() {
		// choose a drawer
		const drawerId = this.remainingPlayers.shift();
		const drawer = this.players.get(drawerId as string);
		if (!drawerId) {
			this.endRound();
			return;
		}
		if (!drawer) {
			this.chooseDrawer();
			return;
		}

		this.drawerId = drawerId;
		this.matchStatus = MatchStatus.CHOOSING;
		const choices = this.wordCuration.getCuratedWords(
			this.settings.choiceCount,
		);

		// emit word choice
		io.to(drawerId).emit("choosing", { isDrawer: true, choices });
		// TODO: if possible emit the whole data of the drawer
		io.to(this.roomId)
			.except(drawerId)
			.emit("choosing", { isDrawer: false, drawerName: drawer.name });
	}

	/** starts a new match when drawer selects the word */
	startMatch(word: string, drawerId: string) {
		const { drawTime, hints } = this.settings;

		if (!this.drawerId) this.drawerId = drawerId;
		this.word = word;
		this.hiddenWord = word.split("").map((char) => (char === " " ? " " : "_"));
		this.wordCuration.wordGuessed = word; // mark word as guessed

		this.status = GameStatus.IN_MATCH;
		this.matchStatus = MatchStatus.DRAWING;

		// emit start match
		io.to(drawerId).emit("startMatch", { isDrawer: true, word }, drawTime);
		io.to(this.roomId)
			.except(drawerId)
			.emit(
				"startMatch",
				{ isDrawer: false, hiddenWord: this.hiddenWord },
				drawTime,
			);

		// set match timeout
		this.gameTimer.startTimer(() => this.endMatch(), drawTime);

		// set hint timeouts
		const interval = Math.floor(drawTime / (hints + 1));

		for (let i = hints; i >= 1; i--) {
			const timer = interval * i;
			this.hintIntervals.push(timer);
			setTimeout(
				() => {
					if (this.hintUsed <= i) {
						this.provideHint(timer);
					}
				},
				(drawTime - timer) * 1000,
			);
		}
	}

	/** winner announcement of the game  */
	private async winnerAnnouncement() {
		// winner announcement
		io.to(this.roomId).emit("results", this.getAllPlayers());
		await Bun.sleep(4000);

		// set all values to default
		this.status = GameStatus.WAITING;
		this.matchStatus = MatchStatus.NONE;
		this.settings = this.defaultSettings;
		this.round = 0;
		this.players.forEach((player) => {
			player.score = 0;
		});

		// emit settings
		io.to(this.roomId).emit("restart");
	}

	/** end a round */
	private endRound() {
		if (this.round === this.settings.maxRounds) this.winnerAnnouncement();
		else {
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

	/** provide hint to players */
	private provideHint(timeLeft: number) {
		const hintUsed = this.hintUsed;
		//either  all hints used
		// or time left is greater than the hint interval
		if (
			hintUsed === this.settings.hints ||
			timeLeft > this.hintIntervals[hintUsed]
		)
			return;

		if (
			!this.word ||
			!this.hiddenWord ||
			this.hintUsed >= this.word.length * 0.5
		)
			return; // prevent revealing more than 60% of the word

		while (true) {
			const index = Math.floor(Math.random() * this.word.length);
			if (this.word[index] !== this.hiddenWord[index]) {
				this.hintUsed++;
				this.hiddenWord[index] = this.word[index];
				break;
			}
		}
		io.to(this.roomId)
			.except(Array.from(this.correctGuessers.keys()))
			.except(this.drawerId as string)
			.emit("hint", this.hiddenWord);
	}

	/** vallidate the word guessed by a player */
	validateWord(msg: string, name: string, wsId: string) {
		let mode = ChatMode.NORMAL;

		if (
			this.matchStatus === MatchStatus.DRAWING &&
			!this.correctGuessers.has(wsId)
		)
			if (this.word && this.word === msg) {
				io.to(wsId).emit("guessed", msg.split("")); // notify the guesser that they have guessed correctly
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
			// reduce the timer based on percentage of players guessed
			const notGuessed = this.getPlayerPercent("notGuessed");

			const timeLeft = this.gameTimer.getTimeLeft();
			let newTimeLeft: number | undefined;

			if (notGuessed <= 70 && timeLeft > this.durationPercent.seventy)
				newTimeLeft = this.durationPercent.seventy;
			else if (notGuessed <= 40 && timeLeft > this.durationPercent.fourty)
				newTimeLeft = this.durationPercent.fourty;
			else if (notGuessed <= 10 && timeLeft > this.durationPercent.ten)
				newTimeLeft = this.durationPercent.ten;

			if (newTimeLeft) {
				io.to(this.roomId).emit("reduceTime", newTimeLeft);
				this.gameTimer.startTimer(() => this.endMatch(), newTimeLeft);

				this.provideHint(newTimeLeft); // in case a hint is to be provided on time reduction
			}
		}
	}

	// TODO: remove log method when all the variable are in use
	log() {
		console.log(this.type);
	}
}
