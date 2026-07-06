const pool = require('../config/db');

const Encuesta = {
    guardarYLiberarHistorial: async (jornada_id, puntuacion_app, comentarios) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 🚨 CORRECCIÓN QUIRÚRGICA: Añadimos fecha_respuesta y NOW() para cumplir con tu tabla de MySQL
            const queryEncuesta = 'INSERT INTO encuestas (jornada_id, puntuacion_app, comentarios, fecha_respuesta) VALUES (?, ?, ?, NOW())';
            await connection.query(queryEncuesta, [jornada_id, puntuacion_app, comentarios || null]);

            const queryJornada = "UPDATE jornadas SET encuesta_contestada = 1 WHERE id = ?";
            await connection.query(queryJornada, [jornada_id]);

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