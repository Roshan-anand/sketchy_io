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
			<CardContent className="">
				<h1 className="font-bold">Players</h1>
				<ul>
					{players.map(({ name, score, id }, i) => {
						return (
							<li className="flex gap-1 items-center " key={id}>
								<span>
									{id === hostId && (
										<Crown className="text-yellow-400 icon-sm" />
									)}
									<h3>#{i + 1}</h3>
								</span>
								<span>
									<p
										className={`flex font-semibold ${id === socket?.id && "text-primary"} `}
									>
										{name}
										{id === socket?.id && "(you)"}
									</p>
									<p>{score} score</p>
								</span>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
