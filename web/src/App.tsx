import { RootFooter } from "./components/footer";
import { GameInterface } from "./components/game/interface";
import { RootHeader } from "./components/header";
import { PlayerOnboard } from "./components/onboard";
import useConnectSocket from "./hooks/socketConntect";
import { GameState } from "./lib/types";
import useGameStore from "./store/gameStore";

function App() {
	useConnectSocket();
	const { gameState } = useGameStore();

	return (
		<main className="w-screen h-screen py-2 flex flex-col">
			<RootHeader />
			{gameState === GameState.ONBOARDING ? (
				<>
					<PlayerOnboard />
					<RootFooter />
				</>
			) : (
				<GameInterface />
			)}
		</main>
	);
}

export default App;
