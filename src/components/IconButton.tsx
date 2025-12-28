import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';
import Icon, { IconProps } from './Icon';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: IconProps['icon'];
	iconProps?: Omit<IconProps, 'icon'>;
	isLoading?: boolean;
}

const IconButton = ({
	children,
	icon,
	iconProps,
	className,
	isLoading,
	...props
}: IconButtonProps) => {
	return (
		<button
			className={classNames('IconButton', className, {
				'animate-pulse': isLoading,
			})}
			{...props}
		>
			<Icon icon={icon} {...iconProps} />
			{children}
		</button>
	);
};

export default IconButton;
