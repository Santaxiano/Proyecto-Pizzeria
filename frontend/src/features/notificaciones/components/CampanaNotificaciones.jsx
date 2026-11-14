function CampanaNotificaciones({ noLeidas = 0, cargando = false, onClick }) {
  const etiqueta = noLeidas > 0
    ? `Notificaciones: ${noLeidas} sin leer`
    : 'Notificaciones';

  return (
    <button
      type="button"
      className="boton-campana"
      onClick={onClick}
      aria-label={etiqueta}
      aria-busy={cargando}
      title={etiqueta}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {noLeidas > 0 && (
        <span className="badge rounded-pill bg-danger badge-campana">
          {noLeidas > 99 ? '99+' : noLeidas}
        </span>
      )}
    </button>
  );
}

export default CampanaNotificaciones;
