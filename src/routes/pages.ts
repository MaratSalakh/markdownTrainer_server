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
import { DBtype } from '../db/db';
import { HTTP_STATUSES } from '../utils';
import { pagesRepository } from '../repositories/pages-repository';
import { body, validationResult } from 'express-validator';
import { inputValidatonMiddleware } from '../middlewares/input-validation-middleware';

export const getPagesRouter = (db: DBtype) => {
  const router = express.Router();

  router.get(
    '/',
    (req: RequestWithQuery<QueryPageModel>, res: Response<PageViewModel[]>) => {
      const pages = pagesRepository.findPageByTitle(db, req.query.title);
      res.json(pages);
    }
  );

  router.get(
    '/:id',
    (
      req: RequestWithParams<URIParamsPageModel>,
      res: Response<PageViewModel>
    ) => {
      const foundPage = pagesRepository.findPageById(db, req.params.id);

      if (!foundPage) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      res.json(foundPage);
    }
  );

  const titleValidation = body('title').trim().isLength({ min: 3, max: 30 });

  router.post(
    '/',
    titleValidation,
    inputValidatonMiddleware,
    (req: RequestWithBody<CreatePageModel>, res: Response<PageViewModel>) => {
      const newPage = pagesRepository.createPage(db, req.body.title);
      if (!newPage) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
        return;
      }

      res.status(HTTP_STATUSES.CREATED_201).json({
        id: newPage.id,
        title: newPage.title,
        url: newPage.url,
      });
    }
  );

  router.delete('/:id', (req: RequestWithParams<URIParamsPageModel>, res) => {
    const isDeletePage = pagesRepository.deletePage(db, req.params.id);

    if (!isDeletePage) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  });

  router.put(
    '/:id',
    titleValidation,
    inputValidatonMiddleware,
    (
      req: RequestWithParamsAndBody<URIParamsPageModel, UpdatePageModel>,
      res
    ) => {
      const changeResult = pagesRepository.changePage(
        db,
        req.params.id,
        req.body.title
      );

      if (!changeResult) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
  );

  return router;
};
