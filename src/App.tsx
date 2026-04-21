import React from 'react';
import { ChatPane } from './components/ChatPane';
import { MenuDrawer } from './components/MenuDrawer';
import { SettingsModal } from './components/Settings';

export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Mesh Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#0c0c14]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Main View Area */}
      <div className="flex-1 relative overflow-hidden">
         <ChatPane />
      </div>
      
      <MenuDrawer />
      <SettingsModal />
    </div>
  );
}
