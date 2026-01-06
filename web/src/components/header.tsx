import { ModeToggle } from "./mode-toggle";

export function RootHeader() {
	return (
		<header className="flex items-center justify-between gap-4 px-2">
			<div className="font-bold">Sketchy.io</div>
			<ModeToggle />
		</header>
	);
}
