import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Eraser, PaintBucket, Pencil, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";
import type { DrawAction, Stroke, Tool } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";
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
	{ value: "#000000" },
	{ value: "#FFFFFF" },
	{ value: "#FF0000" },
	{ value: "#00FF00" },
	{ value: "#0000FF" },
	{ value: "#FFFF00" },
	{ value: "#FF00FF" },
	{ value: "#00FFFF" },
	{ value: "#FFA500" },
	{ value: "#800080" },
	{ value: "#FFC0CB" },
	{ value: "#A52A2A" },
	{ value: "#808080" },
	{ value: "#90EE90" },
	{ value: "#ADD8E6" },
	{ value: "#FFD700" },
];

// Stroke width options
const STROKE_WIDTHS = [
	{ value: "2" },
	{ value: "5" },
	{ value: "10" },
	{ value: "15" },
	{ value: "20" },
];

// Generate unique ID for strokes
const generateId = () => Math.random().toString(36).substring(2, 9);

export function DrawingBoard() {
	const { matchUtils } = useGameStore();
	const { socket } = useSocketStore();
	const isDrawer = matchUtils.isDrawer;

	// Canvas state
	const [strokes, setStrokes] = useState<Stroke[]>([]);
	const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

	// Tool state
	const [currentTool, setCurrentTool] = useState<Tool>("pen");
	const [currentColor, setCurrentColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(5);

	// Drawing state
	const isDrawing = useRef(false);
	const stageRef = useRef<Konva.Stage>(null);

	// History for undo
	const historyRef = useRef<{ strokes: Stroke[]; bgColor: string }[]>([
		{ strokes: [], bgColor: "#FFFFFF" },
	]);
	const historyIndexRef = useRef(0);

	// Container size state
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

	// Update stage size based on container
	useEffect(() => {
		const updateSize = () => {
			if (canvasContainerRef.current) {
				const { clientWidth, clientHeight } = canvasContainerRef.current;
				setStageSize({
					width: clientWidth || 800,
					height: clientHeight || 600,
				});
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	// ===========================================
	// Socket: Send drawing data to others
	// ===========================================

	/**
	 * Emits drawing action to server for broadcasting to other players.
	 * Called after each completed stroke, fill, clear, or undo action.
	 */
	const emitDrawingData = useCallback(
		(action: DrawAction) => {
			if (!socket || !isDrawer) return;
			socket.emit("drawingData", action);
		},
		[socket, isDrawer],
	);

	// ===========================================
	// Socket: Receive drawing data from drawer
	// ===========================================

	/**
	 * Listens for drawing actions from the drawer and updates local canvas.
	 * Handles: stroke (add new stroke), fill (change bg), clear (reset canvas), undo (remove last stroke)
	 */
	useEffect(() => {
		if (!socket || isDrawer) return;

		const handleDrawingData = (action: DrawAction) => {
			switch (action.type) {
				case "stroke":
					if (action.data && "points" in action.data) {
						// Add new stroke from drawer
						setStrokes((prev) => [...prev, action.data as Stroke]);
					} else {
						// Undo action: remove last stroke
						setStrokes((prev) => prev.slice(0, -1));
					}
					break;

				case "fill":
					if (action.data && "color" in action.data) {
						setBackgroundColor(action.data.color);
					}
					break;

				case "clear":
					setStrokes([]);
					setBackgroundColor("#FFFFFF");
					break;
			}
		};

		socket.on("drawingData", handleDrawingData);

		return () => {
			socket.off("drawingData", handleDrawingData);
		};
	}, [socket, isDrawer]);

	// ===========================================
	// History Management (Undo)
	// ===========================================

	const saveToHistory = useCallback(
		(newStrokes: Stroke[], newBgColor: string) => {
			historyRef.current = historyRef.current.slice(
				0,
				historyIndexRef.current + 1,
			);
			historyRef.current.push({ strokes: newStrokes, bgColor: newBgColor });
			historyIndexRef.current += 1;
		},
		[],
	);

	const handleUndo = useCallback(() => {
		if (historyIndexRef.current === 0) return;
		historyIndexRef.current -= 1;
		const state = historyRef.current[historyIndexRef.current];
		setStrokes(state.strokes);
		setBackgroundColor(state.bgColor);
		emitDrawingData({ type: "stroke", data: null });
	}, [emitDrawingData]);

	const handleClear = useCallback(() => {
		const newStrokes: Stroke[] = [];
		const newBgColor = "#FFFFFF";
		setStrokes(newStrokes);
		setBackgroundColor(newBgColor);
		saveToHistory(newStrokes, newBgColor);
		emitDrawingData({ type: "clear", data: null });
	}, [saveToHistory, emitDrawingData]);

	// ===========================================
	// Drawing Event Handlers
	// ===========================================

	const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
		if (!isDrawer) return;

		const stage = e.target.getStage();
		const pos = stage?.getPointerPosition();
		if (!pos) return;

		if (currentTool === "fill") {
			const newBgColor = currentColor;
			setBackgroundColor(newBgColor);
			saveToHistory(strokes, newBgColor);
			emitDrawingData({ type: "fill", data: { color: currentColor } });
			return;
		}

		isDrawing.current = true;

		const newStroke: Stroke = {
			id: generateId(),
			tool: currentTool,
			points: [pos.x, pos.y],
			color: currentColor,
			strokeWidth: currentTool === "eraser" ? strokeWidth * 2 : strokeWidth,
		};

		setStrokes((prev) => [...prev, newStroke]);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
		if (!isDrawing.current || !isDrawer) return;

		const stage = e.target.getStage();
		const point = stage?.getPointerPosition();
		if (!point) return;

		setStrokes((prev) => {
			const lastStroke = prev[prev.length - 1];
			if (!lastStroke) return prev;

			const newPoints = [...lastStroke.points, point.x, point.y];
			return [...prev.slice(0, -1), { ...lastStroke, points: newPoints }];
		});
	};

	const handleMouseUp = () => {
		if (!isDrawing.current || !isDrawer) return;
		isDrawing.current = false;

		saveToHistory(strokes, backgroundColor);

		const lastStroke = strokes[strokes.length - 1];
		if (lastStroke) {
			emitDrawingData({ type: "stroke", data: lastStroke });
		}
	};

	// ===========================================
	// Toolbar Component (only shown to drawer)
	// ===========================================

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
						className="w-fit min-w-0"
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
						className="w-fit min-w-0"
					>
						{COLORS.map((color) => (
							<SelectItem
								key={color.value}
								value={color.value}
								className="w-fit"
							>
								<div
									className="w-4 h-4 rounded border"
									style={{ backgroundColor: color.value }}
								/>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-1">
				<button
					type="button"
					onClick={() => setCurrentTool("pen")}
					className={`p-2 rounded ${currentTool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
					title="Pen"
				>
					<Pencil size={20} />
				</button>
				<button
					type="button"
					onClick={() => setCurrentTool("eraser")}
					className={`p-2 rounded ${currentTool === "eraser" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
					title="Eraser"
				>
					<Eraser size={20} />
				</button>
				<button
					type="button"
					onClick={() => setCurrentTool("fill")}
					className={`p-2 rounded ${currentTool === "fill" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
					title="Fill Background"
				>
					<PaintBucket size={20} />
				</button>
			</div>

			{/* Actions */}
			<div className="flex gap-1">
				<button
					type="button"
					onClick={handleUndo}
					className="p-2 rounded hover:bg-muted disabled:opacity-50"
					title="Undo"
				>
					<Undo2 size={20} />
				</button>
				<button
					type="button"
					onClick={handleClear}
					className="p-2 rounded hover:bg-muted text-destructive"
					title="Clear Canvas"
				>
					<Trash2 size={20} />
				</button>
			</div>
		</CardFooter>
	);

	return (
		<>
			<Card className="flex flex-col p-1 m-2 rounded-xl flex-1">
				{/* Canvas Area - takes 85% when toolbar shown, 100% otherwise */}
				<div
					ref={canvasContainerRef}
					className={`size-full rounded-md overflow-hidden bg-white`}
				>
					<Stage
						ref={stageRef}
						width={stageSize.width}
						height={stageSize.height}
						onMouseDown={handleMouseDown}
						onMousemove={handleMouseMove}
						onMouseup={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onTouchStart={handleMouseDown}
						onTouchMove={handleMouseMove}
						onTouchEnd={handleMouseUp}
						style={{
							cursor: isDrawer ? "crosshair" : "default",
						}}
					>
						<Layer>
							{/* Background */}
							<Rect
								x={0}
								y={0}
								width={stageSize.width}
								height={stageSize.height}
								fill={backgroundColor}
								listening={false}
							/>

							{/* Strokes */}
							{strokes.map((stroke) => (
								<Line
									key={stroke.id}
									points={stroke.points}
									stroke={stroke.color}
									strokeWidth={stroke.strokeWidth}
									tension={0.5}
									lineCap="round"
									lineJoin="round"
									globalCompositeOperation={
										stroke.tool === "eraser" ? "destination-out" : "source-over"
									}
									listening={false}
									draggable={false}
								/>
							))}
						</Layer>
					</Stage>
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
