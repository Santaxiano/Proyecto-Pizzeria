function IndicadorPasos({ pasoActual, totalPasos = 3 }) {
  const pasos = Array.from({ length: totalPasos }, (_, i) => i + 1);

  return (
    <div className="indicador-pasos">
      {pasos.map((num, i) => {
        const completado = pasoActual > num;
        const activo = pasoActual === num;

        let claseCirculo = 'paso-circulo';
        if (activo) claseCirculo += ' activo';
        else if (completado) claseCirculo += ' completado';

        return (
          <div key={num} className="paso-item">
            <span className={claseCirculo}>
              {completado ? '✓' : num}
            </span>

            {i < pasos.length - 1 && (
              <div 
                className={`paso-linea ${pasoActual > num ? 'completada' : ''}`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default IndicadorPasos;