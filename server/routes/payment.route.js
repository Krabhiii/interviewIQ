import express from "express";

import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

import isAuth from "../middlewares/isAuth.js";

const paymentRouter = express.Router();

// CREATE ORDER
paymentRouter.post(
  "/order",
  isAuth,
  createOrder
);

// VERIFY PAYMENT
paymentRouter.post(
  "/verify",
  isAuth,
  verifyPayment
);

export default paymentRouter;