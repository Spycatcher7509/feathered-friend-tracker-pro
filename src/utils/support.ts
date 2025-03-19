
export const generateCaseNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `BW-${year}${month}${day}-${random}`
}

export const generateSupportEmailContent = (caseNumber: string, userEmail: string, issueDescription: string) => ({
  supportEmail: {
    subject: `BirdWatch Issue Report - Case ${caseNumber}`,
    text: `Issue Report from ${userEmail}:\nCase Number: ${caseNumber}\n\n${issueDescription}`,
    html: `
      <h2>BirdWatch Issue Report - Case ${caseNumber}</h2>
      <p><strong>Case Number:</strong> ${caseNumber}</p>
      <p><strong>Reporter Email:</strong> ${userEmail}</p>
      <p><strong>Issue Description:</strong></p>
      <p>${issueDescription}</p>
    `
  },
  userEmail: {
    subject: `BirdWatch Support - Issue Received (Case ${caseNumber})`,
    text: `
Dear BirdWatch User,

Thank you for contacting BirdWatch Support. This email confirms that we have received your issue report.

Case Number: ${caseNumber}

Your reported issue:
${issueDescription}

We will review your case and respond as soon as possible. Please keep this case number for future reference.

Best regards,
The BirdWatch Support Team
    `,
    html: `
      <h2>BirdWatch Support - Issue Received</h2>
      <p>Dear BirdWatch User,</p>
      <p>Thank you for contacting BirdWatch Support. This email confirms that we have received your issue report.</p>
      <p><strong>Case Number:</strong> ${caseNumber}</p>
      <p><strong>Your reported issue:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ccc;">
        ${issueDescription}
      </blockquote>
      <p>We will review your case and respond as soon as possible. Please keep this case number for future reference.</p>
      <p>Best regards,<br>The BirdWatch Support Team</p>
    `
  }
})

// Test email function to verify email sending functionality
export const generateTestEmailContent = (userEmail: string) => ({
  supportEmail: {
    subject: `BirdWatch Email Test`,
    text: `This is a test email to verify the support email functionality is working correctly.\n\nSent from: ${userEmail}`,
    html: `
      <h2>BirdWatch Email Test</h2>
      <p>This is a test email to verify the support email functionality is working correctly.</p>
      <p><strong>Sent from:</strong> ${userEmail}</p>
      <p>If you received this email, the email sending functionality is working correctly!</p>
    `
  },
  userEmail: {
    subject: `BirdWatch Email System Test`,
    text: `
Dear BirdWatch User,

This is a confirmation that a test email has been sent to our support team.

If you requested this test, everything is working correctly!
If you did not request this test, you can safely ignore this message.

Best regards,
The BirdWatch Support Team
    `,
    html: `
      <h2>BirdWatch Email System Test</h2>
      <p>Dear BirdWatch User,</p>
      <p>This is a confirmation that a test email has been sent to our support team.</p>
      <p>If you requested this test, everything is working correctly!</p>
      <p>If you did not request this test, you can safely ignore this message.</p>
      <p>Best regards,<br>The BirdWatch Support Team</p>
    `
  }
})
