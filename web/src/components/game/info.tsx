import { Settings } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { CanvaState, GameState } from "@/lib/types";
import { cn } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";

export function GameInfo({ className }: ComponentProps<"div">) {
	const {
		matchTimer,
		round,
		canvaState,
		matchUtils,
		setGameIntervalId,
		gameState,
	} = useGameStore();
	const { socket } = useSocketStore();
	const [timer, setTimer] = useState(0);

	/** to clear the timer and interval */
	const clearTimer = useCallback(() => {
		setGameIntervalId(null);
		setTimer(0);
	}, [setGameIntervalId]);

	/** to emit choiceMade event when time is up in choosing phase */
	const emitChoiceMade = useCallback(() => {
		if (!socket || !matchUtils.isDrawer || !matchUtils.choices) return;

		const word =
			matchUtils.choices[Math.floor(Math.random() * matchUtils.choices.length)];
		socket.emit("choiceMade", word);
	}, [socket, matchUtils]);

	// Manage the countdown timer based on game state
	useEffect(() => {
		if (canvaState === CanvaState.DRAW || canvaState === CanvaState.CHOOSE) {
			setTimer(matchTimer);

			const intervalId = setInterval(
				() =>
					setTimer((prev) => {
						if (prev <= 0) {
							if (canvaState === CanvaState.CHOOSE) emitChoiceMade();
							clearTimer();
							return 0;
						}
						return prev - 1;
					}),
				1000,
			);
			setGameIntervalId(intervalId);
		} else clearTimer();

		// Cleanup on unmount or when dependencies change
		return () => {
			clearTimer();
		};
	}, [canvaState, matchTimer, emitChoiceMade, clearTimer, setGameIntervalId]);

	return (
		<Card className={cn("h-fit py-1", className)}>
			<CardHeader className="gap-2 flex items-center justify-center">
				<div className="flex flex-col items-center gap-[3px]">
					<span className="bg-foreground w-2.5 h-1.5 rounded-md" />
					<p className="rounded-full border icon-md flex justify-center items-center">
						{timer}
					</p>
				</div>
				<p>Round: {round}</p>
				<h3 className="flex-1 flex justify-center">
					{gameState === GameState.WAITING
						? "Waiting"
						: matchUtils.isDrawer
							? matchUtils.word
							: matchUtils.hiddenWord?.join(" ")}
				</h3>
				<Button variant={"link"}>
					<Settings className="icon-lg" />
				</Button>
			</CardHeader>
		</Card>
	);
}
