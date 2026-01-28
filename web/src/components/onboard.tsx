import { useRef } from "react";
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
			connect({ name, roomId, type: GameEntryType.JOIN });
		} else connect({ name, type: GameEntryType.CREATE });

		setGameState(GameState.FINDING);
	};

	return (
		<section className="flex-1 flex justify-center items-center">
			<Card className="flex flex-col gap-2 p-2">
				<Input
					ref={nameRef}
					defaultValue={localStorage.getItem("sketchy_name") || ""}
					type="text"
					placeholder="Enter your name"
				/>
				<figure>Character</figure>
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
