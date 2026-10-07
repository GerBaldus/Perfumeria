import { sequelize } from '../config/database.js';
import { User, ROLES } from './User.js';
import { Category } from './Category.js';
import { Product } from './Product.js';
import { Order, ORDER_STATUSES } from './Order.js';
import { OrderItem } from './OrderItem.js';

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Vendedor (o admin) al que se le atribuye la venta
User.hasMany(Order, { as: 'sales', foreignKey: 'sellerId', onDelete: 'SET NULL' });
Order.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export { sequelize, User, ROLES, Category, Product, Order, ORDER_STATUSES, OrderItem };
