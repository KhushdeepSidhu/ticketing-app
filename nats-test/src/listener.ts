import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName('accountings-service');

  const subscription = stan.subscribe(
    'ticket:created',
    'queue-group-name',
    options
  );

  subscription.on('message', (msg: Message) => {
    const data = msg.getData();

    console.log(`Received event #${msg.getSequence()} with data: ${data}`);

    msg.ack();
  });
});

process.on('SIGINT', () => {
  console.log(
    'Sending request to NATS streaming server to close the client using SIGINT'
  );
  stan.close();
});
process.on('SIGTERM', () => {
  console.log(
    'Sending request to NATS streaming server to close the client using SIGTERM'
  );
  stan.close();
});
