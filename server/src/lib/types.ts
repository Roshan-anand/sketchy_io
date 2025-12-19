import type { DefaultEventsMap, Server, Socket } from "socket.io";

export enum GameEntryType {
	CREATE,
	JOIN,
}
export type WsAuth =
	| {
			name: string;
			type: GameEntryType.CREATE;
	  }
	| {
			name: string;
			type: GameEntryType.JOIN;
			roomId: string;
	  };

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
type ClientSentEvents = {
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
	choiceMade: (choice: string) => void;
};

type ServerSentEvents = {
	roomJoined: (roomId: string, players: Player[]) => void;
	roomCreated: (roomId: string, players: Player[]) => void;
	chatMsg: (msg: ChatMsg) => void;
	roomMembers: (players: Player[]) => void;
	gameRound: (round: number) => void;
	youChoosing: (choice: string[]) => void;
	startRound: (choiceLen: number) => void;
	roundOver: (word: string) => void;
	otherChoosing: (name: string) => void;
	wsError: (error: string) => void;
};

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
