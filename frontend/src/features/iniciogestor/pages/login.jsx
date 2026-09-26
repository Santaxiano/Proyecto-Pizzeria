import { useNavigate } from 'react-router'
import FormularioLogin from '../components/formulario'
import { iniciarSesion } from '../service/inicioservice'

function LoginPage() {
    const navigate = useNavigate()

    async function handleIngresar({ email, password }) {
        await iniciarSesion(email, password)
        navigate('/gestor', { replace: true })
    }

    return (
        <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-md-8 col-lg-5 col-xl-4">
                    <h1 className="text-center mb-4" style={{ color: 'var(--color-negro)' }}>Ingresar al gestor</h1>

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="h4 text-center text-muted mb-4">Acceso para administradores</h2>
                            <FormularioLogin onIngresar={handleIngresar} />
                        </div>
                    </div>

                    <div className="alert alert-secondary text-center small">
                        <strong>Usuario de prueba:</strong> admin@indumentariasur.com <br /> <strong>Contraseña:</strong> admin123
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage