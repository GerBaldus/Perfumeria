import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ORDER_STATUSES = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM(...ORDER_STATUSES),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'orders',
  timestamps: true,
});
