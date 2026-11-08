export function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error)

  const statusPorCodigo = {
    '22P02': 400,
    '22001': 400,
    '22007': 400,
    '22008': 400,
    '23502': 400,
    '23503': 409,
    '23505': 409,
  };
  const status = Number.isInteger(error.status)
    ? error.status
    : statusPorCodigo[error.code] ?? 500

  if (status >= 500) {
    console.error(error)
  }

  res.status(status).json({
    error: status >= 500
      ? 'Error interno del servidor'
      : status === 409
        ? error.publicMessage || 'El registro entra en conflicto con datos existentes'
        : status === 400 && error.code
          ? 'Los datos enviados no son válidos'
          : error.message,
  })
}
