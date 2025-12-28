import {
	ChatMode,
	GameStatus,
	type GameType,
	type Player,
	type Setting,
} from "../lib/types";
import { io } from "./socket";

class GameRoom {
	// general game data
	private roomId: string;
	private type: GameType;
	private _status: GameStatus;
	private _settings: Setting;
	private players: Map<string, Player>;

	// each round data
	private round: number;

	// each match data
	private drawerId?: string;
	private word?: string;
	private hiddenWord?: string;
	private matchTimeOutId?: number;
	private remainingPlayers: Set<string>;

	constructor(type: GameType, roomId: string) {
		this.roomId = roomId;
		this.type = type;
		this.players = new Map();
		this._status = GameStatus.WAITING;
		this._settings = {
			totalPlayers: 8,
			maxRounds: 3,
			drawTime: 80,
			hints: 2,
		};
		this.round = 0;
		this.remainingPlayers = new Set();
	}

	/** get total players count */
	get playerCount() {
		return this.players.size;
	}

	/** update the game status */
	set status(status: GameStatus) {
		this._status = status;
	}

	/** update the game settings */
	set settings(settings: Setting) {
		this._settings = settings;
	}

	/** add a player to the room */
	addPlayer(player: Player) {
		this.players.set(player.id, player);
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

	/** chooses a random player as drawer */
	private chooseDrawer() {
		// choose a drawer
		const drawerId = this.remainingPlayers.values().next().value;
		const drawer = this.players.get(drawerId as string);
		if (!drawerId || !drawer) {
			// if no drawer is found, end the match
			return;
		}

		this.remainingPlayers.delete(drawerId);
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

	/** start the match */
	startMatch(word: string, drawerId: string) {
		if (!this.drawerId) this.drawerId = drawerId;
		this.word = word;
		// TODO: generate hidden word with underscores and spaces
		// eg. "apple pie" => "_____ ___"
		this.hiddenWord = "_".repeat(word.length);

		// emit start match
		io.to(drawerId).emit("startMatch", { isDrawer: true, word });
		io.to(this.roomId)
			.except(drawerId)
			.emit("startMatch", { isDrawer: false, hiddenWord: this.hiddenWord });
		this._status = GameStatus.IN_MATCH;
	}

	/** starts a new round  */
	private async startRound() {
		io.to(this.roomId).emit("roundInfo", this.round); // emit the round info

		// add remaining players to the match
		this.remainingPlayers = new Set(this.players.keys());
		await Bun.sleep(3000);
		this.chooseDrawer();
	}

	/** starts the game */
	startGame() {
		this.status = GameStatus.IN_PROGRESS;
		this.round = 1;
		this.startRound();
	}

	// validate the word
	vallidateWord(word: string): ChatMode {
		if (this._status === GameStatus.IN_MATCH)
			if (this.word && this.word === word) return ChatMode.GUESS_CORRECT;
		return ChatMode.NORMAL;
	}

	// TODO: remove log method when all the variable are in use
	log() {
		console.log(this._settings, this.type, this.matchTimeOutId, this.drawerId);
	}
}

export { GameRoom };
