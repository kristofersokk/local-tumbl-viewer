import classNames from 'classnames';
import useElementSize from 'Hooks/useElementSize';
import {
	CSSProperties,
	ReactNode,
	RefObject,
	useCallback,
	useRef,
	useState,
} from 'react';

interface CollapsibleProps {
	children: (
		ref: RefObject<HTMLElement | null>,
		className?: string,
		style?: CSSProperties,
		expanded?: boolean
	) => ReactNode | ReactNode[];
	className?: string;
	expandButton: (expand?: () => void) => ReactNode;
	collapseButton: (collapse?: () => void) => ReactNode;
	collapsedHeightPx: number;
}

const Collapsible = ({
	children,
	className,
	expandButton,
	collapseButton,
	collapsedHeightPx,
}: CollapsibleProps) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(false);
	const { scrollHeight } = useElementSize(contentRef);

	const collapsedMaxHeightPx = collapsedHeightPx;

	const collapse = useCallback(() => {
		setExpanded(true);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setExpanded(false);
			});
		});
	}, []);

	const expand = useCallback(() => {
		setExpanded(false);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setExpanded(true);
			});
		});
	}, []);

	const higherThanCollapseLimit = scrollHeight > collapsedMaxHeightPx;
	const showExpandButton = !expanded && higherThanCollapseLimit;
	const showCollapseButton = expanded;

	return (
		<div className={classNames('relative overflow-hidden', className)}>
			{children(
				contentRef,
				'transition-[max-height] duration-700',
				{
					maxHeight: `${expanded ? scrollHeight : collapsedMaxHeightPx}px`,
				},
				expanded
			)}
			{showExpandButton && expandButton(expand)}
			{showCollapseButton && collapseButton(collapse)}
		</div>
	);
};

export default Collapsible;
