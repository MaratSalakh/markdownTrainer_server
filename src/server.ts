import express from 'express';
import fs from 'node:fs';

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

const db = {
  pages: [
    { id: 1, url: './pages/index.html', title: 'Main page' },
    { id: 2, url: './pages/shopPage.html', title: 'Shop page' },
  ],
};

app.get('/', async (request, res) => {
  const data = await fsp.readFile('./pages/index.html', 'utf-8');
  res.send(data);
});

app.get('/shop', async (request, res) => {
  const data = await fsp.readFile('./pages/shopPage.html', 'utf-8');
  res.send(data);
});

app.get('/pages', (req, res) => {
  let foundPages = db.pages;

  if (req.query.title) {
    foundPages = foundPages.filter(
      (item) => item.title.indexOf(req.query.title as string) > -1
    );
  }

  res.json(foundPages);
});

app.get('/pages/:id', (req, res) => {
  const foundPage = db.pages.find((item) => item.id === +req.params.id);

  if (!foundPage) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  res.json(foundPage);
});

app.post('/pages', (req, res) => {
  const titleSpacesLength = req.body.title
    .split('')
    .filter((char: string) => char === ' ');
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
});

app.delete('/pages/:id', (req, res) => {
  const lengthDbPages = db.pages.length;
  db.pages = db.pages.filter((page) => page.id !== +req.params.id);

  if (lengthDbPages === db.pages.length) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});

app.put('/pages/:id', (req, res) => {
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
});

app.delete('/__test__/data', (req, res) => {
  db.pages = [];
  res.sendStatus(201);
});

app.listen(port, () => {
  console.log(`listen port ${port}`);
});
