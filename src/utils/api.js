const API_BASE = '/api';

export const executeScript = async (scriptPath) => {
  try {
    const response = await fetch(`${API_BASE}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scriptPath }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Script execution error:', error);
    return { success: false, error: error.message };
  }
};

export const getColorData = async () => {
  try {
    const response = await fetch(`${API_BASE}/colors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch color data:', error);
    return {};
  }
};

export const getCubePositions = async () => {
  try {
    const response = await fetch(`${API_BASE}/positions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch cube positions:', error);
    return [];
  }
};

export const getRobotStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/robot/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch robot status:', error);
    return { connected: false };
  }
};