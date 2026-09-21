import classNames from 'classnames';

// oxlint-disable-next-line @typescript-eslint/no-empty-object-type
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const TextInput = (props: TextInputProps) => {
	return (
		<input
			{...props}
			className={classNames(
				props.className,
				'bg-control-bg border-control-bg-strong rounded-lg border px-2 py-1'
			)}
		/>
	);
};

export default TextInput;
