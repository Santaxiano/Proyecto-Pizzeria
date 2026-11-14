import { Outlet } from 'react-router';
import NavbarGestor from './NavbarGestor';
import { useNotificacionesGestor } from '../../features/notificaciones/hooks/useNotificacionesGestor';
import PanelNotificaciones from '../../features/notificaciones/components/PanelNotificaciones';
import ToastsNotificaciones from '../../features/notificaciones/components/ToastsNotificaciones';

function LayoutGestor() {
    const notificaciones = useNotificacionesGestor();

    return (
        <div className="container-fluid min-vh-100 p-0">
            <div className="row g-0 min-vh-100">

                {/* Menú lateral importado como componente */}
                <NavbarGestor
                    noLeidas={notificaciones.noLeidasHoy}
                    cargandoNotificaciones={notificaciones.cargando}
                    onAbrirNotificaciones={notificaciones.abrirPanel}
                />

                {/* Contenido principal */}
                <main className="col-12 col-md-9 col-lg-10 p-4 bg-light overflow-auto" style={{ maxHeight: '100vh' }}>
                    <Outlet />
                </main>

            </div>

            {/* Avisos flotantes y panel con el historial por día */}
            <ToastsNotificaciones
                toasts={notificaciones.toasts}
                onCerrar={notificaciones.cerrarToast}
                onVer={notificaciones.abrirPanel}
            />
            <PanelNotificaciones
                abierto={notificaciones.panelAbierto}
                onCerrar={notificaciones.cerrarPanel}
                fecha={notificaciones.fechaPanel}
                onCambiarFecha={notificaciones.setFechaPanel}
                notificaciones={notificaciones.notificacionesFecha}
                cargando={notificaciones.cargandoFecha}
                error={notificaciones.errorFecha}
                onRecargar={notificaciones.recargarFecha}
                leidas={notificaciones.leidas}
                onMarcarTodasLeidas={notificaciones.marcarTodasComoLeidas}
                sonidoActivo={notificaciones.sonidoActivo}
                onAlternarSonido={notificaciones.alternarSonido}
                ultimaActualizacion={notificaciones.ultimaActualizacion}
            />
        </div>
    );
}

export default LayoutGestor;
