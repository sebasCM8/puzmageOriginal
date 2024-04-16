const express = require("express");
const http = require("http");
const path = require("path");
const bodyparser = require("body-parser");
const cors = require("cors");
const {Server} = require("socket.io");

//SESSION LIBRARIES
var session = require("express-session");
var mysqlStore = require("express-mysql-session")(session);

const app = express();
const server = http.createServer(app);

var corsOpt = {
    origin: "*"
};
app.use(cors(corsOpt));

//SOCKET IO CONF
const io = new Server(server);
io.on("connection", (socket)=>{
    console.log("A user connected");

    socket.on("newPlayer", (data)=>{
        socket.join(data.sal_code);
        socket.to(data.sal_code).emit("newPlayer", data);
    });

    socket.on("existentPlayer", (data)=>{
        socket.to(data.sal_code).emit("existentPlayer", data);
    });

    socket.on("listo", (data)=>{
        socket.to(data.sal_code).emit("listo", data);
    });

    socket.on("playerLeft", (data)=>{
        socket.to(data.sal_code).emit("playerLeft", data);
    });

    socket.on("pieza", (data)=>{
        socket.to(data.sal_code).emit("pieza", data);
    });

    socket.on("piezaO", (data)=>{
        socket.to(data.sal_code).emit("piezaO", data);
    });

    socket.on("piezaL", (data)=>{
        socket.to(data.sal_code).emit("piezaL", data);
    });
});

//SESSION CONF
var sessionOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'wserver',
    database: 'puzmage'
};
var sessionStore = new mysqlStore(sessionOptions);

app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.use(session({
    key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

//EJS ENGINE CONF
app.set("view engine", "ejs");

//IMPORT AND USE ROUTES CONTAINER
const router = require("./routes/routes");
const req = require("express/lib/request");
const exp = require("constants");
app.use(router);

app.use(express.static(path.join(__dirname, 'static')));
const port = 3004;
server.listen(port, () => {
    console.log("Running on port: " + port);
});