import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

const getInitialTheme = (): Theme =>
	document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	return { theme, toggleTheme };
};

export default useTheme;
