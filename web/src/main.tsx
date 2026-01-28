import { StrictMode } from "react";
import { type Container, createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root") as Container).render(
	<StrictMode>
		<App />
		<Toaster />
	</StrictMode>,
);
