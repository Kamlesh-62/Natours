const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' })


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(conObj => {
    console.log(conObj.connections)
    console.log("successful")
})



// script for importing data into database
// ==================================
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

// omport data in to databse

const importData = async () => {
    try{
        await Tour.create(tours);
        await Review.create(reviews);
        await User.create(users, { validateBeforeSave: false});
        console.log('data successfully store')
    }catch(err){
        console.log(err)
    }
    process.exit();
};
// delete all data from dB

const deleteData = async () =>{

    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('successfully deleted')
    }catch(err){
        console.log(err)
    }
    process.exit();
} 

if(process.argv[2] === "--import"){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv);
// by console we can know what is index of --import and delete in array