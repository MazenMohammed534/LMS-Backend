import User from "../models/User.js";
import Department from "../models/Department.js";

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

    // Seed default departments
    const departmentCount = await Department.countDocuments({});
    if (departmentCount === 0) {
      console.log("No departments found. Seeding default departments...");
      const defaultDepartments = ["IT"];
      await Department.insertMany(
        defaultDepartments.map((name) => ({ name }))
      );
      console.log("Default departments seeded successfully!");
    } else {
      console.log("Departments already exist in database. Skipping department seed.");
    }
  } catch (error) {
    console.error(`Error seeding default admin/departments: ${error.message}`);
  }
};

export default seedAdmin;
