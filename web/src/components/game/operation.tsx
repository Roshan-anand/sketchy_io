import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { GameCanva } from "./canvas";
import { GameSettings } from "./settings";

enum OperationPhase {
	SETTINGS,
	DRAWING,
	CHOOSING,
	ROUNDS,
}

export function GameOperation({ className }: ComponentProps<"div">) {
	const [operation, _] = useState<OperationPhase>(OperationPhase.SETTINGS);

	return (
		<Card className={cn("w-[70%] max-w-150 mx-auto", className)}>
			{operation === OperationPhase.SETTINGS && <GameSettings />}
			{operation === OperationPhase.DRAWING && <GameCanva />}
			{operation === OperationPhase.CHOOSING && <Choosing />}
			{operation === OperationPhase.ROUNDS && <Rounds />}
		</Card>
	);
}

function Choosing() {
	return <h1>x is Choosing</h1>;
}

// to show rounds
function Rounds() {
	return <h1>Round 1</h1>;
}
