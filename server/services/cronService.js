// Handles all email sending for KIDVAX
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const sendVaccineReminder = async (
  toEmail,
  parentName,
  childName,
  vaccines,
) => {
  const vaccine = vaccines[0];
  const type = vaccine.type;

  let subject, headerColor, headerText, bodyText;

  if (type === "upcoming") {
    subject = `🟡 Upcoming Vaccine for ${childName} in ${vaccine.daysUntil} days`;
    headerColor = "#F57F17";
    headerText = "🟡 Upcoming Vaccine Reminder";
    bodyText = `<strong>${vaccine.vaccine_name}</strong> is due in <strong>${vaccine.daysUntil} days</strong> on <strong>${vaccine.due_date}</strong>. Please schedule a visit to your healthcare provider.`;
  } else if (type === "due_today") {
    subject = `🟢 Vaccine Due Today for ${childName}!`;
    headerColor = "#2E7D32";
    headerText = "🟢 Vaccine Due Today";
    bodyText = `<strong>${vaccine.vaccine_name}</strong> is due <strong>today</strong>. Please visit your healthcare provider as soon as possible.`;
  } else {
    subject = `🔴 Overdue Vaccine for ${childName}`;
    headerColor = "#C62828";
    headerText = "🔴 Overdue Vaccine Alert";
    bodyText = `<strong>${vaccine.vaccine_name}</strong> was due on <strong>${vaccine.due_date}</strong> and is now overdue. Please consult a doctor or health personnel to know if the vaccine can still be taken or needs to be rescheduled.`;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: ${headerColor}; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">💉 KIDVAX</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 4px 0;">Child Vaccination Tracking System</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: ${headerColor};">${headerText}</h2>
          <p>Hello <strong>${parentName}</strong>,</p>
          <p>This is a reminder for <strong>${childName}</strong>:</p>
          <div style="background: #f9f9f9; padding: 16px 20px; border-left: 4px solid ${headerColor}; border-radius: 4px; margin: 16px 0;">
            ${bodyText}
          </div>
          <p style="color: #666; font-size: 13px;">— The KIDVAX Team</p>
        </div>
        <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #999;">
          This is an automated reminder from KIDVAX. Do not reply to this email.
        </div>
      </div>
    `,
  });
};

module.exports = { sendVaccineReminder };
