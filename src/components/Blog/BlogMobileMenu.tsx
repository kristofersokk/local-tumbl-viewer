import { Dialog } from 'radix-ui';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import IconButton from 'Components/IconButton';
import Icon, { IconProps } from 'Components/Icon';

interface BlogMobileMenuProps {
	children: ReactNode;
}

interface MobileMenuRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: IconProps['icon'];
	label: string;
	badge?: ReactNode;
}

export const MobileMenuRow = ({
	icon,
	label,
	badge,
	className,
	...props
}: MobileMenuRowProps) => (
	<button
		className={classNames(
			'hover:bg-control-bg fill-text flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
			className
		)}
		{...props}
	>
		<span className="relative">
			<Icon icon={icon} />
			{badge}
		</span>
		<span className="text-sm">{label}</span>
	</button>
);

const BlogMobileMenu = ({ children }: BlogMobileMenuProps) => {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<IconButton icon="menu" aria-label="Open menu" className="md:hidden" />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="BlogMobileMenuOverlay z-popover fixed inset-0 backdrop-blur-xl backdrop-brightness-75" />
				<Dialog.Content className="BlogMobileMenuContent bg-navbar border-navbar-border z-popover fixed inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col gap-4 border-l p-4 shadow-2xl">
					<div className="flex items-center justify-between">
						<Dialog.Title className="text-lg">Menu</Dialog.Title>
						<Dialog.Close asChild>
							<IconButton icon="close" aria-label="Close menu" />
						</Dialog.Close>
					</div>
					<div className="flex flex-col gap-4">{children}</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default BlogMobileMenu;
