import UserModel from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import transporter from "../config/emailonfig.js"

class UserController{
    static userRegistration = async(req,res)=>{
        const {name, email, password, pass_confirm, tc}= req.body
        const user = await UserModel.findOne({email:email})
        if(user){
            res.send({"status":"failed", "msg":"Email already exists"})
        }
        else{
            if(name && email && password && pass_confirm && tc){
                if(password === pass_confirm){
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password,salt)
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        })
                        await doc.save()  
                        const saved_user = await UserModel.findOne({email: email})

                        //Generater JWT Token
                        const token = jwt.sign({userID: saved_user._id}, process.env.JWT_SECRET_KEY,{expiresIn : "2d"})
                        res.status(201).send({"status":"Success", "msg":"Register successfuly", "token": token})
                    } catch (error) {
                        console.log(error)
                        res.send({"status":"failed", "msg":"Unable to Register"})
                    }
                }
                else{
                    res.send({"status":"failed", "msg":"Password and Pass_confirm does not match"})
                }

            }
            else{
                res.send({"status":"failed", "msg":"all fields are required"})
            }
        }
    }

    static userLogin = async(req, res)=>{
        try {
            const {email, password}= req.body
            if(email && password){
                const user = await UserModel.findOne({email: email})
                if(user != null){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if((user.email === email)&& isMatch){
                         //Generater JWT Token
                         const token = jwt.sign({userID: user._id}, process.env.JWT_SECRET_KEY,{expiresIn : "2d"})
                        res.send({ "status": "Success", "msg": "Login Success", "token": token })
                    }
                }
                else{
                    res.send({ "status": "failed", "msg": "Email or Password is not Valid" })
                }
            }else{
                res.send({"status":"failed", "msg":"all fields are required"})
            }
        } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "msg": "Unable to login" })
        }

        
    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
      }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
          const user = await UserModel.findOne({ email: email })
          if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)
            //  Send Email
            let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Password Reset Link",
            html: `<a href=${link}>Click Here</a> to Reset Your Password`
            })
            res.send({ "status": "success", "msg": "Password Reset Email Sent... Please Check Your Email" })
          } else {
            res.send({ "status": "failed", "msg": "Email doesn't exists" })
          }
        } else {
          res.send({ "status": "failed", "msg": "Email Field is Required" })
        }
      }

    static userPasswordReset = async (req, res) => {
        const { password, pass_confirma } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
          jwt.verify(token, new_secret)
          if (password && pass_confirm) {
            if (password !== pass_confirm) {
              res.send({ "status": "failed", "msg": "New Password and Confirm New Password doesn't match" })
            } else {
              const salt = await bcrypt.genSalt(10)
              const newHashPassword = await bcrypt.hash(password, salt)
              await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
              res.send({ "status": "success", "msg": "Password Reset Successfully" })
            }
          } else {
            res.send({ "status": "failed", "msg": "All Fields are Required" })
          }
        } catch (error) {
          console.log(error)
          res.send({ "status": "failed", "msg": "Invalid Token" })
        }
      }
}

export default UserController