import {
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
	private matchTimeOutId?: number;
	// private

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

	/** starts a new round  */
	private startRound() {
		io.to(this.roomId).emit("roundInfo", this.round); // emit the round info
	}

	/** starts the game */
	start() {
		this.status = GameStatus.IN_PROGRESS;
		this.startRound();
	}

	// validate the word
	vallidateWord(word: string): boolean {
		if (this._status === GameStatus.IN_PROGRESS)
			if (this.word && this.word === word) return true;
		return false;
	}

	// TODO: remove log method when all the variable are in use
	log() {
		console.log(this._settings, this.type, this.matchTimeOutId, this.drawerId);
	}
}

export { GameRoom };
