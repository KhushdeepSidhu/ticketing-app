import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@khushdeeptickets/common';
import { currentUser } from '@khushdeeptickets/common';

import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());

/**
 * 'signed: false' --> disable encryption on this cookie. We're not going to
 *  worry about someone peeking into this thing or anything like that because
 *  the JSON web token itself is already encrypted.
 *
 * 'secure: true' --> cookies will only be used if a user is visiting our
 *  application over an HTTPS connection.
 */

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
