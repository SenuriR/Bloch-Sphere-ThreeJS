import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.post('/simulate', (req, res) => {
  const { circuit } = req.body;
  const python = spawn('python3', [path.join(__dirname, 'quantum/qiskit_runner.py')]);

  python.stdin.write(JSON.stringify({ circuit }));
  python.stdin.end();

  let data = '';
  python.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  python.stderr.on('data', (err) => {
    console.error('Python error:', err.toString());
  });

  python.on('close', (code) => {
    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse simulation output.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
