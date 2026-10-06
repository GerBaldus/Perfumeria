export function notFound(req, res) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Error de validacion',
      errors: err.errors?.map((e) => e.message),
    });
  }

  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
}
