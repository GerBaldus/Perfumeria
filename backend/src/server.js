import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida.');

    await sequelize.sync();
    console.log('Modelos sincronizados.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
