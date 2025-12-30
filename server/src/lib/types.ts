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
	IN_MATCH,
	FINISHED,
}

export type Player = {
	id: string;
	name: string;
	score: number;
};

export type ScoreBoard = {
	word: string;
	scores: Player[];
};

export type Setting = {
	totalPlayers: number;
	maxRounds: number;
	drawTime: number;
	hints: number;
};

export type OneSetting = {
	[K in keyof Setting]: { [P in K]: Setting[P] };
}[keyof Setting];

export enum ChatMode {
	SYSTEM_INFO,
	SYSTEM_SUCCESS,
	NORMAL,
}

export type ChatMsg = {
	name: string;
	msg: string;
	mode: ChatMode;
};

export type choiceData =
	| {
			isDrawer: true;
			choices: string[];
	  }
	| {
			isDrawer: false;
			drawerName: string;
	  };

export type startMatchData =
	| {
			isDrawer: true;
			word: string;
	  }
	| {
			isDrawer: false;
			hiddenWord: string;
	  };

type ClientSentEvents = {
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
	updateSettings: (setting: OneSetting) => void;
	choiceMade: (choice: string) => void;
};

type ServerSentEvents = {
	wsError: (error: string) => void;
	roomJoined: (roomId: string, players: Player[]) => void;
	roomCreated: (roomId: string, players: Player[]) => void;
	chatMsg: (msg: ChatMsg) => void;
	updateSettings: (setting: OneSetting) => void;
	roomMembers: (players: Player[]) => void;
	roundInfo: (round: number) => void;
	choosing: (data: choiceData) => void;
	startMatch: (matchInfo: startMatchData, time: number) => void;
	guessed: (word: string) => void;
	reduceTime: (timeLeft: number) => void;
	endMatch: (scoreBoard: ScoreBoard) => void;
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
