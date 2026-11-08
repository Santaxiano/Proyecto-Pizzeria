const CAMPOS_RESERVA = {
  cliente: {
    columna: 'cliente',
    requerido: true,
    validar: (valor) => typeof valor === 'string' && valor.trim() !== '' && valor.length <= 255,
  },
  contacto: {
    columna: 'contacto',
    requerido: true,
    validar: (valor) => typeof valor === 'string' && valor.trim() !== '' && valor.length <= 255,
  },
  fecha: {
    columna: 'fecha',
    requerido: true,
    validar: (valor) => typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor),
  },
  hora: {
    columna: 'hora',
    requerido: true,
    validar: (valor) => typeof valor === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor),
  },
  comensales: {
    columna: 'comensales',
    requerido: true,
    validar: (valor) => Number.isInteger(valor) && valor > 0,
  },
  lugar: {
    columna: 'lugar',
    requerido: true,
    validar: (valor) => typeof valor === 'string' && valor.trim() !== '' && valor.length <= 50,
  },
};

export const validarReserva = (modo) => (req, res, next) => {
  const body = req.body || {};
  const campos = Object.keys(body);

  if (campos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar datos de la reserva' });
  }

  if (modo === 'crear' && Object.hasOwn(body, 'mesaId')) {
    return res.status(400).json({ error: 'La mesa se asigna por separado' });
  }

  if (Object.hasOwn(body, 'mesaId') && Object.hasOwn(body, 'mesaIds')) {
    return res.status(400).json({ error: 'Enviá mesaId o mesaIds, no ambos' });
  }

  for (const campo of campos) {
    if (campo === 'mesaId' && modo === 'actualizar') {
      if (body.mesaId !== null && (!Number.isInteger(body.mesaId) || body.mesaId <= 0)) {
        return res.status(400).json({ error: 'mesaId debe ser un entero positivo o null' });
      }
      continue;
    }

    if (campo === 'mesaIds' && modo === 'actualizar') {
      if (
        !Array.isArray(body.mesaIds)
        || body.mesaIds.some((id) => !Number.isInteger(id) || id <= 0)
        || new Set(body.mesaIds).size !== body.mesaIds.length
      ) {
        return res.status(400).json({ error: 'mesaIds debe ser una lista de enteros positivos sin repetir' });
      }
      continue;
    }

    const reglas = CAMPOS_RESERVA[campo];
    if (!reglas) {
      return res.status(400).json({ error: `El campo '${campo}' no está permitido` });
    }
    if (!reglas.validar(body[campo])) {
      return res.status(400).json({ error: `El campo '${campo}' no tiene un formato o tipo válido` });
    }
  }

  if (modo === 'crear') {
    for (const [campo, reglas] of Object.entries(CAMPOS_RESERVA)) {
      if (reglas.requerido && body[campo] === undefined) {
        return res.status(400).json({ error: `El campo '${campo}' es obligatorio` });
      }
    }
  }

  next();
};

export { CAMPOS_RESERVA };
