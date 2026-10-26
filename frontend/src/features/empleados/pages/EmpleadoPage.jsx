import { useState } from 'react';
import FormularioRegistro from '../components/FormularioRegistro';
import { registrarEmpleado } from '../services/empleadoService';

function EmpleadoPage() {
    const [mensajeExito, setMensajeExito] = useState('');

    async function handleRegistrar(datos) {
        setMensajeExito(''); 
        await registrarEmpleado(datos);
        setMensajeExito(`¡La cuenta para ${datos.nombre} (${datos.rol}) fue creada con éxito!`);
        
        setTimeout(() => setMensajeExito(''), 4000);
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h1 className="h3 mb-0 text-gray-800 fw-bold">Gestión de Personal</h1>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                            <h5 className="mb-0 fw-bold" style={{ color: 'var(--color-rojo-tomate)' }}>
                                Registrar Nuevo Empleado
                            </h5>
                            <p className="text-muted small mt-1">
                                Completá los datos para darle acceso al sistema a un nuevo integrante del equipo.
                            </p>
                        </div>
                        <div className="card-body p-4">
                            {mensajeExito && (
                                <div className="alert alert-success fw-semibold" role="alert">
                                    {mensajeExito}
                                </div>
                            )}
                            
                            <FormularioRegistro onRegistrar={handleRegistrar} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmpleadoPage;