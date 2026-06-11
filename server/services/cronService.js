// Runs every day at 8AM to check vaccine statuses and send emails
const cron = require("node-cron");
const {
  getAllPendingVaccines,
  updateVaccineStatus,
  updateNotifiedFlags,
} = require("../models/vaccineModel");
const { createNotification } = require("../models/notificationModel");
const { sendVaccineReminder } = require("./emailService");

const runDailyCheck = async () => {
  console.log("⏰ Running daily vaccine check...");

  try {
    const records = await getAllPendingVaccines();
    const today = new Date();

    for (const record of records) {
      const dueDate = new Date(record.due_date);
      const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      // 🟡 UPCOMING — 14 days before due date
      if (daysUntil <= 14 && daysUntil > 0 && !record.notified_upcoming) {
        await updateVaccineStatus(record.record_id, "pending", null);
        await updateNotifiedFlags(record.record_id, "upcoming");
        await sendVaccineReminder(
          record.email,
          record.fullname,
          record.child_name,
          [
            {
              vaccine_name: record.vaccine_name,
              due_date: dueDate.toLocaleDateString(),
              type: "upcoming",
              daysUntil,
            },
          ],
        );
        await createNotification(
          record.user_id,
          `🟡 Upcoming: ${record.vaccine_name} for ${record.child_name} is due in ${daysUntil} day(s)`,
        );
        console.log(
          `🟡 Upcoming email sent for ${record.vaccine_name} — ${record.child_name}`,
        );
      }

      // 🟢 DUE TODAY — exact due date
      else if (daysUntil === 0 && !record.notified_due) {
        await updateVaccineStatus(record.record_id, "pending", null);
        await updateNotifiedFlags(record.record_id, "due");
        await sendVaccineReminder(
          record.email,
          record.fullname,
          record.child_name,
          [
            {
              vaccine_name: record.vaccine_name,
              due_date: dueDate.toLocaleDateString(),
              type: "due_today",
            },
          ],
        );
        await createNotification(
          record.user_id,
          `🟢 Due Today: ${record.vaccine_name} for ${record.child_name} is due today!`,
        );
        console.log(
          `🟢 Due today email sent for ${record.vaccine_name} — ${record.child_name}`,
        );
      }

      // 🔴 OVERDUE — 7 days after due date
      else if (daysUntil <= -7 && !record.notified_overdue) {
        await updateVaccineStatus(record.record_id, "missed", null);
        await updateNotifiedFlags(record.record_id, "overdue");
        await sendVaccineReminder(
          record.email,
          record.fullname,
          record.child_name,
          [
            {
              vaccine_name: record.vaccine_name,
              due_date: dueDate.toLocaleDateString(),
              type: "overdue",
            },
          ],
        );
        await createNotification(
          record.user_id,
          `🔴 Overdue: ${record.vaccine_name} for ${record.child_name} is overdue. Please consult a doctor.`,
        );
        console.log(
          `🔴 Overdue email sent for ${record.vaccine_name} — ${record.child_name}`,
        );
      }
    }

    console.log("✅ Daily vaccine check complete");
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
};

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", runDailyCheck);

console.log("✅ Vaccine reminder cron job started (runs daily at 8AM)");

module.exports = { runDailyCheck };
