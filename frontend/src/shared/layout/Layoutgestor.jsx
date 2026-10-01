import { Outlet } from 'react-router';
import NavbarGestor from './NavbarGestor';

function LayoutGestor() {
    return (
        <div className="container-fluid min-vh-100 p-0">
            <div className="row g-0 min-vh-100">
                
                {/* Menú lateral importado como componente */}
                <NavbarGestor />

                {/* Contenido principal */}
                <main className="col-12 col-md-9 col-lg-10 p-4 bg-light overflow-auto" style={{ maxHeight: '100vh' }}>
                    <Outlet />
                </main>
                
            </div>
        </div>
    );
}

export default LayoutGestor;