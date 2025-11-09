import classNames from 'classnames';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const TextInput = (props: TextInputProps) => {
	return (
		<input
			{...props}
			className={classNames(
				props.className,
				'bg-switch-bg border-switch-thumb rounded-lg border px-2 py-1'
			)}
		/>
	);
};

export default TextInput;
