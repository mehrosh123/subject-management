import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import subjectRouter from './routes/subject.js';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.use('/api/subjects', subjectRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello! Your TypeScript Express server is running',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});