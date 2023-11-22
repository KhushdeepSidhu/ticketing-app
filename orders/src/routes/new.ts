import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@khushdeeptickets/common';
import { body } from 'express-validator';
import { natsWrapper } from '../nats-wrapper';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

// Middlewares

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket in the database which the user is trying to reserve.
    const ticket = await Ticket.findById(ticketId);

    // If the ticket is not found throw a not found error.
    if (!ticket) {
      throw new NotFoundError();
    }

    // Check if the ticket is already reserved
    // if we already have an order in the database which is associated with
    // the ticket, user is trying to reserve, and it doesn't have a status of
    // cancelled then the ticket is already reserved and we throw a bad request
    // error
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build an order and send it to the user
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish an order created event to NATS
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      status: OrderStatus.Created, // why we can't use order.status ??
      expiresAt: order.expiresAt.toISOString(), // UTC time stamp
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
