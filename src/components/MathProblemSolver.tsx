'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Star, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react'
import { useSpring, animated } from 'react-spring'

// Define ANIMATION_DURATION here, outside of any component
const ANIMATION_DURATION = 0.8 // in seconds

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

const FloatingPoints = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute text-2xl font-bold text-green-500 z-50 pointer-events-none"
    initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
    animate={{
      opacity: 0,
      scale: 1.5,
      y: -50,
      transition: { duration: ANIMATION_DURATION }
    }}
    style={{
      left: x,
      top: y,
    }}
  >
    +10
  </motion.div>
)

const CompletionStars = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show && Array(20).fill(null).map((_, index) => (
        <motion.div
          key={`completion-star-${index}`}
          initial={{ 
            opacity: 1, 
            scale: 0,
            x: '-50%',
            y: '-50%'
          }}
          animate={{ 
            opacity: 0,
            scale: 1,
            x: `calc(-50% + ${(Math.random() - 0.5) * 200}px)`,
            y: `calc(-50% + ${(Math.random() - 0.5) * 200}px)`,
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 2, 
            ease: "easeOut" 
          }}
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            zIndex: 50,
          }}
        >
          <Star className="w-6 h-6 text-yellow-400" />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

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
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0)
  const [isHorizontalMode, setIsHorizontalMode] = useState(false)
  const [floatingPoints, setFloatingPoints] = useState(0)
  const [questionPoints, setQuestionPoints] = useState(0)
  const [prevQuestionPoints, setPrevQuestionPoints] = useState(0)
  const instructionRef = useRef<HTMLDivElement>(null)
  const [useSpringAnimation, setUseSpringAnimation] = useState(true)
  const [pendingPoints, setPendingPoints] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCounter, setShowCounter] = useState(true)
  const [showCompletionStars, setShowCompletionStars] = useState(false)
  const [showFloatingPoints, setShowFloatingPoints] = useState(false)

  const ANIMATION_DELAY = 0.2 // in seconds (unchanged)

  const { number } = useSpring({
    from: { number: prevQuestionPoints },
    number: questionPoints,
    delay: 0,
    config: { duration: ANIMATION_DURATION * 1000 }, // Convert seconds to milliseconds
  })

  const { number: decreasingNumber } = useSpring({
    number: isAnimating ? 0 : questionPoints,
    config: { duration: 1000 },
  })

  const { number: increasingTotal } = useSpring({
    number: isAnimating ? totalPoints + questionPoints : totalPoints,
    config: { duration: 1000 },
  })

  const problem = problems[problemIndex]

  const handleAnswer = (answer: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect()
      const cardRect = event.currentTarget.closest('.card')?.getBoundingClientRect()
      if (cardRect) {
        // Calculate position relative to the card
        setAnimationPosition({
          x: buttonRect.left - cardRect.left + buttonRect.width / 2,
          y: buttonRect.top - cardRect.top + buttonRect.height / 2
        })
      }
    } else {
      // Fallback to center of the card if event is not provided
      const card = document.querySelector('.card')
      if (card) {
        const cardRect = card.getBoundingClientRect()
        setAnimationPosition({
          x: cardRect.width / 2,
          y: cardRect.height / 2
        })
      }
    }
    setSelectedAnswer(answer)
    const correct = answer === problem.steps[currentStep].correctAnswer
    setIsCorrect(correct)
    if (correct) {
      setPrevQuestionPoints(questionPoints)
      setQuestionPoints(prevPoints => prevPoints + 10)
      setShowPointsAnimation(true)
      setShowFloatingPoints(true)

      // Get the position of the instruction div
      if (instructionRef.current) {
        const rect = instructionRef.current.getBoundingClientRect()
        setAnimationPosition({
          x: rect.width / 2,
          y: rect.height / 2
        })
      }

      setTimeout(() => {
        setShowPointsAnimation(false)
        setShowFloatingPoints(false)
      }, ANIMATION_DURATION * 1000)
      setCompletedSteps([...completedSteps, `Step ${currentStep + 1}: ${answer}`])
      setTimeout(() => {
        if (currentStep < problem.steps.length - 1) {
          setCurrentStep(currentStep + 1)
          setSelectedAnswer(null)
          setIsCorrect(null)
          setCurrentOptionIndex(0)
        } else {
          setIsCompleted(true)
          setShowCompletionStars(true)
          setTimeout(() => {
            setIsAnimating(true)
          }, 500)
          setTimeout(() => {
            setShowCompletionStars(false)
          }, 1000)
        }
      }, 1000)
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setTotalPoints(prev => prev + questionPoints)
        setQuestionPoints(0)
        setIsAnimating(false)
        setShowCounter(false) // Hide the counter after animation
        setShowCompletionStars(true) // Show stars when animation starts
        setTimeout(() => {
          setShowCompletionStars(false) // Hide stars after 2 seconds
        }, 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAnimating, questionPoints])

  const handleTryAnother = () => {
    setProblemIndex((prevIndex) => (prevIndex + 1) % problems.length)
    setCurrentStep(0)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setCompletedSteps([])
    setIsCompleted(false)
    setCurrentOptionIndex(0)
    setQuestionPoints(0)
    setFloatingPoints(0)
    setPrevQuestionPoints(0)
    setShowCounter(true) // Show the counter for the new problem
  }

  const handlePrevOption = () => {
    setCurrentOptionIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : problem.steps[currentStep].options.length - 1
    )
  }

  const handleNextOption = () => {
    setCurrentOptionIndex((prevIndex) => 
      (prevIndex + 1) % problem.steps[currentStep].options.length
    )
  }

  const handleConfirm = () => {
    const selectedOption = problem.steps[currentStep].options[currentOptionIndex]
    handleAnswer(selectedOption)
  }

  const toggleMode = () => {
    setIsHorizontalMode(prev => !prev)
  }

  const toggleAnimationType = () => {
    setUseSpringAnimation(prev => !prev)
  }

  // Create a custom toggle component
  const CustomToggle = ({ isActive }: { isActive: boolean }) => (
    <div className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
      <div className="w-4 h-4 border-2 border-current rounded-full">
        {isActive && <div className="w-2 h-2 bg-current rounded-full m-auto" />}
      </div>
    </div>
  )

  // Modify this spring for the step points
  const { number: springNumber } = useSpring({
    from: { number: prevQuestionPoints },
    number: questionPoints,
    config: { mass: 1, tension: 120, friction: 14, clamp: true }, // reduced tension and increased friction
  })

  // Modify this spring for the final animation
  const { number: finalNumber } = useSpring({
    from: { number: questionPoints },
    number: isAnimating ? 0 : questionPoints,
    config: { duration: 1500 }, // increased from 1000 to 1500 milliseconds
  })

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
      <Card className="w-[360px] h-[640px] overflow-hidden flex flex-col relative card">
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <span className="text-xl font-bold">Practice</span>
          <div className="flex items-center" ref={headerCounterRef}>
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <animated.span className="text-lg font-bold">
              {increasingTotal.to(n => Math.floor(n))}
            </animated.span>
          </div>
        </div>
        <CardContent className="flex-grow overflow-y-auto space-y-4 relative p-4">
          <div className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 flex items-center justify-center">
            {problem.question}
            {showCounter && (
              <motion.div
                className="ml-2 bg-purple-200 dark:bg-purple-800 p-2 rounded-full flex items-center justify-center"
                animate={{ scale: showPointsAnimation ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                ref={counterRef}
              >
                <Star className="w-5 h-5 text-yellow-500" />
                {isAnimating ? (
                  <animated.span className="ml-1 text-base font-bold text-purple-600 dark:text-purple-300">
                    {finalNumber.to(n => Math.floor(n))}
                  </animated.span>
                ) : useSpringAnimation ? (
                  <animated.span className="ml-1 text-base font-bold text-purple-600 dark:text-purple-300">
                    {springNumber.to(n => Math.floor(n))}
                  </animated.span>
                ) : (
                  <motion.span
                    key={questionPoints}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }} // increased from 0.2 to 0.4 seconds
                    className="ml-1 text-base font-bold text-purple-600 dark:text-purple-300"
                  >
                    {questionPoints}
                  </motion.span>
                )}
              </motion.div>
            )}
          </div>

          <div className="space-y-1">
            {completedSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-1 rounded-md"
              >
                {step}
              </motion.div>
            ))}
          </div>

          {!isCompleted ? (
            <>
              <div 
                ref={instructionRef}
                className="text-base font-medium text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md relative"
              >
                Step {currentStep + 1}: {problem.steps[currentStep].instruction}
                {showFloatingPoints && (
                  <FloatingPoints x={animationPosition.x} y={animationPosition.y} />
                )}
              </div>
              {isHorizontalMode ? (
                <div className="flex items-center justify-between space-x-2">
                  <Button onClick={handlePrevOption} variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-grow">
                    <motion.div
                      key={currentOptionIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <Button
                        className={`w-full text-sm py-3 ${
                          selectedAnswer === problem.steps[currentStep].options[currentOptionIndex]
                            ? isCorrect
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                            : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                        }`}
                        onClick={(event) => handleAnswer(problem.steps[currentStep].options[currentOptionIndex], event)}
                        disabled={isCorrect === true}
                      >
                        {problem.steps[currentStep].options[currentOptionIndex]}
                      </Button>
                    </motion.div>
                  </div>
                  <Button onClick={handleNextOption} variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
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
                        onClick={(event) => handleAnswer(option, event)}
                        disabled={isCorrect === true}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
              {isHorizontalMode && (
                <Button
                  onClick={handleConfirm}
                  className="w-full text-base py-3 bg-purple-500 hover:bg-purple-600 text-white"
                  disabled={isCorrect === true}
                >
                  Confirm
                </Button>
              )}
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

          <CompletionStars show={showCompletionStars} />
        </CardContent>

        {/* Toggle button for horizontal mode */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded shadow text-center">
            <div>Horizontal</div>
            <div>mode</div>
          </div>
          <Button
            onClick={toggleMode}
            className="rounded-full w-12 h-12"
            variant="outline"
          >
            {isHorizontalMode ? <LayoutList className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
          </Button>
        </div>

        {/* Toggle button for point animation */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded shadow text-center">
            <div>Point</div>
            <div>animation</div>
          </div>
          <Button
            onClick={toggleAnimationType}
            className="rounded-full w-12 h-12"
            variant="outline"
          >
            <CustomToggle isActive={useSpringAnimation} />
          </Button>
        </div>
      </Card>
    </div>
  )
}