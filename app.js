const express = require('express')
const path = require('path')
const fs = require('fs');
const bodyParser = require('body-parser')
const app = express();
var cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const controller = require('./controllers/loginC');
const sequelize = require('./util/database');
// const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Password = require('./models/password');
const downloadreport = require('./models/downloadreport');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cors());

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),
{flags:"a"}
);

// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'","https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com"],
//       },
//     })
// );
app.use(compression());
app.use(morgan('combined',{ stream:accessLogStream }));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','signup.html'));
}); 

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


const userRouter = require('./routes/users');
const expenseRouter = require('./routes/expenses');
const purchaseRouter = require('./routes/purchase');
const passwordRouter = require('./routes/forgotpassword');

app.use('/user', userRouter);
app.use('/expense',expenseRouter);
app.use('/purchase',purchaseRouter);
app.use('/password',passwordRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Password);
Password.belongsTo(User);

User.hasMany(downloadreport);
downloadreport.belongsTo(User);

sequelize.sync({force:false})
    .then(()=>{
        console.log("Models synchronised with database")
    })
    .catch((err)=>{
        console.log(err.message);
        console.log("Failed to sync models with database",err);
    });

app.listen(process.env.PORT || 3100);