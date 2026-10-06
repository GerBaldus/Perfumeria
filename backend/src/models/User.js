import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ROLES = ['cliente', 'vendedor', 'admin'];

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(...ROLES),
    allowNull: false,
    defaultValue: 'cliente',
  },
}, {
  tableName: 'users',
  timestamps: true,
});
