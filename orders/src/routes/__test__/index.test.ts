import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    title,
    price,
  });
  await ticket.save();

  return ticket;
};

it.only('fetches orders for an particular user', async () => {
  // Create three tickets
  const championsLeagueTicket = await buildTicket('Champions League', 50);
  const premierLeagueTicket = await buildTicket('Premier League', 40);
  const ligueOneTicket = await buildTicket('Ligue 1', 20);

  const khushdeep = global.signin();
  const alex = global.signin();

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', alex)
    .send({ ticketId: ligueOneTicket.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', khushdeep)
    .send({ ticketId: championsLeagueTicket.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', khushdeep)
    .send({ ticketId: premierLeagueTicket.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', khushdeep)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(championsLeagueTicket.id);
  expect(response.body[1].ticket.id).toEqual(premierLeagueTicket.id);
});
