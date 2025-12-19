import type { Socket } from "socket.io-client";

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

export enum GameState {
	ONBOARDING,
	FINDING,
	WAITING,
	PLAYING,
}

export type Player = {
	name: string;
	score: number;
	id: string;
};

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

export type TypedSocket = Socket<ServerSentEvents, ClientSentEvents>;
