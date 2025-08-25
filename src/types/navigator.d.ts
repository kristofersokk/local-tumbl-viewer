interface Navigator {
	connection?: {
		saveData: boolean;
		effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g';
	};
}
