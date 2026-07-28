const pool = require('../config/db');

const Encuesta = {
    guardarEncuesta: async (jornada_id, id_usuario, pregunta_1, pregunta_2, pregunta_3) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const queryEncuesta = 'INSERT INTO encuestas (jornada_id, id_usuario, pregunta_1, pregunta_2, pregunta_3) VALUES (?, ?, ?, ?, ?)';
            await connection.query(queryEncuesta, [jornada_id, id_usuario, pregunta_1, pregunta_2, pregunta_3]);

            const queryActualizarJornada = 'UPDATE jornadas SET encuesta_contestada = 1 WHERE id = ?';
            await connection.query(queryActualizarJornada, [jornada_id]);

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