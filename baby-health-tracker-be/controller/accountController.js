const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const EmailOtp = require("../models/email_otps");
const accountService = require("../services/accountService");
const parentService = require("../services/parentService");

const OTP_EXPIRY_MINUTES = 10;
const generateOtp = () => crypto.randomInt(10000, 99999).toString();

const register = async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  try {
    const existingAccount = await accountService.findAccountByEmail(email);
    if (existingAccount && existingAccount.is_verified) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (existingAccount && !existingAccount.is_verified) {
      await accountService.deleteAccount(existingAccount._id);
      await parentService.deleteParent(existingAccount.parent_id);
    }

    const newParent = await parentService.createParent({ full_name, phone });
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountData = {
      email,
      password: hashedPassword,
      parent_id: newParent._id,
      role: "parent",
    };
    const newAccount = await accountService.createAccount(accountData);

    //sent otp to email
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await EmailOtp.create({
      email,
      otp,
      purpose: "register",
      expires_at: expiresAt,
      used: false,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "nguyenphamtiendat1232003@gmail.com",
        pass: "wlud knmw fegd ekvr",
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });
    res
      .status(201)
      .json({ message: "Account created successfully. OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await EmailOtp.findOne({
      email,
      otp,
      purpose: "register",
      used: false,
    });
    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (record.expires_at < new Date()) {
      const account = await accountService.findAccountByEmail(email);
      if (account) {
        await accountService.deleteAccount(account._id);
        await parentService.deleteParent(account.parent_id);
      }
      return res.status(400).json({ message: "OTP expired" });
    }
    record.used = true;
    await record.save();
    const account = await accountService.findAccountByEmail(email);
    if (account) {
      account.is_verified = true;
      await account.save();
    }
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const account = await accountService.findAccountByEmail(email);
    if (!account) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!account.is_verified) {
      return res.status(403).json({ message: "Account is not verified" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "12345-67890-09876-54321";

    const tokenPayload = {
      account_id: account._id,
      parent_id: account.parent_id,
      doctor_id: account.doctor_id,
      role: account.role,
    };

    const token = jwt.sign(tokenPayload, secret);

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        account_id: account._id,
        parent_id: account.parent_id,
        doctor_id: account.doctor_id,
        role: account.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const account = await accountService.findAccountByEmail(email);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await EmailOtp.create({
      email,
      otp,
      purpose: "reset",
      expires_at: expiresAt,
      used: false,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "nguyenphamtiendat1232003@gmail.com",
        pass: "wlud knmw fegd ekvr",
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset password OTP",
      text: `Your OTP code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, new_password } = req.body;

  try {
    if (!email || !otp || !new_password) {
      return res
        .status(400)
        .json({ message: "Email, otp, and new_password are required" });
    }

    const record = await EmailOtp.findOne({
      email,
      otp,
      purpose: "reset",
      used: false,
    });
    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expires_at < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await accountService.updateAccountPassword(email, hashedPassword);

    record.used = true;
    await record.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
};
