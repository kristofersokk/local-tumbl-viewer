import IconButton from './IconButton';
import Tooltip from './Tooltip';
import useTheme from 'Hooks/useTheme';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<Tooltip
			content={<p>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</p>}
		>
			<IconButton
				icon={isDark ? 'light-mode' : 'dark-mode'}
				onClick={toggleTheme}
			/>
		</Tooltip>
	);
};

export default ThemeToggle;
