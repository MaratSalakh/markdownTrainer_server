import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import { QueryPageModel } from '../models/QueryPageModel';
import { CreatePageModel } from '../models/CreatePageModel';
import { UpdatePageModel } from '../models/UpdatePageModel';
import { PageViewModel } from '../models/PageViewModel';
import { URIParamsPageModel } from '../models/URIParamsPageModel';
import express, { Response } from 'express';
import { DBtype, PageType } from '../db/db';
import { HTTP_STATUSES } from '../utils';

const getPageViewModel = (page: PageType) => {
  return { id: page.id, title: page.title, url: page.url };
};

export const getPagesRouter = (db: DBtype) => {
  const router = express.Router();

  router.get(
    '/',
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

  router.get(
    '/:id',
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

  router.post(
    '/',
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

  router.delete('/:id', (req: RequestWithParams<URIParamsPageModel>, res) => {
    const lengthDbPages = db.pages.length;
    db.pages = db.pages.filter((page) => page.id !== +req.params.id);

    if (lengthDbPages === db.pages.length) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  });

  router.put(
    '/:id',
    (
      req: RequestWithParamsAndBody<URIParamsPageModel, UpdatePageModel>,
      res
    ) => {
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

  return router;
};
