export class GameTimer {
	private timerId?: NodeJS.Timeout;
	private duration: number;
	private startTime: number;

	constructor() {
		this.startTime = 0;
		this.duration = 0;
	}

	/** get the time left in seconds */
	getTimeLeft() {
		const timeSpent = Date.now() - this.startTime;
		const timeLeft = Math.ceil((this.duration - timeSpent) / 1000);
		return Math.max(timeLeft, 0);
	}

	/**
	 * Starts a timer for the specified duration in seconds.
	 * @param callback - Function to be called when the timer ends.
	 * @param duration - Duration in seconds for the timer.
	 */
	startTimer(callback: () => void, duration: number) {
		if (this.timerId) this.clearTimer();

		this.duration = duration * 1000;
		this.timerId = setTimeout(callback, this.duration);
		this.startTime = Date.now(); // to record when the timer started
	}

	/** clear the timeout to stop the callback */
	clearTimer() {
		if (!this.timerId) return;
		clearTimeout(this.timerId);
		this.startTime = 0;
	}
}
