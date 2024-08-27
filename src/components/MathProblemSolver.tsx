'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Star, ArrowLeft, ArrowRight } from 'lucide-react'

const problems = [
  {
    question: "Solve 3x - 2y = 6 + x, y = 2",
    steps: [
      {
        instruction: "What is the value of y?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2"
      },
      {
        instruction: "Substitute y = 2 into the equation. What does it become?",
        options: ["3x - 4 = 6 + x", "3x - 2 = 6 + x", "3x - 6 = 6 + x", "3x = 6 + x"],
        correctAnswer: "3x - 4 = 6 + x"
      },
      {
        instruction: "Simplify the equation. What's the result?",
        options: ["2x = 10", "2x = 8", "x = 5", "x = 4"],
        correctAnswer: "2x = 10"
      },
      {
        instruction: "Solve for x. What's the final answer?",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswer: "x = 5"
      }
    ]
  },
  {
    question: "Solve 3x^2 + 10x - 8 = 0",
    steps: [
      {
        instruction: "What is the first step to solve this quadratic equation?",
        options: ["Factor the equation", "Use the quadratic formula", "Complete the square", "Guess and check"],
        correctAnswer: "Factor the equation"
      },
      {
        instruction: "What are the factors of 3x^2 + 10x - 8?",
        options: ["(3x - 2)(x + 4)", "(3x + 4)(x - 2)", "(3x + 2)(x - 4)", "(3x - 4)(x + 2)"],
        correctAnswer: "(3x - 2)(x + 4)"
      },
      {
        instruction: "Set each factor to zero. What are the two equations?",
        options: ["3x - 2 = 0 and x + 4 = 0", "3x + 4 = 0 and x - 2 = 0", "3x + 2 = 0 and x - 4 = 0", "3x - 4 = 0 and x + 2 = 0"],
        correctAnswer: "3x - 2 = 0 and x + 4 = 0"
      },
      {
        instruction: "Solve both equations. What are the values of x?",
        options: ["x = 2/3 and x = -4", "x = -2/3 and x = 4", "x = 2/3 and x = 4", "x = -2/3 and x = -4"],
        correctAnswer: "x = 2/3 and x = -4"
      }
    ]
  }
]

export default function Component() {
  const [problemIndex, setProblemIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [points, setPoints] = useState(0)
  const [totalPoints, setTotalPoints] = useState(500)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 })
  const counterRef = useRef<HTMLDivElement>(null)
  const headerCounterRef = useRef<HTMLDivElement>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showFinalAnimation, setShowFinalAnimation] = useState(false)

  const problem = problems[problemIndex]

  const handleAnswer = (answer: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect()
    setAnimationPosition({ x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top })
    setSelectedAnswer(answer)
    const correct = answer === problem.steps[currentStep].correctAnswer
    setIsCorrect(correct)
    if (correct) {
      setShowPointsAnimation(true)
      setTimeout(() => {
        setPoints(prevPoints => prevPoints + 10)
        setShowPointsAnimation(false)
      }, 500)
      setCompletedSteps([...completedSteps, `Step ${currentStep + 1}: ${answer}`])
      setTimeout(() => {
        if (currentStep < problem.steps.length - 1) {
          setCurrentStep(currentStep + 1)
          setSelectedAnswer(null)
          setIsCorrect(null)
        } else {
          setIsCompleted(true)
          setShowFinalAnimation(true)
        }
      }, 1000)
    }
  }

  const handleTryAnother = () => {
    setProblemIndex((prevIndex) => (prevIndex + 1) % problems.length)
    setCurrentStep(0)
    setPoints(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setCompletedSteps([])
    setIsCompleted(false)
    setShowFinalAnimation(false)
  }

  useEffect(() => {
    if (showFinalAnimation) {
      const timer = setTimeout(() => {
        setTotalPoints(prevTotal => prevTotal + points)
        setShowFinalAnimation(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showFinalAnimation, points])

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
      <Card className="w-[360px] h-[640px] overflow-hidden flex flex-col">
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <span className="text-xl font-bold">Practice</span>
          <div className="flex items-center" ref={headerCounterRef}>
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <motion.span 
              className="text-lg font-bold"
              key={totalPoints}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              {totalPoints}
            </motion.span>
          </div>
        </div>
        <CardContent className="flex-grow overflow-y-auto space-y-4 relative p-4">
          <div className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 flex items-center justify-center">
            {problem.question}
            <motion.div
              className="ml-2 bg-purple-200 dark:bg-purple-800 p-2 rounded-full flex items-center justify-center"
              animate={{ scale: showPointsAnimation ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
              ref={counterRef}
            >
              <Star className="w-5 h-5 text-yellow-500" />
              <motion.span 
                className="ml-1 text-base font-bold text-purple-600 dark:text-purple-300"
                key={points}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {points}
              </motion.span>
            </motion.div>
          </div>

          <div className="space-y-2">
            {completedSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded-md"
              >
                {step}
              </motion.div>
            ))}
          </div>

          {!isCompleted ? (
            <>
              <div className="text-base font-medium text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                Step {currentStep + 1}: {problem.steps[currentStep].instruction}
              </div>
              <div className="space-y-2">
                {problem.steps[currentStep].options.map((option, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className={`w-full text-sm py-3 ${
                        selectedAnswer === option
                          ? isCorrect
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                      }`}
                      onClick={(e) => handleAnswer(option, e)}
                      disabled={isCorrect === true}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 text-center"
            >
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                Congratulations!
              </div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                You solved the problem correctly!
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
              </motion.div>
              <Button
                onClick={handleTryAnother}
                className="text-base py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white"
              >
                Try Another One <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          <AnimatePresence>
            {showPointsAnimation && (
              <motion.div
                initial={{ opacity: 1, x: animationPosition.x, y: animationPosition.y, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  x: counterRef.current?.getBoundingClientRect().left ?? 0,
                  y: counterRef.current?.getBoundingClientRect().top ?? 0,
                  scale: 0.5
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed text-2xl font-bold text-green-500 pointer-events-none"
              >
                +10
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showFinalAnimation && (
              <motion.div
                initial={{ 
                  opacity: 1, 
                  x: counterRef.current?.getBoundingClientRect().left ?? 0,
                  y: counterRef.current?.getBoundingClientRect().top ?? 0
                }}
                animate={{ 
                  opacity: 1, 
                  x: headerCounterRef.current?.getBoundingClientRect().left ?? 0,
                  y: headerCounterRef.current?.getBoundingClientRect().top ?? 0,
                  scale: 0.8
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="fixed text-2xl font-bold text-yellow-400 pointer-events-none flex items-center"
              >
                <Star className="w-6 h-6 mr-1" />
                {points}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}