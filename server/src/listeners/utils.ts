import { GameRooms, io } from "../config/socket";
import type { TypedScoket } from "../lib/types";
import { MemberMapToArray } from "../lib/utils";

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
	const room = GameRooms.get(roomId);
	if (!room) return;

	const players = MemberMapToArray(room.members);

	io.in(roomId).emit("roomMembers", players);
};
