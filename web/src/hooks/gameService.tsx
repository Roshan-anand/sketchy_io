import { useEffect } from "react";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";

const useGameService = () => {
	const { socket } = useSocketStore();
	const {
		updateRound,
		setChoosingInfo,
		setStartMatch,
		setEndMatch,
		setEndGame,
		setRestart,
		setMatchTimer,
		setHiddenWord,
	} = useGameStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("roundInfo")) return;

		socket.on("roundInfo", (round) => updateRound(round));
		socket.on("choosing", (data) => setChoosingInfo(data));
		socket.on("startMatch", (matchInfo, time) =>
			setStartMatch(matchInfo, time),
		);
		socket.on("endMatch", (scoreBoard) => setEndMatch(scoreBoard));
		socket.on("results", (players) => setEndGame(players));
		socket.on("restart", () => setRestart());
		socket.on("reduceTime", (newTimer) => setMatchTimer(newTimer));
		socket.on("hint", (hiddenWord) => setHiddenWord(hiddenWord));

		return () => {
			socket.off("roundInfo");
			socket.off("choosing");
			socket.off("startMatch");
			socket.off("endMatch");
			socket.off("results");
			socket.off("restart");
			socket.off("reduceTime");
		};
	}, [
		socket,
		updateRound,
		setChoosingInfo,
		setStartMatch,
		setEndMatch,
		setEndGame,
		setRestart,
		setMatchTimer,
		setHiddenWord,
	]);
};

export default useGameService;
