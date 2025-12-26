import { Tooltip as RadixTooltip } from 'radix-ui';
import { ReactNode } from 'react';

interface TooltipComponentProps {
	delayDuration?: number;
	content: ReactNode;
	children: ReactNode;
}

const Tooltip = ({
	delayDuration = 200,
	content,
	children,
}: TooltipComponentProps) => {
	return (
		<RadixTooltip.Provider>
			<RadixTooltip.Root delayDuration={delayDuration}>
				<RadixTooltip.Portal>
					<RadixTooltip.Content
						className="TooltipContent z-tooltip"
						sideOffset={5}
					>
						{content}
						<RadixTooltip.Arrow className="TooltipArrow" />
					</RadixTooltip.Content>
				</RadixTooltip.Portal>
				<RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	);
};

export default Tooltip;
