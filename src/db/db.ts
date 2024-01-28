export type PageType = {
  id: number;
  url: string;
  title: string;
  users: number;
};

export type DBtype = { pages: PageType[] };

export const db: DBtype = {
  pages: [
    { id: 1, url: './pages/index.html', title: 'Main page', users: 10 },
    { id: 2, url: './pages/shopPage.html', title: 'Shop page', users: 10 },
  ],
};
