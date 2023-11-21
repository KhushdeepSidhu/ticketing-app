import express, { Request, Response } from 'express';
import { natsWrapper } from '../nats-wrapper';

// Middlewares

const router = express.Router();

router.post('/api/orders', async (req: Request, res: Response) => {
  res.status(201).send({});
});

export { router as createOrderRouter };
