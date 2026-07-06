const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// 🎯 AGREGAMOS '0.0.0.0' AQUÍ para que acepte las conexiones de tu celular Xiaomi por Wi-Fi:
app.listen(PORT, '0.0.0.0', () => {
    console.log("servidor flowpay corriendo en el puerto" + PORT);
    console.log("http://localhost:" + PORT + "/api/health" );
    console.log("probando servidor :)");
    console.log("cesar=alejandro");
});