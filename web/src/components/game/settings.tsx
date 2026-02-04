import { Copy } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Domain, type OneSetting, type Setting } from "@/lib/types";
import { socketConErr } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

type Options<T> = {
	name: string;
	values: T[keyof T][];
	key: keyof T;
};

export function GameSettings() {
	const { roomId, players, isHost, settings, setSettings } = useGameStore();
	const { socket } = useSocketStore();

	const options: Options<Setting>[] = [
		{
			name: "Total Players",
			values: [4, 6, 8, 10, 12],
			key: "totalPlayers",
		},
		{
			name: "Max Rounds",
			values: [1, 2, 3, 4, 5, 6],
			key: "maxRounds",
		},
		{
			name: "Draw Time (s)",
			values: [5, 60, 80, 100, 120, 150],
			key: "drawTime",
		},
		{
			name: "Hints",
			values: [1, 2, 3, 4, 5],
			key: "hints",
		},
		{ name: "choices", values: [2, 3, 5], key: "choiceCount" },
		{
			name: "Theme",
			values: [
				Domain.ANIMALS,
				Domain.FOOD,
				Domain.ITEMS,
				Domain.OTHERS,
				Domain.PROFESSIONS,
				"All",
			],
			key: "theme",
		},
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
		if (!socket || isHost) return;
		socket.on("updateSettings", (setting) => setSettings(setting));
		return () => {
			socket.off("updateSettings");
		};
	}, [socket, setSettings, isHost]);

	return (
		<>
			<CardContent className="flex flex-wrap">
				{options.map(({ name, values, key }) => (
					<div
						key={key}
						className="w-1/2 flex items-center justify-between p-2"
					>
						<Label>
							<h3>{name} :</h3>
						</Label>
						<Select
							value={settings[key].toString()}
							onValueChange={(value) => {
								const setting = {
									[key]:
										key === "theme" ? (value as Domain) : parseInt(value, 10),
								} as OneSetting;
								setSettings(setting);

								if (socket) socket.emit("updateSettings", setting);
							}}
						>
							<SelectTrigger className="w-1/2 font-semibold" disabled={!isHost}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="bg-background border-4 font-semibold border-border">
								{values.map((val) => (
									<SelectItem value={val.toString()} key={val}>
										{val}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				))}
			</CardContent>
			<CardFooter className="flex  justify-center gap-2">
				<Button
					disabled={!isHost}
					variant={"primary"}
					onClick={handleStart}
					className="w-[70%] max-w-[300px]"
				>
					Start
				</Button>
				<Button
					onClick={handleCopy}
					variant={"muted"}
					className="h-full w-[30%] max-w-[150px]"
				>
					<p>Invite</p>
					<Copy />
				</Button>
			</CardFooter>
		</>
	);
}
