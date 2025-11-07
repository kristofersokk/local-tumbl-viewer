import DOMPurify from 'dompurify';
import {
	createElement,
	JSX,
	memo,
	RefObject,
	useEffect,
	useState,
} from 'react';
import { DomProcessor, iterateDomTree } from 'Utils/blogUtils';
import Loader from './Loader';

type Props<E extends keyof JSX.IntrinsicElements = 'div'> = {
	tag?: E;
	Ref?: RefObject<HTMLElement | null>;
	content: string;
	domProcessors?: DomProcessor[]; // needs to be stable
	allowIframes?: boolean;
} & JSX.IntrinsicElements[E];

const UnsafeContent = <E extends keyof JSX.IntrinsicElements = 'div'>({
	tag,
	Ref,
	content,
	domProcessors,
	allowIframes = false,
	...rest
}: Props<E>) => {
	const tagContainer = {
		tag: tag || ('div' as E),
	};

	const [body, setBody] = useState<HTMLBodyElement | null>(null);

	useEffect(() => {
		const body = DOMPurify.sanitize(content, {
			RETURN_DOM: true,
			FORBID_TAGS: ['script'],
			ADD_TAGS: allowIframes ? ['iframe'] : [],
			ADD_ATTR: allowIframes
				? ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
				: [],
		}) as HTMLBodyElement;

		Promise.all(
			(domProcessors || []).map(processor => {
				iterateDomTree(body, processor);
			})
		).then(() => {
			setBody(body);
		});
	}, [allowIframes, content, domProcessors]);

	if (!body) {
		return (
			<div className="flex h-20 w-full items-center justify-center">
				<Loader type="spinner" size={20} />
			</div>
		);
	}

	return createElement(tagContainer.tag, {
		key: content,
		ref: Ref,
		...rest,
		dangerouslySetInnerHTML: { __html: body.innerHTML },
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
