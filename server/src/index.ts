import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

// Ensure the WEB_URL environment variable is set
const url = Bun.env.WEB_URL;
if (!url) {
	console.error("Error: WEB_URL environment variable is required. Exiting.");
	process.exit(1);
}

const io = new Server();

const engine = new Engine({
	path: "/socket.io/",
	cors: {
		origin: url,
	},
	pingTimeout: 60000, // 60 seconds
});

io.bind(engine);

let onlinePlayers = 0;

io.on("connection", (socket) => {
	console.log("new connection :", socket.id);

	io.emit("online-players", onlinePlayers++);

	socket.on("disconnect", () => {
		console.log("disconnected :", socket.id);
		io.emit("online-players", --onlinePlayers);
	});
});

export default {
	port: 3000,
	...engine.handler(),
};
