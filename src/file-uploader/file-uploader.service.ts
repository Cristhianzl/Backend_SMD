import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileUploaderService {
  tenant: string;

  AWS_S3_BUCKET = process.env.AWS_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }
  async uploadFile(file, id, type) {
    const uuidValue = uuid();

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      uuidValue,
      id,
      type,
    );
  }

  async s3_upload(file, bucket, name, id, type) {
    var data = {
      Body: file,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
      Bucket: bucket,
      Key: name,
    };

    try {
      let s3Response = await this.s3.upload(data).promise();
      if (s3Response) {
        if (type === 'item') {
          await this.dbConnection.query(
            `update ${this.tenant}.products set url_img = '${s3Response.Location}' where id = '${id}'`,
          );
        }

        if (type === 'tenant') {
          await this.dbConnection.query(
            `update public.tenants set tenant_img = '${s3Response.Location}' where tenant_name = '${this.tenant}'`,
          );
        }
      }
      return s3Response;
    } catch (e) {}
  }

  async deleteFile(url: string) {
    const key = url.split('/').pop();

    var params = { Bucket: process.env.AWS_BUCKET, Key: key };
    let s3Response = await this.s3.deleteObject(params).promise();
    return s3Response;
  }
}
