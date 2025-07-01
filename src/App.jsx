import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import ControlPanel from './components/ControlPanel';
import ColorTeaching from './components/ColorTeaching';
import CubeDetection from './components/CubeDetection';
import RobotControl from './components/RobotControl';
import LogPanel from './components/LogPanel';
import { useSystemStatus } from './hooks/useSystemStatus';

function App() {
  const [activeTab, setActiveTab] = useState('control');
  const { status, logs, updateStatus, addLog } = useSystemStatus();

  const tabs = [
    { id: 'control', label: 'Control Panel', icon: '🎮' },
    { id: 'teaching', label: 'Color Teaching', icon: '🎨' },
    { id: 'detection', label: 'Cube Detection', icon: '📷' },
    { id: 'robot', label: 'Robot Control', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status Panel */}
          <div className="lg:col-span-1">
            <StatusPanel status={status} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
              <div className="flex flex-wrap border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'control' && (
                  <ControlPanel 
                    status={status} 
                    updateStatus={updateStatus} 
                    addLog={addLog} 
                  />
                )}
                {activeTab === 'teaching' && (
                  <ColorTeaching 
                    status={status} 
                    updateStatus={updateStatus} 
                    addLog={addLog} 
                  />
                )}
                {activeTab === 'detection' && (
                  <CubeDetection 
                    status={status} 
                    updateStatus={updateStatus} 
                    addLog={addLog} 
                  />
                )}
                {activeTab === 'robot' && (
                  <RobotControl 
                    status={status} 
                    updateStatus={updateStatus} 
                    addLog={addLog} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Log Panel */}
        <div className="mt-6">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;