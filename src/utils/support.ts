
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
    to: 'accounts@thewrightsupport.com',
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
    to: userEmail,
    subject: `BirdWatch Support - Case ${caseNumber} Received`,
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
      <h2>BirdWatch Support Confirmation</h2>
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
