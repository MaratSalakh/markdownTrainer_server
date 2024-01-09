import express from 'express';
import fs from 'node:fs';

const { promises: fsp } = fs;

const app = express();
const port = 3000;

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

app.post('/pages', (req, res) => {
  if (!req.body.title) {
    res.sendStatus(400);
    return;
  }

  const createdPage = {
    id: +new Date(),
    url: 'unknown',
    title: req.body.title,
  };

  db.pages.push(createdPage);

  res.json(createdPage);
});

app.get('/pages/:id', (req, res) => {
  const foundPage = db.pages.find((item) => item.id === +req.params.id);

  if (!foundPage) {
    res.sendStatus(404);
    return;
  }

  res.json(foundPage);
});

app.listen(port, () => {
  console.log(`listen port ${port}`);
});
