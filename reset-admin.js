require('dotenv').config();
// Note: If your package.json uses 'bcrypt' instead of 'bcryptjs', change the line below to: const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs'); 
const { sequelize, User } = require('./models');

async function resetAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // 👇 CHANGE THESE TO YOUR NEW DETAILS 👇
    const newEmail = 'meeneshwar2007@gmail.com'; 
    const newPassword = 'YourNewStrongPassword123!'; 
    // 👆 CHANGE THESE TO YOUR NEW DETAILS 👆

    // Hash the new password so the database accepts it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin user in the database
    const [updated] = await User.update(
      { email: newEmail, password: hashedPassword },
      { where: { role: 'admin' } }
    );

    if (updated > 0) {
      console.log('✅ Success! Admin email and password have been updated.');
    } else {
      console.log('❌ No admin user was found in the database.');
    }
    
    process.exit(0); // Stop the script
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    process.exit(1);
  }
}

resetAdmin();