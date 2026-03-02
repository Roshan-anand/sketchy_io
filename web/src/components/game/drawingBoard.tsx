import { Eraser, PaintBucket, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Tool } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
import { Button } from "../ui/button";
import { Card, CardFooter } from "../ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

// Predefined colors for the color palette
const COLORS = [
	"#000000", // Black
	"#FFFFFF", // White
	"#EF4444", // Red
	"#F97316", // Orange
	"#EAB308", // Yellow
	"#22C55E", // Green
	"#3B82F6", // Blue
	"#8B5CF6", // Purple
	"#EC4899", // Pink
	"#78716C", // Brown
];

// Stroke width options
const STROKE_WIDTHS = [
	{ value: "2" },
	{ value: "5" },
	{ value: "10" },
	{ value: "15" },
	{ value: "20" },
];

export function DrawingBoard() {
	const { matchUtils } = useGameStore();
	const { socket } = useSocketStore();
	const isDrawer = matchUtils.isDrawer;

	const [isDrawing, setIsDrawing] = useState(false);
	const [currentColor, setCurrentColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [tool, setTool] = useState<Tool>("pencil");

	const lastPosRef = useRef<{ x: number; y: number } | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const getContext = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return null;
		return canvas.getContext("2d");
	}, []);

	const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};
	};

	const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
		// if tool is fill
		if (tool === "fill") {
			const canvas = canvasRef.current;
			if (!canvas || !socket) return;

			const ctx = getContext();
			if (!ctx) return;
			ctx.fillStyle = currentColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			socket.emit("fillCanvas", currentColor);
			return;
		}

		const pos = getCanvasCoordinates(e);
		lastPosRef.current = pos;
		setIsDrawing(true);
	};

	const stopDrawing = () => {
		setIsDrawing(false);
		lastPosRef.current = null;
	};

	const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!isDrawing || !lastPosRef.current || !canvas || !socket) return;

		const ctx = getContext();
		if (!ctx) return;

		const pos = getCanvasCoordinates(e);
		const from = lastPosRef.current;

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(pos.x, pos.y);
		ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : currentColor;
		ctx.lineWidth = strokeWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.stroke();

		lastPosRef.current = pos;

		const normalize = (p: { x: number; y: number }) => ({
			x: p.x / canvas.width,
			y: p.y / canvas.height,
		});

		socket.emit("canvasData", {
			from: normalize(from),
			to: normalize(pos),
			color: tool === "eraser" ? "#FFFFFF" : currentColor,
			width: strokeWidth / canvas.width,
		});
	};

	const clearCanvas = () => {
		const canvas = canvasRef.current;
		const ctx = getContext();
		if (!canvas || !ctx) return;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		socket?.emit("fillCanvas", "#FFFFFF");
	};

	// for listening incomming canvas events
	useEffect(() => {
		if (!socket || socket.hasListeners("canvasData")) return;
		socket.on("canvasData", (data) => {
			const ctx = getContext();
			if (!ctx) return;

			const canvas = canvasRef.current;
			if (!canvas) return;

			const { from, to, color, width } = data;

			// Denormalize coordinates
			const fromX = from.x * canvas.width;
			const fromY = from.y * canvas.height;
			const toX = to.x * canvas.width;
			const toY = to.y * canvas.height;

			ctx.save();

			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.strokeStyle = color;
			ctx.lineWidth = width * canvas.width;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.stroke();

			ctx.restore();
		});

		socket.on("fillCanvas", (color) => {
			const canvas = canvasRef.current;
			const ctx = getContext();
			if (!canvas || !ctx) return;

			ctx.fillStyle = color;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		});

		return () => {
			socket.off("canvasData");
			socket.off("fillCanvas");
		};
	}, [socket, getContext]);

	// base canvas setup
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = 600;
		canvas.height = 400;

		// Fill with white background
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}, []);

	// Toolbar Component (only shown to drawer)
	const Toolbar = () => (
		<CardFooter className="flex items-center justify-between bg-background border-4 border-border p-2 ">
			{/* Stroke Width Select */}
			<div className="flex gap-1">
				<Select
					value={strokeWidth.toString()}
					onValueChange={(val) => setStrokeWidth(Number(val))}
				>
					<SelectTrigger>
						<SelectValue placeholder="Size" />
					</SelectTrigger>
					<SelectContent
						align="start"
						position="popper"
						className="w-fit min-w-0 bg-accent"
					>
						{STROKE_WIDTHS.map((sw) => (
							<SelectItem key={sw.value} value={sw.value}>
								<div
									className="rounded-full bg-foreground"
									style={{
										width: Math.min(Number(sw.value), 14),
										height: Math.min(Number(sw.value), 14),
									}}
								/>
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Color Select */}
				<Select value={currentColor} onValueChange={setCurrentColor}>
					<SelectTrigger>
						<SelectValue>
							{/*<div
							className="w-4 h-4 rounded border"
							style={{ backgroundColor: currentColor }}
						/>*/}
						</SelectValue>
					</SelectTrigger>
					<SelectContent
						align="start"
						position="popper"
						className="w-fit min-w-0 bg-accent"
					>
						{COLORS.map((color) => (
							<SelectItem key={color} value={color} className="w-fit">
								<div
									className="w-4 h-4 rounded border"
									style={{ backgroundColor: color }}
								/>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Tools */}
			<div className="flex gap-1">
				<Button
					type="button"
					onClick={() => setTool("pencil")}
					className={`p-2 rounded ${tool === "pencil" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary"}`}
					title="Pen"
					variant={"primary"}
				>
					<Pencil size={20} />
				</Button>
				<Button
					type="button"
					onClick={() => setTool("eraser")}
					className={`p-2 rounded ${tool === "eraser" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary"}`}
					title="Eraser"
					variant={"primary"}
				>
					<Eraser size={20} />
				</Button>
				<Button
					type="button"
					onClick={() => setTool("fill")}
					className={`p-2 rounded ${tool === "fill" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary"}`}
					title="Fill Background"
					variant={"primary"}
				>
					<PaintBucket size={20} />
				</Button>
			</div>

			{/* Actions */}
			<div className="flex gap-1">
				{/*<button
	        type="button"
	        onClick={handleUndo}
	        className="p-2 rounded hover:bg-muted disabled:opacity-50"
	        title="Undo"
	      >
	        <Undo2 size={20} />
	      </button>*/}
				<Button
					type="button"
					onClick={clearCanvas}
					// className="p-2 rounded hover:bg-muted text-destructive"
					title="Clear Canvas"
					variant={"destructive"}
				>
					<Trash2 size={20} />
				</Button>
			</div>
		</CardFooter>
	);

	return (
		<>
			<Card className="flex flex-col p-1 m-2 rounded-xl flex-1">
				<div className="flex-1 flex items-center justify-center bg-muted">
					<canvas
						ref={canvasRef}
						className={`bg-white rounded border border-border ${isDrawer ? "cursor-crosshair" : "cursor-not-allowed"} w-full h-full`}
						onMouseDown={isDrawer ? startDrawing : undefined}
						onMouseMove={isDrawer ? draw : undefined}
						onMouseUp={isDrawer ? stopDrawing : undefined}
						onMouseLeave={isDrawer ? stopDrawing : undefined}
					/>
				</div>
				{/* Toolbar - 15% height, only visible for drawer */}
			</Card>
			{isDrawer ? (
				<Toolbar />
			) : (
				<Card className="shadow border-border border-4" />
			)}
		</>
	);
}
