import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'Premier League',
    price: 25,
    userId: '123',
  });

  // Save the ticket
  await ticket.save();

  // Fetch two copies of ticket
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 35 });
  secondInstance!.set({ price: 45 });

  // save the first ticket
  await firstInstance!.save();

  // save the second ticket
  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
