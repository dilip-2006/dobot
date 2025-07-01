import React, { useState, useEffect } from 'react';
import { Camera, Target, MapPin, RefreshCw } from 'lucide-react';
import { executeScript, getCubePositions } from '../utils/api';

const CubeDetection = ({ status, updateStatus, addLog }) => {
  const [detectedPositions, setDetectedPositions] = useState([]);
  const [cubeMatrix, setCubeMatrix] = useState([]);
  const [finalCubeMatrix, setFinalCubeMatrix] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    loadDetectedPositions();
    loadCubeMatrices();
  }, []);

  const loadDetectedPositions = async () => {
    try {
      const positions = await getCubePositions();
      setDetectedPositions(positions);
      updateStatus({ cubesDetected: positions.length });
    } catch (error) {
      addLog('Failed to load detected positions', 'error');
    }
  };

  const loadCubeMatrices = async () => {
    try {
      // Load cube matrices from JSON files
      // This would need to be implemented in the backend API
      addLog('Loading cube matrices...', 'info');
    } catch (error) {
      addLog('Failed to load cube matrices', 'error');
    }
  };

  const startCubeDetection = async () => {
    try {
      setIsDetecting(true);
      updateStatus({ 
        currentOperation: 'Cube Detection', 
        isProcessing: true, 
        cameraActive: true,
        colorDetectionActive: true 
      });
      addLog('Starting cube detection...', 'info');
      
      const result = await executeScript('inverse/cube_detection_dobot.py');
      
      if (result.success) {
        addLog('Cube detection completed', 'success');
        await loadDetectedPositions();
      } else {
        throw new Error(result.error || 'Cube detection failed');
      }
    } catch (error) {
      addLog(`Cube detection failed: ${error.message}`, 'error');
    } finally {
      setIsDetecting(false);
      updateStatus({ 
        isProcessing: false, 
        currentOperation: null, 
        cameraActive: false,
        colorDetectionActive: false 
      });
    }
  };

  const startColorDetectionProcess = async () => {
    try {
      updateStatus({ 
        currentOperation: 'Color Detection & Stack Process', 
        isProcessing: true,
        colorDetectionActive: true 
      });
      addLog('Starting color detection and stack process...', 'info');
      
      const result = await executeScript('color d&t/detectcolor.py');
      
      if (result.success) {
        addLog('Color detection and stack process completed', 'success');
        await loadCubeMatrices();
      } else {
        throw new Error(result.error || 'Process failed');
      }
    } catch (error) {
      addLog(`Color detection process failed: ${error.message}`, 'error');
    } finally {
      updateStatus({ 
        isProcessing: false, 
        currentOperation: null,
        colorDetectionActive: false 
      });
    }
  };

  const calculateHomography = async () => {
    try {
      updateStatus({ currentOperation: 'Calculating Homography Matrix', isProcessing: true });
      addLog('Calculating homography matrix...', 'info');
      
      const result = await executeScript('inverse/cam_to_dobot_matrix.npy');
      
      if (result.success) {
        addLog('Homography matrix calculated successfully', 'success');
      } else {
        throw new Error(result.error || 'Homography calculation failed');
      }
    } catch (error) {
      addLog(`Homography calculation failed: ${error.message}`, 'error');
    } finally {
      updateStatus({ isProcessing: false, currentOperation: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Detection Controls */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Camera className="h-6 w-6 mr-2 text-primary-600" />
          Cube Detection Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={startCubeDetection}
            disabled={isDetecting || status.isProcessing}
            className="btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Target className="h-5 w-5" />
            <span>Detect Cube Positions</span>
          </button>

          <button
            onClick={startColorDetectionProcess}
            disabled={status.isProcessing}
            className="btn-success flex items-center justify-center space-x-2 py-3"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Color Detection Process</span>
          </button>

          <button
            onClick={calculateHomography}
            disabled={status.isProcessing}
            className="btn-warning flex items-center justify-center space-x-2 py-3"
          >
            <MapPin className="h-5 w-5" />
            <span>Calculate Homography</span>
          </button>
        </div>

        {isDetecting && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse rounded-full h-3 w-3 bg-blue-600"></div>
              <span className="text-blue-800 font-medium">Detecting cube positions...</span>
            </div>
          </div>
        )}
      </div>

      {/* Detected Positions */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Target className="h-6 w-6 mr-2 text-primary-600" />
          Detected Positions
        </h3>

        {detectedPositions.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No positions detected yet</p>
            <p className="text-sm text-gray-400">Run cube detection to identify object positions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {detectedPositions.map((position, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Position {index + 1}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">X:</span>
                    <span className="ml-2 font-mono">{position[0]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Y:</span>
                    <span className="ml-2 font-mono">{position[1]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Z:</span>
                    <span className="ml-2 font-mono">{position[2]?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">R:</span>
                    <span className="ml-2 font-mono">{position[3]?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cube Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initial Matrix */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Cube Matrix</h3>
          {cubeMatrix.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No initial matrix detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cubeMatrix.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Position {index + 1}:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{color}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Matrix */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Cube Matrix</h3>
          {finalCubeMatrix.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No final matrix detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {finalCubeMatrix.map((color, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Position {index + 1}:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{color}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Detection Instructions</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>1. Cube Position Detection:</strong> Automatically detects and saves cube positions for robotic manipulation</p>
          <p><strong>2. Color Detection Process:</strong> Detects initial and final cube arrangements for stack planning</p>
          <p><strong>3. Homography Calculation:</strong> Calibrates camera-to-robot coordinate transformation</p>
        </div>
      </div>
    </div>
  );
};

export default CubeDetection;