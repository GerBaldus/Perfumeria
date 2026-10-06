import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize, User } from '../models/index.js';

const name = process.env.ADMIN_NAME || 'Admin';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Definí ADMIN_EMAIL y ADMIN_PASSWORD en .env antes de correr este script.');
  process.exit(1);
}

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Usuario ${email} actualizado a rol admin.`);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, role: 'admin' });
    console.log(`Usuario admin ${email} creado.`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
