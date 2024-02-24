import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendGridClient {
  private logger: Logger;
  constructor() {
    SendGrid.setApiKey(
      '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',
    );
  }

  async send(mail): Promise<void> {
    await SendGrid.send(mail);
  }
}
