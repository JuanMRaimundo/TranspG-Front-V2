import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import TripsHistoryPage from "./pages/DailyTripsPage";
import { Toaster } from "sonner";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const DriversPage = lazy(() => import("./pages/DriversPage"));
const UserEditPage = lazy(() => import("./pages/UserEditPage"));
const DailyTripsPage = lazy(() => import("./pages/DailyTripsPage"));
const TripDetailPage = lazy(() => import("./pages/TripDetailPage"));

const PageLoader = () => (
	<div className="min-h-screen flex items-center justify-center bg-slate-50">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
	</div>
);

function App() {
	return (
		<>
			<BrowserRouter>
				<Suspense fallback={<PageLoader />}>
					<Routes>
						{/* RUTA PÚBLICA */}
						<Route path="/login" element={<LoginPage />} />

						{/* RUTAS PROTEGIDAS (Nivel 1: Seguridad) */}
						<Route element={<ProtectedRoute />}>
							{/* LAYOUT PRINCIPAL (Nivel 2: Estructura Visual) */}
							<Route element={<MainLayout />}>
								{/* PÁGINAS INTERNAS (Nivel 3: Contenido que sale por el Outlet) */}
								<Route path="/" element={<TripsPage />} />
								<Route path="/daily" element={<DailyTripsPage />} />
								<Route path="/users/clients" element={<ClientsPage />} />
								<Route path="/users/drivers" element={<DriversPage />} />
								<Route path="/trips" element={<TripsHistoryPage />} />
								<Route path="/users/edit/:id" element={<UserEditPage />} />
								<Route path="/trips/:id" element={<TripDetailPage />} />
							</Route>
						</Route>

						{/* Fallback */}
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</Suspense>
			</BrowserRouter>
			<Toaster position="top-right" closeButton />
		</>
	);
}

export default App;
