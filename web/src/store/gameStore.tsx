import { create } from "zustand";
import {
	CanvaState,
	type choiceData,
	GameState,
	type Player,
	type startMatchData,
} from "@/lib/types";

// TODO : replace drawerName with full player details
type MatchUtils =
	| {
			isDrawer: true;
			choices?: string[];
			word?: string;
	  }
	| { isDrawer: false; drawerName?: string; hiddenWord?: string };

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
	canvaState: CanvaState;
	canType: boolean; // to control if the player can type in chat
	round: number;
	matchUtils: MatchUtils;
	matchTimer: number;
	setGuessed: (word: string) => void;
	updateRound: (round: number) => void;
	setChoosingInfo: (data: choiceData) => void;
	setMatchInfo: (matchInfo: startMatchData, time: number) => void;
	setEndMatch: () => void;
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

	// to handle the match
	canvaState: CanvaState.SETTINGS,
	canType: true,
	round: 0,
	matchUtils: { isDrawer: false },
	matchTimer: 0,
	setGuessed: (word) => {
		// const {matchUtils} = get()
		set({
			canType: false,
			matchUtils: {
				// ...matchUtils,
				isDrawer: false,
				hiddenWord: word,
			},
		});
	},
	updateRound: (round) => set({ round, canvaState: CanvaState.ROUND }),
	setChoosingInfo: (data) => {
		const { matchUtils } = get();
		set({
			matchUtils: { ...matchUtils, ...data },
			canvaState: CanvaState.CHOOSE,
		});
	},
	setMatchInfo: (matchInfo, time) => {
		const { matchUtils } = get();
		set({
			gameState: GameState.PLAYING,
			matchUtils: { ...matchUtils, ...matchInfo },
			matchTimer: time,
			canvaState: CanvaState.DRAW,
		});
	},
	setEndMatch: () =>
		set({
			canType: true,
			gameState: GameState.WAITING,
			matchUtils: { isDrawer: false },
			matchTimer: 0,
			canvaState: CanvaState.SCORE_BOARD,
		}),
}));

export default useGameStore;
