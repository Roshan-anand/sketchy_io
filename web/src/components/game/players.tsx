import { Crown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Card, CardContent } from "../ui/card";

export function PlayersInfo({ className }: ComponentProps<"section">) {
	const { players, hostId } = useGameStore();
	const { socket } = useSocketStore();
	return (
		<Card className={cn("flex flex-col gap-2 p-1 ", className)}>
			<CardContent className="p-0">
				<h1 className="font-bold border-b-2 my-2">Players</h1>
				<ul className="flex flex-col gap-2">
					{players.map(({ name, score, id, char }, i) => {
						return (
							<li className="flex gap-1 items-center justify-between" key={id}>
								<span>
									{id === hostId && (
										<Crown className="text-yellow-400 icon-sm" />
									)}
									<h3>#{i + 1}</h3>
								</span>
								<span className="flex flex-col items-center">
									<h3
										className={`flex font-semibold ${id === socket?.id && "text-primary"} `}
									>
										{name}
										{id === socket?.id && "(you)"}
									</h3>
									<p>{score} score</p>
								</span>
								<span className="bg-accent rounded-md p-1">
									<img
										src={`char/${char}.png`}
										className="icon-lg"
										alt="char"
									/>
								</span>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
