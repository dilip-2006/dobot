import React from 'react';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const StatusPanel = ({ status }) => {
  const getConnectionIcon = () => {
    if (status.robotConnected) {
      return <CheckCircle className="h-5 w-5 text-success-600" />;
    }
    return <WifiOff className="h-5 w-5 text-error-600" />;
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-success-600' : 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary-600" />
          System Status
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Robot Connection</span>
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className={`text-sm font-medium ${
                status.robotConnected ? 'text-success-600' : 'text-error-600'
              }`}>
                {status.robotConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Camera</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status.cameraActive ? 'bg-success-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${getStatusColor(status.cameraActive)}`}>
                {status.cameraActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Color Detection</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status.colorDetectionActive ? 'bg-success-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-medium ${getStatusColor(status.colorDetectionActive)}`}>
                {status.colorDetectionActive ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Operation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Operation</h3>
        <div className="text-center">
          {status.currentOperation ? (
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {status.currentOperation}
              </div>
              {status.isProcessing && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">Idle</span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Colors Taught</span>
            <span className="text-sm font-medium text-gray-900">{status.colorsTaught || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Cubes Detected</span>
            <span className="text-sm font-medium text-gray-900">{status.cubesDetected || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Operations Complete</span>
            <span className="text-sm font-medium text-gray-900">{status.operationsComplete || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;