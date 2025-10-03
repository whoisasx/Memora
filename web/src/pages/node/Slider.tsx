export default function Slider({
	keyName,
	stepCount,
	minVal,
	maxVal,
	value,
	setValue,
}: {
	keyName: string;
	stepCount: number;
	minVal: number;
	maxVal: number;
	value: number;
	setValue: (val: number) => void;
}) {
	return (
		<div className="">
			<div className="flex flex-col gap-2 text-xs">
				<div className="flex items-center justify-between">
					<p className="text-slate-600 dark:text-slate-400 text-xs capitalize">
						{" "}
						{keyName}{" "}
					</p>
					<span className="text-slate-700 dark:text-slate-300 font-bold text-xs">
						{stepCount >= 1 ? value.toFixed(0) : value.toFixed(2)}
					</span>
				</div>
				<input
					type="range"
					step={stepCount}
					max={maxVal}
					min={minVal}
					value={value}
					onChange={(e) => setValue(Number(e.target.value))}
					className="range"
				/>
			</div>
		</div>
	);
}
