import { PageType, DBtype } from '../db/db';

const getPageViewModel = (page: PageType) => {
  return { id: page.id, title: page.title, url: page.url };
};

export const pagesRepository = {
  findPageByTitle(db: DBtype, title: string) {
    let foundPages = db.pages;

    if (title) {
      foundPages = foundPages.filter((item) => item.title.indexOf(title) > -1);
    }

    return foundPages.map((page) => getPageViewModel(page));
  },

  findPageById(db: DBtype, id: string) {
    const foundPage = db.pages.find((item) => item.id === +id);

    if (!foundPage) {
      return null;
    }

    return getPageViewModel(foundPage);
  },

  createPage(db: DBtype, title: string) {
    const titleSpacesLength = title
      .split('')
      .filter((char: string) => char === ' ').length;
    // check string with spaces only
    const checkSpaces = title.length === titleSpacesLength;

    if (!title || title === '' || checkSpaces) {
      return null;
    }

    const createdPage = {
      id: +new Date(),
      url: 'unknown',
      title: title,
      users: 0,
    };

    db.pages.push(createdPage);

    return createdPage;
  },

  deletePage(db: DBtype, id: string) {
    const lengthDbPages = db.pages.length;
    db.pages = db.pages.filter((page) => page.id !== +id);

    if (lengthDbPages === db.pages.length) {
      return false;
    }

    return true;
  },

  changePage(db: DBtype, id: string, title: string) {
    if (!title) {
      return 'badRequest';
    }

    const foundPage = db.pages.find((item) => item.id === +id);
    if (!foundPage) {
      return 'notFound';
    }

    foundPage.title = title;

    return;
  },
};
