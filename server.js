const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/guardar", (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, "comodin.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error on writing file:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    console.log("Data saved succesfully");
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});