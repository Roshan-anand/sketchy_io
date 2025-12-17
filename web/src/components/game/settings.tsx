import { Copy } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Setting } from "@/lib/types";
import { socketConErr } from "@/lib/utils";
import useRoomStore from "@/store/roomStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

export function GameSettings() {
	const { roomId, players, isHost } = useRoomStore();
	const { socket } = useSocketStore();

	const playersCount = useRef<string>("8");
	const roundsCount = useRef<string>("3");
	const drawTime = useRef<string>("80");
	const hintsCount = useRef<string>("2");

	const options = [
		{
			input: playersCount,
			lable: "Total Players",
			values: ["4", "6", "8", "10", "12"],
		},
		{
			input: roundsCount,
			lable: "Max Rounds",
			values: ["2", "3", "4", "5", "6"],
		},
		{
			input: drawTime,
			lable: "Draw Time (s)",
			values: ["60", "80", "100", "120", "150"],
		},
		{
			input: hintsCount,
			lable: "Hints",
			values: ["1", "2", "3", "4", "5"],
		},
	];

	// Start game with selected settings
	const handleStart = () => {
		if (players.length < 2) {
			toast.error("At least 2 players are required to start the game.");
			return;
		}

		const settings: Setting = {
			totalPlayers: parseInt(playersCount.current, 10),
			maxRounds: parseInt(roundsCount.current, 10),
			drawTime: parseInt(drawTime.current, 10),
			hints: parseInt(hintsCount.current, 10),
		};

		if (!socket) socketConErr();
		else socket.emit("startGame", settings);
	};

	// Copy room link to clipboard
	const handleCopy = async () => {
		try {
			const link = `${window.location.origin}/?${roomId}`;
			await navigator.clipboard.writeText(link);
			toast.success("Room link copied to clipboard!");
		} catch (_) {
			toast.error("Failed to copy room link.");
		}
	};

	return (
		<>
			<CardContent className="flex flex-wrap">
				{options.map(({ input, lable, values }) => (
					<div
						key={lable}
						className="w-1/2 flex items-center justify-between p-2"
					>
						<Label>{lable} :</Label>
						<Select
							defaultValue={input.current}
							onValueChange={(value) => {
								if (input.current) input.current = value;
							}}
						>
							<SelectTrigger className="w-1/2" disabled={!isHost}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{values.map((val) => (
									<SelectItem value={val} key={val}>
										{val}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				))}
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button
					disabled={!isHost}
					variant={"secondary"}
					onClick={handleStart}
					className="w-[70%]"
				>
					Start
				</Button>
				<Button
					disabled={!isHost}
					onClick={handleCopy}
					className="flex-1 flex items-center gap-2 p-1"
				>
					<p>Invite</p>
					<Copy />
				</Button>
			</CardFooter>
		</>
	);
}
