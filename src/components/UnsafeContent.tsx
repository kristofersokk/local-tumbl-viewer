import DOMPurify from 'dompurify';
import { createElement, JSX, memo, RefObject, useMemo } from 'react';

type Props<E extends keyof JSX.IntrinsicElements = 'div'> = {
	tag?: E;
	Ref?: RefObject<HTMLElement | null>;
	content: string;
} & JSX.IntrinsicElements[E];

const UnsafeContent = <E extends keyof JSX.IntrinsicElements = 'div'>({
	tag,
	Ref,
	content,
	...rest
}: Props<E>) => {
	const tagContainer = {
		tag: tag || ('div' as E),
	};

	const sanitizedContent = useMemo(
		() => DOMPurify.sanitize(content),
		[content]
	);

	return createElement(tagContainer.tag, {
		key: content,
		ref: Ref,
		...rest,
		dangerouslySetInnerHTML: { __html: sanitizedContent },
	});
};

export default memo(UnsafeContent, (prevProps, nextProps) => {
	return (
		prevProps.content === nextProps.content &&
		prevProps.tag === nextProps.tag &&
		prevProps.Ref === nextProps.Ref &&
		JSON.stringify(prevProps) === JSON.stringify(nextProps)
	);
});
