const { log } = require('console')
const express = require('express')
require('./config/database')
const app = express()
const userRouter = require('./routes/userRouter')
const port = process.env.PORT
app.use(express.json())
app.use(userRouter)

app.listen(port, ()=>{
    log(`app is running on port: ${port}`)
})