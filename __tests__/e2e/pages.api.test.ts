import request from 'supertest';

import { app, HTTP_STATUSES } from '../../src/server';

describe('/pages', () => {
  beforeAll(async () => {
    await request(app).delete('/__test__/data');
  });

  it('should return 200 and empty array', async () => {
    await request(app).get('/pages').expect(HTTP_STATUSES.OK_200, []);
  });

  it('should return 404 for no existing page', async () => {
    await request(app).get('/pages/1').expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`shouldn't create page with incorrect unput data`, async () => {
    await request(app)
      .post('/pages')
      .send({ title: '' })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app).get('/pages').expect(HTTP_STATUSES.OK_200, []);
  });

  let createdPage1: any = null;
  it(`should create page with correct unput data`, async () => {
    const createdResponse = await request(app)
      .post('/pages')
      .send({ title: 'Cart page' })
      .expect(HTTP_STATUSES.CREATED_201);

    createdPage1 = createdResponse.body;

    expect(createdPage1).toEqual({
      id: expect.any(Number),
      title: 'Cart page',
      url: 'unknown',
    });

    await request(app)
      .get('/pages/' + createdPage1.id)
      .expect(HTTP_STATUSES.OK_200, createdPage1);
  });

  let createdPage2: any = null;
  it(`should create second page with correct unput data`, async () => {
    const createdResponse = await request(app)
      .post('/pages')
      .send({ title: 'Cart page 2' })
      .expect(HTTP_STATUSES.CREATED_201);

    createdPage2 = createdResponse.body;

    expect(createdPage2).toEqual({
      id: expect.any(Number),
      title: 'Cart page 2',
      url: 'unknown',
    });

    await request(app)
      .get('/pages/')
      .expect(HTTP_STATUSES.OK_200, [createdPage1, createdPage2]);
  });

  it(`shouldn't update not existing page`, async () => {
    await request(app)
      .put('/pages/-100')
      .send({ title: 'good title' })
      .expect(HTTP_STATUSES.NOT_FOUND_404);
  });

  it(`should update existing page`, async () => {
    await request(app)
      .put('/pages/' + createdPage1.id)
      .send({ title: 'good new title' })
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/pages/' + createdPage1.id)
      .expect(HTTP_STATUSES.OK_200, {
        ...createdPage1,
        title: 'good new title',
      });

    await request(app)
      .get('/pages/' + createdPage2.id)
      .expect(HTTP_STATUSES.OK_200, createdPage2);
  });

  it(`should delete both pages`, async () => {
    await request(app)
      .delete('/pages/' + createdPage1.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/pages/' + createdPage1.id)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app)
      .delete('/pages/' + createdPage2.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/pages/' + createdPage2.id)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app).get('/pages/').expect(HTTP_STATUSES.OK_200, []);
  });
});
