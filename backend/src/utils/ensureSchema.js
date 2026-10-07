import { DataTypes } from 'sequelize';
import { sequelize } from '../models/index.js';

// sequelize.sync() crea tablas nuevas pero no agrega columnas a las existentes,
// asi que las columnas sumadas despues del primer deploy se agregan aca.
export async function ensureSchema() {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable('orders');

  if (!columns.sellerId) {
    await queryInterface.addColumn('orders', 'sellerId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }

  if (!columns.confirmedAt) {
    await queryInterface.addColumn('orders', 'confirmedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }
}
