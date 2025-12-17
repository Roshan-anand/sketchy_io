import { type ComponentProps, useEffect, useRef, useState } from "react";
import type { ChatMsg } from "@/lib/types";
import { cn, socketConErr } from "@/lib/utils";
import useSocketStore from "@/store/socketStore";
import { Input } from "../ui/input";

export function PlayerInput({ className }: ComponentProps<"section">) {
	const { socket } = useSocketStore();
	const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);

	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement | null>(null);

	// to listen for incoming chat msgs from server
	useEffect(() => {
		if (!socket || socket.hasListeners("chatMsg")) return;
		socket.on("chatMsg", (data) => {
			setChatMsgs((prev) => [...prev, data]);

			// scroll to bottom
			const list = listRef.current;
			if (!list) return;
			list.scrollTop = list.scrollHeight;
		});
		return () => {
			socket.off("chatMsg");
		};
	}, [socket]);

	return (
		<section className={cn("border rounded-md p-2", className)}>
			<ul
				ref={listRef}
				className="max-h-48 overflow-y-auto mb-2 flex flex-col gap-1"
			>
				{chatMsgs.map(({ msg, name, isValid }, i) => {
					const key = `${i}-${name}`;
					return (
						<li
							key={key}
							className={`flex gap-1 items-center ${isValid && " bg-green-500/20 "}`}
						>
							<span className="font-bold">{name} :</span>
							<span>{msg}</span>
						</li>
					);
				})}
			</ul>
			<span className="flex items-center p-1 gap-2">
				<Input
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
			</span>
		</section>
	);
}
