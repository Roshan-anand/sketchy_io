import { GameRoomsHub, io } from "../config/socket";
import { GameRoom } from "../core/gameRoom";
import { ChatMode, GameType, type TypedScoket } from "../lib/types";
import { generateId } from "../lib/utils";
import { broadcastTotalMembers, emitErr } from "./utils";

// export const roomListeners = (ws: TypedScoket) => {
//   // to quickly join any random room
//   // ws.on(WsEvs.CREATE_ROOM, ({ name }: Create) => {
//   //   let roomId: string | null = null;

//   //   // logic to find a room that is playing
//   //   for (const id in GameRooms) {
//   //     const currentRoom = GameRooms.get(id);
//   //     if (!currentRoom) continue;
//   //     if (currentRoom.type === GameType.PUBLIC) {
//   //       if (currentRoom.members.size < 6) {
//   //         roomId = id;
//   //         currentRoom.members.set(ws.id, { name, score: 0 });
//   //         break;
//   //       }
//   //     }
//   //   }

//   //   // logic to create a new room if all public room is full
//   //   if (!roomId) roomId = createNewRoom(GameType.PRIVATE, name, ws.id);

//   //   ws.join(roomId);
//   //   ws.emit("quick-room-joined", roomId);
//   // });
// };

export const joinRoom = (ws: TypedScoket, name: string, roomId: string, character?: string) => {
	const room = GameRoomsHub.get(roomId);

	if (!room) {
		emitErr(ws, "join a random room");
		// TODO : join a random room logic
		return;
	}

	// else join the user to the room
	const roomData = room.addPlayer({ id: ws.id, name, character });

	if (!roomData) {
		emitErr(ws, "room is full");
		ws.disconnect();
		return;
	}

	ws.data = { name, roomId };

	broadcastTotalMembers(roomId);
	io.to(roomId).emit("chatMsg", {
		name: "system",
		msg: `${ws.data.name} joined the game`,
		mode: ChatMode.SYSTEM_INFO,
	});
	ws.emit("roomJoined", roomData);
	ws.join(roomId);
};

export const createRoom = (ws: TypedScoket, name: string, character?: string) => {
	const roomId = generateId(6);
	const room = new GameRoom(GameType.PRIVATE, roomId, ws.id); // create a private room instance
	room.addPlayer({ id: ws.id, name, character });

	GameRoomsHub.set(roomId, room);
	ws.data = { name, roomId };

	ws.emit("roomCreated", {
		roomId,
		players: room.getAllPlayers(),
		hostId: ws.id,
	});
	ws.join(roomId);
};
