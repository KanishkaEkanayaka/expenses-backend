var cors = require('cors');
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug')('app:db');
const error = require('./middleware/error');
const users = require('./routes/users');
const categories = require('./routes/categories');
const helmet = require('helmet');
const auth = require('./routes/auth');
const bodyParser = require('body-parser');

const app = express();

//Set view engine
app.set('view engine','ejs');

app.use(express.json());
//create instance of body parser to use
// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(express.urlencoded({extended:true})); // when we get urlencoded body.(When passing html form data to webserver and etc) 
app.use(express.static('public')); // specify the folder which contains all the public assets.
                                   //anything inside this file can be accessed by the root(ex :- localhost:5000/readme.txt)

app.use(helmet());

//check whether the jwt.private key is set. otherwise exit the program
if(!config.get('jwt.privateKey')){
    console.error('FATAL ERROR: jwt.privateKey not defined');
    process.exit(1);
}

//check whether the database.location is set. otherwise exit the program
if(!config.get('database.location')){
    console.error('FATAL ERROR: database.location not defined');
    process.exit(1);
}

mongoose.connect(config.get('database.location'))
    .then(debug('Database Connected'))
    .catch((err)=>(debug('Database connection failed..')));

    var corsOptions = {
        origin: ["http://localhost:3000"],
        optionsSuccessStatus: 200 // For legacy browser support
        }
        
        app.use(cors(corsOptions));

app.use('/api/users',users);
app.use('/api/auth',auth);
app.use('/api/categories',categories);

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
});