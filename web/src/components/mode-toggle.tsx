import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "./ui/button";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
			{theme === "dark" ? (
				<Moon className="icon-md fill-accent-foreground" />
			) : (
				<Sun className="icon-md fill-accent-foreground" />
			)}
		</Button>
	);
}
