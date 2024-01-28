import { DBtype } from '../db/db';
import express, { Express } from 'express';

export const getTestsRouter = (db: DBtype) => {
  const router = express.Router();

  router.delete('/data', (req, res) => {
    db.pages = [];
    res.sendStatus(201);
  });

  return router;
};
