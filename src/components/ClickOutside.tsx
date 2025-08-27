import { useClickOutside } from 'Hooks/useClickOutside';
import { ReactNode, useRef } from 'react';

export interface ClickOutsideProps {
	children: (ref: React.RefObject<HTMLElement | null>) => ReactNode;
	onClickOutside: () => void;
}

// use ClickOutside hook, pass ref as render prop to children
export default function ClickOutside({
	children,
	onClickOutside,
}: ClickOutsideProps) {
	const ref = useRef<HTMLElement>(null);
	useClickOutside(ref, onClickOutside);
	return <>{children(ref)}</>;
}
