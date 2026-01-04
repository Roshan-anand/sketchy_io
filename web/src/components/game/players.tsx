import { Crown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import { Card, CardContent, CardHeader } from "../ui/card";

export function PlayersInfo({ className }: ComponentProps<"section">) {
	const { players, hostId } = useGameStore();
	return (
		<Card className={cn("flex flex-col gap-2", className)}>
			<CardHeader>Players : {players.length}</CardHeader>
			<CardContent>
				<ul>
					{players.map(({ name, score, id }) => {
						return (
							<li className="flex gap-1" key={id}>
								{id === hostId && <Crown className="text-yellow-400 icon-dm" />}
								<p>{name}</p>
								<p>{score}</p>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}
