import Autoplay from "embla-carousel-autoplay";
import { Bath, House, Info, User } from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "./ui/card";

export function RootFooter() {
	return (
		<footer className="mt-auto flex px-1 gap-2 flex-col md:flex-row">
			<Card>
				<CardHeader className="flex justify-center">
					<Info />
					<h1>About</h1>
				</CardHeader>
				<CardContent className="flex flex-col gap-3 ">
					<h3>
						skribbl.io is a free online multiplayer drawing and guessing
						pictionary game.
					</h3>
					<h3>
						A normal game consists of a few rounds, where every round a player
						has to draw their chosen word and others have to guess it to gain
						points!
					</h3>
					<h3>
						The person with the most points at the end of the game, will then be
						crowned as the winner! Have fun!
					</h3>
				</CardContent>
			</Card>
			<Card className="min-w-1/2">
				<CardContent className="size-full flex flex-col gap-2  text-center ">
					<header>How to play </header>
					<Carousel
						plugins={[
							Autoplay({
								delay: 10000,
							}),
						]}
						className="flex-1 flex flex-col"
					>
						<CarouselContent>
							<CarouselItem>
								<ChooseRule />
							</CarouselItem>
							<CarouselItem>
								<DrawRule />
							</CarouselItem>
							<CarouselItem>
								<GuessRule />
							</CarouselItem>
							<CarouselItem>
								<YouGuessRule />
							</CarouselItem>
							<CarouselItem>
								<ScoreRule />
							</CarouselItem>
						</CarouselContent>
						<div className="flex justify-between">
							<CarouselPrevious />
							<CarouselNext />
						</div>
					</Carousel>
				</CardContent>
			</Card>
		</footer>
	);
}

function ChooseRule() {
	return (
		<section className="p-1 ">
			<h1>
				<span>CHOOSE A WORD!</span>
				<span className="flex gap-2 justify-center my-2">
					{["~~~", "Bat", "~~~"].map((val, i) => {
						const key = i;
						return (
							<span className="border p-1" key={key}>
								{val}
							</span>
						);
					})}
				</span>
			</h1>
			<p>when it's your turn, choose a word you want to draw!</p>
		</section>
	);
}

function DrawRule() {
	return (
		<section className="p-1">
			<House className="mx-auto size-[100px]" />
			<p>Try to draw your choosen word! No spelling!</p>
		</section>
	);
}

function GuessRule() {
	return (
		<section className="p-1">
			<div className="flex justify-center">
				<User className="size-[70px]" />
				<p className="border h-fit p-1 rounded-2xl rounded-bl-none">House</p>
			</div>
			<p>Let other players try to guess your drawn word!</p>
		</section>
	);
}

function YouGuessRule() {
	return (
		<section className="p-1">
			<div className="flex justify-between p-3">
				<Bath className="size-[100px]" />
				<div className="border-l w-fit p-1">you :House</div>
			</div>
			<p>
				When it's not your turn, try to guess what other players are drawing!
			</p>
		</section>
	);
}

function ScoreRule() {
	return (
		<section className="p-1">
			<p>Score the most points and be crowned the winner at the end!</p>
		</section>
	);
}
