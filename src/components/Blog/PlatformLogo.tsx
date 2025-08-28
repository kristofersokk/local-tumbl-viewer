import classNames from 'classnames';
import { Platform } from 'Types/blog';

const platformToConf: Record<
	Platform,
	{ letters: string; bgColor: string; color: string }
> = {
	tumblr: { letters: 't', bgColor: '#001935', color: 'white' },
	instagram: { letters: 'i', bgColor: '#c32aa3', color: 'white' },
	bluesky: { letters: 'b', bgColor: '#00aabb', color: 'white' },
	newtumbl: { letters: 'nt', bgColor: '#ff77a8', color: 'white' },
	twitter: { letters: 'X', bgColor: 'black', color: 'white' },
	unknown: { letters: '?', bgColor: 'gray', color: 'white' },
};

interface PlatformLogoProps {
	platform: Platform;
	className?: string;
}

const PlatformLogo = ({ platform, className }: PlatformLogoProps) => {
	const { letters, bgColor, color } = platformToConf[platform];
	return (
		<div
			className={classNames(
				'flex min-h-11 min-w-11 items-center justify-center rounded-lg border-2 border-white text-4xl font-semibold',
				className
			)}
			style={{ backgroundColor: bgColor, color }}
		>
			{letters}
		</div>
	);
};

export default PlatformLogo;
