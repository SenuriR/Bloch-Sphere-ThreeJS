// backend/index.js
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

app.post('/simulate', (req, res) => {
  const circuit = req.body.circuit || [];
  const py = spawn('python3', [path.join(__dirname, 'quantum', 'pennylane_runner.py')]);
  let result = '';
  let error = '';

  py.stdout.on('data', data => result += data);
  py.stderr.on('data', data => error += data);

  py.on('close', () => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Python stderr:', error);
      res.status(500).json({ error: 'Failed to parse simulation output.' });
    }
  });

  py.stdin.write(JSON.stringify({ circuit }));
  py.stdin.end();
});

app.post('/circuit-diagram', (req, res) => {
  const circuit = req.body.circuit || [];
  const py = spawn('python3', [path.join(__dirname, 'quantum', 'circuit_diagram.py')]);
  let result = '';
  let error = '';

  py.stdout.on('data', data => result += data);
  py.stderr.on('data', data => error += data);

  py.on('close', () => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Python stderr:', error);
      res.status(500).json({ error: 'Failed to parse diagram output.' });
    }
  });

  py.stdin.write(JSON.stringify({ circuit }));
  py.stdin.end();
});

app.post('/state-evolution', (req, res) => {
  const circuit = req.body.circuit || [];
  const py = spawn('python3', [path.join(__dirname, 'quantum', 'statevector_evolution.py')]);

  let result = '', error = '';
  py.stdout.on('data', data => result += data);
  py.stderr.on('data', data => error += data);

  py.on('close', () => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Python stderr:', error);
      res.status(500).json({ error: 'Failed to parse state evolution output.' });
    }
  });

  py.stdin.write(JSON.stringify({ circuit }));
  py.stdin.end();
});


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
