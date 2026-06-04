import crypto from "crypto";

import razorpay from "../services/razorpay.service.js";

import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

const plans = {
  starter: {
    amount: 0,
    credits: 100,
  },

  pro: {
    amount: 149,
    credits: 200,
  },

  ultimate: {
    amount: 499,
    credits: 650,
  },
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!plans[planId]) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const selectedPlan = plans[planId];

    // FREE PLAN
    if (selectedPlan.amount === 0) {
      const user = await User.findById(req.userId);

      user.credits += selectedPlan.credits;
      await user.save();

      await Payment.create({
        userId: user._id,
        planId,
        amount: 0,
        credits: selectedPlan.credits,
        status: "paid",
      });

      return res.json({
        success: true,
        free: true,
        credits: user.credits,
      });
    }

    // PAID PLAN
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const payment = await Payment.create({
      userId: req.userId,
      planId,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Order creation failed",
    });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";

    await payment.save();

    const user = await User.findById(payment.userId);

    user.credits += payment.credits;
    await user.save();

    return res.json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Verification failed",
    });
  }
};