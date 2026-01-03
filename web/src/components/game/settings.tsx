import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { OneSetting, Setting } from "@/lib/types";
import { socketConErr } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

type Options = {
	name: string;
	values: string[];
	key: keyof Setting;
};

export function GameSettings() {
	const { roomId, players, isHost } = useGameStore();
	const { socket } = useSocketStore();

	const [settings, setSettings] = useState<Setting>({
		totalPlayers: 8,
		maxRounds: 3,
		drawTime: 80,
		hints: 2,
		choiceCount: 3,
	});

	const options: Options[] = [
		{
			name: "Total Players",
			values: ["4", "6", "8", "10", "12"],
			key: "totalPlayers",
		},
		{
			name: "Max Rounds",
			values: ["1", "2", "3", "4", "5", "6"],
			key: "maxRounds",
		},
		{
			name: "Draw Time (s)",
			values: ["5", "60", "80", "100", "120", "150"],
			key: "drawTime",
		},
		{
			name: "Hints",
			values: ["1", "2", "3", "4", "5"],
			key: "hints",
		},
		{ name: "choices", values: ["2", "3", "5"], key: "choiceCount" },
	];

	// Start game with selected settings
	const handleStart = () => {
		if (players.length < 2) {
			toast.error("At least 2 players are required to start the game.");
			return;
		}

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

	useEffect(() => {
		if (!socket) return;
		socket.on("updateSettings", (setting) => {
			setSettings((prev) => ({
				...prev,
				...setting,
			}));
		});
		return () => {};
	}, [socket]);

	return (
		<>
			<CardContent className="flex flex-wrap">
				{options.map(({ name, values, key }) => (
					<div
						key={key}
						className="w-1/2 flex items-center justify-between p-2"
					>
						<Label>{name} :</Label>
						<Select
							value={settings[key].toString()}
							onValueChange={(value) => {
								setSettings((prev) => ({
									...prev,
									[key]: parseInt(value, 10),
								}));

								if (socket)
									socket.emit("updateSettings", {
										[key]: parseInt(value, 10),
									} as OneSetting);
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
