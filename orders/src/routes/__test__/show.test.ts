import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the order is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns a 401 if the order is not associated to the user', async () => {
  // Create a ticket
  const title = 'concert';
  const price = 20;
  const ticket = Ticket.build({
    title,
    price,
  });
  await ticket.save();

  // Create an order for user one
  const userOne = global.signin();

  // Create an order associated with the ticket
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Try to find the order created with user two
  const userTwo = global.signin();
  await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('returns the order if the order is found', async () => {
  // Create a ticket
  const title = 'concert';
  const price = 20;
  const ticket = Ticket.build({
    title,
    price,
  });
  await ticket.save();

  const user = global.signin();

  // Create an order associated with the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Fetch the order and do assertions
  const orderResponse = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(orderResponse.body.id).toEqual(order.id);
  expect(orderResponse.body.ticket.id).toEqual(ticket.id);
});
