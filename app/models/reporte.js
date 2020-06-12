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
    comentarioAdmin: String,
    notificado: String,
    idioma: String
    
});

module.exports = mongoose.model("Reporte", ReporteSchema);
