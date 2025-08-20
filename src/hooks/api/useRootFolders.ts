import { skipToken, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from 'Constants/queryKeys';
import InitializationContext from 'Contexts/InitializationContext';
import { useContext } from 'react';

const useRootFolders = () => {
	const { rootDirHandle } = useContext(InitializationContext);

	return useQuery({
		queryKey: [QUERY_KEYS.ROOT_FOLDERS, rootDirHandle?.name],
		queryFn: rootDirHandle
			? async () =>
					Array.fromAsync(rootDirHandle.values()).then(handles =>
						handles.filter(
							(handle): handle is FileSystemDirectoryHandle =>
								handle.kind === 'directory'
						)
					)
			: skipToken,
		staleTime: Infinity,
	});
};

export default useRootFolders;
