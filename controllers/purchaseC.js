const Razorpay = require('razorpay');
const Order = require('../models/order');

const purchasePremium = async (req,res,next)=>{
    try{
        const razor = new Razorpay({
            key_id: "rzp_test_2Z8AChmXggn6FY",
            key_secret : "4drfp3zRFgJ2DjeXKeyZ5nhu"
        });

        const amount = 2000;

        razor.orders.create({amount, currency:"INR"},async(err,order)=>{
            if(err){
                throw new Error(JSON.stringify(err));
            }

            await req.user.createOrder({orderId:order.id,status:"PENDING"});
            return res.status(201).json({order,key_id:razor.key_id});
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
};

const updateTransactionStatus = async (req,res)=>{
    try{
        const { paymentId,order_id,status} = req.body;         ///////
        console.log("Requested body : ", req.body);
        const order = await Order.findOne({where:{orderId:order_id}});       
        console.log(order,"Prints the Order here");
        await Promise.all([
            order.update({paymentId,status:"SUCCESSFUL"}),       //////
            req.user.update({ispremiumuser:true})
        ]);
        return res.status(202).json({success:true, message:"Transaction Successful",ispremiumuser:true});
    }catch(err){
        console.log(err.message);
        return res.status(500).json({success:false,message:"Internal Server Error"});    
    }
};

module.exports={purchasePremium, updateTransactionStatus};