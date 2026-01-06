/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// You'll need to set up nodemailer with your email service
// For Gmail, you'll need to create an app password at https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // Your actual Gmail
    pass: "your-app-password", // Replace with your 16-character app password
  },
});

// COST OPTIMIZATION: Configure function with minimal resources
exports.sendInvitationEmail = onDocumentCreated(
  {
    document: "invitations/{invitationId}",
    // Minimize memory allocation (128MB is minimum)
    memory: "128MiB",
    // Set timeout to reduce idle costs
    timeoutSeconds: 60,
    // Set minimum instances to 0 to avoid idle costs
    minInstances: 0,
    // Set maximum instances to control scaling costs
    maxInstances: 10,
    // Use us-central1 for lower costs
    region: "us-central1"
  },
  async (event) => {
    // Get the document snapshot
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const invitationData = snapshot.data();

    if (!invitationData.email) {
      console.log("No email provided for invitation");
      return;
    }

    // Email content
    const mailOptions = {
      from: "Top Computers <your-email@gmail.com>",
      to: invitationData.email,
      subject: "Invitation to Top Computers Website",
      html: `
      <h2>Welcome to Top Computers!</h2>
      <p>You've been invited to join our computer services platform.</p>
      <p>Use the following invitation code to register:</p>
      <div style="background-color: #f0f8ff; padding: 10px; border: 1px solid #4682b4; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 20px 0;">
        ${invitationData.code}
      </div>
      <p>This invitation code is linked to your email address: ${invitationData.email}</p>
      <p>Click <a href="https://your-domain.com/register">here</a> to register.</p>
      <p>Thanks,<br>The Top Computers Team</p>
    `,
    };

    try {
      // Send the email
      console.log(
        `Attempting to send email to ${invitationData.email} with code ${invitationData.code}`
      );
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${invitationData.email}`);
      } catch (emailError) {
        console.error("Error in sendMail:", emailError);
        throw emailError;
      }

      // Update the invitation to mark email as sent
      await admin
        .firestore()
        .collection("invitations")
        .doc(event.params.invitationId)
        .update({
          emailSent: true,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return;
    } catch (error) {
      console.error("Error sending invitation email:", error);
      
      // COST OPTIMIZATION: Update invitation with error status to avoid retries
      try {
        await admin
          .firestore()
          .collection("invitations")
          .doc(event.params.invitationId)
          .update({
            emailSent: false,
            emailError: error.message,
            lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (updateError) {
        console.error("Error updating invitation with failure:", updateError);
      }
      
      throw error; // Re-throw to trigger function retry if appropriate
    }
  }
);

// COST OPTIMIZATION: Batch cleanup function to reduce database operations
exports.cleanupOldLogs = onCall(
  {
    memory: "128MiB",
    timeoutSeconds: 300,
    minInstances: 0,
    maxInstances: 1,
    region: "us-central1"
  },
  async (request) => {
    // Only allow authenticated users to call this function
    if (!request.auth) {
      throw new Error("Authentication required");
    }
    
    try {
      const db = admin.firestore();
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Keep 6 months of logs
      
      // Batch delete old activity logs to save costs
      const logsQuery = db.collection('activityLogs')
        .where('timestamp', '<', cutoffDate)
        .limit(500); // Process in batches to avoid timeouts
      
      const snapshot = await logsQuery.get();
      if (snapshot.empty) {
        return { deleted: 0, message: "No old logs to delete" };
      }
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Deleted ${snapshot.size} old activity logs`);
      
      return { deleted: snapshot.size, message: `Deleted ${snapshot.size} old logs` };
    } catch (error) {
      console.error("Error cleaning up logs:", error);
      throw error;
    }
  }
);

// COST OPTIMIZATION: Aggregate daily stats to reduce real-time calculations
exports.aggregateDailyStats = onCall(
  {
    memory: "256MiB",
    timeoutSeconds: 540,
    minInstances: 0,
    maxInstances: 1,
    region: "us-central1"
  },
  async (request) => {
    if (!request.auth) {
      throw new Error("Authentication required");
    }
    
    try {
      const db = admin.firestore();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get all transactions for today
      const transactionsQuery = db.collection('transactions')
        .where('date', '>=', today)
        .where('date', '<', tomorrow);
      
      const snapshot = await transactionsQuery.get();
      
      let totalIncome = 0;
      let totalExpenses = 0;
      let transactionCount = 0;
      const categoryCounts = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        transactionCount++;
        
        if (data.type === 'income') {
          totalIncome += data.amount || 0;
        } else if (data.type === 'expense') {
          totalExpenses += data.amount || 0;
        }
        
        if (data.category) {
          categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
        }
      });
      
      // Store aggregated stats
      const statsDoc = {
        date: today,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount,
        categoryCounts,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('dailyStats').doc(today.toISOString().split('T')[0]).set(statsDoc);
      
      return { 
        success: true, 
        stats: {
          totalIncome,
          totalExpenses,
          transactionCount,
          categoriesCount: Object.keys(categoryCounts).length
        }
      };
    } catch (error) {
      console.error("Error aggregating daily stats:", error);
      throw error;
    }
  }
);
