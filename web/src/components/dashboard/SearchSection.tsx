import Searchbar from "./Searchbar";

export default function SearchSection() {
	return (
		<section className="w-full py-5 mt-5 h-200 border flex justify-center">
			<div className="h-full w-full md:w-3/4 border flex items-center justify-center">
				<Searchbar />
			</div>
		</section>
	);
}
