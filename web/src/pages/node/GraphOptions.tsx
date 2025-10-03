import { useAnimatedStore, useAttributeStore } from "../../store/nodeStore";
import Slider from "./Slider";

export default function GraphOptions() {
	const attributeStore = useAttributeStore();
	const setHasAnimated = useAnimatedStore((state) => state.setHasanimated);
	return (
		<div className="border w-40 md:w-60 px-3 py-3 absolute top-13 right-2 flex flex-col gap-2 rounded-xl">
			<div className="flex flex-col gap-2 mb-2">
				<p className="font-semibold text-base">Display</p>
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
				className="w-full h-8 border rounded-xl"
				onClick={() => setHasAnimated(false)}
			>
				{" "}
				animate
			</button>
			<div className="flex flex-col gap-2 mt-1">
				<p className="font-semibold text-base">Forces</p>
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
