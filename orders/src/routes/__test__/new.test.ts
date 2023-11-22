import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({});

  expect(response.statusCode).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/orders').send({}).expect(401);
});

it('returns a status of other than 401 if user is signed in', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid ticket id is provided', async () => {
  await request(app)
    .post('/api/orders')
    .send({
      ticketId: '',
    })
    .set('Cookie', global.signin())
    .expect(400);
});

it('returns an error if ticket does not exist', async () => {
  await request(app)
    .post('/api/orders')
    .send({
      ticketId: new mongoose.Types.ObjectId(),
    })
    .set('Cookie', global.signin())
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  // Create a ticket in the database
  const ticket = Ticket.build({
    title: 'Semi-Final',
    price: 100,
  });
  await ticket.save();

  // Create an order for that ticket in the database
  const order = Order.build({
    userId: 'dfjdlkfjs',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // Create an order for the same ticket again
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it('reserves a ticket', async () => {
  // Create a ticket in the database
  const ticket = Ticket.build({
    title: 'Semi-Final',
    price: 100,
  });
  await ticket.save();

  // Create an order for the ticket
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      userId: 'dfjdlkfjs',
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticketId: ticket.id,
    })
    .expect(201);
});

it('emit an order created event', async () => {
  // Create a ticket in the database
  const ticket = Ticket.build({
    title: 'Semi-Final',
    price: 100,
  });
  await ticket.save();

  // Create an order for the ticket
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      userId: 'dfjdlkfjs',
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
