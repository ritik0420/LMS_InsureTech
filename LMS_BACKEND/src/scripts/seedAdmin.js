const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/user.model");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@insuretech.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const fullName = process.env.ADMIN_NAME || "System Admin";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "ADMIN"
    });

    console.log("Admin user created successfully");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
