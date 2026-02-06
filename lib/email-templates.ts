/**
 * Email verification template
 */
export function getVerificationEmailTemplate(verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your TripTally account</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TripTally</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
          
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up for TripTally! To complete your registration and start planning your trips, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; font-size: 13px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin-bottom: 0;">
            If you didn't create a TripTally account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>TripTally - Plan your perfect trip</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Password reset email template
 */
export function getResetPasswordEmailTemplate(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your TripTally password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TripTally</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
          
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your TripTally password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; font-size: 13px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin-bottom: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>TripTally - Plan your perfect trip</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Welcome email template
 */
export function getWelcomeEmailTemplate(name: string): string {
  const displayName = name || "there"
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TripTally!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TripTally</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome to TripTally, ${displayName}! 🎉</h2>
          
          <p style="color: #666; font-size: 16px;">
            Your email has been verified and your account is ready to go. We're excited to help you plan your perfect trips!
          </p>
          
          <h3 style="color: #333; margin-top: 30px;">What you can do with TripTally:</h3>
          
          <ul style="color: #666; font-size: 15px; line-height: 1.8;">
            <li>Plan flight trips and road trips with detailed itineraries</li>
            <li>Track flights, transport, and lodging options</li>
            <li>Manage trip participants and split expenses</li>
            <li>Keep all your trip planning in one place</li>
          </ul>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.AUTH_URL || "http://localhost:3000"}/trips" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
              Start Planning Your Trip
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin-bottom: 0;">
            Need help? Just reply to this email and we'll be happy to assist you.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>TripTally - Plan your perfect trip</p>
        </div>
      </body>
    </html>
  `
}
