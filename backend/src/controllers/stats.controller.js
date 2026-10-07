import { Op, QueryTypes } from 'sequelize';
import { sequelize, Order, User } from '../models/index.js';
import { SALE_STATUSES } from '../models/Order.js';

// Unidad de date_trunc y cuanto hacia atras se muestra en cada vista
const PERIODS = {
  day: { unit: 'day', span: '29 days' },
  week: { unit: 'week', span: '11 weeks' },
  month: { unit: 'month', span: '11 months' },
};

function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Lee period, tz y sellerId de la query. Devuelve { error } si alguno es invalido.
function parseFilters(req) {
  const period = PERIODS[req.query.period || 'day'];
  if (!period) {
    return { error: `Periodo invalido. Debe ser uno de: ${Object.keys(PERIODS).join(', ')}` };
  }

  // Los dias/semanas/meses se cortan en la zona horaria del navegador, no en UTC
  const tz = req.query.tz || 'UTC';
  if (!isValidTimeZone(tz)) {
    return { error: 'Zona horaria invalida' };
  }

  // El vendedor solo ve sus ventas; el admin ve las de todos o filtra por uno
  let sellerId = null;
  if (req.user.role !== 'admin') {
    sellerId = req.user.id;
  } else if (req.query.sellerId) {
    sellerId = Number(req.query.sellerId);
    if (!Number.isInteger(sellerId)) {
      return { error: 'Vendedor invalido' };
    }
  }

  return { period, tz, sellerId };
}

export async function salesBySeller(req, res, next) {
  try {
    const { error, period, tz, sellerId } = parseFilters(req);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const rows = await sequelize.query(
      `SELECT to_char(date_trunc(:unit, o."confirmedAt" AT TIME ZONE :tz), 'YYYY-MM-DD') AS "period",
              u.id AS "sellerId",
              u.name AS "sellerName",
              CAST(COUNT(*) AS INTEGER) AS "orders",
              SUM(o.total) AS "total"
       FROM orders o
       JOIN users u ON u.id = o."sellerId"
       WHERE o.status IN (:statuses)
         AND o."confirmedAt" AT TIME ZONE :tz >= date_trunc(:unit, now() AT TIME ZONE :tz) - CAST(:span AS INTERVAL)
         ${sellerId ? 'AND o."sellerId" = :sellerId' : ''}
       GROUP BY 1, u.id, u.name
       ORDER BY 1 DESC, SUM(o.total) DESC`,
      {
        type: QueryTypes.SELECT,
        replacements: {
          unit: period.unit,
          span: period.span,
          tz,
          statuses: SALE_STATUSES,
          sellerId,
        },
      }
    );

    res.json(rows.map((r) => ({ ...r, total: Number(r.total) })));
  } catch (err) {
    next(err);
  }
}

// Pedidos que componen las ventas de un vendedor en el mismo rango que salesBySeller
export async function sellerOrders(req, res, next) {
  try {
    const { error, period, tz, sellerId } = parseFilters(req);
    if (error) {
      return res.status(400).json({ message: error });
    }
    if (!sellerId) {
      return res.status(400).json({ message: 'Falta el vendedor' });
    }

    const unit = sequelize.escape(period.unit);
    const span = sequelize.escape(period.span);
    const zone = sequelize.escape(tz);

    const orders = await Order.findAll({
      where: {
        sellerId,
        status: SALE_STATUSES,
        [Op.and]: sequelize.literal(
          `"Order"."confirmedAt" AT TIME ZONE ${zone} >= date_trunc(${unit}, now() AT TIME ZONE ${zone}) - CAST(${span} AS INTERVAL)`
        ),
      },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['confirmedAt', 'DESC']],
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// Opciones del filtro: quienes pueden vender hoy mas quienes ya tienen ventas a su nombre
export async function listSellers(req, res, next) {
  try {
    const sellers = await User.findAll({
      attributes: ['id', 'name', 'role'],
      where: {
        [Op.or]: [
          { role: ['vendedor', 'admin'] },
          { id: { [Op.in]: sequelize.literal('(SELECT DISTINCT "sellerId" FROM orders WHERE "sellerId" IS NOT NULL)') } },
        ],
      },
      order: [['name', 'ASC']],
    });

    res.json(sellers);
  } catch (err) {
    next(err);
  }
}
