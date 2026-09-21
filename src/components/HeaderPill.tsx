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
				'md:bg-navbar md:border-navbar-border xs:px-6 flex items-center px-2 md:border-b md:shadow-header',
				side === 'left'
					? 'xs:gap-4 min-w-0 md:rounded-br-3xl'
					: 'xs:gap-1 md:gap-2 md:rounded-bl-3xl',
				className
			)}
		>
			{children}
		</div>
	);
};

export default HeaderPill;
