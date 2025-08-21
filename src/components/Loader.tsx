import PacmanLoader from 'react-spinners/PacmanLoader';

const Loader = () => {
	return (
		<PacmanLoader
			color="var(--color-text)"
			size={60}
			aria-label="Loading Spinner"
			data-testid="loader"
		/>
	);
};

export default Loader;
