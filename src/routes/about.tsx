import { createFileRoute, useNavigate } from '@tanstack/react-router';
import HomeLogo from 'Assets/icons/home.svg?react';

export const Route = createFileRoute('/about')({
	component: About,
});

function About() {
	const navigate = useNavigate({ from: '/about' });

	const goHome = () => {
		document.startViewTransition(() => {
			navigate({ to: '/' });
		});
	};

	return (
		<div className="flex h-dvh w-dvw flex-col items-center justify-center">
			<div className="flex max-w-10/12 flex-col items-center justify-center">
				<button
					className="fill-text fixed top-0 left-0 m-4 cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-800"
					onClick={() => goHome()}
				>
					<HomeLogo />
				</button>
				<h1 className="mb-8 text-4xl font-bold">Tumbl Viewer</h1>
				<div className="flex flex-col items-start">
					<div>
						<span>A local viewer for Tumblr blogs downloaded by </span>
						<a
							className="underline"
							href="https://github.com/TumblThreeApp/TumblThree"
							target="_blank"
							rel="noopener noreferrer"
						>
							TumblThree
						</a>
					</div>
					<div>
						<span className="mr-2">Source code:</span>
						<a
							className="underline"
							href="https://github.com/kristofersokk/local-tumbl-viewer"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub repository
						</a>
						<div className="mt-4 flex items-center gap-4">
							<p>Please donate to support development</p>
							<a href="https://ko-fi.com/R6R2168JSZ" target="_blank">
								<img
									height="36"
									className="h-9 border-0"
									src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
									alt="Buy Me a Coffee at ko-fi.com"
								/>
							</a>
						</div>
					</div>
					<a
						className="mt-4 cursor-pointer text-xl underline"
						href="https://kristofersokk.dev"
						target="_blank"
						rel="noopener noreferrer"
					>
						My website
					</a>
				</div>
			</div>
		</div>
	);
}
