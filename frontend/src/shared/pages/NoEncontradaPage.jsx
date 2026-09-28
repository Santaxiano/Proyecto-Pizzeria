import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

function NoEncontradaPage() {
  const error = useRouteError();
  const esErrorInesperado = Boolean(error) && !(isRouteErrorResponse(error) && error.status === 404);

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--color-rojo-tomate)', margin: 0 }}>
        {esErrorInesperado ? 'Ups' : '404'}
      </p>
      <h1 style={{ fontSize: '1.8rem', margin: '16px 0' }}>
        {esErrorInesperado ? 'Algo salió mal en el horno' : 'Página no encontrada'}
      </h1>
      <p style={{ color: 'var(--color-gris-oscuro)', marginBottom: '24px' }}>
        {esErrorInesperado
          ? 'Ocurrió un error inesperado al procesar la solicitud.'
          : 'La dirección que buscás no existe o fue modificada.'}
      </p>
      <Link to="/" className="boton-ingreso" style={{ display: 'inline-block' }}>
        Volver al inicio
      </Link>
    </div>
  );
}

export default NoEncontradaPage;