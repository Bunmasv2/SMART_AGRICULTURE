import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import BatchDetail from '../pages/batches/BatchDetail';
import GrowthProcessDetail from '../pages/processes/GrowthProcessDetail';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Batches = lazy(() => import('../pages/batches/BatchList'));
const BatchLifecycle = lazy(() => import('../pages/batches/BatchLifecycle'));
const Processes = lazy(() => import('../pages/processes/GrowthProcess'));
const Inventory = lazy(() => import('../pages/inventory/Inventory'));
const Crops = lazy(() => import('../pages/crops/CropList'));
const Tasks = lazy(() => import('../pages/tasks/TaskManagement'));
const Calendar = lazy(() => import('../pages/tasks/FarmingCalendar'));
const WorkerImagesPage = lazy(() => import('../pages/ai-assistant/WorkerImagesPage'));
const AnalyzeSymptomsPage = lazy(() => import('../pages/ai-assistant/AnalyzeSymptomsPage'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const FertilizerManagement = lazy(() => import('../pages/inventory/FertilizerManagement'));
const PesticideManagement = lazy(() => import('../pages/inventory/PesticideManagement'));

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="flex h-screen items-center justify-center font-medium text-[#2c9b4e]">Loading Agrikon...</div>}>
                <Routes>
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Dashboard />} />

                            <Route path="/batches">
                                <Route index element={<Batches />} />
                                <Route path=":id" element={<BatchDetail />} />
                                <Route path="lifecycle/:id" element={<BatchLifecycle />} />
                            </Route>

                            <Route path="/processes" element={<Processes />} />
                            <Route path="/processes/:id" element={<GrowthProcessDetail />} />

                            <Route path="/crops" element={<Crops />} />

                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/fertilizers" element={<FertilizerManagement />} />
                            <Route path="/pesticides" element={<PesticideManagement />} />

                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/calendar" element={<Calendar />} />

                            <Route path="/ai-assistant" element={<Navigate to="/ai-assistant/worker-images" replace />} />
                            <Route path="/ai-assistant/worker-images" element={<WorkerImagesPage />} />
                            <Route path="/ai-assistant/analyze-symptoms" element={<AnalyzeSymptomsPage />} />
                            <Route path="/ai-assistant/:batchId" element={<Navigate to="/ai-assistant/worker-images" replace />} />

                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Route>

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;