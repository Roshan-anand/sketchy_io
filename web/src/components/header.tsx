import { FaGithub } from "react-icons/fa";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function RootHeader() {
	return (
		<header className="flex items-center gap-4 px-2">
			<div className="font-bold">Sketchy.io</div>
			<Button
				variant={"outline"}
				className="ml-auto"
				onClick={() =>
					window.open(
						"https://github.com/Roshan-anand/sketchy_io",
						"_blank",
						"noopener,noreferrer",
					)
				}
				aria-label="Open project on GitHub"
			>
				<FaGithub />
			</Button>
			<ModeToggle />
		</header>
	);
}
