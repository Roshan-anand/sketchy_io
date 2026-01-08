import type { Socket } from "socket.io-client";

// Types for drawing
export type Tool = "pen" | "eraser" | "fill";

export interface Stroke {
	id: string;
	tool: Tool;
	points: number[];
	color: string;
	strokeWidth: number;
}

export interface DrawAction {
	type: "stroke" | "fill" | "clear";
	data: Stroke | { color: string } | null;
}

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

export enum MatchStatus {
	CHOOSING,
	DRAWING,
	NONE,
}

export enum CanvaState {
	SETTINGS,
	ROUND,
	DRAW,
	CHOOSE,
	SCORE_BOARD,
	WINNER,
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
	choiceCount: number;
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
			hiddenWord: string[];
	  };

type RoomData = {
	roomId: string;
	players: Player[];
	hostId: string;
};

type RoomUtilData =
	| {
			matchStatus: MatchStatus.NONE;
	  }
	| {
			matchStatus: MatchStatus.DRAWING;
			startMatchData: Extract<startMatchData, { isDrawer: false }>;
			timer: number;
	  }
	| {
			matchStatus: MatchStatus.CHOOSING;
			choosingData: Extract<choiceData, { isDrawer: false }>;
	  };

export type RoomJoinedData = RoomData & { settings: Setting } & RoomUtilData;

type ClientSentEvents = {
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
	updateSettings: (setting: OneSetting) => void;
	choiceMade: (choice: string) => void;
	drawingData: (data: DrawAction) => void;
};

type ServerSentEvents = {
	wsError: (error: string) => void;
	roomJoined: (data: RoomJoinedData) => void;
	roomCreated: (data: RoomData) => void;
	hostInfo: (hostId: string) => void;
	setHost: (hostId: string) => void;
	chatMsg: (msg: ChatMsg) => void;
	updateSettings: (setting: OneSetting) => void;
	roomMembers: (players: Player[]) => void;
	roundInfo: (round: number) => void;
	choosing: (data: choiceData) => void;
	startMatch: (matchInfo: startMatchData, time: number) => void;
	guessed: (word: string[]) => void;
	reduceTime: (timeLeft: number) => void;
	hint: (hiddenWord: string[]) => void;
	endMatch: (scoreBoard: ScoreBoard) => void;
	results: (scores: Player[]) => void;
	restart: () => void;
	drawingData: (data: DrawAction) => void;
};

export type TypedSocket = Socket<ServerSentEvents, ClientSentEvents>;
