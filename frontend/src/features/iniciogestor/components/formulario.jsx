import { useRef, useState } from 'react';
import { esEmailValido, esRequerido } from '../../../shared/utilss/validacion';

function validar(valores) {
    const errores = {};
    if (!esRequerido(valores.email)) errores.email = 'Ingresá tu email.';
    else if (!esEmailValido(valores.email)) errores.email = 'El formato del email no es válido.';
    if (!esRequerido(valores.password)) errores.password = 'Ingresá tu contraseña.';
    return errores;
}

function FormularioLogin({ onIngresar }) {
    const [valores, setValores] = useState({ email: '', password: '' });
    const [errores, setErrores] = useState({});
    const [errorServidor, setErrorServidor] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const formularioRef = useRef(null);

    function handleChange(e) {
        const { name, value } = e.target;
        setValores({ ...valores, [name]: value });
        if (errores[name]) setErrores({ ...errores, [name]: undefined });
        setErrorServidor('');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const nuevosErrores = validar(valores);
        setErrores(nuevosErrores);

        const primerCampoConError = Object.keys(nuevosErrores)[0];
        if (primerCampoConError) {
            formularioRef.current.elements[primerCampoConError].focus();
            return;
        }

        setEnviando(true);
        try {
            await onIngresar(valores);
        } catch (error) {
            setErrorServidor(error.message);
            setEnviando(false);
        }
    }

    return (
        <form ref={formularioRef} onSubmit={handleSubmit} noValidate>
            {errorServidor && (
                <div className="alert alert-danger text-center" role="alert">
                    {errorServidor}
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold" style={{ color: 'var(--color-negro)' }}>
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    className={`form-control p-3 ${errores.email ? 'is-invalid' : ''}`}
                    value={valores.email}
                    onChange={handleChange}
                    disabled={enviando}
                />
                {errores.email && <div className="invalid-feedback fw-bold">{errores.email}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label fw-bold" style={{ color: 'var(--color-negro)' }}>
                    Contraseña
                </label>
                <div className="input-group">
                    <input
                        id="password"
                        name="password"
                        type={mostrarPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`form-control p-3 ${errores.password ? 'is-invalid' : ''}`}
                        value={valores.password}
                        onChange={handleChange}
                        disabled={enviando}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-4 fw-bold"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        aria-pressed={mostrarPassword}
                    >
                        {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                    {errores.password && <div className="invalid-feedback fw-bold">{errores.password}</div>}
                </div>
            </div>

            <button type="submit" className="btn btn-tomate w-100 py-3 fw-bold fs-5 text-white" disabled={enviando}>
                {enviando ? 'Verificando...' : 'Ingresar'}
            </button>
        </form>
    );
}

export default FormularioLogin;