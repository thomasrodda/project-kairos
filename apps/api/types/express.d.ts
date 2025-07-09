import type { User } from '@kairos/database'

declare global {
  namespace Express {
    interface Request {
      user?: User
      firebaseUid?: string
    }
  }
}

export {}
