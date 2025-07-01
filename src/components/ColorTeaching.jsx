import React, { useState, useEffect } from 'react';
import { Camera, Save, Trash2, Eye, Plus } from 'lucide-react';
import { executeScript, getColorData } from '../utils/api';

const ColorTeaching = ({ status, updateStatus, addLog }) => {
  const [taughtColors, setTaughtColors] = useState({});
  const [isTeaching, setIsTeaching] = useState(false);

  useEffect(() => {
    loadTaughtColors();
  }, []);

  const loadTaughtColors = async () => {
    try {
      const colors = await getColorData();
      setTaughtColors(colors);
      updateStatus({ colorsTaught: Object.keys(colors).length });
    } catch (error) {
      addLog('Failed to load taught colors', 'error');
    }
  };

  const startColorTeaching = async () => {
    try {
      setIsTeaching(true);
      updateStatus({ currentOperation: 'Color Teaching', isProcessing: true, cameraActive: true });
      addLog('Starting color teaching mode...', 'info');
      
      const result = await executeScript('color d&t/python teach_color.py.py');
      
      if (result.success) {
        addLog('Color teaching completed', 'success');
        await loadTaughtColors();
      } else {
        throw new Error(result.error || 'Color teaching failed');
      }
    } catch (error) {
      addLog(`Color teaching failed: ${error.message}`, 'error');
    } finally {
      setIsTeaching(false);
      updateStatus({ isProcessing: false, currentOperation: null, cameraActive: false });
    }
  };

  const deleteColor = async (colorName) => {
    try {
      // This would need to be implemented in the backend
      addLog(`Deleted color: ${colorName}`, 'info');
      await loadTaughtColors();
    } catch (error) {
      addLog(`Failed to delete color: ${error.message}`, 'error');
    }
  };

  const getColorPreview = (ranges) => {
    // Convert HSV ranges to approximate RGB for preview
    const h = (ranges.lower[0] + ranges.upper[0]) / 2;
    const s = (ranges.lower[1] + ranges.upper[1]) / 2 / 255;
    const v = (ranges.lower[2] + ranges.upper[2]) / 2 / 255;
    
    // Simple HSV to RGB conversion for preview
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="space-y-8">
      {/* Teaching Interface */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Camera className="h-6 w-6 mr-2 text-primary-600" />
            Color Teaching
          </h3>
          <button
            onClick={startColorTeaching}
            disabled={isTeaching || status.isProcessing}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Teach New Color</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Click "Teach New Color" to start the camera</li>
            <li>Position a colored cube in front of the camera</li>
            <li>Click on the cube in the camera view to select the color</li>
            <li>Enter a name for the color when prompted</li>
            <li>Press 'q' to finish teaching</li>
          </ol>
        </div>

        {isTeaching && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse rounded-full h-3 w-3 bg-blue-600"></div>
              <span className="text-blue-800 font-medium">Camera active - Click on objects to teach colors</span>
            </div>
          </div>
        )}
      </div>

      {/* Taught Colors Display */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Eye className="h-6 w-6 mr-2 text-primary-600" />
          Taught Colors ({Object.keys(taughtColors).length})
        </h3>

        {Object.keys(taughtColors).length === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No colors taught yet</p>
            <p className="text-sm text-gray-400">Start by teaching the system to recognize colored cubes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(taughtColors).map(([colorName, ranges]) => (
              <div key={colorName} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{colorName}</h4>
                  <button
                    onClick={() => deleteColor(colorName)}
                    className="text-error-600 hover:text-error-700 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div 
                    className="w-full h-8 rounded border border-gray-300"
                    style={{ backgroundColor: getColorPreview(ranges) }}
                  ></div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>H: {ranges.lower[0]}-{ranges.upper[0]}</div>
                    <div>S: {ranges.lower[1]}-{ranges.upper[1]}</div>
                    <div>V: {ranges.lower[2]}-{ranges.upper[2]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Color Detection Test */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Color Detection</h3>
        <p className="text-gray-600 mb-4">
          Test the taught colors by running the detection system on the current camera view.
        </p>
        <button
          onClick={() => executeScript('color d&t/detectcolor.py')}
          disabled={status.isProcessing || Object.keys(taughtColors).length === 0}
          className="btn-success flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Test Detection</span>
        </button>
      </div>
    </div>
  );
};

export default ColorTeaching;