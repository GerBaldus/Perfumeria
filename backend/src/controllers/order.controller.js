import { sequelize, Order, OrderItem, Product, User } from '../models/index.js';
import { ORDER_STATUSES, SALE_STATUSES } from '../models/Order.js';

export async function listOrders(req, res, next) {
  try {
    const isStaff = ['vendedor', 'admin'].includes(req.user.role);
    const where = isStaff ? {} : { userId: req.user.id };

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'seller', attributes: ['id', 'name'] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const isStaff = ['vendedor', 'admin'].includes(req.user.role);
    if (!isStaff && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tenes permisos para ver este pedido' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'El pedido debe tener al menos un item' });
  }

  try {
    const order = await sequelize.transaction(async (t) => {
      let total = 0;
      const resolvedItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product) {
          throw Object.assign(new Error(`Producto ${item.productId} no encontrado`), { status: 404 });
        }
        if (product.stock < item.quantity) {
          throw Object.assign(new Error(`Stock insuficiente para ${product.name}`), { status: 400 });
        }

        product.stock -= item.quantity;
        await product.save({ transaction: t });

        total += Number(product.price) * item.quantity;
        resolvedItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
      }

      const newOrder = await Order.create({ userId: req.user.id, total }, { transaction: t });
      await OrderItem.bulkCreate(
        resolvedItems.map((i) => ({ ...i, orderId: newOrder.id })),
        { transaction: t }
      );

      return newOrder;
    });

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] }],
    });

    res.status(201).json(fullOrder);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Estado invalido. Debe ser uno de: ${ORDER_STATUSES.join(', ')}` });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // La venta queda a nombre del primero que toma el pedido, aunque despues otro cambie el estado
    if (SALE_STATUSES.includes(status) && !order.sellerId) {
      order.sellerId = req.user.id;
      order.confirmedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
}
