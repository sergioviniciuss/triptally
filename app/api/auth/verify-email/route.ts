import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth-utils"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-verification-link", request.url)
    )
  }

  // Verify the token
  const verification = await verifyToken(token, email)

  if (!verification.valid) {
    return NextResponse.redirect(
      new URL(`/login?error=${verification.error}`, request.url)
    )
  }

  // Update user's emailVerified field
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=user-not-found", request.url)
    )
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  // Send welcome email (don't await, let it happen in background)
  sendWelcomeEmail(email, user.name || "")

  return NextResponse.redirect(
    new URL("/login?verified=true", request.url)
  )
}
