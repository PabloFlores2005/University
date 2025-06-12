const axios = require('axios');
const { Buffer } = require('buffer');

async function decode() {
    try {
        const response = await axios.get('https://callback-iot.onrender.com/data');
        const data = response.data;
        
        data.forEach(item => {
            if (item.hexData) {
                const buffer = Buffer.from(item.hexData, 'hex');
                const temp = buffer.readFloatLE(0);
                const hum = buffer.readFloatLE(4);
                const pres = buffer.readFloatLE(8);
                
                console.log(`Dispositivo: ${item.device}`);
                console.log(`Temperatura: ${temp.toFixed(2)} °C`);
                console.log(`Humedad: ${hum.toFixed(2)} %`);
                console.log(`Presión: ${pres.toFixed(2)} hPa\n`);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

decode();