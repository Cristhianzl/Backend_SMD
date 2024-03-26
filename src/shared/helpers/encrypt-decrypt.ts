import { createCipheriv, createDecipheriv, createHash } from 'crypto';
const passwordEncryption: string = 'hashkeymmd';

const encryptMethod: string = 'aes-256-cbc';
const key: string = createHash('sha512')
  .update(passwordEncryption, 'utf-8')
  .digest('hex')
  .substring(0, 32);
const iv = createHash('sha512')
  .update(passwordEncryption, 'utf-8')
  .digest('hex')
  .substring(0, 16);
export const decrypt = (encryptedText: string) => {
  const buff = Buffer.from(encryptedText, 'base64');
  encryptedText = buff.toString('utf-8');
  const decryptor = createDecipheriv(encryptMethod, key, iv);
  const decryptedText =
    decryptor.update(encryptedText, 'base64', 'utf-8') +
    decryptor.final('utf-8');

  return decryptedText;
};

export const encrypt = () => {
  return createCipheriv(encryptMethod, key, iv);
};
