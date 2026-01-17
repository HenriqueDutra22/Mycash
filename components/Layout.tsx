
import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { ViewType, UserProfile } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    currentView: ViewType;
    onViewChange: (v: ViewType) => void;
    user: UserProfile;
    hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, user, hideNav }) => {
    return (
        <div className="flex min-h-screen bg-[#0a0f0c] text-white">
            {/* Desktop Sidebar */}
            {!hideNav && (
                <Sidebar
                    currentView={currentView}
                    onViewChange={onViewChange}
                    user={user}
                    onPlusClick={() => onViewChange('NEW_TRANSACTION')}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0">
                <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-32 lg:pb-12">
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                {!hideNav && (
                    <BottomNav
                        currentView={currentView}
                        onViewChange={onViewChange}
                        onPlusClick={() => onViewChange('NEW_TRANSACTION')}
                    />
                )}
            </main>
        </div>
    );
};

export default Layout;
