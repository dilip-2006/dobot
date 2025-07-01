import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Path to the Python project directory
const PYTHON_PROJECT_PATH = path.join(__dirname, '..', 'demo-magician-python-64-master', 'demo-magician-python-64-master');

// Execute Python script
app.post('/api/execute', async (req, res) => {
  const { scriptPath } = req.body;
  
  if (!scriptPath) {
    return res.status(400).json({ success: false, error: 'Script path is required' });
  }

  try {
    const fullScriptPath = path.join(PYTHON_PROJECT_PATH, scriptPath);
    
    // Check if script exists
    if (!fs.existsSync(fullScriptPath)) {
      return res.status(404).json({ success: false, error: 'Script not found' });
    }

    console.log(`Executing script: ${fullScriptPath}`);

    const pythonProcess = spawn('python', [fullScriptPath], {
      cwd: PYTHON_PROJECT_PATH,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          success: true, 
          output: stdout,
          message: 'Script executed successfully'
        });
      } else {
        res.json({ 
          success: false, 
          error: stderr || `Script exited with code ${code}`,
          output: stdout
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      res.json({ 
        success: false, 
        error: `Failed to execute script: ${error.message}`
      });
    });

  } catch (error) {
    console.error('Script execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get taught colors
app.get('/api/colors', (req, res) => {
  try {
    const colorsPath = path.join(PYTHON_PROJECT_PATH, 'color d&t', 'taught_colors.json');
    
    if (fs.existsSync(colorsPath)) {
      const colorsData = fs.readFileSync(colorsPath, 'utf8');
      res.json(JSON.parse(colorsData));
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error reading colors:', error);
    res.status(500).json({ error: 'Failed to read colors data' });
  }
});

// Get cube positions
app.get('/api/positions', (req, res) => {
  try {
    const positionsPath = path.join(PYTHON_PROJECT_PATH, 'inverse', 'detected_positions.json');
    
    if (fs.existsSync(positionsPath)) {
      const positionsData = fs.readFileSync(positionsPath, 'utf8');
      const positions = JSON.parse(positionsData);
      // Ensure it's an array of positions
      res.json(Array.isArray(positions) ? [positions] : []);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading positions:', error);
    res.status(500).json({ error: 'Failed to read positions data' });
  }
});

// Get cube matrices
app.get('/api/matrices', (req, res) => {
  try {
    const initialMatrixPath = path.join(PYTHON_PROJECT_PATH, 'color d&t', 'cube_matrix.json');
    const finalMatrixPath = path.join(PYTHON_PROJECT_PATH, 'color d&t', 'final_cube_matrix.json');
    
    let initialMatrix = [];
    let finalMatrix = [];
    
    if (fs.existsSync(initialMatrixPath)) {
      const initialData = fs.readFileSync(initialMatrixPath, 'utf8');
      initialMatrix = JSON.parse(initialData);
    }
    
    if (fs.existsSync(finalMatrixPath)) {
      const finalData = fs.readFileSync(finalMatrixPath, 'utf8');
      finalMatrix = JSON.parse(finalData);
    }
    
    res.json({ initial: initialMatrix, final: finalMatrix });
  } catch (error) {
    console.error('Error reading matrices:', error);
    res.status(500).json({ error: 'Failed to read matrices data' });
  }
});

// Robot status endpoint
app.get('/api/robot/status', (req, res) => {
  // This would need to be implemented to check actual robot connection
  // For now, return a mock status
  res.json({
    connected: true,
    position: { x: 0, y: 0, z: 0, r: 0 },
    status: 'ready'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Python project path: ${PYTHON_PROJECT_PATH}`);
});