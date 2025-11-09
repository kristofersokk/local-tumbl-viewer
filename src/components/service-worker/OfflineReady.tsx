import { Toast } from 'radix-ui';
import { useCallback, useState } from 'react';

import useTimer from 'Hooks/useTimer';

const OfflineReady = () => {
	const [open, setOpen] = useState(false);

	const openToast = useCallback(() => setOpen(true), []);
	useTimer(1000, openToast);

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
