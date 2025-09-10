import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';
import Icon, { IconProps } from './Icon';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: IconProps['icon'];
	iconProps?: Omit<IconProps, 'icon'>;
}

const IconButton = ({
	children,
	icon,
	iconProps,
	className,
	...props
}: IconButtonProps) => {
	return (
		<button className={classNames('IconButton', className)} {...props}>
			<Icon icon={icon} {...iconProps} />
			{children}
		</button>
	);
};

export default IconButton;
