/**
 * EventCollector is a utility class that allows you to register multiple input events and specify a callback to be executed once all registered events have been triggered. This can be particularly useful in scenarios where you need to wait for multiple asynchronous operations to complete before proceeding with a certain action.
 * Usage:
 * 1. Instantiate the EventCollector with an array of input keys that represent the events you want to track.
 * 2. For each event, call the registerInput method with the corresponding key to get a callback function that you should invoke when that event occurs.
 * 3. Set the output callback using the setOutput method, which will be called once all registered events have been triggered.
 * Example:
 * const collector = new EventCollector(['event1', 'event2']);
 * const onEvent1 = collector.registerInput('event1');
 * const onEvent2 = collector.registerInput('event2');
 * collector.setOutput(() => {
 *   console.log('All events completed!');
 * });
 * // Simulate events
 * onEvent1();
 * onEvent2();
 * In this example, the message "All events completed!" will be logged to the console once both onEvent1 and onEvent2 have been called.
 *
 * This class does not handle the order of events or any potential errors that may occur during event processing. It simply tracks whether all specified events have been triggered and executes the output callback accordingly.
 *
 * This implementation assumes that each event will only be triggered once. If you need to handle multiple occurrences of the same event, additional logic would be required to track the count of each event and determine when all events have been completed.
 */
export class EventCollector {
	private inputCallbacks: Set<string>;
	private completedInputs: Set<string>;
	private outputCallback: Callback | null = null;
	private everythingRegistered: boolean = false;
	private config: {
		debug: boolean;
		autoComplete: boolean;
	};

	constructor({
		inputKeys,
		debug,
		autoComplete,
	}: {
		inputKeys?: string[];
		debug?: boolean;
		autoComplete?: boolean;
	} = {}) {
		this.inputCallbacks = new Set(inputKeys);
		this.completedInputs = new Set();
		this.config = {
			debug: debug ?? false,
			autoComplete: autoComplete ?? true,
		};
	}

	public registerInput(key: string): () => void {
		this.inputCallbacks.add(key);
		if (this.config.debug) {
			console.log(`Registered input: ${key}`);
		}

		return () => {
			this.completedInputs.add(key);
			if (this.config.debug) {
				console.log(`Event completed: ${key}`);
			}
			this.checkCompletion();
		};
	}

	public markEverythingRegistered(): void {
		this.everythingRegistered = true;
		this.checkCompletion();
	}

	public setOutput(callback?: Callback): void {
		this.outputCallback = callback ?? null;
	}

	private checkCompletion(): void {
		if (
			this.outputCallback &&
			(this.everythingRegistered || this.config.autoComplete) &&
			this.completedInputs.size === this.inputCallbacks.size
		) {
			this.outputCallback();
		}
	}
}
