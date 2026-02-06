import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPasswordResetToken, hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json()

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Verify the token
    const verification = await verifyPasswordResetToken(token, email)

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Update the user's password
    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
