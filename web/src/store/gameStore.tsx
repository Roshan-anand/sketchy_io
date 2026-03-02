import { create } from "zustand";
import {
	CanvaState,
	type ChatMsg,
	type choiceData,
	GameState,
	MatchStatus,
	type OneSetting,
	type Player,
	type RoomJoinedData,
	type ScoreBoard,
	type Setting,
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
	hostId: string | null;
	isHost: boolean;
	players: Player[];
	settings: Setting;
	setPlayers: (players: Player[]) => void;
	setSettings: (oneSetting: OneSetting) => void;
	setEnterGame: (roomId: string, players: Player[], hostId: string) => void;
	setJoinGame: (data: RoomJoinedData) => void;
	setHost: (hostId: string, isHost: boolean) => void;
	gameIntervalId: number | null;
	setGameIntervalId: (id: number | null) => void;
	// to handle the match
	chatMsgs: ChatMsg[];
	canvaState: CanvaState;
	canType: boolean; // to control if the player can type in chat
	round: number;
	matchUtils: MatchUtils;
	matchTimer: number;
	scoreBoard: ScoreBoard;
	addChatMsg: (msgs: ChatMsg) => void;
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
	gameState: GameState.PLAYING,
	setGameState: (state) => set({ gameState: state }),
	roomId: null,
	hostId: null,
	isHost: false,
	players: [],
	settings: {
		totalPlayers: 8,
		maxRounds: 3,
		drawTime: 80,
		hints: 2,
		choiceCount: 3,
		theme: "All",
	},
	setPlayers: (players) => set({ players: players }),
	setSettings: (oneSetting) =>
		set({ settings: { ...get().settings, ...oneSetting } }),
	setEnterGame: (roomId, players, hostId) =>
		set({
			gameState: GameState.WAITING,
			roomId,
			players,
			isHost: true,
			hostId,
		}),
	setJoinGame: (data) => {
		const { setChoosingInfo, setStartMatch } = get();
		const { roomId, hostId, players, matchStatus, settings } = data;

		set({
			roomId,
			players,
			isHost: false,
			hostId,
			gameState:
				matchStatus === MatchStatus.NONE
					? GameState.WAITING
					: GameState.PLAYING,
			settings,
		});

		if (matchStatus === MatchStatus.CHOOSING)
			setChoosingInfo(data.choosingData);
		else if (matchStatus === MatchStatus.DRAWING)
			setStartMatch(data.startMatchData, data.timer); // TODO : also bring the drawing data to sync the canvas
	},
	setHost: (hostId, isHost) => set({ hostId, isHost }),
	gameIntervalId: null,
	setGameIntervalId: (id: number | null) => {
		const { gameIntervalId } = get();
		if (gameIntervalId) clearInterval(gameIntervalId);
		set({ gameIntervalId: id });
	},
	// to handle the match
	canvaState: CanvaState.DRAW,
	canType: true,
	round: 0,
	matchUtils: { isDrawer: true },
	matchTimer: 0,
	scoreBoard: { scores: [], word: "" },
	chatMsgs: [],
	addChatMsg: (msgs) => {
		const { chatMsgs } = get();

		const oldMsgs = chatMsgs.length >= 25 ? chatMsgs.slice(5) : chatMsgs;
		set({ chatMsgs: [...oldMsgs, msgs] });
	},
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
			chatMsgs: [],
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
