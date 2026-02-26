import { type ComponentProps, useEffect, useRef } from "react";
import { playAudio } from "@/lib/audios";
import { ChatMode } from "@/lib/types";
import { cn, socketConErr } from "@/lib/utils";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";

export function PlayerInput({ className }: ComponentProps<"section">) {
	const { socket } = useSocketStore();
	const { matchUtils, canType, setGuessed, chatMsgs, addChatMsg } =
		useGameStore();

	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement | null>(null);

	// to listen for incoming chat msgs from server
	useEffect(() => {
		if (!socket || socket.hasListeners("chatMsg")) return;
		socket.on("chatMsg", (msg) => {
			addChatMsg(msg);
			if (msg.mode === ChatMode.SYSTEM_SUCCESS) playAudio("playerGuessed");
		});

		socket.on("guessed", (word) => {
			setGuessed(word);
			playAudio("playerGuessed");
		});
		return () => {
			socket.off("chatMsg");
			socket.off("guessed");
		};
	}, [socket, setGuessed, addChatMsg]);

	// scroll to bottom logic for chat message
	useEffect(() => {
		if (!chatMsgs) return;
		const list = listRef.current;
		if (!list) return;
		list.scrollTop = list.scrollHeight;
		list.scroll;
	}, [chatMsgs]);

	return (
		<Card
			className={cn(
				"border flex flex-col justify-between p-0 gap-0",
				className,
			)}
		>
			<CardContent className="flex-1">
				<ul
					ref={listRef}
					className="h-full overflow-y-auto mb-2 flex flex-col gap-1"
				>
					{chatMsgs.map(({ msg, name, mode }, i) => {
						const key = `${i}-${name}`;
						return (
							<li
								key={key}
								className={`flex gap-1 items-center px-1 rounded-sm ${mode === ChatMode.SYSTEM_SUCCESS && " bg-green-500/20 text-green-500"} ${mode === ChatMode.SYSTEM_INFO && "bg-amber-400/20 text-amber-400 "} `}
							>
								{mode === ChatMode.NORMAL && (
									<span className="font-bold">{name} :</span>
								)}
								<span>{msg}</span>
							</li>
						);
					})}
				</ul>
			</CardContent>
			<CardFooter className="py-4">
				<Input
					disabled={matchUtils.isDrawer || !canType}
					onKeyDown={(e) => {
						if (e.key !== "Enter") return;

						const input = inputRef.current;
						if (!input || !input.value.trim()) return;

						if (!socket) {
							socketConErr();
							return;
						}
						socket.emit("chatMsg", input.value);
						input.value = "";
					}}
					ref={inputRef}
					type="text"
					placeholder="type your guess here ..."
				/>
			</CardFooter>
		</Card>
	);
}
