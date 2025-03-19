
import { supabase } from "@/integrations/supabase/client"
import { generateCaseNumber, generateSupportEmailContent } from "@/utils/support"
import { format } from "date-fns"
import { sendDiscordWebhookMessage } from "@/utils/discord"

export interface IssueReportResult {
  success: boolean
  caseNumber?: string
  formattedDate?: string
  error?: Error
}

export const submitIssueReport = async (
  userEmail: string,
  issueDescription: string
): Promise<IssueReportResult> => {
  try {
    if (!issueDescription.trim()) {
      throw new Error("Please provide a description of the issue.")
    }

    if (!userEmail) {
      throw new Error("Could not determine your email address. Please try logging in again.")
    }

    const caseNumber = generateCaseNumber()
    const reportedAt = new Date()
    const formattedDate = format(reportedAt, "MMMM d, yyyy 'at' h:mm a")

    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Use the autoresponse email with full access
    const supportEmail = 'support@featheredfriendtracker.co.uk'
    console.log('Using support email address:', supportEmail)

    // Store issue in database - status will default to 'open'
    const { error: dbError } = await supabase
      .from('issues')
      .insert({
        user_id: user.id,
        description: issueDescription
      })

    if (dbError) {
      console.error('Error storing issue in database:', dbError)
      throw dbError
    }

    const emailContent = generateSupportEmailContent(caseNumber, userEmail, issueDescription)

    // Send issue report to support team with improved error handling
    console.log('Sending email to support team:', supportEmail)
    const { data: supportEmailData, error: supportEmailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: supportEmail,
        subject: emailContent.supportEmail.subject,
        text: emailContent.supportEmail.text,
        html: emailContent.supportEmail.html
      }
    })

    if (supportEmailError) {
      console.error('Error sending support email:', supportEmailError)
      throw supportEmailError
    }
    
    console.log('Support email response:', supportEmailData)

    // Send auto-response to user with improved error handling
    console.log('Sending confirmation to user:', userEmail)
    const { data: userEmailData, error: ackError } = await supabase.functions.invoke('send-email', {
      body: {
        to: userEmail,
        subject: emailContent.userEmail.subject,
        text: emailContent.userEmail.text,
        html: emailContent.userEmail.html
      }
    })

    if (ackError) {
      console.error('Error sending acknowledgment email:', ackError)
      throw ackError
    }
    
    console.log('User email response:', userEmailData)

    try {
      // Send Discord notification
      await sendDiscordWebhookMessage(`🎫 New Issue Report (${caseNumber})
📅 Reported: ${formattedDate}
📧 Reporter: ${userEmail}
📝 Description: ${issueDescription}

Our support team will respond within 48 hours.`, "support")
    } catch (discordError) {
      console.error('Error sending Discord notification:', discordError)
      // Don't throw the error as this is not critical for the user
    }

    return {
      success: true,
      caseNumber,
      formattedDate
    }
  } catch (error) {
    console.error('Error sending issue report:', error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}
