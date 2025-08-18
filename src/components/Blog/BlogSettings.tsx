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
		collapsedHeightRem,
		setCollapsedHeightRem,
		showDate,
		setShowDate,
		showPostUrl,
		setShowPostUrl,
	} = params;

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button className="fill-text cursor-pointer rounded-full p-2 transition-colors [&:hover]:bg-gray-700">
					<SettingsLogo />
				</button>
			</Popover.Trigger>
			<Popover.Content align="end" sideOffset={5} className="max-w-[90vw]">
				<div className="bg-popover-background rounded-lg px-3 py-4">
					<p className="mb-4">Settings</p>
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
								min={10}
								max={60}
								step={1}
								value={[collapsedHeightRem]}
								onValueChange={value => setCollapsedHeightRem(value[0])}
							>
								<Slider.Track className="SliderTrack">
									<Slider.Range className="SliderRange" />
								</Slider.Track>
								<Slider.Thumb className="SliderThumb" />
							</Slider.Root>
							<span className="text-sm">{collapsedHeightRem}rem</span>
						</div>
						<span className="text-sm">Show date:</span>
						<div className="flex items-center gap-2">
							<Switch.Root
								className="SwitchRoot"
								checked={showDate}
								onCheckedChange={setShowDate}
							>
								<Switch.Thumb className="SwitchThumb" />
							</Switch.Root>
						</div>
						<span className="text-sm">Show post URL:</span>
						<div className="flex items-center gap-2">
							<Switch.Root
								className="SwitchRoot"
								checked={showPostUrl}
								onCheckedChange={setShowPostUrl}
							>
								<Switch.Thumb className="SwitchThumb" />
							</Switch.Root>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default BlogSettings;
