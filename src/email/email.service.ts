import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';

@Injectable()
export class EmailService {
  constructor(private readonly sendGridClient: SendGridClient) {}

  async sendTestEmail(
    recipient: string,
    body = 'This is a test mail',
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      from: 'noreply@domain.com', //Approved sender ID in Sendgrid
      subject: 'Test email',
      content: [{ type: 'text/plain', value: body }],
    };
    await this.sendGridClient.send(mail);
  }

  async sendEmailWithTemplate(recipient: string, body: string): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      cc: 'contatomeumenud@gmail.com', //Assuming you want to send a copy to this email
      from: 'contatomeumenud@gmail.com', //Approved sender ID in Sendgrid
      subject: 'Email de recuperação de senha',
      templateId: 'd-78fee0e5c74a4c87b8650bd2a85f1618', //Retrieve from config service or environment variable
      dynamicTemplateData: {
        link: `http://localhost:5174/change-password/${body}`,
        subject: 'Email de recuperação de senha',
      }, //The data to be used in the template
    };
    try {
      await this.sendGridClient.send(mail);
    } catch (e) {
      throw new HttpException(
        'Ocorreu um erro ao enviar email.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
