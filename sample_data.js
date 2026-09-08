/**
 * CogniStudy AI - Pre-loaded Sample Study Data
 * High-yield starter decks, sample study notes, and knowledge graphs
 */

window.SAMPLE_DATA = {
  decks: [
    {
      id: "deck_ai_ml",
      title: "Artificial Intelligence & Machine Learning",
      description: "Neural networks, transformers, loss functions, and optimization algorithms.",
      category: "Computer Science",
      color: "#6366f1",
      cards: [
        {
          id: "c1",
          front: "What is the Transformer architecture's core attention mechanism?",
          back: "Scaled Dot-Product Self-Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. It computes dynamic contextual weights across all input tokens simultaneously.",
          hint: "Think Q, K, V matrices and temperature scaling.",
          box: 2,
          nextReview: Date.now() - 100000,
          interval: 3,
          ease: 2.5
        },
        {
          id: "c2",
          front: "Explain the Bias-Variance Tradeoff.",
          back: "Bias is the error from overly simplistic model assumptions (underfitting). Variance is the error from extreme sensitivity to training noise (overfitting). Total Error = Bias^2 + Variance + Irreducible Error.",
          hint: "Underfitting vs Overfitting.",
          box: 3,
          nextReview: Date.now() + 86400000,
          interval: 6,
          ease: 2.6
        },
        {
          id: "c3",
          front: "How does Backpropagation calculate gradients across layers?",
          back: "By applying the Calculus Chain Rule backwards from the loss function to each parameter weight (dL/dw = dL/da * da/dz * dz/dw).",
          hint: "Chain Rule of Calculus.",
          box: 1,
          nextReview: Date.now() - 50000,
          interval: 1,
          ease: 2.4
        },
        {
          id: "c4",
          front: "What is the purpose of Layer Normalization in Deep Learning?",
          back: "LayerNorm stabilizes hidden state dynamics by normalizing activations across feature dimensions per sample, independent of batch size (crucial for RNNs and Transformers).",
          hint: "Contrast with Batch Normalization.",
          box: 1,
          nextReview: Date.now() - 20000,
          interval: 1,
          ease: 2.5
        }
      ]
    },
    {
      id: "deck_data_structures",
      title: "Algorithms & Data Structures",
      description: "Time complexities, tree traversals, graphs, and dynamic programming.",
      category: "Computer Science",
      color: "#06b6d4",
      cards: [
        {
          id: "ds1",
          front: "What is the average and worst-case time complexity of QuickSort?",
          back: "Average: O(N log N). Worst-case: O(N^2) (occurs when the pivot chosen is consistently the smallest or largest element).",
          hint: "Partitioning efficiency.",
          box: 2,
          nextReview: Date.now() - 40000,
          interval: 2,
          ease: 2.5
        },
        {
          id: "ds2",
          front: "What are the core properties of a Red-Black Tree?",
          back: "1. Every node is red or black. 2. Root is black. 3. Red nodes cannot have red children. 4. Every path from a node to descendant null leaves has identical black-node count.",
          hint: "Self-balancing binary search tree rules.",
          box: 1,
          nextReview: Date.now() - 10000,
          interval: 1,
          ease: 2.3
        },
        {
          id: "ds3",
          front: "What distinguishes Dijkstra's Algorithm from the A* Search Algorithm?",
          back: "Dijkstra searches greedily based only on actual distance g(n). A* combines actual distance with an admissible heuristic estimate h(n): f(n) = g(n) + h(n), guiding the search towards the goal faster.",
          hint: "Heuristic function h(n).",
          box: 3,
          nextReview: Date.now() + 172800000,
          interval: 7,
          ease: 2.7
        }
      ]
    },
    {
      id: "deck_quantum_physics",
      title: "Quantum Physics & Thermodynamics",
      description: "Wave-particle duality, Heisenberg uncertainty, entropy, and statistical mechanics.",
      category: "Physics",
      color: "#ec4899",
      cards: [
        {
          id: "qp1",
          front: "State Heisenberg's Uncertainty Principle formula and meaning.",
          back: "Delta_x * Delta_p >= hbar / 2. You cannot simultaneously measure both position (x) and momentum (p) of a subatomic particle with arbitrary precision.",
          hint: "Product of position and momentum uncertainties.",
          box: 1,
          nextReview: Date.now() - 10000,
          interval: 1,
          ease: 2.5
        },
        {
          id: "qp2",
          front: "What does the Second Law of Thermodynamics state regarding Entropy?",
          back: "In an isolated system, total entropy (disorder / multiplicity of microstates S = k_B * ln(Omega)) never decreases over time; Delta_S_total >= 0.",
          hint: "S = k_B * ln(Omega).",
          box: 2,
          nextReview: Date.now() - 5000,
          interval: 2,
          ease: 2.6
        }
      ]
    }
  ],

  sampleNotes: `# Introduction to Neural Networks & Deep Learning

## 1. Fundamental Concepts
An artificial neural network (ANN) is composed of interconnected nodes (neurons) structured in layers:
- **Input Layer**: Receives raw data features (e.g. pixels, tabular columns, word embeddings).
- **Hidden Layers**: Perform non-linear transformations to extract high-level representations.
- **Output Layer**: Produces the final prediction (class probabilities or continuous value).

## 2. Mathematical Formulation
For any neuron j in layer l:
z_j = sum(w_ij * a_i) + b_j
a_j = sigma(z_j)

Where:
- w_ij represents connection weights.
- b_j is the bias term.
- sigma is an activation function (ReLU, Sigmoid, GELU).

## 3. Activation Functions
- **ReLU (Rectified Linear Unit)**: f(x) = max(0, x). Computationally efficient and mitigates vanishing gradients for positive inputs.
- **Softmax**: Converts unnormalized logits into a valid probability distribution where sum(P) = 1.0.

## 4. Optimization & Backpropagation
Loss minimization relies on Gradient Descent variants (Adam, RMSProp, SGD with Momentum).
Backpropagation uses the multi-variable Chain Rule to propagate loss gradients backwards from the output layer to update weights:
w_new = w_old - learning_rate * (dL/dw).`,

  sampleQuiz: {
    title: "Deep Learning Foundations Quiz",
    questions: [
      {
        id: "q1",
        question: "Which activation function is defined as f(x) = max(0, x)?",
        options: ["Sigmoid", "ReLU", "Tanh", "GELU"],
        correctIndex: 1,
        explanation: "ReLU (Rectified Linear Unit) outputs zero for negative values and passes positive values unchanged, avoiding vanishing gradient issues in positive regimes."
      },
      {
        id: "q2",
        question: "What calculus rule is the foundational engine of Backpropagation?",
        options: ["Product Rule", "L'Hopital's Rule", "Chain Rule", "Fundamental Theorem of Line Integrals"],
        correctIndex: 2,
        explanation: "The Chain Rule allows gradient calculation of composite functions backwards through network layers."
      },
      {
        id: "q3",
        question: "True or False: In an isolated thermodynamic system, total entropy can spontaneously decrease without external work.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation: "The Second Law of Thermodynamics dictates that entropy in an isolated system always increases or remains constant (Delta S >= 0)."
      },
      {
        id: "q4",
        question: "What does the Softmax function output?",
        options: ["Raw unbounded logits", "A probability distribution summing to 1.0", "Binary 0 or 1 values", "A standardized scalar"],
        correctIndex: 1,
        explanation: "Softmax exponentiates logits and normalizes them so all elements sum to 1.0, representing multi-class categorical probabilities."
      }
    ]
  },

  mindmapData: {
    id: "root",
    label: "Artificial Intelligence",
    color: "#6366f1",
    children: [
      {
        id: "ml",
        label: "Machine Learning",
        color: "#06b6d4",
        children: [
          { id: "sup", label: "Supervised Learning", color: "#10b981", children: [{ id: "reg", label: "Regression" }, { id: "clf", label: "Classification" }] },
          { id: "unsup", label: "Unsupervised Learning", color: "#f59e0b", children: [{ id: "clust", label: "Clustering" }, { id: "dim", label: "PCA / Dim Reduction" }] },
          { id: "rl", label: "Reinforcement Learning", color: "#ec4899", children: [{ id: "qlearn", label: "Q-Learning" }, { id: "policy", label: "Policy Gradients" }] }
        ]
      },
      {
        id: "dl",
        label: "Deep Learning",
        color: "#8b5cf6",
        children: [
          { id: "ann", label: "Neural Networks", color: "#a855f7", children: [{ id: "bp", label: "Backpropagation" }, { id: "act", label: "Activation Functions" }] },
          { id: "trans", label: "Transformers", color: "#6366f1", children: [{ id: "attn", label: "Self-Attention" }, { id: "llm", label: "LLMs & GPT" }] },
          { id: "cv", label: "Computer Vision", color: "#38bdf8", children: [{ id: "cnn", label: "CNNs" }, { id: "vit", label: "Vision Transformers" }] }
        ]
      }
    ]
  }
};
