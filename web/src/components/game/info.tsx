import { Settings, TimerIcon } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { CanvaState } from "@/lib/types";
import { cn } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";

export function GameInfo({ className }: ComponentProps<"div">) {
	const { matchTimer, round, canvaState, matchUtils } = useGameStore();
	const [timer, setTimer] = useState(0);

	const intervalId = useRef<number | null>(null);

	// Manage the countdown timer based on game state
	useEffect(() => {
		if (canvaState === CanvaState.DRAW) {
			setTimer(matchTimer);
			if (intervalId.current) window.clearInterval(intervalId.current);
			intervalId.current = window.setInterval(
				() => setTimer((prev) => Math.max(prev - 1, 0)),
				1000,
			);
		} else if (intervalId.current) {
			window.clearInterval(intervalId.current);
			intervalId.current = null;
			setTimer(0);
		}

		return () => {
			if (!intervalId.current) return;
			window.clearInterval(intervalId.current);
			intervalId.current = null;
		};
	}, [canvaState, matchTimer]);

	return (
		<Card className={cn("", className)}>
			<CardHeader className="gap-2">
				<h3>Round: {round}</h3>
				<h3 className="flex items-center gap-2">
					<TimerIcon className="icon-md" />
					<span> {timer}s</span>
				</h3>
				<h3 className="flex-1 flex justify-center">
					{matchUtils.isDrawer
						? matchUtils.word
						: matchUtils.hiddenWord?.split("").join("  ")}
				</h3>
				<Button variant={"link"}>
					<Settings className="icon-lg" />
				</Button>
			</CardHeader>
		</Card>
	);
}
