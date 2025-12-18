import { RootFooter } from "./components/footer";
import { GameInterface } from "./components/game/interface";
import { RootHeader } from "./components/header";
import { PlayerOnboard } from "./components/onboard";
import useConnectSocket from "./hooks/socketConntect";
import { GameState } from "./lib/types";
import useRoomStore from "./store/roomStore";

function App() {
	useConnectSocket();
	const { gameState } = useRoomStore();

	return (
		<main className="w-screen h-screen p-2 flex flex-col">
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
