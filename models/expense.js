const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('Expense',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull: false
    },
    amount:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    },
},
    {
        tableName: 'expense',
        timestamps: false,          // Set timestamps to false to disable the default timestamps
    }
);

module.exports = Expense;