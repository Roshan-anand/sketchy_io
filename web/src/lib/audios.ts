const join = new Audio("/audio/join.ogg");
const leave = new Audio("/audio/leave.ogg");
const playerGuessed = new Audio("/audio/playerGuessed.ogg");
const roundEndFailure = new Audio("/audio/roundEndFailure.ogg");
const roundEndSuccess = new Audio("/audio/roundEndSuccess.ogg");
const roundStart = new Audio("/audio/roundStart.ogg");
const tick = new Audio("/audio/tick.ogg");

join.load();
leave.load();
playerGuessed.load();
roundEndFailure.load();
roundEndSuccess.load();
roundStart.load();
tick.load();

type AudioType =
	| "join"
	| "leave"
	| "playerGuessed"
	| "roundEndFailure"
	| "roundEndSuccess"
	| "roundStart"
	| "tick";

export function playAudio(type: AudioType) {
	switch (type) {
		case "join":
			join.play();
			break;
		case "leave":
			leave.play();
			break;
		case "playerGuessed":
			playerGuessed.play();
			break;
		case "roundEndFailure":
			roundEndFailure.play();
			break;
		case "roundEndSuccess":
			roundEndSuccess.play();
			break;
		case "roundStart":
			roundStart.play();
			break;
		case "tick":
			tick.play();
			break;
	}
}
