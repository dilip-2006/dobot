import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Trash2 } from 'lucide-react';

const LogPanel = ({ logs }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-success-600';
      case 'error': return 'text-error-600';
      case 'warning': return 'text-warning-600';
      default: return 'text-blue-600';
    }
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dobot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Terminal className="h-6 w-6 mr-2 text-primary-600" />
          System Logs
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs yet. System operations will appear here.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 text-xs mt-0.5 min-w-0 flex-shrink-0">
                  {log.timestamp}
                </span>
                <span className="text-xs mt-0.5">{getLogIcon(log.type)}</span>
                <span className={`${getLogColor(log)} flex-1 min-w-0 break-words`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPanel;