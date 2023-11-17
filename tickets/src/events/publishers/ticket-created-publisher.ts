import {
  TicketCreatedEvent,
  Publisher,
  Subjects,
} from '@khushdeeptickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
