import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';
const THEME_CHANGE_EVENT = 'themechange';

const getInitialTheme = (): Theme =>
	document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const handleThemeChange = () => {
			setTheme(getInitialTheme());
		};

		window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
		return () =>
			window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
	}, []);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem(THEME_STORAGE_KEY, theme);
		window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	return { theme, toggleTheme };
};

export default useTheme;
