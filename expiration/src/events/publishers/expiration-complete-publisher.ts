import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@khushdeeptickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
