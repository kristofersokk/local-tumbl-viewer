import ClipLoader from 'react-spinners/ClipLoader';
import PacmanLoader from 'react-spinners/PacmanLoader';
import ClockLoader from 'react-spinners/ClockLoader';

interface LoaderProps {
	type?: 'pacman' | 'spinner' | 'clock';
	className?: string;
	size?: number;
	text?: string;
	progress?: {
		current: number;
		total: number;
	};
}

const Loader = ({
	type = 'spinner',
	className,
	size = 10,
	text,
	progress,
}: LoaderProps) => {
	return (
		<div className="absolute translate-x-1/2">
			<div className="absolute flex w-96 max-w-[90vw] -translate-x-1/2 -translate-y-16 flex-col items-center gap-4">
				{type === 'spinner' ? (
					<ClipLoader
						className={className}
						color="var(--color-text)"
						size={size}
						aria-label="Loading Spinner"
						data-testid="loader"
					/>
				) : type === 'pacman' ? (
					<PacmanLoader
						className={className}
						color="var(--color-text)"
						size={size}
						aria-label="Loading Pacman Loader"
						data-testid="loader"
					/>
				) : (
					<ClockLoader
						className={className}
						color="var(--color-text)"
						size={size}
						aria-label="Loading Clock Loader"
						data-testid="loader"
					/>
				)}
				{text && <p>{text}</p>}
				{progress && (
					<progress
						value={progress.current / (progress.total || 100)}
						max={1}
						className="w-64 max-w-9/12 rounded-md"
					/>
				)}
			</div>
		</div>
	);
};

export default Loader;
