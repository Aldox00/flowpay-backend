const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log("servidor flowpay corriendo en el puerto" + PORT);
    console.log("http://localhost:" + PORT + "/api/health" );
    console.log("probando servidor :)");
    console.log("cesar=alejandro");
});