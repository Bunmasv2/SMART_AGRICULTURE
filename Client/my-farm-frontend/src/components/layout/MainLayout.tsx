import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex flex-col h-screen bg-[#f0fdf4] font-sans">
            
            {/* Header full width */}
            <Header />

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar */}
                <Sidebar className="w-64 bg-white shadow-md hidden md:block" />

                {/* Right side */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* Main */}
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>

                    {/* Footer */}
                    <Footer />
                </div>

            </div>
        </div>
    );
}