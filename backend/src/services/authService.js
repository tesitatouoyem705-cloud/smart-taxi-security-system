const bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken");
const hashPassword=p=>bcrypt.hash(p,12),comparePassword=(p,h)=>bcrypt.compare(p,h);
const createToken=u=>jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET||"development-secret",{expiresIn:"1d"});
module.exports={hashPassword,comparePassword,createToken};
