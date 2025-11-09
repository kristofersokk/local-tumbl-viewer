import classNames from 'classnames';
import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import InterceptCallbacks from 'Components/utils/InterceptCallbacks';
import {
	BlogParams,
	BlogSorting as BlogSortingType,
} from 'Hooks/useBlogViewSettings';
import { Popover, Slider, Switch } from 'radix-ui';
import { useState } from 'react';
import BlogSorting from './BlogSorting';

interface BlogSettingsProps {
	params: BlogParams;
	sorting: BlogSortingType;
}

const BlogSettings = ({ params, sorting }: BlogSettingsProps) => {
	const {
		layoutMode,
		setLayoutMode,
		columnWidthRem,
		setColumnWidthRem,
		collapsedHeightPercent,
		setCollapsedHeightPercent,
		showDate,
		setShowDate,
		showPostLink,
		setShowPostLink,
		showRebloggedInfo,
		setShowRebloggedInfo,
		showTags,
		setShowTags,
		fallbackToOnlineMedia,
		setFallbackToOnlineMedia,
		debugMode,
		setDebugMode,
	} = params;

	const [open, setOpen] = useState(false);

	return (
		<Popover.Root
			open={open}
			onOpenChange={newOpen => {
				document.startViewTransition(() => {
					setOpen(newOpen);
				});
			}}
		>
			<Tooltip content={<p>Settings</p>}>
				<Popover.Trigger asChild>
					<InterceptCallbacks
						intercept={{
							onClick: (prevCb, args) => {
								document.startViewTransition(() => {
									prevCb(...args);
								});
							},
						}}
						render={props => <IconButton icon="page-info" {...props} />}
					/>
				</Popover.Trigger>
			</Tooltip>
			<Popover.Content align="end" sideOffset={5} className="max-w-[90vw]">
				<div className="bg-popover-background flex flex-col gap-4 rounded-lg px-3 py-4">
					<p className="text-lg">Settings</p>
					<div className="grid grid-cols-[auto_1fr] gap-4">
						<BlogSorting sorting={sorting} />
						<div className="flex items-center">
							<span className="align-middle text-sm">Layout:</span>
						</div>
						<div className="flex items-center gap-1">
							<IconButton
								icon="masonry"
								className={classNames({
									'bg-gray-700': layoutMode === 'masonry',
								})}
								onClick={() => setLayoutMode('masonry')}
							/>
							<IconButton
								icon="vertical-list"
								className={classNames({
									'bg-gray-700': layoutMode === 'list',
								})}
								onClick={() => setLayoutMode('list')}
							/>
						</div>
						<span className="text-sm">Column width:</span>
						<div className="flex items-center gap-2">
							<Slider.Root
								className="SliderRoot"
								min={10}
								max={60}
								step={1}
								value={[columnWidthRem]}
								onValueChange={value => setColumnWidthRem(value[0])}
							>
								<Slider.Track className="SliderTrack">
									<Slider.Range className="SliderRange" />
								</Slider.Track>
								<Slider.Thumb className="SliderThumb" />
							</Slider.Root>
							<span className="text-sm">{columnWidthRem}rem</span>
						</div>
						{layoutMode === 'masonry' && (
							<>
								<span className="text-sm">Post collapsed height:</span>
								<div className="flex items-center gap-2">
									<Slider.Root
										className="SliderRoot"
										min={5}
										max={200}
										step={1}
										value={[collapsedHeightPercent]}
										onValueChange={value => setCollapsedHeightPercent(value[0])}
									>
										<Slider.Track className="SliderTrack">
											<Slider.Range className="SliderRange" />
										</Slider.Track>
										<Slider.Thumb className="SliderThumb" />
									</Slider.Root>
									<span className="text-sm">{collapsedHeightPercent}%</span>
								</div>
							</>
						)}
					</div>
					<div className="grid grid-cols-[auto_auto_auto_auto] gap-4">
						<div className="flex items-center">
							<span className="text-sm">Show date:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={showDate}
									onCheckedChange={setShowDate}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-sm">Show post link:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={showPostLink}
									onCheckedChange={setShowPostLink}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-sm">Show reblogged info:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={showRebloggedInfo}
									onCheckedChange={setShowRebloggedInfo}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-sm">Show tags:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={showTags}
									onCheckedChange={setShowTags}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-sm">Fallback to online media:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={fallbackToOnlineMedia}
									onCheckedChange={setFallbackToOnlineMedia}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						<div className="flex items-center">
							<span className="text-sm">Debug mode:</span>
						</div>
						<div className="flex items-center">
							<div className="flex items-center gap-2">
								<Switch.Root
									className="SwitchRoot"
									checked={debugMode}
									onCheckedChange={setDebugMode}
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default BlogSettings;
