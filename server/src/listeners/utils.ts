import { GameRoomsHub, io } from "../config/socket";
import type { TypedScoket } from "../lib/types";

/**
 * to send custom error message back to the socket client
 *
 * @param msg - error message that needs to send
 * @param ws  - socket of the client
 */
export const emitErr = (ws: TypedScoket, msg: string) => {
	ws.emit("wsError", msg);
};

export const broadcastTotalMembers = (roomId: string) => {
	const room = GameRoomsHub.get(roomId);
	if (!room) return;

	io.in(roomId).emit("roomMembers", room.getAllPlayers());
};
