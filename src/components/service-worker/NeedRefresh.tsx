import { Toast } from 'radix-ui';
import { useEffect, useState } from 'react';

interface NeedRefreshProps {
	updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>;
}

const NeedRefresh = ({ updateServiceWorker }: NeedRefreshProps) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setOpen(true);
		}, 5000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<Toast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
			<Toast.Description asChild>
				<p>New version of app available</p>
			</Toast.Description>
			<div className="flex items-center gap-2">
				<button
					className="ToastAction"
					onClick={() => {
						setOpen(false);
						updateServiceWorker(true);
					}}
				>
					Upgrade
				</button>
				<button className="ToastAction" onClick={() => setOpen(false)}>
					Dismiss
				</button>
			</div>
		</Toast.Root>
	);
};

export default NeedRefresh;
