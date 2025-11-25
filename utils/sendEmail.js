import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendApprovalEmail = async (toEmail, { sellerName, approved = true, reason = "" } = {}) => {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    throw new Error("Missing BREVO_API_KEY or BREVO_SENDER_EMAIL in environment variables");
  }

  const subject = approved ? "Your seller account has been approved" : "Your seller account status";
  const htmlContent = approved
    ? `<div style="font-family: Arial, sans-serif; padding:10px;">
         <h2>Account Approved</h2>
         <p>Hi ${sellerName || ""},</p>
         <p>Your seller account has been <strong style="color: #008060">approved</strong> by the admin. You can now access your seller dashboard and add products.</p>
         <p>Login: <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/seller/login">${process.env.FRONTEND_URL || "http://localhost:3000"}/seller/login</a></p>
         <p>Thanks,<br/>INDXIND SHOPEE Team</p>
       </div>`
    : `<div style="font-family: Arial, sans-serif; padding:10px;">
         <h2>Account Update</h2>
         <p>Hi ${sellerName || ""},</p>
         <p>Your seller account status has been updated to <strong>${approved ? "Approved" : "Rejected/Suspended"}</strong>.</p>
         ${reason ? `<p>Reason: ${reason}</p>` : ""}
         <p>Contact support if you need help.</p>
       </div>`;

  const payload = {
    sender: { name: "INDXIND SHOPEE", email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  const resp = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
  });

  return resp.data;
};
