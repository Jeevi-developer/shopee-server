import { sendMail } from "./brevoMailService.js";

export const sendContactMail = async ({ name, email, phone, subject, message }) => {
  try {
    if (!email) throw new Error("User email is missing");

   // Admin notification email template
const adminMailData = {
  sender: { name: "INDXIND SHOPEE", email: process.env.BREVO_SENDER_EMAIL },
  to: [
    {
      email: process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL,
      name: "Website Admin",
    },
  ],
  subject: subject || "New Contact Message | INDXIND SHOPEE",
  htmlContent: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Message</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100">
    <div class="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-10 mb-10">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
        <img src="images/cdexcoin.png" alt="INDXIND SHOPEE" class="w-24 h-24 mx-auto mb-2 rounded-full"/>
        <h1 class="text-white text-2xl font-bold">INDXIND SHOPEE</h1>
      </div>

      <!-- Content -->
      <div class="p-6 text-gray-800">
        <h2 class="text-xl font-semibold mb-4">New Contact Message Received</h2>
        <p class="mb-4">A user has submitted a message through the Contact Us form. Details are as follows:</p>

        <div class="bg-gray-100 border-l-4 border-purple-600 p-4 rounded mb-4">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        </div>

        <p>Please respond to the user as soon as possible.</p>
        <p>— Website Team</p>
      </div>

      <!-- Footer -->
      <div class="bg-gray-800 text-gray-200 p-6 text-center text-sm">
        <p>INDXIND SHOPEE | 5/45 Opposite 1008 Sivalayam Temple, Ariyanoor, Salem, Tamilnadu, India, 636308</p>
        <p>Email: <a href="mailto:indxindshopee@gmail.com" class="text-purple-400 underline">indxindshopee@gmail.com</a> | Phone: +91 04272903575</p>
        <p class="mt-2">© ${new Date().getFullYear()} INDXIND SHOPEE. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `,
};


    // Send admin email (optional)
    await sendMail(adminMailData);

   // Acknowledgment email to user
const userMailData = {
  sender: { name: "INDXIND SHOPEE", email: process.env.BREVO_SENDER_EMAIL },
  to: [
    {
      email: email,
      name: name,
    },
  ],
  subject: "We Received Your Message | INDXIND SHOPEE",
  htmlContent: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>INDXIND SHOPEE - Acknowledgment</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100">
    <div class="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-10 mb-10">
      <!-- Header with Logo -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
        <img src="images/cdexcoin.png" alt="INDXIND SHOPEE" class="w-24 h-24 mx-auto mb-2 rounded-full"/>
        <h1 class="text-white text-2xl font-bold">INDXIND SHOPEE</h1>
      </div>

      <!-- Main Content -->
      <div class="p-6 text-gray-800">
        <h2 class="text-xl font-semibold mb-4">Hello ${name},</h2>
        <p class="mb-4">
          Thank you for contacting <strong>INDXIND SHOPEE</strong>! We have received your message and our support team will get back to you as soon as possible.
        </p>

        <div class="bg-gray-100 border-l-4 border-purple-600 p-4 rounded mb-4">
          <p class="font-semibold">Your Message:</p>
          <p>${message}</p>
        </div>

        <p class="mb-4">Meanwhile, you can visit our website for more information: <a href="https://yourcompany.com" class="text-purple-600 underline">www.yourcompany.com</a></p>

        <p>Best regards,</p>
        <p class="font-bold">INDXIND SHOPEE Team</p>
      </div>

      <!-- Footer -->
      <div class="bg-gray-800 text-gray-200 p-6 text-center text-sm">
        <p>INDXIND SHOPEE | 5/45 Opposite 1008 Sivalayam Temple, Ariyanoor, Salem, Tamilnadu, India, 636308</p>
        <p>Email: <a href="mailto:indxindshopee@gmail.com" class="text-purple-400 underline">indxindshopee@gmail.com</a> | Phone: +91 04272903575</p>
        <p class="mt-2">© ${new Date().getFullYear()} INDXIND SHOPEE. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `,
};


    const userResponse = await sendMail(userMailData);
    console.log("Acknowledgment mail sent to user:", userResponse);

    return { success: true, userResponse };
  } catch (error) {
    console.error("Error sending contact mail via Brevo:", error);
    return { success: false, error };
  }
};
