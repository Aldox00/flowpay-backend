const pool = require('../config/db');

const Encuesta = {
    guardarEncuesta: async (id_usuario, pregunta_1, pregunta_2, pregunta_3) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const queryEncuesta = 'INSERT INTO encuestas (id_usuario, pregunta_1, pregunta_2, pregunta_3) VALUES (?, ?, ?, ?)';
            await connection.query(queryEncuesta, [id_usuario, pregunta_1, pregunta_2, pregunta_3]);

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