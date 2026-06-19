import User from "../models/User.js";

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("No administrative user found. Seeding default Admin...");

      const admin = await User.create({
        name: "System Admin",
        email: "admin@campus.edu",
        password: "adminpassword123",
        role: "admin",
      });

      console.log(`Default Admin seeded successfully:`);
      console.log(`Email: ${admin.email}`);
      console.log(`Password: adminpassword123`);
    } else {
      console.log("Admin account already exists in database. Skipping seed.");
    }
  } catch (error) {
    console.error(`Error seeding default admin: ${error.message}`);
  }
};

export default seedAdmin;
