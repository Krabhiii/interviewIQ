import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Coins,
  Crown,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Rocket,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";

const plans = [
  {
    id: "starter",
    name: "Starter",
    coins: 100,
    price: "₹0",
    icon: <Coins size={34} />,
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/40",
    popular: false,
    features: [
      "2 AI Interviews",
      "Resume Based Questions",
      "Instant AI Evaluation",
      "Performance Report",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    coins: 200,
    price: "₹149",
    icon: <Sparkles size={34} />,
    gradient: "from-violet-500 to-fuchsia-600",
    glow: "shadow-fuchsia-500/40",
    popular: true,
    features: [
      "10 AI Interviews",
      "Advanced AI Feedback",
      "Cheating Detection",
      "Communication Analysis",
      "Priority Processing",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate",
    coins: 650,
    price: "₹499",
    icon: <Crown size={34} />,
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/40",
    popular: false,
    features: [
      "Unlimited Practice Feel",
      "Full AI Analytics",
      "Company Level Questions",
      "Detailed Reports",
      "Premium Experience",
      "Fastest AI Response",
    ],
  },
];

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    console.log("PLAN CLICKED:", plan);

    if (!userData) {
      alert("Please login first");
      return;
    }

    try {
      setLoadingPlan(plan.id);

      const orderRes = await axios.post(
        `${serverUrl}/api/payment/order`,
        { planId: plan.id },
        { withCredentials: true }
      );

      console.log("ORDER RESPONSE:", orderRes.data);

      const data = orderRes.data;

      // FREE PLAN
      if (data.free) {
        dispatch(
          setUserData({
            ...userData,
            credits: data.credits,
          })
        );

        alert(`${plan.name} plan activated successfully`);

        setLoadingPlan(null);

        setTimeout(() => {
          navigate("/");
        }, 1000);

        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay SDK failed to load");
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: data.razorpayKey,
        amount: data.amount * 100,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: `${plan.name} Plan - ${plan.coins} Coins`,
        order_id: data.orderId,

        handler: async function (response) {
          try {
            console.log("RAZORPAY RESPONSE:", response);

            const verifyRes = await axios.post(
              `${serverUrl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            );

            console.log("VERIFY RESPONSE:", verifyRes.data);

            if (verifyRes.data.success) {
              dispatch(
                setUserData({
                  ...userData,
                  credits: verifyRes.data.credits,
                })
              );

              alert("Payment successful! Coins added.");

              setTimeout(() => {
                navigate("/");
              }, 1200);
            }

            setLoadingPlan(null);
          } catch (error) {
            console.log("VERIFY ERROR:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Payment verification failed");
            setLoadingPlan(null);
          }
        },

        prefill: {
          name: userData?.name || "InterviewIQ User",
          email: userData?.email || "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log("ORDER ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Payment failed");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/20 blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm mb-6">
            <Rocket size={16} />
            AI Powered Interview Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Crack Your
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              {" "}
              Dream Job
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
            Practice with intelligent AI interviews, real-world questions,
            instant feedback, communication analysis, and advanced interview
            reports designed to make you industry ready.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-14">
            <StatCard icon={<BrainCircuit />} title="AI Analysis" value="99%" />
            <StatCard
              icon={<ShieldCheck />}
              title="Smart Detection"
              value="Realtime"
            />
            <StatCard
              icon={<Sparkles />}
              title="Interview Modes"
              value="Advanced"
            />
            <StatCard icon={<Rocket />} title="Boost Confidence" value="10X" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{
                scale: 1.03,
                rotateX: 4,
                rotateY: -4,
              }}
              className={`relative group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden p-8 transition-all duration-500 hover:border-cyan-400/40 ${plan.glow} shadow-[0_0_80px_rgba(59,130,246,0.15)]`}
            >
              {plan.popular && (
                <div className="absolute top-5 right-5 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </div>
              )}

              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition duration-500 bg-gradient-to-br ${plan.gradient}`}
              />

              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br ${plan.gradient} shadow-2xl mb-6`}
              >
                {plan.icon}
              </div>

              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>

              <p className="text-gray-400 mb-6">
                Perfect for interview preparation
              </p>

              <div className="flex items-end gap-2 mb-8">
                <span className="text-6xl font-black">{plan.price}</span>
                <span className="text-gray-400 mb-2">/ pack</span>
              </div>

              <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-2xl p-4 mb-8">
                <Coins className="text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Interview Coins</p>
                  <p className="font-bold text-xl">{plan.coins} Coins</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePayment(plan)}
                disabled={loadingPlan === plan.id}
                className={`relative z-20 w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${plan.gradient} hover:scale-[1.02] transition duration-300 shadow-2xl disabled:opacity-60 flex items-center justify-center gap-2`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Choose Plan"
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-28 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Your Next Interview
            <span className="text-cyan-400"> Can Change Everything</span>
          </h2>

          <p className="max-w-3xl mx-auto text-gray-400 text-lg leading-relaxed">
            Every successful developer, engineer, and professional once sat
            nervous before an interview. The difference is preparation.
            Practice smarter. Improve faster. Build confidence with AI.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
              🚀 Real Interview Simulation
            </div>

            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
              🧠 AI Powered Feedback
            </div>

            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
              📊 Advanced Analytics
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-14 flex justify-center"
          >
            <button
              onClick={() => navigate("/interview")}
              className="
                px-10 py-5 rounded-2xl
                bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600
                text-white font-black text-xl
                shadow-[0_0_50px_rgba(59,130,246,0.6)]
                hover:scale-105 transition-all duration-300
              "
            >
              🚀 Start Interview Now
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.08)] hover:scale-105 transition duration-300">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
        {icon}
      </div>

      <h3 className="text-3xl font-black mb-1">{value}</h3>

      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
};

export default Pricing;