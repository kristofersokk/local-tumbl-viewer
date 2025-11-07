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

export interface IconProps extends SVGProps<SVGSVGElement> {
	icon:
		| 'arrow-left'
		| 'download'
		| 'filter'
		| 'home'
		| 'link'
		| 'masonry'
		| 'page-info'
		| 'pan-zoom'
		| 'settings'
		| 'vertical-list'
		| 'debug';
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
};

const Icon = ({ icon, ...props }: IconProps) => {
	const Component = mapIconToComponent[icon];
	return Component ? <Component {...props} /> : null;
};

export default Icon;
