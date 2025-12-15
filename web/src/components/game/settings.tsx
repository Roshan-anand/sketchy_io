import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";

type Setting = {
	totalMembers: number;
	maxRounds: number;
	drawtime: number;
	hints: number;
};

export function GameSettings() {
	const { wsEmit } = useSocketStore();

	const handleStart = () => {
		const settings: Setting = {
			totalMembers: 8,
			maxRounds: 3,
			drawtime: 80,
			hints: 2,
		};

		wsEmit("start-game", settings);
	};

	return (
		<section>
			<Button onClick={handleStart}>Start</Button>
		</section>
	);
}
