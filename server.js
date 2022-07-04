const mongoose = require('mongoose') 
const dotenv = require('dotenv')

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('uncaught Exception! 🚫 shutting down')
        process.exit(1)
});

dotenv.config({path:'./config.env'});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(() => {
    // console.log(conObj.connections)
    console.log("DB connection successful");
})


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on Port ${port}`)
});

process.on('unhandleRejection', err => {
    console.log(err.name, err.message);
    console.log('unhandle rejection! 🚫 shutting down')
    server.close( ()=>{
        process.exit(1)
    })
})

