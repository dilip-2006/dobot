import { useState, useCallback } from 'react';

export const useSystemStatus = () => {
  const [status, setStatus] = useState({
    robotConnected: false,
    cameraActive: false,
    colorDetectionActive: false,
    isProcessing: false,
    currentOperation: null,
    colorsTaught: 0,
    cubesDetected: 0,
    operationsComplete: 0
  });

  const [logs, setLogs] = useState([]);

  const updateStatus = useCallback((updates) => {
    setStatus(prev => ({ ...prev, ...updates }));
  }, []);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    status,
    logs,
    updateStatus,
    addLog,
    clearLogs
  };
};