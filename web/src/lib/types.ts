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

export enum CanvaState {
	SETTINGS,
	ROUND,
	DRAW,
	CHOOSE,
	SCORE_BOARD,
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
	endMatch: () => void;
};

export type TypedSocket = Socket<ServerSentEvents, ClientSentEvents>;
