import { auth } from './firebase-admin'
import { prisma } from '@kairos/database'
import type { DecodedIdToken } from 'firebase-admin/auth'

export class AuthService {
  /**
   * Verify Firebase ID token and return decoded token
   */
  static async verifyToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const decodedToken = await auth.verifyIdToken(idToken)
      return decodedToken
    } catch (error) {
      console.error('Error verifying token:', error)
      throw new Error('Invalid authentication token')
    }
  }

  /**
   * Sync Firebase user to database
   */
  static async syncUser(uid: string) {
    try {
      // Get user from Firebase
      const firebaseUser = await auth.getUser(uid)

      // Upsert user in database
      const user = await prisma.user.upsert({
        where: { firebaseUid: uid },
        update: {
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          updatedAt: new Date(),
        },
        create: {
          firebaseUid: uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
        },
      })

      return user
    } catch (error) {
      console.error('Error syncing user:', error)
      throw new Error('Failed to sync user')
    }
  }

  /**
   * Get or create user from Firebase token
   */
  static async getOrCreateUser(decodedToken: DecodedIdToken) {
    const { uid } = decodedToken

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    })

    // If not, sync from Firebase
    if (!user) {
      user = await this.syncUser(uid)
    }

    return user
  }
}
