/*
create table salas(
    sal_id int auto_increment,
    sal_usuario int not null,
    sal_img int not null,
    sal_code varchar(50) not null,
    sal_level int not null,
    sal_estado int not null,
    
    primary key(sal_id),
    foreign key(sal_usuario) references users(usu_id),
    foreign key(sal_img) references images(img_id)
);
*/
const pool = require("../db/db_helper");
const Users = require("./usuarios_model");
const Images = require("./images_model");

class Salas {
    constructor() {
        this.sal_id = null;
        this.sal_usuario = null;
        this.sal_img = null;
        this.sal_code = null;
        this.sal_level = null;
        this.sal_estado = null;
    }
    async crear_sal(data) {
        var response;
        var eImgid;
        var eUsuemail;
        var eSalcode;
        var eLevel;
        try {
            eImgid = "sal_img" in data;
            eUsuemail = "usu_email" in data;
            eSalcode = "sal_code" in data;
            eLevel = "sal_level" in data;
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return;
        }
        if (!eImgid || !eUsuemail || !eSalcode || !eLevel) {
            response = { ok: false, msg: "Asegurese de haber enviado todos los parametros en data" };
            return response;
        }
        this.sal_img = data.sal_img;
        if (this.sal_img === null || this.sal_img === "") {
            response = { ok: false, msg: "Imagen nula o vacia" };
            return response;
        }
        this.sal_level = data.sal_level;
        if (this.sal_level === null || this.sal_level === "") {
            response = { ok: false, msg: "Level nulo o vacio" };
            return response;
        }
        this.sal_code = data.sal_code;
        if (this.sal_code === null || this.sal_code === "") {
            response = { ok: false, msg: "Codigo nulo o vacio" };
            return response;
        }
        var sqlString = "SELECT * FROM salas WHERE sal_estado = 1 AND sal_code = '" + this.sal_code + "' ";
        var dbResponse;
        try {
            dbResponse = await pool.query(sqlString);
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        if (dbResponse.length > 0) {
            response = { ok: false, msg: "Codigo en uso...eliga otro codigo para la partida" };
            return response;
        }
        var usuObj = new Users();
        var userImg = await usuObj.obtenerUsarioEmail(data.usu_email);
        if (userImg.ok === false) {
            response = { ok: false, msg: userImg.msg };
            return response;
        }
        this.sal_usuario = userImg.result.usu_id;
        var newSalaData = {
            sal_usuario: this.sal_usuario,
            sal_img: this.sal_img,
            sal_code: this.sal_code,
            sal_level: this.sal_level,
            sal_estado: 1
        };
        try {
            sqlString = "INSERT INTO salas SET ?";
            dbResponse = await pool.query(sqlString, newSalaData);
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        response = { ok: true, msg: "Registro exitoso" };
        return response;
    }
    async unirse_sal(data) {
        var eCode;
        var response;
        try {
            eCode = "sal_code" in data;
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        if (!eCode) {
            response = { ok: false, msg: "Debe ingresar el codigo de sala" };
            return response;
        }
        this.sal_code = data.sal_code;
        if (this.sal_code === "" || this.sal_code === null) {
            response = { ok: false, msg: "Codigo de sala vacio o nulo" };
            return response;
        }
        var sqlString = "SELECT * FROM salas WHERE sal_estado = 1 AND sal_code = '" + this.sal_code + "' ";
        var dbResponse;
        try {
            dbResponse = await pool.query(sqlString);
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        if (dbResponse.length === 0) {
            response = { ok: false, msg: "No se encontro sala con ese codigo" };
            return response;
        }
        this.sal_img = dbResponse[0].sal_img;
        var imgObj = new Images();
        var imgReq = await imgObj.obtenerImgId(this.sal_img);
        if (imgReq.ok === false) {
            response = { ok: false, msg: imgReq.msg };
            return response;
        }

        response = { ok: true, salObj: dbResponse[0], imgObj: imgReq.result, msg: "Ingreso exitoso..." };
        return response;
    }

    async close_sal(data) {
        var eCode;
        var response;
        try {
            eCode = "sal_code" in data;
        } catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        if (!eCode) {
            response = { ok: false, msg: "Debe enviar un codigo" };
            return response;
        }
        this.sal_code = data.sal_code;
        if (this.sal_code === null || this.sal_code === "") {
            response = { ok: false, msg: "Codigo no puede ser vacio" };
            return response;
        }
        var sqlString = "UPDATE salas SET sal_estado = 0 WHERE sal_code = '" + this.sal_code + "' ";
        var dbResponse;
        try{
            dbResponse = await pool.query(sqlString);
        }catch (err) {
            response = { ok: false, msg: String(err) };
            return response;
        }
        response = {ok: true, msg: "Sala cerrada"};
        return response;
    }
}

module.exports = Salas;