import { useEffect } from "react";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";

const useGameService = () => {
	const { socket } = useSocketStore();
	const { updateRound, setChoosingInfo, setStartMatch, setEndMatch } =
		useGameStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("roundInfo")) return;

		socket.on("roundInfo", (round) => updateRound(round));
		socket.on("choosing", (data) => setChoosingInfo(data));
		socket.on("startMatch", (matchInfo, time) =>
			setStartMatch(matchInfo, time),
		);
		socket.on("endMatch", (scoreBoard) => setEndMatch(scoreBoard));

		return () => {
			socket.off("roundInfo");
			socket.off("choosing");
			socket.off("startMatch");
			socket.off("endMatch");
		};
	}, [socket, updateRound, setChoosingInfo, setStartMatch, setEndMatch]);
};

export default useGameService;
