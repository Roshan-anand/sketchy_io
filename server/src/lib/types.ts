import type { DefaultEventsMap, Server, Socket } from "socket.io";

export enum GameType {
	PUBLIC,
	PRIVATE,
}

export enum GameStatus {
	WAITING,
	IN_PROGRESS,
	FINISHED,
}

export type Player = {
	name: string;
	score: number;
	id: string;
};

export type Members = Map<string, Player>;

export type Setting = {
	totalPlayers: number;
	maxRounds: number;
	drawTime: number;
	hints: number;
};

export type ChatMsg = {
	name: string;
	msg: string;
	isValid: boolean;
};

export type GameRoom = {
	type: GameType;

	members: Members;
	status: GameStatus;

	settings: Setting;

	word: string;
	round: number;
	drawerId: string;
};

// Define typed events for Socket.IO
type ServerSentEvents = {
	roomJoined: (roomId: string, players: Player[]) => void;
	roomCreated: (roomId: string, players: Player[]) => void;
	chatMsg: (msg: ChatMsg) => void;
	roomMembers: (players: Player[]) => void;
	wsError: (error: string) => void;
	playersOnline: (count: number) => void;
};

type ClientSentEvents = {
	joinRoom: (name: string, roomId: string) => void;
	createRoom: (name: string) => void;
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
};
// type InterServerEvents = {};

type SocketData = {
	roomId: string;
	name: string;
};

export type TypedScoket = Socket<
	ClientSentEvents,
	ServerSentEvents,
	DefaultEventsMap,
	SocketData
>;

export type TypedIo = Server<ClientSentEvents, ServerSentEvents>;
