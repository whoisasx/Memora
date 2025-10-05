import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import AuthPage from "./pages/auth/AuthPage";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import Graphview from "./pages/node/Graphview";
import Callback from "./pages/auth/AuthCallback";
import NotFound from "./pages/NotFound";

function App() {
	return (
		<div>
			<Toaster position="top-center" reverseOrder={true} />
			<Routes>
				<Route index element={<Home />} />
				<Route element={<AuthPage />}>
					<Route path="signin" element={<Signin />} />
					<Route path="signup" element={<Signup />} />
				</Route>
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="nodes" element={<Graphview />} />
				<Route path="auth">
					<Route path="callback" element={<Callback />} />
				</Route>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
}

export default App;
