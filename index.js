const axios = require('axios'); 
const express = require('express');

const app = express();
app.use(express.json());

let data = [];

app.get('/data', async (req, res) => {
    try {
        const url = "https://callback-iot.onrender.com/data";
        const response = await axios.get(url);
        
        const datos = response.data;

        data = datos.slice(0, 2);

        res.json({
            message: "Data obtained",
            info: data
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/visualize', (req, res) => {
    try {
        const dataReceived = req.body;
        console.log("🔍 Data received to visualize:");
        console.log(dataReceived);

        res.json({ mensaje: "Data received" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});