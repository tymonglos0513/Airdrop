import { HashRouter as BrowserRouter, Route, Routes } from "react-router-dom";
import ClaimPage from "./pages/ClaimPage";
import Footer from "./pages/Footer";
import MintPage from "./pages/MintPage";
import NavBar from "./pages/NavBar";

function App() {
	return (
		<>
			<NavBar />
			<BrowserRouter>
				<Routes>
					<Route path="/">
						<Route index element={<MintPage />} />

						<Route path="/claim" element={<ClaimPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
			<Footer />
		</>
	);
}

export default App;
