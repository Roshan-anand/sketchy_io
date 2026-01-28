import { FaGithub } from "react-icons/fa";
import { Button } from "./ui/button";

export function RootHeader() {
	return (
		<header className="flex items-center gap-4 px-2">
			<h1 className="font-bold text-accent bg-secondary px-2 -rotate-1">
				<span className="rotate-1">Sketchy.io</span>
			</h1>
			<Button
				variant={"muted"}
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
		</header>
	);
}
