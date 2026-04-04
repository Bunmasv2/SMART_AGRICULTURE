import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
    const location = useLocation();
    const publicAiPaths = ['/ai-assistant', '/ai-assistant/worker-images', '/ai-assistant/analyze-symptoms'];
    if (publicAiPaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))) {
        return <Outlet />;
    }

    const user = localStorage.getItem('user');
    
    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render child routes if authenticated
    return <Outlet />;
};

export default ProtectedRoute;
