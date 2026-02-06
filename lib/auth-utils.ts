import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

/**
 * Get the current session on the server
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Require authentication and return the user ID
 * Throws an error if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  return {
    userId: session.user.id,
    user: session.user,
  }
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

/**
 * Compare a password with a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a random token for password reset or email verification
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Create a verification token in the database
 */
export async function createVerificationToken(email: string) {
  const token = generateToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify and consume a verification token
 */
export async function verifyToken(token: string, email: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  if (!verificationToken) {
    return { valid: false, error: "Invalid token" }
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })
    return { valid: false, error: "Token expired" }
  }

  // Delete the token after verification
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  return { valid: true }
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(email: string) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: `reset:${email}`,
    },
  })

  const token = generateToken()
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(token: string, email: string) {
  return await verifyToken(token, `reset:${email}`)
}
