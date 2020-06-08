var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReporteSchema = new Schema({
    nombre: String,
    apellido: String, 
    correo: {
        type: String,
    },
    direccion: String,
    referencia: String, 
    tipoPersona: String, 
    comentario: String,
    numeroReporte: Number,
});

module.exports = mongoose.model("Reporte", ReporteSchema);
