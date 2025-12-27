import classNames from 'classnames';
import { ReactNode } from 'react';

interface CenterProps {
	children: ReactNode | ReactNode[];
	className?: string;
}

const Center = ({ children, className }: CenterProps) => {
	return (
		<div
			className={classNames(
				'flex w-full items-center justify-center',
				className
			)}
		>
			{children}
		</div>
	);
};

export default Center;
