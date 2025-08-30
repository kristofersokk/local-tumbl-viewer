import { Toast } from 'radix-ui';
import { useEffect, useState } from 'react';

const OfflineReady = () => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setOpen(true);
		}, 1000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<Toast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
			<Toast.Description asChild>
				<p>Ready for offline use</p>
			</Toast.Description>
			<Toast.Action className="ToastAction" asChild altText="Dismiss">
				<button>Dismiss</button>
			</Toast.Action>
		</Toast.Root>
	);
};

export default OfflineReady;
