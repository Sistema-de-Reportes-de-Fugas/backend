var express = require("express"); //importar express
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var app = express(); 
var bodyParser = require("body-parser");
var morgan = require("morgan");
app.use(morgan("dev"));
const cors = require("cors"); //importar cors para su uso
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.options("*", cors());
app.use(morgan("dev"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var uri = "mongodb+srv://user_web:webapp123@webapp-eztga.gcp.mongodb.net/ReportesDeFugas?retryWrites=true&w=majority"

var mongoose = require("mongoose");
mongoose.connect(uri,{useNewUrlParser:true, useUnifiedTopology:true});

var db = mongoose.connection;
db.on('error',console.error.bind(console,'Error de conexión'));
db.once('openUri',function(){
    console.log("Conexión exitosa a MongoDB");
});

// Set up Auth0 configuration
const authConfig = {
    domain: "dev-dzmu24qp.auth0.com",
    audience: "http://localhost:8080/api"
  };


// Define middleware that validates incoming bearer tokens
// using JWKS from dev-dzmu24qp.auth0.com
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
  
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithm: ["RS256"]
  });
  
  


//middleware
var router = express.Router();
//Contador para numero de reportes
var counter=0;
router.use(function(req, res, next) {
    next();
});//habilita el middleware

router.get("/",function(req, res){
    res.json({
        mensaje: "Sistema de reporte de aguas cdmx"
    });
})

router.get("/api",function(req, res){
    res.status(500).send({ 
        error: "Error 500"
    });
});

// Define an endpoint that must be called with an access token
router.get("/api/external", checkJwt, (req, res) => {
    res.send({
      msg: "Your Access Token was successfully validated!"
    });
  });

//declarar modelos
var Reporte = require("./app/models/reporte");
router.route("/reportes").post(async function(req,res) {
        counter = counter + 1;
        var reporte = new Reporte();
        reporte.nombre = req.body.nombre;
        reporte.apellido = req.body.apellido;
        reporte.correo = req.body.correo;
        reporte.direccion = req.body.direccion;
        reporte.referencia = req.body.referencia;
        reporte.tipoPersona = req.body.tipoPersona;
        reporte.comentario = req.body.comentario;
        reporte.numeroReporte = counter; 
        reporte.comentarioAdmin = req.body.comentarioAdmin;
        /*
        if (reporte.nombre == "") {
            res.status(400).send({
                error: "Nombre faltante"
            });
        }
        */
        try {
            await reporte.save(function(err) {
                if(err) {
                    console.log(err);
                    if (err.name == "ValidationError") res.status(400).send({error: err.message});
                }
            });
            res.json({mensaje: "Reporte creado"});
        } catch(error) {
            res.status(500).send({ error: error});
        }
    }).get(function(req, res) {
        Reporte.find(function(err, reportes){
            if(err) {
                res.send(err);
            }
            res.status(200).send(reportes);
        });
    });
router.route("/reportes/:id_reporte").get(function (req, res) {
    Reporte.findById(req.params.id_reporte, function (error, reporte) {
      if (error) {
        res.status(404).send({ message: "Not found" });
        return;
      }
      if (reporte == null) {
        res.status(404).send({ reporte: "Not found" });
        return;
      }
      res.status(200).send(reporte);
    });
  })
    .put(function(req, res) {
        Reporte.findById(req.params.id_reporte, function(err, reporte) {
            if(err) {
                res.send(err);
            }
            reporte.nombre = req.body.nombre;
            reporte.apellido = req.body.apellido;
            reporte.correo = req.body.correo;
            reporte.direccion = req.body.direccion;
            reporte.referencia = req.body.referencia;
            reporte.profesion = req.body.profesion;
            reporte.comentario = req.body.comentario;
            reporte.comentarioAdmin = req.body.comentarioAdmin;

            reporte.save(function(err) {
                if(err) {
                    res.send(err)
                }
                res.json({ message: "Reporte actualizado" })
            }) 
        })
    })
    .delete(function(req, res) {
        Reporte.remove({
            _id: req.params.id_reporte,

        }, function (err, reporte) {
            if(err) {
                res.send(err)
            }
            res.json({ mensaje:"Usuario eliminado" });
        })
    })

app.use("/api",router); //url base de este api que tiene las rutas en el router

app.listen(port); //abre el puerto de escucha
console.log(port)
console.log("Servidor está arriba");