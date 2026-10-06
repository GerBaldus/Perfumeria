import { Category } from '../models/index.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }

    const { name, description } = req.body;
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();

    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }

    await category.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
