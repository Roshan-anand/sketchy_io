import { useRef, useState } from "react";
import { toast } from "sonner";
import { GameEntryType, GameState } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

export function PlayerOnboard() {
	const { connect } = useSocketStore();
	const { setGameState } = useGameStore();

	const [count, setCount] = useState(Math.floor(Math.random() * 17) + 1);

	const roomId = window.location.search.replace("?", "");
	const nameRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (type: GameEntryType) => {
		const name = nameRef.current?.value;
		if (!name) {
			toast.error("Please enter your name");
			return;
		}

		localStorage.setItem("sketchy_name", name);

		if (type === GameEntryType.JOIN) {
			connect({ name, roomId, type: GameEntryType.JOIN, char: count });
		} else connect({ name, type: GameEntryType.CREATE, char: count });

		setGameState(GameState.FINDING);
	};

	return (
		<section className="flex-1 flex justify-center items-center">
			<Card className="flex flex-col gap-2 p-4">
				<Input
					ref={nameRef}
					defaultValue={localStorage.getItem("sketchy_name") || ""}
					type="text"
					placeholder="Enter your name"
				/>
				<figure className="flex items-center justify-center gap-3 font-bold">
					<Button
						onClick={() => {
							setCount((prev) => {
								if (prev === 1) return 17;
								else return --prev;
							});
						}}
					>
						{"<"}
					</Button>

					<span className="size-[120px] bg-accent rounded-md p-2">
						<img src={`char/${count}.png`} className="size-full" alt="char" />
					</span>
					<Button
						onClick={() => {
							setCount((prev) => {
								if (prev === 17) return 1;
								else return ++prev;
							});
						}}
					>
						{">"}
					</Button>
				</figure>
				{roomId !== "" && (
					<Button
						type="button"
						variant={"muted"}
						onClick={() => handleSubmit(GameEntryType.JOIN)}
					>
						Join Room
					</Button>
				)}
				<Button
					type="button"
					variant={"primary"}
					onClick={() => handleSubmit(GameEntryType.CREATE)}
				>
					Create Private Room
				</Button>
			</Card>
		</section>
	);
}
