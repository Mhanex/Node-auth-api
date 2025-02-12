import { 
  VERIFICATION_EMAIL_TEMPLATE, 
  CONGRATULATORY_EMAIL_TEMPLATE, 
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE
 } from './emailTemplates.js';
import { mailClient, sender } from './mailtrapConfiguration.js'

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [ {email} ]

  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification"
    });

    console.log("Email sent successfully", response);
  } catch (error) {
     console.error('Error sending veification code', error);

     throw new Error(`Error sending verification email: ${error}`);
  }

}

export const sendCongratulatoryEmail = async (email, name) => {
  const recipient = [ { email } ]
  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: "Account Verified Successfully",
      html: CONGRATULATORY_EMAIL_TEMPLATE.replace("{name}", name),
      category: "Account Verification Confirmed"
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
     console.error('Error sending welcome email', error);

     throw new Error(`Error sending welcome email: ${error}`);
  }

}

export const sendPasswordResetEmail = async (email, name, resetURL) => {
  const recipient = [ { email } ]
  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE
      .replace("{resetURL}", resetURL)
      .replace("{name}", name),
      category: "Password Reset"
    });

    console.log("Reset link sent successfully", response);
  } catch (error) {
     console.error('Error sending welcome email', error);

     throw new Error(`Error sending welcome email: ${error}`);
  }
}

export const sendPasswordResetSuccessEmail = async (email, name) => {
  const recipient = [ { email } ]
  try {
    const response = await mailClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{name}", name),
      category: "Password Reset Successful"
    });

    console.log("Password was reset successfully", response);
  } catch (error) {
     console.error('Error sending welcome email', error);

     throw new Error(`Error sending welcome email: ${error}`);
  }
}