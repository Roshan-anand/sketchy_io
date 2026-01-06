import { Server as Engine } from "@socket.io/bun-engine";
import { io } from "./config/socket";

// Ensure the WEB_URL environment variable is set
const url = Bun.env.WEB_URL;
if (!url) {
	console.error("Error: WEB_URL environment variable is required. Exiting.");
	process.exit(1);
}
console.log("WEB_URL:", url);

// Initialize Socket.IO server with Bun Engine
const engine = new Engine({
	path: "/socket.io/",
	cors: {
		origin: url,
	},
	pingTimeout: 60000, // 60 seconds
});
io.bind(engine);

export default {
	port: 3000,
	...engine.handler(),
};
