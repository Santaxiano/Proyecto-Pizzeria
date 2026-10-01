import { Outlet, NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import { cerrarSesion } from '../../features/iniciogestor/service/inicioservice';

function LayoutGestor() {
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const cerrarMenu = () => setMenuAbierto(false);

    const handleLogout = () => {
        cerrarSesion();
        cerrarMenu();
        navigate('/login', { replace: true });
    };

    return (
        <div className="container-fluid min-vh-100 p-0">
            <div className="row g-0 min-vh-100">
                {/* el sidebar */}
                <aside className="col-12 col-md-3 col-lg-2 bg-sidebar text-white d-flex flex-column p-3 p-md-4 shadow-sm z-3">
                    <nav className="navbar navbar-dark navbar-expand-md h-100 w-100 flex-md-column align-items-stretch p-0">
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <h2 className="fs-3 text-center mb-0 mb-md-5 d-flex align-items-center justify-content-center gap-2">
                                <span style={{ color: 'var(--color-rojo-tomate)' }}>+</span>PIZZA Gestor
                            </h2>
                            <button
                                className="navbar-toggler d-md-none"
                                type="button"
                                aria-controls="menu-gestor"
                                aria-expanded={menuAbierto}
                                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                                onClick={() => setMenuAbierto(!menuAbierto)}
                            >
                                <span className="navbar-toggler-icon" />
                            </button>
                        </div>

                        <div className={`collapse navbar-collapse w-100 flex-md-column align-items-stretch ${menuAbierto ? 'show' : ''}`} id="menu-gestor">
                            <div className="nav flex-column gap-2 mb-auto mt-3 mt-md-0">
                                <NavLink end to="/gestor" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                    Panel Inicio
                                </NavLink>
                                <NavLink to="/gestor/salon" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                    Salón
                                </NavLink>
                                <NavLink to="/gestor/comandas" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                    Comandas
                                </NavLink>
                                <NavLink to="/gestor/stock" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                    Gestión de Stock
                                </NavLink>
                            </div>

                            <button onClick={handleLogout} className="btn btn-tomate w-100 mt-4 fw-bold">
                                Cerrar Sesión
                            </button>
                        </div>
                    </nav>
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