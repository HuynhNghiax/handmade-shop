const sequelize = require('../config/db');
const MakerProfile = require('../models/MakerProfile');
const User = require('../models/User');
require('../models/associations');

async function run() {
  try {
    const users = await User.findAll();
    console.log('=== ALL USERS ===');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, isMaker: ${u.isMaker}, isAdmin: ${u.isAdmin}`);
    });
    
    const makers = await MakerProfile.findAll({
      include: [{ model: User, as: 'User' }]
    });
    console.log('=== ALL MAKER PROFILES ===');
    makers.forEach(m => {
      console.log(`ID: ${m.id}, UserID: ${m.userId}, Name: ${m.User?.name || 'N/A'}, Email: ${m.User?.email || 'N/A'}, Status: ${m.status}, isBanned: ${m.isBanned}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
run();
