import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signupRouter } from './routes/signup';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { errorHandler, NotFoundError } from '@khushdeeptickets/common';

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

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
