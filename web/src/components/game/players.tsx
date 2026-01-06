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
		<Card className={cn("flex flex-col gap-2 p-1 h-fit", className)}>
			<CardContent className="">
				<ul>
					{players.map(({ name, score, id }, i) => {
						return (
							<li className="flex gap-1 items-center justify-between" key={id}>
								<span>
									{id === hostId && (
										<Crown className="text-yellow-400 icon-sm" />
									)}
									<p>#{i + 1}</p>
								</span>
								<span>
									<p
										className={`flex font-semibold ${id === socket?.id && "text-primary"} `}
									>
										<span>{name}</span>
										<span>{id === socket?.id && "(you)"}</span>
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
