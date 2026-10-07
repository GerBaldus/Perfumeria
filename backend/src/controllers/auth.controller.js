import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { signToken } from '../utils/token.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Todo registro publico se crea como cliente; vendedor/admin se asignan desde /api/users
    const user = await User.create({ name, email, password: hashed, role: 'cliente' });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res, next) {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();

    if (!name || !email) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (email !== req.user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
      }
    }

    req.user.name = name;
    req.user.email = email;
    await req.user.save();

    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // req.user viene sin password, lo buscamos de nuevo para poder comparar
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
}
