import { create } from "zustand";
import {
	CanvaState,
	type choiceData,
	GameState,
	type Player,
	type ScoreBoard,
	type startMatchData,
} from "@/lib/types";

// TODO : replace drawerName with full player details
type MatchUtils =
	| {
			isDrawer: true;
			choices?: string[];
			word?: string;
	  }
	| { isDrawer: false; drawerName?: string; hiddenWord?: string[] };

type Store = {
	gameState: GameState;
	setGameState: (state: GameState) => void;
	roomId: string | null;
	isHost: boolean;
	players: Player[];
	setPlayers: (players: Player[]) => void;
	setEnterGame: (
		gameState: GameState,
		roomId: string,
		isHost: boolean,
		players: Player[],
	) => void;
	gameIntervalId: number | null;
	setGameIntervalId: (id: number | null) => void;
	// to handle the match
	canvaState: CanvaState;
	canType: boolean; // to control if the player can type in chat
	round: number;
	matchUtils: MatchUtils;
	matchTimer: number;
	scoreBoard: ScoreBoard;
	setMatchTimer: (time: number) => void;
	setHiddenWord: (word: string[]) => void;
	setGuessed: (word: string[]) => void;
	updateRound: (round: number) => void;
	setChoosingInfo: (data: choiceData) => void;
	setStartMatch: (matchInfo: startMatchData, time: number) => void;
	setEndMatch: (scoreBoard: ScoreBoard) => void;
	setEndGame: (players: Player[]) => void;
	setRestart: () => void;
};

const useGameStore = create<Store>()((set, get) => ({
	// to handle players in the room
	gameState: GameState.ONBOARDING,
	setGameState: (state) => set({ gameState: state }),
	roomId: null,
	isHost: false,
	players: [],
	setPlayers: (players) => set({ players: players }),
	setEnterGame: (gameState, roomId, isHost, players) =>
		set({ gameState, roomId, isHost, players }),

	gameIntervalId: null,
	setGameIntervalId: (id: number | null) => {
		const { gameIntervalId } = get();
		if (gameIntervalId) clearInterval(gameIntervalId);
		set({ gameIntervalId: id });
	},
	// to handle the match
	canvaState: CanvaState.SETTINGS,
	canType: true,
	round: 0,
	matchUtils: { isDrawer: false },
	matchTimer: 0,
	scoreBoard: { scores: [], word: "" },
	setMatchTimer: (time) => set({ matchTimer: time }),
	setHiddenWord: (word) => {
		const { matchUtils } = get();

		if (!matchUtils.isDrawer)
			set({
				matchUtils: {
					...matchUtils,
					hiddenWord: word,
				},
			});
	},
	setGuessed: (word) =>
		set({
			canType: false,
			matchUtils: {
				...get().matchUtils,
				isDrawer: false,
				hiddenWord: word,
			},
		}),
	updateRound: (round) => set({ round, canvaState: CanvaState.ROUND }),
	setChoosingInfo: (data) =>
		set({
			matchUtils: { ...get().matchUtils, ...data },
			canvaState: CanvaState.CHOOSE,
			matchTimer: 15,
		}),
	setStartMatch: (matchInfo, time) =>
		set({
			gameState: GameState.PLAYING,
			matchUtils: { ...get().matchUtils, ...matchInfo },
			matchTimer: time,
			canvaState: CanvaState.DRAW,
		}),
	setEndMatch: (scoreBoard) =>
		set({
			canType: true,
			matchUtils: { isDrawer: false },
			matchTimer: 0,
			canvaState: CanvaState.SCORE_BOARD,
			scoreBoard,
		}),
	setEndGame: (players) =>
		set({
			canvaState: CanvaState.WINNER,
			players,
		}),
	setRestart: () =>
		set({
			gameState: GameState.WAITING,
			canvaState: CanvaState.SETTINGS,
		}),
}));

export default useGameStore;
