const pool = require('../config/db');

const Encuesta = {
    guardarEncuesta: async (id_usuario, pregunta_1, pregunta_2, pregunta_3) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const queryEncuesta = 'INSERT INTO encuestas (id_usuario, pregunta_1, pregunta_2, pregunta_3) VALUES (?, ?, ?, ?)';
            await connection.query(queryEncuesta, [id_usuario, pregunta_1, pregunta_2, pregunta_3]);

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
            await connection.query(queryActualizarJornada, [id_usuario]);

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