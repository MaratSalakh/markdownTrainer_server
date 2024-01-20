import express, { Request, Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';
import { QueryPageModel } from './models/QueryPageModel';
import { CreatePageModel } from './models/CreatePageModel';
import { UpdatePageModel } from './models/UpdatePageModel';
import { PageViewModel } from './models/PageViewModel';
import { URIParamsPageModel } from './models/URIParamsPageModel';

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
  users: number;
};

const db: { pages: PageType[] } = {
  pages: [
    { id: 1, url: './pages/index.html', title: 'Main page', users: 10 },
    { id: 2, url: './pages/shopPage.html', title: 'Shop page', users: 10 },
  ],
};

const getPageViewModel = (page: PageType) => {
  return { id: page.id, title: page.title, url: page.url };
};

app.get(
  '/pages',
  (req: RequestWithQuery<QueryPageModel>, res: Response<PageViewModel[]>) => {
    let foundPages = db.pages;

    if (req.query.title) {
      foundPages = foundPages.filter(
        (item) => item.title.indexOf(req.query.title) > -1
      );
    }

    res.json(foundPages.map((page) => getPageViewModel(page)));
  }
);

app.get(
  '/pages/:id',
  (
    req: RequestWithParams<URIParamsPageModel>,
    res: Response<PageViewModel>
  ) => {
    const foundPage = db.pages.find((item) => item.id === +req.params.id);

    if (!foundPage) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    res.json(getPageViewModel(foundPage));
  }
);

app.post(
  '/pages',
  (req: RequestWithBody<CreatePageModel>, res: Response<PageViewModel>) => {
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
      users: 0,
    };

    db.pages.push(createdPage);

    res.status(HTTP_STATUSES.CREATED_201).json({
      id: createdPage.id,
      title: createdPage.title,
      url: createdPage.url,
    });
  }
);

app.delete('/pages/:id', (req: RequestWithParams<URIParamsPageModel>, res) => {
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
  (req: RequestWithParamsAndBody<URIParamsPageModel, UpdatePageModel>, res) => {
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
