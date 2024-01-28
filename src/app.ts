import express, { Response } from 'express';
import { getPagesRouter } from './routes/pages';
import { getTestsRouter } from './routes/tests';
import { db } from './db/db';

export const app = express();

const jsonBodyMiddleware = express.json();

app.use(jsonBodyMiddleware);

app.use('/pages', getPagesRouter(db));
app.use('/__test__', getTestsRouter(db));
