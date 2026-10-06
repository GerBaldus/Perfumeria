import { Product, Category } from '../models/index.js';

export async function listProducts(req, res, next) {
  try {
    const { categoryId, search } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;

    const products = await Product.findAll({
      where,
      include: { model: Category, attributes: ['id', 'name'] },
      order: [['createdAt', 'DESC']],
    });

    const filtered = search
      ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;

    res.json(filtered);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: { model: Category, attributes: ['id', 'name'] },
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, brand, description, price, stock, imageUrl, categoryId } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'El nombre y el precio son obligatorios' });
    }

    const product = await Product.create({ name, brand, description, price, stock, imageUrl, categoryId });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const fields = ['name', 'brand', 'description', 'price', 'stock', 'imageUrl', 'categoryId'];
    for (const field of fields) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
