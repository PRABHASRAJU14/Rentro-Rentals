require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, timestamp: Date.now() };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Rentro OTP',
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending OTP:", err);
      return res.json({ success: false, error: "Failed to send OTP." });
    }
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!otpStore[email]) return res.json({ success: false, error: "No OTP sent to this email." });

  const { otp: storedOtp, timestamp } = otpStore[email];
  const isExpired = Date.now() - timestamp > 5 * 60 * 1000;

  if (isExpired) {
    delete otpStore[email];
    return res.json({ success: false, error: "OTP expired. Please request a new one." });
  }

  if (otp === storedOtp) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  res.json({ success: false, error: "Incorrect OTP." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
