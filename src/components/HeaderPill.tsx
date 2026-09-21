import classNames from 'classnames';
import { ReactNode } from 'react';

interface HeaderPillProps {
	side: 'left' | 'right';
	className?: string;
	children?: ReactNode;
}

const HeaderPill = ({ side, className, children }: HeaderPillProps) => {
	return (
		<div
			className={classNames(
				'bg-navbar border-navbar-border shadow-header xs:px-6 flex items-center border-b px-2',
				side === 'left'
					? 'xs:gap-4 min-w-0 rounded-br-3xl'
					: 'xs:gap-1 rounded-bl-3xl md:gap-2',
				className
			)}
		>
			{children}
		</div>
	);
};

export default HeaderPill;
