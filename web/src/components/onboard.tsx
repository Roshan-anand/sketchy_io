import { useRef, useState } from "react";
import { toast } from "sonner";
import { GameEntryType, GameState, type CharacterType } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import kirb from "@/assets/kirb.jpeg";
import download12 from "@/assets/download (12).jpeg";
import download13 from "@/assets/download (13).jpeg";

export function PlayerOnboard() {
	const { connect } = useSocketStore();
	const { setGameState } = useGameStore();

	const roomId = window.location.search.replace("?", "");
	const nameRef = useRef<HTMLInputElement>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>(
		(localStorage.getItem("sketchy_character") as CharacterType) || "kirb"
	);
	const [showRules, setShowRules] = useState(false);

	const characters = [
		{ id: "kirb" as CharacterType, src: kirb, name: "Kirby" },
		{ id: "character1" as CharacterType, src: download12, name: "Artist" },
		{ id: "character2" as CharacterType, src: download13, name: "Creator" },
	];

	const handleSubmit = (type: GameEntryType) => {
		const name = nameRef.current?.value;
		if (!name) {
			toast.error("Please enter your name");
			return;
		}

		localStorage.setItem("sketchy_name", name);
		localStorage.setItem("sketchy_character", selectedCharacter);

		if (type === GameEntryType.JOIN) {
			connect({ name, character: selectedCharacter, roomId, type: GameEntryType.JOIN });
		} else connect({ name, character: selectedCharacter, type: GameEntryType.CREATE });

		setGameState(GameState.FINDING);
	};

	return (
		<section className="flex-1 flex justify-center items-center min-h-screen relative" style={{ backgroundColor: '#57595B' }}>
			<Card className="w-full max-w-md bg-black border-white text-white shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-white">Welcome to Sketchy</CardTitle>
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowRules(!showRules)}
						className="mt-2 bg-black border-white text-white hover:bg-gray-900"
					>
						{showRules ? "Hide Rules" : "Show Rules"}
					</Button>
				</CardHeader>

				<CardContent>
					<form className="flex flex-col gap-4 p-2">
						<div className="space-y-2">
							<label className="text-sm font-medium text-white">Enter your name:</label>
							<Input
								ref={nameRef}
								defaultValue={localStorage.getItem("sketchy_name") || ""}
								type="text"
								placeholder="Your gaming name"
								className="bg-gray-900 border-white text-white placeholder-gray-400 focus:border-white"
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-white text-center block">Choose your character:</label>
							<div className="flex justify-center gap-4">
								{characters.map((character) => (
									<button
										key={character.id}
										type="button"
										onClick={() => setSelectedCharacter(character.id)}
										className={`p-2 rounded-lg border-2 ${
											selectedCharacter === character.id
												? "border-white bg-gray-700"
												: "border-gray-600 bg-gray-800"
										}`}
									>
										<img
											src={character.src}
											alt={character.name}
											className="w-16 h-16 rounded-md object-cover"
										/>
										<p className="text-xs text-center mt-1 text-white">{character.name}</p>
									</button>
								))}
							</div>
						</div>

						<div className="flex flex-col gap-2 mt-4">
							{roomId !== "" && (
								<Button
									type="button"
									onClick={() => handleSubmit(GameEntryType.JOIN)}
									className="bg-white hover:bg-gray-200 text-black"
								>
									Join Room
								</Button>
							)}
							<Button
								type="button"
								variant="secondary"
								onClick={() => handleSubmit(GameEntryType.CREATE)}
								className="bg-gray-600 hover:bg-gray-500 text-white border-white"
							>
								Create Private Room
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Rules Modal */}
			{showRules && (
				<div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-bold text-black">Game Rules</h3>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowRules(false)}
									className="bg-white border-black text-black hover:bg-gray-100"
								>
									✕
								</Button>
							</div>
							<div className="space-y-3 text-sm text-gray-700">
								<div>
									<p className="font-semibold text-black">🎨 How to Play:</p>
									<ul className="list-disc list-inside space-y-1 ml-4 mt-1">
										<li>One player draws a word or phrase</li>
										<li>Other players guess what it is</li>
										<li>Correct guesses earn points</li>
										<li>Fastest guessers get more points</li>
									</ul>
								</div>

								<div>
									<p className="font-semibold text-black mt-3">⏰ Time Limits:</p>
									<ul className="list-disc list-inside space-y-1 ml-4 mt-1">
										<li>Each round lasts 60 seconds</li>
										<li>You have 3 hints per round</li>
										<li>Choose words wisely!</li>
									</ul>
								</div>

								<div>
									<p className="font-semibold text-black mt-3">🏆 Scoring:</p>
									<ul className="list-disc list-inside space-y-1 ml-4 mt-1">
										<li>Drawer gets points for each correct guess</li>
										<li>Guessers get points based on speed</li>
										<li>Most points at the end wins!</li>
									</ul>
								</div>

								<div>
									<p className="font-semibold text-black mt-3">📝 Tips:</p>
									<ul className="list-disc list-inside space-y-1 ml-4 mt-1">
										<li>Use clear, simple drawings</li>
										<li>Don't write letters or numbers</li>
										<li>Be creative with your guesses</li>
										<li>Have fun and be respectful!</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
