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
	matchUtils: MatchUtils;
	round: number;
	updateRound: (round: number) => void;
	choosingInfo: (data: choiceData) => void;
	matchInfo: (data: startMatchData) => void;
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
	matchUtils: { isDrawer: false },
	round: 0,
	updateRound: (round) => set({ round, canvaState: CanvaState.ROUND }),
	choosingInfo: (data) => {
		const { matchUtils } = get();
		set({
			matchUtils: { ...matchUtils, ...data },
			canvaState: CanvaState.CHOOSE,
		});
	},
	matchInfo: (data) => {
		const { matchUtils } = get();
		set({
			matchUtils: { ...matchUtils, ...data },
			canvaState: CanvaState.DRAW,
		});
	},
}));

export default useGameStore;
