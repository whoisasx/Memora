import { useDashboardStore } from "../../store/dashboardStore";
import AppLogo from "../../ui/icons/Logo";

export default function Navbar() {
	const { setCreateModelOpen } = useDashboardStore();
	return (
		<section className="h-20 w-auto border rounded-2xl">
			<div className="w-full h-full relative flex items-center justify-between px-3 rounded-2xl">
				<div>
					<AppLogo />
				</div>
				<div>graph+user icon</div>

				<div className="absolute top-full right-3 z-10 mt-3">
					<button
						onClick={() => setCreateModelOpen(true)}
						className="px-5 h-10 border rounded-2xl "
					>
						add content
					</button>
				</div>
			</div>
		</section>
	);
}
