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
		<div>
			<div className="flex flex-col gap-2 text-sm">
				<div className="flex items-center justify-between">
					<p> {keyName} </p>
					<span> {value}</span>
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
