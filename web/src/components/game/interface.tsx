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
		<main className="min-h-0 flex-1 flex justify-center items-center max-h-[95vh]">
			{gameState === GameState.FINDING ? (
				<div className="size-full flex justify-center items-center">
					<Spinner className="size-[30%] max-w-25 " />
				</div>
			) : (
				<div className="size-full flex flex-col p-2">
					<GameInfo className="" />
					<span className="flex-1 grid gap-4 grid-cols-4 grid-rows-2 md:grid-cols-4 md:grid-rows-1">
						<PlayersInfo className="flex-1 shadow border-4 col-span-2 row-start-2 md:col-span-1 md:row-start-auto" />
						<GameCanva className="flex-4 col-span-4 row-start-1 md:col-span-2 md:row-start-auto" />
						<PlayerInput className="flex-1 shadow border-4 col-span-2 row-start-2 md:col-span-1 md:row-start-auto" />
					</span>
				</div>
			)}
		</main>
	);
}
