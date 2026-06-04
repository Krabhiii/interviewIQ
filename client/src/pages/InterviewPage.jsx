import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2 } from 'lucide-react'

import Step1SetUp from '../components/Step1SetUp.jsx'
import Step2Interview from '../components/Step2Interview.jsx'
import Step3Report from '../components/Step3Report.jsx'

function InterviewPage() {
  const [step, setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">

      {/* HEADER */}
      <div className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        
        <div className="flex items-center gap-2">
          <Brain className="text-blue-400" size={22} />
          <h1 className="text-lg font-semibold">
            InterviewAI
          </h1>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              
              <motion.div
                animate={{ scale: step === s ? 1.1 : 1 }}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium
                ${
                  step > s
                    ? 'bg-green-500 text-white'
                    : step === s
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle2 size={18} /> : s}
              </motion.div>

              {s !== 3 && (
                <div className="w-8 h-[2px] bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">

        {/* ✅ DIRECTLY RENDER STEP COMPONENT (NO MIDDLE CARD) */}
        <AnimatePresence mode="wait">

          {step === 1 && (
            <Step1SetUp
              key="step1"
              onStart={(data) => {
                setInterviewData(data)
                setStep(2)
              }}
            />
          )}

          {step === 2 && (
            <Step2Interview
              key="step2"
              interviewData={interviewData}
              onFinish={(report) => {
                setInterviewData(report)
                setStep(3)
              }}
            />
          )}

          {step === 3 && (
            <Step3Report
              key="step3"
              report={interviewData}
              onRestart={() => {
                setInterviewData(null)
                setStep(1)
              }}
            />
          )}

        </AnimatePresence>

      </div>

      {/* FOOTER */}
      <div className="text-center text-xs text-gray-400 pb-4">
        © {new Date().getFullYear()} InterviewAI • Smart Practice Platform
      </div>
    </div>
  )
}

export default InterviewPage