import SettingsLogo from 'Assets/icons/settings.svg?react';
import { BlogParams } from 'Hooks/useBlogViewSettings';
import { Popover, Slider, Switch } from 'radix-ui';

interface BlogSettingsProps {
	params: BlogParams;
}

const BlogSettings = ({ params }: BlogSettingsProps) => {
	const {
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
	} = params;

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button className="fill-text cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-800">
					<SettingsLogo />
				</button>
			</Popover.Trigger>
			<Popover.Content align="end" sideOffset={5} className="max-w-[90vw]">
				<div className="bg-popover-background flex flex-col gap-4 rounded-lg px-3 py-4">
					<p className="text-lg">Settings</p>
					<div className="grid grid-cols-[auto_auto] gap-4">
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
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default BlogSettings;
