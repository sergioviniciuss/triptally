import nodemailer from "nodemailer"
import {
  getVerificationEmailTemplate,
  getResetPasswordEmailTemplate,
  getWelcomeEmailTemplate,
} from "./email-templates"

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

/**
 * Send a verification email to a new user
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  const html = getVerificationEmailTemplate(verificationUrl)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "TripTally <noreply@triptally.com>",
      to: email,
      subject: "Verify your TripTally account",
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  const html = getResetPasswordEmailTemplate(resetUrl)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "TripTally <noreply@triptally.com>",
      to: email,
      subject: "Reset your TripTally password",
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Send a welcome email after email verification
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const html = getWelcomeEmailTemplate(name)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "TripTally <noreply@triptally.com>",
      to: email,
      subject: "Welcome to TripTally!",
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error: "Failed to send email" }
  }
}
