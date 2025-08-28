import { Toast } from 'radix-ui';
import { useState } from 'react';

const OfflineReady = () => {
	const [open, setOpen] = useState(true);

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
