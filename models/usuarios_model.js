/*
;
create table users(
    usu_id int auto_increment,
    usu_email varchar(100) not null,
    usu_password varchar(100) not null,
    usu_estado int not null,
    
    primary key(usu_id)
);
*/
const { response } = require('express');
const pool = require('../db/db_helper');

class Users {
    constructor() {
        this.usu_id = null;
        this.usu_email = null;
        this.usu_password = null;
        this.usu_estado = null;
    }
    async registrar_usu(data) {
        var response;
        var exEmail;
        var exPass;
        try {
            exEmail = 'usu_email' in data;
            exPass = 'usu_password' in data;
        } catch (err) {
            response = { msg: String(err), ok: false };
            return response;
        }
        if (!exEmail || !exPass) {
            response = { msg: 'Email y password no pueden ser null', ok: false };
            return response;
        }
        this.usu_email = data.usu_email;
        this.usu_password = data.usu_password;
        if (this.usu_email === null || this.usu_email === '') {
            response = { msg: 'Email no puede ser null o vacio', ok: false };
            return response;
        }
        if (this.usu_password === null || this.usu_password === '') {
            response = { msg: 'Password no puede ser null o vacio', ok: false };
            return response;
        }

        var sqlString = "SELECT * FROM users WHERE usu_email = '" + this.usu_email + "' ";
        var dbResponse = await pool.query(sqlString);
        if (dbResponse.length > 0) {
            response = { msg: 'El email ingresado ya esta en uso...', ok: false };
            return response;
        }
        var nuevoUsuarioData = {
            usu_email: this.usu_email,
            usu_password: this.usu_password,
            usu_estado: 1
        };
        sqlString = 'INSERT INTO users SET ?';
        dbResponse = await pool.query(sqlString, [nuevoUsuarioData]);
        response = {
            msg: 'registrado con exito',
            ok: true,
            id: dbResponse.insertId
        };
        return response;
    }
    async login_usu(data) {
        var response;
        var exEmail;
        var exPass;
        try {
            exEmail = 'usu_email' in data;
            exPass = 'usu_password' in data;
        } catch (err) {
            response = { msg: String(err), ok: false };
            return response;
        }
        if (!exEmail || !exPass) {
            response = { msg: 'Email y password no pueden ser null', ok: false };
            return response;
        }
        this.usu_email = data.usu_email;
        this.usu_password = data.usu_password;
        if (this.usu_email === null || this.usu_email === '') {
            response = { msg: 'Email no puede ser null o vacio', ok: false };
            return response;
        }
        if (this.usu_password === null || this.usu_password === '') {
            response = { msg: 'Password no puede ser null o vacio', ok: false };
            return response;
        }
        var sqlString = "SELECT * FROM users WHERE usu_email = '" + this.usu_email + "' AND usu_estado = 1";
        var dbResponse = await pool.query(sqlString);
        if (dbResponse.length === 0) {
            response = { msg: "No existe un usuario con el email ingresado", ok: false };
            return response;
        } else {
            if (dbResponse[0].usu_password === this.usu_password) {
                response = { msg: "Login exitoso", ok: true };
                return response;
            } else {
                response = { msg: "Password incorrecta", ok: false };
                return response;
            }
        }
    }
    async obtenerUsarioEmail(email) {
        var response;
        if (typeof (email) !== "string" || email === "") {
            response = {
                ok: false,
                msg: "email debe ser string no vacio"
            };
            return response;
        }
        this.usu_email = email;
        var sqlString = "SELECT * FROM users WHERE usu_estado = 1 AND usu_email = '" + this.usu_email + "' ";
        var dbResponse = await pool.query(sqlString);
        if (dbResponse.length > 0) {
            response = {
                ok: true,
                result: dbResponse[0]
            }
        } else {
            response = {
                ok: false,
                result: "No se encontro usuario con email"
            }
        }
        return response;
    }
}

module.exports = Users;