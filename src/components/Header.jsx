import React from 'react';
import { Bot, Settings, Info } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary-600 robot-arm-animation" />
              <div className="absolute inset-0 rounded-full bg-primary-600 opacity-20 pulse-ring"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dobot Control Interface</h1>
              <p className="text-sm text-gray-600">Robotic Arm Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;