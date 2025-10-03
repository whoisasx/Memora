import { useAnimatedStore, useAttributeStore } from "../../store/nodeStore";
import Slider from "./Slider";

export default function GraphOptions() {
	const attributeStore = useAttributeStore();
	const setHasAnimated = useAnimatedStore((state) => state.setHasanimated);
	return (
		<div className="border border-sky-200/60 dark:border-sky-700/60 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md w-40 md:w-60 px-4 py-4 absolute top-13 right-2 flex flex-col gap-3 rounded-xl shadow-lg shadow-sky-500/25 dark:shadow-sky-400/15 ring-1 ring-sky-100/50 dark:ring-sky-800/50 z-40">
			<div className="flex flex-col gap-3 mb-1">
				<p className="font-semibold text-base text-sky-700 dark:text-sky-300">
					Display
				</p>
				<Slider
					keyName="text fade"
					stepCount={0.01}
					minVal={0}
					maxVal={1.0}
					value={attributeStore.textFade}
					setValue={attributeStore.setTextFade}
				/>
				<Slider
					keyName="node size"
					stepCount={0.01}
					minVal={0.05}
					maxVal={5.0}
					value={attributeStore.nodeSize}
					setValue={attributeStore.setNodeSize}
				/>
				<Slider
					keyName="link thickness"
					stepCount={0.01}
					minVal={0.05}
					maxVal={3.0}
					value={attributeStore.lineThickness}
					setValue={attributeStore.setLineThickness}
				/>
			</div>
			<button
				className="w-full h-9 border border-sky-300 dark:border-sky-600 bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/50 dark:to-sky-800/50 hover:from-sky-100 hover:to-sky-200 dark:hover:from-sky-800/70 dark:hover:to-sky-700/70 text-sky-700 dark:text-sky-300 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
				onClick={() => setHasAnimated(false)}
			>
				Animate Graph
			</button>
			<div className="flex flex-col gap-3 mt-2">
				<p className="font-semibold text-base text-sky-700 dark:text-sky-300">
					Forces
				</p>
				<Slider
					keyName="center forces"
					stepCount={0.01}
					minVal={0.0}
					maxVal={1.0}
					value={attributeStore.centerForces}
					setValue={attributeStore.setCenterForces}
				/>
				<Slider
					keyName="repel forces"
					stepCount={0.01}
					minVal={0.0}
					maxVal={20.0}
					value={attributeStore.repelForces}
					setValue={attributeStore.setRepelForces}
				/>
				<Slider
					keyName="link forces"
					stepCount={0.01}
					minVal={0.0}
					maxVal={1.0}
					value={attributeStore.linkForces}
					setValue={attributeStore.setLinkForces}
				/>
				<Slider
					keyName="link distance"
					stepCount={1.0}
					minVal={30}
					maxVal={500}
					value={attributeStore.linkDistance}
					setValue={attributeStore.setLinkDistance}
				/>
			</div>
		</div>
	);
}
