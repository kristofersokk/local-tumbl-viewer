import classNames from 'classnames';
import { Platform } from 'Types/blog';

const platformToConf: Record<
	Platform,
	{ letters: string; bgColor: string; color: string }
> = {
	tumblr: {
		letters: 't',
		bgColor: 'var(--color-platform-tumblr)',
		color: 'var(--color-platform-text)',
	},
	instagram: {
		letters: 'i',
		bgColor: 'var(--color-platform-instagram)',
		color: 'var(--color-platform-text)',
	},
	bluesky: {
		letters: 'b',
		bgColor: 'var(--color-platform-bluesky)',
		color: 'var(--color-platform-text)',
	},
	newtumbl: {
		letters: 'nt',
		bgColor: 'var(--color-platform-newtumbl)',
		color: 'var(--color-platform-text)',
	},
	twitter: {
		letters: 'X',
		bgColor: 'var(--color-platform-twitter)',
		color: 'var(--color-platform-text)',
	},
	unknown: {
		letters: '?',
		bgColor: 'var(--color-platform-unknown)',
		color: 'var(--color-platform-text)',
	},
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
				'border-logo-border flex min-h-11 min-w-11 items-center justify-center rounded-lg border-2 text-4xl font-semibold',
				className
			)}
			style={{ backgroundColor: bgColor, color }}
		>
			{letters}
		</div>
	);
};

export default PlatformLogo;
