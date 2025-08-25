import DOMPurify from 'dompurify';
import { createElement, JSX, memo, RefObject, useMemo } from 'react';
import { DomProcessor, iterateDomTree } from 'Utils/blogUtils';

type Props<E extends keyof JSX.IntrinsicElements = 'div'> = {
	tag?: E;
	Ref?: RefObject<HTMLElement | null>;
	content: string;
	domProcessors?: DomProcessor[]; // needs to be stable
} & JSX.IntrinsicElements[E];

const UnsafeContent = <E extends keyof JSX.IntrinsicElements = 'div'>({
	tag,
	Ref,
	content,
	domProcessors,
	...rest
}: Props<E>) => {
	const tagContainer = {
		tag: tag || ('div' as E),
	};

	const bodyWithSanitizedContent = useMemo(() => {
		const body = DOMPurify.sanitize(content, {
			RETURN_DOM: true,
		}) as HTMLBodyElement;

		domProcessors?.forEach(processor => {
			iterateDomTree(body, processor);
		});

		return body;
	}, [content, domProcessors]);

	return createElement(tagContainer.tag, {
		key: content,
		ref: Ref,
		...rest,
		dangerouslySetInnerHTML: { __html: bodyWithSanitizedContent.innerHTML },
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
