import { Outlet, NavLink, useNavigate } from 'react-router';
import { cerrarSesion } from '../../features/iniciogestor/service/inicioservice';

function LayoutGestor() {
    const navigate = useNavigate();

    const handleLogout = () => {
        cerrarSesion();
        navigate('/login', { replace: true });
    };

    return (
        <div className="container-fluid min-vh-100 p-0">
            <div className="row g-0 min-vh-100">
                {/* el sidebar */}
                <aside className="col-12 col-md-3 col-lg-2 bg-sidebar text-white d-flex flex-column p-4 shadow-sm z-3">
                    <h2 className="fs-3 text-center mb-5 d-flex align-items-center justify-content-center gap-2">
                        <span style={{ color: 'var(--color-rojo-tomate)' }}>+</span>PIZZA Gestor
                    </h2>

                    <nav className="nav flex-column gap-2 mb-auto">
                        <NavLink end to="/gestor" className="nav-link text-white rounded px-3 py-2 fw-semibold">
                            Panel Inicio
                        </NavLink>
                        <NavLink to="/gestor/comandas" className="nav-link text-white rounded px-3 py-2 fw-semibold">
                            Comandas / Salón
                        </NavLink>
                        <NavLink to="/gestor/stock" className="nav-link text-white rounded px-3 py-2 fw-semibold">
                            Gestión de Stock
                        </NavLink>
                    </nav>

                    <button onClick={handleLogout} className="btn btn-tomate mt-4 fw-bold">
                        Cerrar Sesión
                    </button>
                </aside>

                {/* contenido principal */}
                <main className="col-12 col-md-9 col-lg-10 p-4 bg-light overflow-auto" style={{ maxHeight: '100vh' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default LayoutGestor;