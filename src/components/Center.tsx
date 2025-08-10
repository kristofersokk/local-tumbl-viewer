import { ReactNode } from 'react';

interface CenterProps {
	children: ReactNode | ReactNode[];
}

const Center = ({ children }: CenterProps) => {
	return (
		<div className="flex h-full items-center justify-center">{children}</div>
	);
};

export default Center;
