import useGameService from "@/hooks/gameService";
import { GameState } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import { Spinner } from "../ui/spinner";
import { GameCanva } from "./canvas";
import { GameInfo } from "./info";
import { PlayerInput } from "./input";
import { PlayersInfo } from "./players";

export function GameInterface() {
	useGameService();
	const { gameState } = useGameStore();

	return (
		<main className="flex-1 flex justify-center items-center">
			{gameState === GameState.FINDING ? (
				<div className="size-full flex justify-center items-center">
					<Spinner className="size-[30%] max-w-25 " />
				</div>
			) : (
				<div className="w-[clamp(500px,100%,1000px)] h-[clamp(500px,100%,900px)] flex flex-col gap-2 py-2">
					<GameInfo className="" />
					<span className="flex-1 flex gap-2">
						<PlayersInfo className="flex-1" />
						<GameCanva className="w-[55%]" />
						<PlayerInput className="flex-2" />
					</span>
				</div>
			)}
		</main>
	);
}
