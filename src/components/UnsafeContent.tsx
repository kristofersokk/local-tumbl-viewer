import { createElement, JSX, RefObject } from 'react';

type Props<E extends keyof JSX.IntrinsicElements = 'div'> = {
	tag?: E;
	Ref: RefObject<HTMLElement | null>;
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
	return createElement(tagContainer.tag, {
		ref: Ref,
		...rest,
		dangerouslySetInnerHTML: { __html: content },
	});
};

export default UnsafeContent;
