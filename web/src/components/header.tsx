import { ModeToggle } from "./mode-toggle";

export function RootHeader() {
	return (
		<header className="flex justify-between ">
			<div className="font-bold">Sketchy.io</div>
			<ModeToggle />
		</header>
	);
}
