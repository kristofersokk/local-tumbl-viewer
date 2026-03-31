import DOMPurify from 'dompurify';
import {
	createElement,
	JSX,
	memo,
	RefObject,
	useEffect,
	useEffectEvent,
	useState,
} from 'react';

import {
	DomProcessor,
	DomProcessorAsync,
	iterateDomTree,
	iterateDomTreeAsync,
} from 'Utils/htmlUtils';

import { EventCollector } from 'Helpers/eventCollector';
import Loader from './Loader';

type Props<E extends keyof JSX.IntrinsicElements = 'div'> = {
	tag?: E;
	Ref?: RefObject<HTMLElement | null>;
	content: string;
	domProcessors?: { main: DomProcessorAsync; mediaOnLoad?: DomProcessor }; // needs to be stable
	allowIframes?: boolean;
	onLoad?: () => void;
} & Omit<JSX.IntrinsicElements[E], 'onLoad'>;

const UnsafeContent = <E extends keyof JSX.IntrinsicElements = 'div'>({
	tag,
	Ref,
	content,
	domProcessors,
	allowIframes = false,
	onLoad,
	...rest
}: Props<E>) => {
	const tagContainer = {
		tag: tag || ('div' as E),
	};

	const [body, setBody] = useState<HTMLBodyElement | null>(null);

	const onLoadEvent = useEffectEvent(() => {
		onLoad?.();
	});

	const handleBody = useEffectEvent((body: HTMLBodyElement) => {
		setTimeout(() => {
			if (domProcessors) {
				iterateDomTreeAsync(body, domProcessors.main).then(() => {
					if (domProcessors.mediaOnLoad) {
						setBody(body);
						const eventCollector = new EventCollector({
							autoComplete: false,
						});
						eventCollector.setOutput(() => {
							onLoadEvent();
						});
						iterateDomTree(body, domProcessors.mediaOnLoad, eventCollector);
						eventCollector.markEverythingRegistered();
					} else {
						onLoadEvent();
					}
				});
			} else {
				setBody(body);
			}
		}, 0);
	});

	useEffect(() => {
		const body = DOMPurify.sanitize(content, {
			RETURN_DOM: true,
			FORBID_TAGS: ['script'],
			ADD_TAGS: allowIframes ? ['iframe'] : [],
			ADD_ATTR: allowIframes
				? ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
				: [],
		}) as HTMLBodyElement;

		handleBody(body);
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
