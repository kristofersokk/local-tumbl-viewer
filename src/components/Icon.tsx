import { SVGProps } from 'react';
import ArrowLeft from '../assets/icons/arrow-left.svg?react';
import Download from '../assets/icons/download.svg?react';
import Filter from '../assets/icons/filter.svg?react';
import Home from '../assets/icons/home.svg?react';
import Link from '../assets/icons/link.svg?react';
import Masonry from '../assets/icons/masonry.svg?react';
import PageInfo from '../assets/icons/page-info.svg?react';
import PanZoom from '../assets/icons/pan-zoom.svg?react';
import Settings from '../assets/icons/settings.svg?react';
import VerticalList from '../assets/icons/vertical-list.svg?react';
import Debug from '../assets/icons/debug.svg?react';
import Refresh from '../assets/icons/refresh.svg?react';
import Sort from '../assets/icons/sort.svg?react';
import Shuffle from '../assets/icons/shuffle.svg?react';
import ClockArrowDown from '../assets/icons/clock-arrow-down.svg?react';
import ClockArrowUp from '../assets/icons/clock-arrow-up.svg?react';

export interface IconProps extends SVGProps<SVGSVGElement> {
	icon: keyof typeof mapIconToComponent;
}

const mapIconToComponent = {
	'arrow-left': ArrowLeft,
	download: Download,
	filter: Filter,
	home: Home,
	link: Link,
	masonry: Masonry,
	'page-info': PageInfo,
	'pan-zoom': PanZoom,
	settings: Settings,
	'vertical-list': VerticalList,
	debug: Debug,
	refresh: Refresh,
	sort: Sort,
	shuffle: Shuffle,
	'clock-arrow-down': ClockArrowDown,
	'clock-arrow-up': ClockArrowUp,
};

const Icon = ({ icon, ...props }: IconProps) => {
	const Component = mapIconToComponent[icon];
	return Component ? <Component {...props} /> : null;
};

export default Icon;
