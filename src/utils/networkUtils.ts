export const isOnline = () => {
	return navigator.onLine;
};

export const isSlowConnection = () => {
	return ['slow-2g', '2g', '3g'].includes(
		navigator.connection?.effectiveType || ''
	);
};

export const isDataSavingRequested = () => {
	return navigator.connection?.saveData === true;
};

export const shouldSaveData = () => {
	return !isOnline() || isSlowConnection() || isDataSavingRequested();
};
