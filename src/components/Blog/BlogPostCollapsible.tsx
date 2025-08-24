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

interface BlogPostCollapsibleProps {
	children: (
		ref: RefObject<HTMLElement | null>,
		className?: string
	) => ReactNode | ReactNode[];
	collapsedHeightRem: number;
}

const BlogPostCollapsible = ({
	children,
	collapsedHeightRem,
}: BlogPostCollapsibleProps) => {
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
		<div className="relative overflow-y-hidden">
			{children(contentRef, 'transition-[max-height] duration-500')}
			{collapsed && (
				<button
					className="bg-blog-collapse-color/50 [&:hover]:bg-blog-collapse-color-hover/50 absolute right-0 bottom-0 left-0 cursor-pointer p-2 transition-colors"
					onClick={expand}
				>
					Expand
				</button>
			)}
			{!collapsed && !isNonCollapsible && (
				<button
					className="mt-2 w-full cursor-pointer bg-gray-700/40 p-2 transition-colors [&:hover]:bg-gray-700/70"
					onClick={collapse}
				>
					Collapse
				</button>
			)}
		</div>
	);
};

export default BlogPostCollapsible;
