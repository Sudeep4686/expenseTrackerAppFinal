const Expense = require('../models/expense');
const User = require('../models/user');
const DownloadReport = require('../models/downloadreport');
const UserServices = require('../services/userservices');
const S3 = require('../services/S3');


async function addExpense(req, res) {
    try {
      const { amount, description, category } = req.body;
      const expense = await Expense.create({
        amount: amount,
        description: description,
        category: category,
        userId: req.user.id
      });
      const userId = req.user.id;
      const totalExpense = await Expense.sum('amount', { where: { userId } });
      // Update the totalexpense field in the users table
      await User.update({ totalexpense: totalExpense }, { where: { id: userId } });
      res.status(200).json({ message: 'Expense created successfully', expense });
    } catch (error) {
        console.log(error.message);
      res.status(500).json({ message: 'Failed to create expense', error: error });
    }
  }

async function getExpense(req, res) {
    try {
      const userId = req.user.id;
      console.log("USERId: ",userId);
      const page = +req.query.page || 1;
      const pageSize = +req.query.pageSize || 10;
      // const data = await Expense.findAll({ where: { userId: userId } });
      // res.send({data});
      const {count,rows:expenses}=await Expense.findAndCountAll({
        where:{userId},
        offset :(page-1)*pageSize,
        limit:pageSize,   
        order:[['id','DESC']]                       
      });
      res.status(200).json({
        allExpense: expenses,
        currentPage:page,
        totalExpense:count,
        hasNextpage: pageSize * page < count,
        nextPage : page+1,
        hasPreviousPage : page-1,
        lastPage:Math.ceil(count/pageSize)
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
}

async function deleteExpense(req, res) {
    try {
      const expenseId = req.params.id;

      // Retrieve the expense that is going to be deleted
      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        return res.status(404).send({ message: 'Expense not found' });
      }
      // Delete the expense from the database
      await Expense.destroy({ where: { id: expenseId } });
      const userId = req.user.id;
      // Recalculate the total expense for the user
      const totalExpense = await Expense.sum('amount', { where: { userId } });

      // Update the totalexpense field in the users table
      await User.update({ totalexpense: totalExpense }, { where: { id: userId } });

      res.send({ message: 'Expense deleted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error deleting expense.' });
    }
}

const downloadReport = async(req,res,next)=>{
  try{
    if(req.user.ispremiumuser ===true ){
      const expenses =  await UserServices.getExpenses(req);
      console.log(expenses,"PRINTING FROM EXPENSEC");
      const stringifiedExpenses = JSON.stringify(expenses);
      const userId = req.user.id;
      const filename = `Expense${userId}/${new Date()}.txt`;
      const bufferData = Buffer.from(stringifiedExpenses,'utf-8');
      console.log(filename,"FILENAME")
      const fileURL = await S3.uploadToS3(bufferData,filename);
      await DownloadReport.create({
        userId: userId,
        URL: fileURL
      });
      res.status(200).json({fileURL})
    }else{
      res.status(403).json({message:'Only Premium Users can download the report.'})
    }
  }catch(err){
    console.log("Printing the error in downloading the report",err.message);
  }
}

module.exports = {addExpense,getExpense,deleteExpense,downloadReport};