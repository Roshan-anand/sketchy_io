import type { Socket } from "socket.io-client";

export enum GameState {
	ONBOARDING,
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
	joinRoom: (name: string, roomId: string) => void;
	createRoom: (name: string) => void;
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
};

type ServerSentEvents = {
	roomJoined: (roomId: string, players: Player[]) => void;
	roomCreated: (roomId: string, players: Player[]) => void;
	chatMsg: (msg: ChatMsg) => void;
	roomMembers: (players: Player[]) => void;
	wsError: (error: string) => void;
	playersOnline: (count: number) => void;
};

export type TypedSocket = Socket<ServerSentEvents, ClientSentEvents>;
