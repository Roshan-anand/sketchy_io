import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import useRoomStore from "@/store/roomStore";

export function PlayersInfo({ className }: ComponentProps<"section">) {
	const { players } = useRoomStore();
	return (
		<section className={cn("flex flex-col gap-2", className)}>
			<header>Players : {players.length}</header>
			<ul>
				{players.map(({ name, score }) => (
					<li className="flex gap-1" key={name + Date.now()}>
						<p>{name}</p>
						<p>{score}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
