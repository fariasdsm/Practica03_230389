import express from 'express';
import session from 'express-session';
import moment from 'moment-timezone'; // Importar moment-timezone

const app = express();

// Configuración del middleware de sesiones
app.use(session({
    secret: 'p3-AFL#tigrillo-sesionespersistentes',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Ruta para inicializar la sesión
app.get('/iniciar-sesion', (req, res) => {
    if (!req.session.inicio) {
        req.session.inicio = new Date();
        req.session.ultimoAcceso = new Date();
        res.send('Sesión iniciada');
    } else {
        res.send('Sesión ya iniciada');
    }
});

// Ruta para actualizar la fecha de última consulta
app.get('/actualizar', (req, res) => {
    if (req.session.inicio) {
        req.session.ultimoAcceso = new Date();
        res.send('Fecha de última consulta actualizada');
    } else {
        res.send('No hay una sesión activa.');
    }
});

// Ruta para obtener el estado de la sesión
app.get('/estado-sesion', (req, res) => {
    if (req.session.inicio) {
        const ahora = new Date();
        const inicio = new Date(req.session.inicio);
        const ultimoAcceso = new Date(req.session.ultimoAcceso);

        // Calcular la antigüedad de la sesión
        const antiguedadMs = ahora - inicio;
        const horas = Math.floor(antiguedadMs / (1000 * 60 * 60));
        const minutos = Math.floor((antiguedadMs % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((antiguedadMs % (1000 * 60)) / 1000);

        // Convertir las fechas al huso horario de CDMX
        const inicioCDMX = moment(inicio).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const ultimoAccesoCDMX = moment(ultimoAcceso).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            mensaje: 'Estado de la sesión',
            sesionID: req.sessionID,
            inicio: inicioCDMX,
            ultimoAcceso: ultimoAccesoCDMX,
            antiguedad: `${horas} horas, ${minutos} minutos y ${segundos} segundos`
        });
    } else {
        res.send('No hay una sesión activa.');
    }
});

// Ruta para cerrar la sesión
app.get('/cerrar-sesion', (req, res) => {
    if (req.session.inicio) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error al cerrar la sesión');
            }
            res.send('Sesión cerrada correctamente.');
        });
    } else {
        res.send('No hay una sesión activa para cerrar.');
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
