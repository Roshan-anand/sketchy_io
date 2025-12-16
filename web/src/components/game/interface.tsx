import { useGameService } from "@/hooks/gameService";
import { PlayerInput } from "./input";
import { GameOperation } from "./operation";
import { PlayersInfo } from "./players";

export function GameInterface() {
	useGameService();
	return (
		<main className="flex-1">
			<PlayerInput className="" />
			<PlayersInfo className="" />
			<GameOperation className="" />
		</main>
	);
}
