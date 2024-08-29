'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Star, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react'
import { useSpring, animated } from 'react-spring'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { problems } from './problems';

interface LatexRendererProps {
  text: string;
  classes: {
    text: string;
    inline: string;
  };
}

// split text and latex
const LatexRenderer: React.FC<LatexRendererProps> = ({ text, classes }) => {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/);

  return (
    <div className="flex flex-wrap items-top">
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <div key={index} className={classes.inline}><InlineMath math={part.slice(1, -1)}/></div>;
        }
        return <span key={index} className={classes.text}>{part}</span>;
      })}
    </div>
  );
};

// Define ANIMATION_DURATION here, outside of any component
const ANIMATION_DURATION = 0.8 // in seconds

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

const MiniCarousel = ({ totalQuestions, currentQuestion, onQuestionSelect }) => {
  // Only render the carousel if we're not on the last question
  if (currentQuestion === totalQuestions - 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-1">
      {Array.from({ length: totalQuestions }, (_, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full cursor-pointer
                      ${i === currentQuestion ? 'bg-white' : 'bg-white/50'}`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuestionSelect(i)}
        />
      ))}
    </div>
  );
};

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
  const [floatingPoints, setFloatingPoints] = useState(0)
  const [questionPoints, setQuestionPoints] = useState(0)
  const [prevQuestionPoints, setPrevQuestionPoints] = useState(0)
  const instructionRef = useRef<HTMLDivElement>(null)
  const [instructionFontSize, setInstructionFontSize] = useState(16) // Start with 16px font size
  const [useSpringAnimation, setUseSpringAnimation] = useState(true)
  const [pendingPoints, setPendingPoints] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCounter, setShowCounter] = useState(true)
  const [showCompletionStars, setShowCompletionStars] = useState(false)
  const [showFloatingPoints, setShowFloatingPoints] = useState(false)
  const [instructionHeight, setInstructionHeight] = useState('auto')
  const [questionFontSize, setQuestionFontSize] = useState(18) // Start with 18px font size for the question
  const questionRef = useRef<HTMLDivElement>(null)
  const [showStepInstruction, setShowStepInstruction] = useState(true)
  const cardContentRef = useRef<HTMLDivElement>(null)
  const [isHorizontalMode, setIsHorizontalMode] = useState(false)

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

  // Add this new state to track progress for each problem
  const [problemProgress, setProblemProgress] = useState<{
    [key: number]: {
      currentStep: number;
      completedSteps: string[];
      isCompleted: boolean;
      questionPoints: number;
      showCounter: boolean;
    };
  }>({});

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
      setCompletedSteps([...completedSteps, `${currentStep + 1})   ${answer}`])
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
        saveProblemProgress(); // Save progress after updating state
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
        saveProblemProgress(); // Save the updated progress
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAnimating, questionPoints])

  const handleTryAnother = () => {
    const nextIndex = (problemIndex + 1) % problems.length;
    setProblemIndex(nextIndex);
    loadProblemProgress(nextIndex);
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

  const [direction, setDirection] = useState(0);

  const handlePrevProblem = () => {
    setDirection(-1);
    setProblemIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + problems.length) % problems.length;
      loadProblemProgress(newIndex);
      return newIndex;
    });
  }

  const handleNextProblem = () => {
    setDirection(1);
    setProblemIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % problems.length;
      loadProblemProgress(newIndex);
      return newIndex;
    });
  }

  const loadProblemProgress = (index: number) => {
    const progress = problemProgress[index] || {
      currentStep: 0,
      completedSteps: [],
      isCompleted: false,
      questionPoints: 0,
      showCounter: true,
    };
    setCurrentStep(progress.currentStep);
    setCompletedSteps(progress.completedSteps);
    setIsCompleted(progress.isCompleted);
    setQuestionPoints(progress.questionPoints);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentOptionIndex(0);
    setShowCounter(progress.showCounter);
    setIsAnimating(false); // Reset animation state
  }

  const saveProblemProgress = () => {
    setProblemProgress(prev => ({
      ...prev,
      [problemIndex]: {
        currentStep,
        completedSteps,
        isCompleted,
        questionPoints,
        showCounter,
      }
    }));
  }

  useEffect(() => {
    saveProblemProgress();
  }, [currentStep, completedSteps, isCompleted, questionPoints]);

  const handleQuestionSelect = (index: number) => {
    const direction = index > problemIndex ? 1 : -1;
    setDirection(direction);
    setProblemIndex(index);
    loadProblemProgress(index);
  };

  useEffect(() => {
    const adjustQuestionSize = () => {
      if (questionRef.current) {
        const element = questionRef.current;
        const maxHeight = 64; // Maximum height for two lines (adjust as needed)
        
        // Reset font size to default
        element.style.fontSize = '18px';
        setQuestionFontSize(18);

        // Force a reflow to get accurate scrollHeight
        void element.offsetHeight;

        // Check if content overflows
        if (element.scrollHeight > maxHeight) {
          // Gradually decrease font size until it fits
          let fontSize = 17;
          while (element.scrollHeight > maxHeight && fontSize > 12) {
            element.style.fontSize = `${fontSize}px`;
            setQuestionFontSize(fontSize);
            fontSize--;
            
            // Force a reflow to get accurate scrollHeight
            void element.offsetHeight;
          }
        }
      }
    };

    adjustQuestionSize();
  }, [problemIndex]);

  const toggleMode = () => {
    setIsHorizontalMode(prev => !prev)
  }

  const toggleAnimationType = () => {
    setUseSpringAnimation(prev => !prev)
  }

  const toggleStepInstruction = () => {
    setShowStepInstruction(prev => !prev)
  }

  useEffect(() => {
    // Set isHorizontalMode based on the current step's type
    setIsHorizontalMode(problem.steps[currentStep].type === 'horizontal');
  }, [currentStep, problemIndex]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
      <Card className="w-[360px] h-[640px] overflow-hidden flex flex-col relative card">
        {/* Header - stays fixed */}
        <div className="bg-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            {/* Navigation buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white" onClick={handlePrevProblem}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={handleNextProblem}>
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Practice text and carousel */}
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold">Practice</span>
              {/* Mini Carousel */}
              <MiniCarousel
                totalQuestions={problems.length}
                currentQuestion={problemIndex}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>

            {/* Points total */}
            <div className="flex items-center" ref={headerCounterRef}>
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <animated.span className="text-lg font-bold">
                {increasingTotal.to(n => Math.floor(n))}
              </animated.span>
            </div>
          </div>
        </div>

        {/* Animated content - positioned below the header */}
        <div className="flex-grow relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={problemIndex}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? 1000 : -1000,
                  opacity: 0
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 1000 : -1000,
                  opacity: 0
                })
              }}
              className="absolute inset-0 flex flex-col"
            >
              <CardContent 
                className="flex-grow overflow-y-auto pt-4 px-2 flex flex-col"
                ref={cardContentRef}
              >
                <div className="flex items-start mb-2 px-4">
                  <div 
                    ref={questionRef}
                    className="text-lg font-semibold text-left text-gray-800 dark:text-gray-200 flex-grow"
                    style={{ 
                      fontSize: `${questionFontSize}px`,
                      minHeight: '48px',
                    }}
                  >
                    <LatexRenderer text={problem.question} classes={{text:'pt-2 px-2', inline:'pt-2'}} />
                  </div>
                  
                  {showCounter && (
                    <motion.div
                      className="ml-0 bg-purple-200 dark:bg-purple-800 p-2 rounded-full flex items-center justify-center flex-shrink-0"
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
                          transition={{ duration: 0.4 }}
                          className="ml-1 text-base font-bold text-purple-600 dark:text-purple-300"
                        >
                          {questionPoints}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1 flex-grow px-1 overflow-y-auto">
                  {completedSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-md px-2"
                    >
                      <LatexRenderer text={step} classes={{text:'', inline:'pl-1'}} />
                    </motion.div>
                  ))}
                </div>

                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 text-center mt-4"
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
              </CardContent>

              {/* Docked instruction and steps section */}
              {!isCompleted && (
                <div className="bg-white dark:bg-gray-800 p-4 space-y-4 flex flex-col">
                  {showStepInstruction && (
                    <div 
                      ref={instructionRef}
                      className="text-base font-medium text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md relative"
                    >
                      {problem.steps[currentStep].instruction}
                      {showFloatingPoints && (
                        <FloatingPoints x={animationPosition.x} y={animationPosition.y} />
                      )}
                    </div>
                  )}
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
                            className={`w-full text-sm py-3 px-2 h-auto whitespace-normal ${
                              selectedAnswer === problem.steps[currentStep].options[currentOptionIndex]
                                ? isCorrect
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                                : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                            }`}
                            onClick={(event) => handleAnswer(problem.steps[currentStep].options[currentOptionIndex], event)}
                            disabled={isCorrect === true}
                          >
                            <span className="block text-left">
                              <LatexRenderer text={problem.steps[currentStep].options[currentOptionIndex]} classes={{text:'', inline:''}} />
                            </span>
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
                            className={`w-full text-sm py-3 px-2 h-auto whitespace-normal ${
                              selectedAnswer === option
                                ? isCorrect
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                                : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                            }`}
                            onClick={(event) => handleAnswer(option, event)}
                            disabled={isCorrect === true}
                          >
                            <span className="block text-left" style={{ textAlign: 'center'}}>
                              <LatexRenderer text={option} classes={{text:'', inline:''}} />
                            </span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {isHorizontalMode && (
                    <Button
                      onClick={handleConfirm}
                      className="w-full text-base py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white"
                      disabled={isCorrect === true}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      {/* Toggle buttons moved outside the card */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end space-y-2">
        {/* Horizontal mode toggle */}
        <div className="flex items-center space-x-2">
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

        {/* Point animation toggle */}
        <div className="flex items-center space-x-2">
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

        {/* Step instruction toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded shadow text-center">
            <div>Step</div>
            <div>instruction</div>
          </div>
          <Button
            onClick={toggleStepInstruction}
            className="rounded-full w-12 h-12"
            variant="outline"
          >
            <CustomToggle isActive={showStepInstruction} />
          </Button>
        </div>
      </div>
    </div>
  )
}

  
  
