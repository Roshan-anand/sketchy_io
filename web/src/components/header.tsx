import { Wifi, WifiOff } from "lucide-react";
import useSocketStore from "@/store/socketStore";
import { ModeToggle } from "./mode-toggle";

export function RootHeader() {
	const { isConnected } = useSocketStore();
	return (
		<header className="flex items-center gap-4">
			<div className="font-bold">Sketchy.io</div>
			{isConnected ? (
				<Wifi className="text-green-500 ml-auto icon-md" />
			) : (
				<WifiOff className="text-red-500 ml-auto icon-md" />
			)}
			<ModeToggle />
		</header>
	);
}
