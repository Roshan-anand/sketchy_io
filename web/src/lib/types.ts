import type { Socket } from "socket.io-client";

export enum GameEntryType {
	CREATE,
	JOIN,
}

export type WsAuth =
	| {
			name: string;
			type: GameEntryType.CREATE;
			char: number;
	  }
	| {
			name: string;
			type: GameEntryType.JOIN;
			roomId: string;
			char: number;
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
	char: number;
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
	theme: SettingTheme;
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

export type Tool = "pencil" | "eraser" | "fill";
export type CanvaData = {
	from: {
		x: number;
		y: number;
	};
	to: {
		x: number;
		y: number;
	};
	color: string;
	width: number;
};

type ClientSentEvents = {
	startGame: (settings: Setting) => void;
	chatMsg: (msg: string) => void;
	updateSettings: (setting: OneSetting) => void;
	choiceMade: (choice: string) => void;
	canvasData: (data: CanvaData) => void;
	fillCanvas: (color: string) => void;
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
	canvasData: (data: CanvaData) => void;
	fillCanvas: (color: string) => void;
};

export type TypedSocket = Socket<ServerSentEvents, ClientSentEvents>;

export enum Domain {
	ANIMALS = "Animals",
	PROFESSIONS = "Professions",
	ITEMS = "Items",
	FOOD = "Food",
	OTHERS = "Others",
}

export type SettingTheme = Domain | "All";
