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
};

export type Members = Map<string, Player>;

export type Setting = {
	totalMembers: number;
	maxRounds: number;
	drawtime: number;
	hints: number;
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

export type User = {
	name: string;
	roomId: string;
};
