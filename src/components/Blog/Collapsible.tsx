import classNames from 'classnames';
import useElementSize from 'Hooks/useElementSize';
import useRemToPixels from 'Hooks/useRemToPixels';
import {
	ReactNode,
	RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

interface CollapsibleProps {
	children: (
		ref: RefObject<HTMLElement | null>,
		className?: string,
		collapsed?: boolean
	) => ReactNode | ReactNode[];
	className?: string;
	expandButton: (expand?: () => void) => ReactNode;
	collapseButton: (collapse?: () => void) => ReactNode;
	collapsedHeightRem: number;
}

const Collapsible = ({
	children,
	className,
	expandButton,
	collapseButton,
	collapsedHeightRem,
}: CollapsibleProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState(true);
	const [isNonCollapsible, setIsNonCollapsible] = useState(false);
	const { scrollHeight } = useElementSize(contentRef);
	const remToPixels = useRemToPixels();

	const collapsedMaxHeightRem = collapsedHeightRem * (remToPixels / 16);
	const nonCollapsibleHeightRem = collapsedHeightRem * (remToPixels / 16);

	const collapse = () => {
		setCollapsed(true);

		const contentEl = contentRef.current;
		if (contentEl) {
			contentEl.style.maxHeight = `${scrollHeight}px`;
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					contentEl.style.maxHeight = `${collapsedMaxHeightRem}rem`;
				})
			);
		}
	};

	const expand = useCallback(() => {
		setCollapsed(false);

		const contentEl = contentRef.current;
		if (contentEl) {
			contentEl.style.maxHeight = `${collapsedMaxHeightRem}rem`;
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					contentEl.style.maxHeight = `${scrollHeight}px`;
				})
			);
		}
	}, [collapsedMaxHeightRem, scrollHeight]);

	useEffect(() => {
		const contentEl = contentRef.current;
		if (contentEl) {
			if (collapsed) {
				contentEl.style.maxHeight = `${collapsedMaxHeightRem}rem`;
			} else if (scrollHeight) {
				contentEl.style.maxHeight = `${scrollHeight}px`;
			}
		}
	});

	useEffect(() => {
		const element = contentRef.current;
		if (
			element &&
			scrollHeight > 0 &&
			scrollHeight < nonCollapsibleHeightRem * remToPixels &&
			collapsed
		) {
			expand();
			setIsNonCollapsible(true);
		}
	}, [scrollHeight, collapsed, remToPixels, expand, nonCollapsibleHeightRem]);

	return (
		<div className={classNames('relative overflow-hidden', className)}>
			{children(contentRef, 'transition-[max-height] duration-500', collapsed)}
			{collapsed && expandButton(expand)}
			{!collapsed && !isNonCollapsible && collapseButton(collapse)}
		</div>
	);
};

export default Collapsible;
