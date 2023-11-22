import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@khushdeeptickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
