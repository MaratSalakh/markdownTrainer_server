import express, { Request, Response } from 'express';
import fs from 'node:fs';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';
import { QueryPageModel } from './models/QueryPageModel';
import { CreatePageModel } from './models/CreatePageModel';
import { UpdatePageModel } from './models/UpdatePageModel';

const { promises: fsp } = fs;

export const app = express();
const port = 3000;

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
};

const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

type PageType = {
  id: number;
  url: string;
  title: string;
};

const db: { pages: PageType[] } = {
  pages: [
    { id: 1, url: './pages/index.html', title: 'Main page' },
    { id: 2, url: './pages/shopPage.html', title: 'Shop page' },
  ],
};

app.get('/', async (req, res: Response<string>) => {
  const data = await fsp.readFile('./pages/index.html', 'utf-8');
  res.send(data);
});

app.get('/shop', async (req, res: Response<string>) => {
  const data = await fsp.readFile('./pages/shopPage.html', 'utf-8');
  res.send(data);
});

app.get(
  '/pages',
  (req: RequestWithQuery<QueryPageModel>, res: Response<PageType[]>) => {
    let foundPages = db.pages;

    if (req.query.title) {
      foundPages = foundPages.filter(
        (item) => item.title.indexOf(req.query.title) > -1
      );
    }

    res.json(foundPages);
  }
);

app.get('/pages/:id', (req: RequestWithParams<{ id: string }>, res) => {
  const foundPage = db.pages.find((item) => item.id === +req.params.id);

  if (!foundPage) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  res.json(foundPage);
});

app.post(
  '/pages',
  (req: RequestWithBody<CreatePageModel>, res: Response<PageType>) => {
    const titleSpacesLength = req.body.title
      .split('')
      .filter((char: string) => char === ' ').length;
    // check string with spaces only
    const checkSpaces = req.body.title.length === titleSpacesLength;

    if (!req.body.title || req.body.title === '' || checkSpaces) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      return;
    }

    const createdPage = {
      id: +new Date(),
      url: 'unknown',
      title: req.body.title,
    };

    db.pages.push(createdPage);

    res.status(HTTP_STATUSES.CREATED_201).json(createdPage);
  }
);

app.delete('/pages/:id', (req: RequestWithParams<{ id: string }>, res) => {
  const lengthDbPages = db.pages.length;
  db.pages = db.pages.filter((page) => page.id !== +req.params.id);

  if (lengthDbPages === db.pages.length) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

app.put(
  '/pages/:id',
  (req: RequestWithParamsAndBody<{ id: string }, UpdatePageModel>, res) => {
    if (!req.body.title) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      return;
    }

    const foundPage = db.pages.find((item) => item.id === +req.params.id);
    if (!foundPage) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    foundPage.title = req.body.title;

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  }
);

app.delete('/__test__/data', (req, res) => {
  db.pages = [];
  res.sendStatus(201);
});

app.listen(port, () => {
  console.log(`listen port ${port}`);
});
