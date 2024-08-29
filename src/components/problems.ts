export const problems = [
  {
    question: "Solve: $$\\begin{align*} &3x - 2y = 6 + x \\\\ &y = 2\\end{align*}$$",
    steps: [
      {
        instruction: "What is the first step?",
        options: ["Guess a value for x", "Substitute y = 2 into the equation.", "Divide both sides by 3"],
        correctAnswer: "Substitute y = 2 into the equation.",
        type: 'vertical'
      },
      {
        instruction: "What is the new equation?",
        options: ["3x - 4 = 6 + x", "3x - 2 = 6 + x", "3x = 6 + x"],
        correctAnswer: "3x - 4 = 6 + x",
        type: 'horizontal'
      },
      {
        instruction: "Simplify the equation. What's the result?",
        options: [, "2x = 8", "x = 5", "2x = 10", "x = 4"],
        correctAnswer: "2x = 10",
        type: 'horizontal'
      },
      {
        instruction: "What's the final answer?",
        options: ["x = 3", "x = 4", "x = 5", "x = 6"],
        correctAnswer: "x = 5",
        type: 'horizontal'
      }
    ]
  },
  {
    question: "Solve: $3x^2 + 10x - 2 = 6$",
    steps: [
      {
        instruction: "What type of equation is this?",
        options: ["Linear", "Quadratic", "Exponential"],
        correctAnswer: "Quadratic",
        type: 'vertical'
      },
      {
        instruction: "Simplify the quadratic",
        options: ["$3x^2 + 10x - 8$", "$3x^2 + 10x - 2$", "$3x^2 + 10x - 6$"],
        correctAnswer: "$3x^2 + 10x - 8$",
        type: 'vertical'
      },
      {
        instruction: "Factorise it",
        options: ["(3x - 2)(x + 4)", "(3x + 4)(x - 2)", "(3x + 2)(x - 4)", "(3x - 4)(x + 2)"],
        correctAnswer: "(3x - 2)(x + 4)",
        type: 'vertical'
      },
      {
        instruction: "What are the roots?",
        options: ["x = -2/3, 4", "x = 2/3, 4", "x = -2/3, -4", "x = 2/3, -4"],
        correctAnswer: "x = 2/3, -4",
        type: 'vertical'
      }
    ]
  },
  {
    question: "Solve: $3(x - 4) = 2x + 6$",
    steps: [
        {
            instruction: "How should we start?",
            options: [
                "Combine like terms on the left side of the equation.",
                "Distribute the 3 on the left side of the equation.",
                "Factor the expression on the left side of the equation."
            ],
            correctAnswer: "Distribute the 3 on the left side of the equation.",
            type: 'horizontal'
        },
        {
            instruction: "Distribute the 3 on the left side of the equation.",
            options: [
                "9x - 12 = 2x + 6",
                "3x - 4 = 2x + 6",
                "3x - 12 = 2x + 6",
                "3x - 12 = 2x - 6"
            ],
            correctAnswer: "3x - 12 = 2x + 6",
            type: 'vertical'
        },
        {
            instruction: "What could be the next step?",
            options: [
                "Isolate x by eliminating 2x from both sides.",
                "Multiply both sides of the equation by 3.",
                "Add 2x to both sides of the equation."
            ],
            correctAnswer: "Isolate x by eliminating 2x from both sides.",
            type: 'vertical'
        },
        {
            instruction: "What is the simplified equation?",
            options: [
                "$x - 12 = 6$",
                "$x - 12 = 0$",
                "$x - 12 = 12$",
                "$x - 12 = -6$"
            ],
            correctAnswer: "$x - 12 = 6$",
            type: 'vertical'
        },
        {
            instruction: "Find x.",
            options: [
                "$x = 9$",
                "$x = 12$",
                "$x = 18$",
                "$x = 24$",
            ],
            correctAnswer: "$x = 18$",
            type: 'vertical'
        }
    ]
}
];