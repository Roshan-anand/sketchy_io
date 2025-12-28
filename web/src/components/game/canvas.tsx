import type { ComponentProps } from "react";
import { CanvaState } from "@/lib/types";
import { cn, socketConErr } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { GameSettings } from "./settings";

export function GameCanva({ className }: ComponentProps<"div">) {
	const { canvaState } = useGameStore();
	return (
		<Card className={cn("min-h-75", className)}>
			{canvaState === CanvaState.SETTINGS ? (
				<GameSettings />
			) : canvaState === CanvaState.DRAW ? (
				<DrawingBoard />
			) : (
				<CanvaUtils />
			)}
		</Card>
	);
}

function DrawingBoard() {
	const { matchUtils } = useGameStore();
	return (
		<CardContent>
			<header className="flex justify-center">
				{matchUtils.isDrawer
					? matchUtils.word
					: matchUtils.hiddenWord?.split("").join("  ")}
			</header>
		</CardContent>
	);
}

function CanvaUtils() {
	const { canvaState, round, matchUtils } = useGameStore();
	const { socket } = useSocketStore();
	return (
		<CardContent className="flex justify-center items-center flex-1">
			{canvaState === CanvaState.CHOOSE && (
				<h1>
					{matchUtils.isDrawer ? (
						<>
							<div>Your are choosing</div>
							<ul className="flex gap-2 my-2">
								{matchUtils.choices?.map((word) => (
									<Button
										key={word}
										variant={"outline"}
										onClick={() => {
											if (!socket) socketConErr();
											else socket.emit("choiceMade", word);
										}}
									>
										{word}
									</Button>
								))}
							</ul>
						</>
					) : (
						`${matchUtils.drawerName} is choosing`
					)}
				</h1>
			)}
			{canvaState === CanvaState.ROUND && <h1>Round {round}</h1>}
		</CardContent>
	);
}
