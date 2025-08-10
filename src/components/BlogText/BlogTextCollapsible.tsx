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

interface BlogTextCollapsibleProps {
	children: (
		ref: RefObject<HTMLElement | null>,
		className?: string
	) => ReactNode | ReactNode[];
}

const BlogTextCollapsible = ({ children }: BlogTextCollapsibleProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [collapsed, setCollapsed] = useState(true);
	const [isNonCollapsible, setIsNonCollapsible] = useState(false);
	const { scrollHeight } = useElementSize(contentRef);
	const remToPixels = useRemToPixels();

	const collapsedMaxHeightRem = 24 * (remToPixels / 16);
	const nonCollapsibleHeightRem = 24 * (remToPixels / 16);

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
	}, [scrollHeight]);

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
				<div className="from-blog-collapse-color absolute right-0 bottom-0 left-0 flex justify-around bg-gradient-to-t p-2">
					<button
						className="cursor-pointer rounded-xl bg-gray-600/75 p-2 drop-shadow-[0_2px_4px_rgba(0,0,9px,0)] transition-shadow hover:drop-shadow-gray-600"
						onClick={expand}
					>
						Show More
					</button>
				</div>
			)}
			{!collapsed && !isNonCollapsible && (
				<div className="flex justify-around">
					<button
						className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-gray-700"
						onClick={collapse}
					>
						Show Less
					</button>
				</div>
			)}
		</div>
	);
};

export default BlogTextCollapsible;
