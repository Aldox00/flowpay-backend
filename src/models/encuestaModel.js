const pool = require('../config/db');

const Encuesta = {
    guardarEncuesta: async ({ id_usuario, jornada_id, pregunta_1, pregunta_2, pregunta_3 }) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            let usuarioId = id_usuario;

            if (!usuarioId && jornada_id) {
                const [jornadas] = await connection.query(
                    'SELECT usuario_id FROM jornadas WHERE id = ? LIMIT 1',
                    [jornada_id]
                );

                if (!jornadas.length) {
                    throw new Error('No se encontró la jornada indicada.');
                }

                usuarioId = jornadas[0].usuario_id;
            }

            if (!usuarioId) {
                throw new Error('No se encontró el usuario asociado a la encuesta.');
            }

            const queryEncuesta = `
                INSERT INTO encuestas (id_usuario, pregunta_1, pregunta_2, pregunta_3)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    pregunta_1 = VALUES(pregunta_1),
                    pregunta_2 = VALUES(pregunta_2),
                    pregunta_3 = VALUES(pregunta_3),
                    fecha = NOW()
            `;
            await connection.query(queryEncuesta, [usuarioId, pregunta_1, pregunta_2, pregunta_3]);

            const queryActualizarJornada = `
                UPDATE jornadas j
                JOIN (
                    SELECT id FROM jornadas
                    WHERE usuario_id = ? AND estado = 'cerrada'
                    ORDER BY fecha_fin DESC
                    LIMIT 1
                ) ultima ON j.id = ultima.id
                SET j.encuesta_contestada = 1
            `;
            await connection.query(queryActualizarJornada, [usuarioId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = Encuesta;