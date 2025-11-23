export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Error de validación de Prisma (violación de constraint único)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0]
    let errorMessage = 'El registro ya existe'
    
    if (field === 'cedula') {
      errorMessage = 'Esta cédula ya está registrada en el sistema'
    } else if (field === 'email') {
      errorMessage = 'Este correo electrónico ya está registrado'
    }
    
    return res.status(409).json({
      error: errorMessage,
      field: field
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro no encontrado'
    })
  }

  // Error de validación personalizado
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message
    })
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
}

