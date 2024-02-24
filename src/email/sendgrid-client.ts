import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendGridClient {
  private logger: Logger;
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(mail): Promise<void> {
    await SendGrid.send(mail);
  }
}
