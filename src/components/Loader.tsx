import ClipLoader from 'react-spinners/ClipLoader';
import PacmanLoader from 'react-spinners/PacmanLoader';

interface LoaderProps {
	type?: 'pacman' | 'spinner';
	className?: string;
	size?: number;
}

const Loader = ({ type = 'spinner', className, size = 10 }: LoaderProps) => {
	return type === 'spinner' ? (
		<ClipLoader
			className={className}
			color="var(--color-text)"
			size={size}
			aria-label="Loading Spinner"
			data-testid="loader"
		/>
	) : (
		<PacmanLoader
			className={className}
			color="var(--color-text)"
			size={size}
			aria-label="Loading Pacman Loader"
			data-testid="loader"
		/>
	);
};

export default Loader;
