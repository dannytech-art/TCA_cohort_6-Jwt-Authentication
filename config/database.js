const mongoose = require('mongoose')
require('dotenv').config()

const DB = process.env.MONGODB_URI

mongoose.connect(DB).then(()=>{
    console.log(`db connected`);
    
}).catch((error)=>{
    console.log(`error connecting to db:${error}`);
    
})