import { useNavigate } from 'react-router';
import FormularioLogin from '../components/FormularioLogin';
import { iniciarSesion } from '../service/inicioservice';

function LoginPage() {
    const navigate = useNavigate();

    async function handleIngresar({ email, password }) {
        await iniciarSesion(email, password);
        navigate('/gestor', { replace: true });
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="row w-100 justify-content-center px-2">
                <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                    
                    <div className="card shadow-lg border-0" style={{ borderRadius: 'var(--radio-borde, 16px)', overflow: 'hidden' }}>
                        
                        {/* Cabecera oscura con la marca */}
                        <div className="bg-dark text-center py-4 border-bottom" style={{ borderColor: 'var(--color-rojo-tomate) !important', borderBottomWidth: '3px !important' }}>
                            <h1 className="fw-bold mb-0 text-white fs-2">
                                <span style={{ color: 'var(--color-rojo-tomate)' }}>+</span>PIZZA
                            </h1>
                            <p className="text-secondary mb-0 mt-1 fw-semibold">Gestor Administrativo</p>
                        </div>

                        {/* Cuerpo del formulario */}
                        <div className="card-body p-4 p-md-5 bg-white">
                            <h2 className="h5 text-center mb-4 text-muted fw-semibold">Ingresá tus credenciales</h2>
                            
                            <FormularioLogin onIngresar={handleIngresar} />
                            
                            {/* Credenciales de prueba adaptadas al diseño */}
                            <div className="mt-4 p-3 rounded text-center" style={{ backgroundColor: '#fdf3f2', border: '1px solid #fad5d2' }}>
                                <p className="small mb-0" style={{ color: 'var(--color-rojo-tomate)' }}>
                                    <strong className="d-block mb-1">Acceso de prueba:</strong>
                                    admin@maspizza.com <br /> 
                                    <strong>Clave:</strong> admin123
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-link text-muted text-decoration-none fw-semibold"
                        >
                            ← Volver al sitio público
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LoginPage;