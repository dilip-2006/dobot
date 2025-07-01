import React from 'react';
import { Play, Square, Home, RotateCcw, AlertCircle } from 'lucide-react';
import { executeScript } from '../utils/api';

const ControlPanel = ({ status, updateStatus, addLog }) => {
  const handleOperation = async (operation, scriptPath) => {
    try {
      updateStatus({ currentOperation: operation, isProcessing: true });
      addLog(`Starting ${operation}...`, 'info');
      
      const result = await executeScript(scriptPath);
      
      if (result.success) {
        addLog(`${operation} completed successfully`, 'success');
        updateStatus({ 
          isProcessing: false, 
          currentOperation: null,
          operationsComplete: (status.operationsComplete || 0) + 1
        });
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      addLog(`${operation} failed: ${error.message}`, 'error');
      updateStatus({ isProcessing: false, currentOperation: null });
    }
  };

  const operations = [
    {
      id: 'color-teaching',
      title: 'Color Teaching',
      description: 'Teach the system to recognize different colored cubes',
      icon: '🎨',
      action: () => handleOperation('Color Teaching', 'color d&t/python teach_color.py.py'),
      color: 'primary'
    },
    {
      id: 'color-detection',
      title: 'Color Detection & Stack Process',
      description: 'Detect colors and process goal stack operations',
      icon: '🔍',
      action: () => handleOperation('Color Detection & Stack Process', 'color d&t/detectcolor.py'),
      color: 'success'
    },
    {
      id: 'cube-detection',
      title: 'Cube Position Detection',
      description: 'Detect cube positions for robotic manipulation',
      icon: '📦',
      action: () => handleOperation('Cube Position Detection', 'inverse/cube_detection_dobot.py'),
      color: 'warning'
    },
    {
      id: 'homography',
      title: 'Homography Matrix',
      description: 'Calculate camera to robot coordinate transformation',
      icon: '📐',
      action: () => handleOperation('Homography Matrix Calculation', 'inverse/cam_to_dobot_matrix.npy'),
      color: 'secondary'
    }
  ];

  const quickActions = [
    {
      id: 'home',
      title: 'Go Home',
      icon: Home,
      action: () => handleOperation('Homing Robot', 'DobotControl.py'),
      color: 'secondary'
    },
    {
      id: 'stop',
      title: 'Emergency Stop',
      icon: Square,
      action: () => {
        updateStatus({ isProcessing: false, currentOperation: null });
        addLog('Emergency stop activated', 'warning');
      },
      color: 'error'
    },
    {
      id: 'reset',
      title: 'Reset System',
      icon: RotateCcw,
      action: () => {
        updateStatus({ 
          isProcessing: false, 
          currentOperation: null,
          colorDetectionActive: false,
          cameraActive: false
        });
        addLog('System reset', 'info');
      },
      color: 'secondary'
    }
  ];

  const getButtonClass = (color) => {
    const baseClass = 'w-full p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1';
    switch (color) {
      case 'primary': return `${baseClass} border-primary-200 bg-primary-50 hover:bg-primary-100`;
      case 'success': return `${baseClass} border-success-200 bg-success-50 hover:bg-success-100`;
      case 'warning': return `${baseClass} border-warning-200 bg-warning-50 hover:bg-warning-100`;
      case 'error': return `${baseClass} border-error-200 bg-error-50 hover:bg-error-100`;
      default: return `${baseClass} border-gray-200 bg-gray-50 hover:bg-gray-100`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Connection Warning */}
      {!status.robotConnected && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-warning-600" />
          <div>
            <p className="text-warning-800 font-medium">Robot Not Connected</p>
            <p className="text-warning-700 text-sm">Please ensure the Dobot is connected before starting operations.</p>
          </div>
        </div>
      )}

      {/* Main Operations */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Main Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operations.map((operation) => (
            <button
              key={operation.id}
              onClick={operation.action}
              disabled={status.isProcessing}
              className={`${getButtonClass(operation.color)} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{operation.icon}</span>
                  <h4 className="font-semibold text-gray-900">{operation.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{operation.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={status.isProcessing && action.id !== 'stop'}
              className={`btn-${action.color} flex items-center justify-center space-x-2 py-3`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Status */}
      {status.isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-blue-800 font-medium">Operation in Progress</p>
              <p className="text-blue-700 text-sm">{status.currentOperation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;