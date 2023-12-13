import {pool} from '../database/conexion.js';
import jwt from 'jsonwebtoken';

export const validarUsuario = async(req,res)=>{

    try {
        let {identificacion, contraseña} = req.body;

        let sql = `SELECT id_usuario, nombres, rol FROM usuario WHERE identificacion = ? and contraseña = ?`;
        const [rows] = await pool.query(sql, [identificacion, contraseña]);        

        if(rows.length>0){

            let token = jwt.sign({user:rows},process.env.AUT_SECRET,{expiresIn:process.env.AUT_EXPIRE});

            return res.status(200).json({token:token,message:'Usuario autorizado..'});
        }else{
            res.status(401).json({message:'Usuario no encontrado...'});
        }

    }catch (e) {
        res.status(500).json({message:'error en el sistema ' +e})

    }
}

export const validarToken = async (req,res,next)=>{

    try{ 
    let token_usuario = req.headers['token'];

    if(!token_usuario){
        return res.status(401).json({message: 'Se requiere el token...'});
    }else{

        const decoded = jwt.verify(token_usuario, process.env.AUT_SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token caducado', autorizado: false });
                } else {
                    return res.status(401).json({ message: 'Token inválido', autorizado: false });
                }
            } else {
                next();
            }
        });     
    }
} catch (e) {
    return res.status(401).json({ message: 'Error al validar el token: ' + e });
}
} 