import { useGameService } from "@/hooks/gameService";
import { GameState } from "@/lib/types";
import useRoomStore from "@/store/roomStore";
import { Spinner } from "../ui/spinner";
import { PlayerInput } from "./input";
import { GameOperation } from "./operation";
import { PlayersInfo } from "./players";

export function GameInterface() {
	useGameService();

	const { gameState } = useRoomStore();

	return (
		<main className="flex-1">
			{gameState === GameState.FINDING ? (
				<div className="size-full flex justify-center items-center">
					<Spinner className="size-[30%] max-w-25 " />
				</div>
			) : (
				<>
					<PlayerInput className="" />
					<PlayersInfo className="" />
					<GameOperation className="" />
				</>
			)}
		</main>
	);
}
