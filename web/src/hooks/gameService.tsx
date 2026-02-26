import { useEffect } from "react";
import { playAudio } from "@/lib/audios";
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
		setHost,
		canType,
	} = useGameStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("roundInfo")) return;

		socket.on("roundInfo", (round) => {
			updateRound(round);
			playAudio("roundStart");
		});
		socket.on("choosing", (data) => setChoosingInfo(data));
		socket.on("startMatch", (matchInfo, time) =>
			setStartMatch(matchInfo, time),
		);
		socket.on("endMatch", (scoreBoard) => {
			if (canType) playAudio("roundEndFailure");
			else playAudio("roundEndSuccess");
			setEndMatch(scoreBoard);
		});
		socket.on("results", (players) => setEndGame(players));
		socket.on("restart", () => setRestart());
		socket.on("reduceTime", (newTimer) => setMatchTimer(newTimer));
		socket.on("hint", (hiddenWord) => setHiddenWord(hiddenWord));
		socket.on("hostInfo", (hostId) => setHost(hostId, false));
		socket.on("setHost", (hostId) => setHost(hostId, true));

		return () => {
			socket.off("roundInfo");
			socket.off("choosing");
			socket.off("startMatch");
			socket.off("endMatch");
			socket.off("results");
			socket.off("restart");
			socket.off("reduceTime");
			socket.off("hint");
			socket.off("hostInfo");
			socket.off("setHost");
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
		setHost,
		canType,
	]);
};

export default useGameService;
