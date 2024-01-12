import dotenv from "dotenv"
dotenv.config()
import expess from "express"
import connectDB from "./config/connectdb.js"
import userRoutes from "./routes/userRoutes.js"


const app = expess()
const port = process.env.PORT
const DATABASE_URL= process.env.DATABASE_URL


//Database Connection
connectDB(DATABASE_URL)

//Json
app.use(expess.json())

//Load Routes
app.use("/api/user", userRoutes)

app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`)
})