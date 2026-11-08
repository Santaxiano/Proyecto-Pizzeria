import { useState, useEffect, useMemo, useRef } from 'react';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 5;

// Zona para arrastrar o elegir una imagen (en celular abre galería/cámara).
// No sube nada: solo entrega el File elegido; la subida se hace al guardar.
export default function SelectorImagen({ imagenActual, archivo, onCambiarArchivo, onQuitarImagenActual }) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState('');
  // URL temporal para mostrar el archivo elegido; se libera al cambiarlo o cerrar el modal
  const vistaPrevia = useMemo(() => (archivo ? URL.createObjectURL(archivo) : ''), [archivo]);
  useEffect(() => {
    if (!vistaPrevia) return;
    return () => URL.revokeObjectURL(vistaPrevia);
  }, [vistaPrevia]);

  const elegirArchivo = (nuevo) => {
    if (!nuevo) return;
    if (!TIPOS_PERMITIDOS.includes(nuevo.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (nuevo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setError(`La imagen no puede pesar más de ${TAMANO_MAXIMO_MB} MB.`);
      return;
    }
    setError('');
    onCambiarArchivo(nuevo);
  };

  const abrirSelector = () => inputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    elegirArchivo(e.dataTransfer.files?.[0]);
  };

  const handleQuitar = (e) => {
    e.stopPropagation();
    setError('');
    if (archivo) onCambiarArchivo(null);
    else onQuitarImagenActual();
  };

  const imagenAMostrar = vistaPrevia || (imagenActual && imagenActual !== '/noimagen.jpg' ? imagenActual : '');

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={abrirSelector}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), abrirSelector())}
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={handleDrop}
        className={`border border-2 rounded p-3 text-center ${arrastrando ? 'border-success bg-success-subtle' : 'border-secondary-subtle bg-light'}`}
        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
      >
        {imagenAMostrar ? (
          <div className="d-flex align-items-center gap-3 text-start">
            <img
              src={imagenAMostrar}
              alt="Vista previa"
              className="rounded shadow-sm"
              style={{ width: '90px', height: '90px', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/noimagen.jpg'; }}
            />
            <div className="flex-grow-1 small">
              <div className="fw-bold text-truncate">{archivo ? archivo.name : 'Imagen actual'}</div>
              <div className="text-muted">Tocá o arrastrá otra imagen para reemplazarla</div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleQuitar}>
              Quitar
            </button>
          </div>
        ) : (
          <div className="py-2">
            <div className="fs-2">📷</div>
            <div className="fw-bold small">Arrastrá una imagen o tocá para elegirla</div>
            <div className="text-muted small">JPG, PNG o WEBP · máx. {TAMANO_MAXIMO_MB} MB · si no cargás ninguna se usa la imagen por defecto</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={(e) => {
          elegirArchivo(e.target.files?.[0]);
          e.target.value = ''; // permite volver a elegir el mismo archivo
        }}
      />

      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
