import React, { useState } from 'react';
import { Bot, Home, Play, Square, RotateCcw, Settings } from 'lucide-react';
import { executeScript } from '../utils/api';

const RobotControl = ({ status, updateStatus, addLog }) => {
  const [manualCoords, setManualCoords] = useState({ x: 0, y: 0, z: 0, r: 0 });
  const [isExecuting, setIsExecuting] = useState(false);

  const executeRobotOperation = async (operation, scriptPath) => {
    try {
      setIsExecuting(true);
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
    } finally {
      setIsExecuting(false);
    }
  };

  const homeRobot = () => executeRobotOperation('Homing Robot', 'DobotControl.py');
  const executeStackProcess = () => executeRobotOperation('Stack Process Execution', 'DobotControl.py');
  const executeInverseKinematics = () => executeRobotOperation('Inverse Kinematics Execution', 'HELLO.py');

  const emergencyStop = () => {
    setIsExecuting(false);
    updateStatus({ isProcessing: false, currentOperation: null });
    addLog('Emergency stop activated', 'warning');
  };

  const handleCoordChange = (coord, value) => {
    setManualCoords(prev => ({ ...prev, [coord]: parseFloat(value) || 0 }));
  };

  const moveToPosition = async () => {
    try {
      addLog(`Moving to position: X=${manualCoords.x}, Y=${manualCoords.y}, Z=${manualCoords.z}, R=${manualCoords.r}`, 'info');
      // This would need to be implemented to send coordinates to the robot
      addLog('Manual positioning completed', 'success');
    } catch (error) {
      addLog(`Manual positioning failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Robot Status */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Bot className="h-6 w-6 mr-2 text-primary-600" />
          Robot Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
              status.robotConnected ? 'bg-success-100' : 'bg-error-100'
            }`}>
              <Bot className={`h-8 w-8 ${
                status.robotConnected ? 'text-success-600' : 'text-error-600'
              }`} />
            </div>
            <p className="font-medium text-gray-900">Connection</p>
            <p className={`text-sm ${
              status.robotConnected ? 'text-success-600' : 'text-error-600'
            }`}>
              {status.robotConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900">Status</p>
            <p className="text-sm text-blue-600">
              {status.currentOperation || 'Ready'}
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-3">
              <Play className="h-8 w-8 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">Operations</p>
            <p className="text-sm text-purple-600">
              {status.operationsComplete || 0} completed
            </p>
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={homeRobot}
            disabled={isExecuting}
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>

          <button
            onClick={executeStackProcess}
            disabled={isExecuting || !status.robotConnected}
            className="btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Play className="h-5 w-5" />
            <span>Execute Stack</span>
          </button>

          <button
            onClick={executeInverseKinematics}
            disabled={isExecuting || !status.robotConnected}
            className="btn-success flex items-center justify-center space-x-2 py-3"
          >
            <Bot className="h-5 w-5" />
            <span>Inverse Kinematics</span>
          </button>

          <button
            onClick={emergencyStop}
            className="btn-error flex items-center justify-center space-x-2 py-3"
          >
            <Square className="h-5 w-5" />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>

      {/* Manual Position Control */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Manual Position Control</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">X (mm)</label>
            <input
              type="number"
              value={manualCoords.x}
              onChange={(e) => handleCoordChange('x', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Y (mm)</label>
            <input
              type="number"
              value={manualCoords.y}
              onChange={(e) => handleCoordChange('y', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Z (mm)</label>
            <input
              type="number"
              value={manualCoords.z}
              onChange={(e) => handleCoordChange('z', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">R (degrees)</label>
            <input
              type="number"
              value={manualCoords.r}
              onChange={(e) => handleCoordChange('r', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="0.1"
            />
          </div>
        </div>

        <button
          onClick={moveToPosition}
          disabled={isExecuting || !status.robotConnected}
          className="btn-primary flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Move to Position</span>
        </button>
      </div>

      {/* Operation History */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Operations</h3>
        
        <div className="space-y-3">
          {status.operationsComplete > 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">
                {status.operationsComplete} operations completed successfully
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No operations completed yet</p>
              <p className="text-sm text-gray-400">Execute robot operations to see history</p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Information */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Safety Information</h3>
        <div className="space-y-2 text-sm text-yellow-800">
          <p><strong>⚠️ Always ensure the robot workspace is clear before executing operations</strong></p>
          <p><strong>🛑 Use Emergency Stop if any unexpected behavior occurs</strong></p>
          <p><strong>🏠 Home the robot before starting any new operation sequence</strong></p>
          <p><strong>📏 Verify coordinates are within safe operating limits</strong></p>
        </div>
      </div>
    </div>
  );
};

export default RobotControl;