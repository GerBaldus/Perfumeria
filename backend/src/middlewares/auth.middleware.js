import { verifyToken } from '../utils/token.js';
import { User } from '../models/index.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Falta el token de autenticacion' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}
