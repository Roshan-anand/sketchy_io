import type { ComponentProps } from "react";
import { CanvaState } from "@/lib/types";
import { cn, socketConErr } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { DrawingBoard } from "./drawingBoard";
import { GameSettings } from "./settings";

export function GameCanva({ className }: ComponentProps<"div">) {
	const { canvaState } = useGameStore();
	return (
		<div className={cn("h-full flex flex-col", className)}>
			{canvaState === CanvaState.DRAW ? (
				<DrawingBoard />
			) : (
				<>
					<Card className={cn("min-h-75 p-0 m-2 rounded-md", className)}>
						{canvaState === CanvaState.SETTINGS ? (
							<GameSettings />
						) : canvaState === CanvaState.SCORE_BOARD ? (
							<ScoreBoard />
						) : canvaState === CanvaState.WINNER ? (
							<GameResult />
						) : (
							<CanvaUtils />
						)}
					</Card>
					<Card className="shadow border-4 border-border" />
				</>
			)}
		</div>
	);
}

function ScoreBoard() {
	const { scoreBoard } = useGameStore();
	return (
		<CardContent className="size-full flex flex-col justify-center items-center ">
			<h1>Score Board</h1>
			<h3>The word was: {scoreBoard.word}</h3>
			<ul>
				{scoreBoard.scores.map(({ name, score }, i) => {
					const key = `${name}+${i}`;
					return (
						<li className="flex gap-2" key={key}>
							<p>{name} : </p>
							<p className={score > 0 ? "text-green-500" : ""}>
								{score > 0 && "+ "}
								{score}
							</p>
						</li>
					);
				})}
			</ul>
		</CardContent>
	);
}

function GameResult() {
	const { players } = useGameStore();
	return (
		<CardContent className="flex flex-col justify-center items-center flex-1">
			<h1>Game Over!</h1>
			<ul>
				{players.map(({ id, name, score }) => {
					return (
						<li key={id}>
							{name} : {score}
						</li>
					);
				})}
			</ul>
		</CardContent>
	);
}

function CanvaUtils() {
	const { canvaState, round, matchUtils, setGameIntervalId } = useGameStore();
	const { socket } = useSocketStore();
	return (
		<CardContent className="flex flex-col justify-center items-center flex-1">
			{canvaState === CanvaState.CHOOSE && (
				<h1 className="flex flex-col items-center font-bold">
					{matchUtils.isDrawer ? (
						<>
							<div>Your are choosing</div>
							<ul className="flex flex-wrap justify-center gap-2 my-2">
								{matchUtils.choices?.map((word) => (
									<Button
										key={word}
										variant={"muted"}
										onClick={() => {
											if (!socket) socketConErr();
											else {
												socket.emit("choiceMade", word);
												setGameIntervalId(null);
											}
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
