import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { cerrarSesion, obtenerSesion } from '../../features/login/service/inicioservice';
import CampanaNotificaciones from '../../features/notificaciones/components/CampanaNotificaciones';

function NavbarGestor({ noLeidas = 0, cargandoNotificaciones = false, onAbrirNotificaciones }) {
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [rolUsuario, setRolUsuario] = useState('');

    useEffect(() => {
        const sesion = obtenerSesion();
        if (sesion && sesion.rol) {
            setRolUsuario(sesion.rol);
        }
    }, []);

    const cerrarMenu = () => setMenuAbierto(false);

    const handleLogout = () => {
        cerrarSesion(); 
        cerrarMenu();
        navigate('/login', { replace: true });
    };

    return (
        <aside className="col-12 col-md-3 col-lg-2 bg-sidebar text-white d-flex flex-column p-3 p-md-4 shadow-sm z-3 sticky-top top-0">
            <nav className="navbar navbar-dark navbar-expand-md h-100 w-100 flex-md-column align-items-stretch p-0">
                <div className="d-flex w-100 justify-content-between align-items-center gap-2 mb-0 mb-md-4">
                    <h2 className="fs-3 text-center mb-0 d-flex align-items-center justify-content-center gap-2">
                        <span style={{ color: 'var(--color-rojo-tomate)' }}>+</span>PIZZA Gestor
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                        <CampanaNotificaciones
                            noLeidas={noLeidas}
                            cargando={cargandoNotificaciones}
                            onClick={onAbrirNotificaciones}
                        />
                        <button
                            className="navbar-toggler d-md-none"
                            type="button"
                            aria-controls="menu-gestor"
                            aria-expanded={menuAbierto}
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <span className="navbar-toggler-icon" />
                        </button>
                    </div>
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
                        <NavLink to="/gestor/configuracion" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                            Configuración
                        </NavLink>

                        {rolUsuario === 'administrador' && (
                            <NavLink to="/gestor/empleados" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                Registrar Personal
                            </NavLink>
                        )}
                        {rolUsuario === 'administrador' && (
                            <NavLink to="/gestor/usuarios" onClick={cerrarMenu} className="nav-link text-white rounded px-3 py-2 fw-semibold">
                                Administrar Usuarios
                            </NavLink>
                        )}
                    </div>

                    <button onClick={handleLogout} className="btn btn-tomate w-100 mt-4 fw-bold">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
        </aside>
    );
}

export default NavbarGestor;