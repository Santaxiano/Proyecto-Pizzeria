import { useRef, useState } from 'react';
import { esEmailValido, esRequerido } from '../../../shared/utilss/validacion';

function validar(valores) {
    const errores = {};
    if (!esRequerido(valores.nombre)) errores.nombre = 'Ingresá el nombre.';
    if (!esRequerido(valores.email)) errores.email = 'Ingresá el email.';
    else if (!esEmailValido(valores.email)) errores.email = 'El formato del email no es válido.';
    if (!esRequerido(valores.password)) errores.password = 'Ingresá una contraseña.';
    if (!esRequerido(valores.rol) || valores.rol === '') errores.rol = 'Seleccioná un rol.';
    return errores;
}

function FormularioRegistro({ onRegistrar }) {
    const [valores, setValores] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
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
            await onRegistrar(valores);
            setValores({ nombre: '', email: '', password: '', rol: 'empleado' });
        } catch (error) {
            setErrorServidor(error.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form ref={formularioRef} onSubmit={handleSubmit} noValidate>
            {errorServidor && (
                <div className="alert alert-danger" role="alert">
                    {errorServidor}
                </div>
            )}

            <div className="mb-3">
                <label htmlFor="nombre" className="form-label fw-bold">Nombre Completo</label>
                <input id="nombre" name="nombre" type="text"
                    className={`form-control p-3 ${errores.nombre ? 'is-invalid' : ''}`}
                    value={valores.nombre} onChange={handleChange} disabled={enviando}
                />
                {errores.nombre && <div className="invalid-feedback fw-bold">{errores.nombre}</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="email" className="form-label fw-bold">Email</label>
                <input id="email" name="email" type="email" autoComplete="off"
                    className={`form-control p-3 ${errores.email ? 'is-invalid' : ''}`}
                    value={valores.email} onChange={handleChange} disabled={enviando}
                />
                {errores.email && <div className="invalid-feedback fw-bold">{errores.email}</div>}
            </div>

            <div className="mb-3">
                <label htmlFor="rol" className="form-label fw-bold">Rol en el sistema</label>
                <select id="rol" name="rol"
                    className={`form-select p-3 ${errores.rol ? 'is-invalid' : ''}`}
                    value={valores.rol} onChange={handleChange} disabled={enviando}
                >
                    <option value="empleado">Empleado</option>
                    <option value="administrador">Administrador</option>
                </select>
                {errores.rol && <div className="invalid-feedback fw-bold">{errores.rol}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label fw-bold">Contraseña</label>
                <div className="input-group">
                    <input id="password" name="password" type={mostrarPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={`form-control p-3 ${errores.password ? 'is-invalid' : ''}`}
                        value={valores.password} onChange={handleChange} disabled={enviando}
                    />
                    <button type="button" className="btn btn-outline-secondary px-4 fw-bold"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                    >
                        {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                    {errores.password && <div className="invalid-feedback fw-bold">{errores.password}</div>}
                </div>
            </div>

            <button type="submit" className="btn btn-tomate w-100 py-3 fw-bold fs-5 text-white" disabled={enviando}>
                {enviando ? 'Registrando...' : 'Registrar'}
            </button>
        </form>
    );
}

export default FormularioRegistro;