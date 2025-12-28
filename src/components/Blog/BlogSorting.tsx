import classNames from 'classnames';
import IconButton from 'Components/IconButton';
import Tooltip from 'Components/Tooltip';
import { BlogSorting as BlogSortingType } from 'Hooks/useBlogViewSettings';
import { useTransition } from 'react';

interface BlogSortingProps {
	sorting: BlogSortingType;
}

const BlogSorting = ({
	sorting: {
		sortingField,
		sortingDirection,
		setSortingField,
		setSortingDirection,
	},
}: BlogSortingProps) => {
	const [isShufflePending, startShuffleTransition] = useTransition();
	const [isAscCreatedAtPending, startAscCreatedAtTransition] = useTransition();
	const [isDescCreatedAtPending, startDescCreatedAtTransition] =
		useTransition();

	return (
		<>
			<div className="flex items-center">
				<span className="align-middle text-sm">Sorting:</span>
			</div>
			<div className="flex items-center gap-1">
				<Tooltip content={<p>Shuffle</p>}>
					<IconButton
						icon="shuffle"
						className={classNames({
							'bg-gray-700': sortingField === 'shuffle',
						})}
						onClick={() =>
							startShuffleTransition(() => setSortingField('shuffle'))
						}
						isLoading={isShufflePending}
					/>
				</Tooltip>
				<Tooltip content={<p>Sort Asc by Created Time</p>}>
					<IconButton
						icon="clock-arrow-down"
						className={classNames({
							'bg-gray-700':
								sortingField === 'createdBy' && sortingDirection === 'asc',
						})}
						onClick={() => {
							startAscCreatedAtTransition(() => {
								setSortingField('createdBy');
								setSortingDirection('asc');
							});
						}}
						isLoading={isAscCreatedAtPending}
					/>
				</Tooltip>
				<Tooltip content={<p>Sort Desc by Created Time</p>}>
					<IconButton
						icon="clock-arrow-up"
						className={classNames({
							'bg-gray-700':
								sortingField === 'createdBy' && sortingDirection === 'desc',
						})}
						onClick={() => {
							startDescCreatedAtTransition(() => {
								setSortingField('createdBy');
								setSortingDirection('desc');
							});
						}}
						isLoading={isDescCreatedAtPending}
					/>
				</Tooltip>
			</div>
		</>
	);
};

export default BlogSorting;
