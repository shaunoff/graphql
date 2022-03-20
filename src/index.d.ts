import { Request } from 'express'

declare global {
  interface CustomRequest extends Request {
    cookies: Record<'fingerprint', string>
  }
}
