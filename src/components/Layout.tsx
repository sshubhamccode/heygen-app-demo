import React from 'react';
import { MonitorPlay, Video, UserCircle, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'translator' | 'avatar';
  onTabChange: (tab: 'translator' | 'avatar') => void;
  session: any;
  onSignOut: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  session,
  onSignOut
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/75 border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-semibold text-slate-800">VideoLingua</h1>
          </div>
          <nav className="flex items-center gap-6">
            <ul className="flex gap-6">
              <li>
                <button
                  onClick={() => onTabChange('translator')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'translator'
                      ? 'text-blue-500 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-500'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Translator</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('avatar')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'avatar'
                      ? 'text-blue-500 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-500'
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Avatar Generator</span>
                </button>
              </li>
            </ul>
            
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-sm text-slate-600">
                {session?.user?.email}
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-800 text-slate-300 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MonitorPlay className="w-6 h-6 text-blue-400" />
              <span className="font-medium">VideoLingua</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} VideoLingua. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};