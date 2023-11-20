import {
  TicketUpdatedEvent,
  Publisher,
  Subjects,
} from '@khushdeeptickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
