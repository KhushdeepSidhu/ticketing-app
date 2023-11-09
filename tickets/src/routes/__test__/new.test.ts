import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.statusCode).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status of other than 401 if user is signed in', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .send({
      title: '',
      price: 34,
    })
    .set('Cookie', global.signin())
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .send({
      price: 3,
    })
    .set('Cookie', global.signin())
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .send({
      title: 'test',
      price: -12,
    })
    .set('Cookie', global.signin())
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  const title = 'test';
  const price = 12;
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .send({
      title,
      price,
    })
    .set('Cookie', global.signin());

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});
