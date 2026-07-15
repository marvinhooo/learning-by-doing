window.CS336_EN = Object.freeze({
  "nav": {
    "dashboard": "Today",
    "path": "Learning Path",
    "labs": "Labs",
    "formulas": "Formulas & Symbols",
    "assignments": "Assignments",
    "quiz": "Retrieval Training",
    "glossary": "Glossary",
    "notes": "Notes"
  },
  "sources": {
    "l01": {
      "label": "Lecture 1 - Overview & Tokenization"
    },
    "l02": {
      "label": "Lecture 2 - PyTorch, Resources & Training"
    },
    "l03": {
      "label": "Lecture 3 - Architecture & Training"
    },
    "l04": {
      "label": "Lecture 4 - Mixture of Experts"
    },
    "l05": {
      "label": "Lecture 5 - GPUs"
    },
    "l06": {
      "label": "Lecture 6 - Profiling, CUDA & Triton"
    },
    "l07": {
      "label": "Lecture 7 - Parallelism Basics"
    },
    "l08": {
      "label": "Lecture 8 - Distributed Training"
    },
    "l09": {
      "label": "Lecture 9 - Scaling Laws Basics"
    },
    "l11": {
      "label": "Lecture 11 - Scaling Details"
    },
    "l12": {
      "label": "Lecture 12 - Evaluation"
    },
    "l13": {
      "label": "Lecture 13 - Data"
    },
    "l15": {
      "label": "Lecture 15 - RLHF & Alignment"
    },
    "l16": {
      "label": "Lecture 16 - RLVR"
    },
    "l17": {
      "label": "Lecture 17 - Policy Gradient & GRPO"
    },
    "a1": {
      "label": "Assignment 1 - Basics"
    },
    "a2": {
      "label": "Assignment 2 - Systems"
    },
    "a3": {
      "label": "Assignment 3 - Scaling"
    },
    "a4": {
      "label": "Assignment 4 - Data"
    },
    "a5": {
      "label": "Assignment 5 - Alignment"
    },
    "a5s": {
      "label": "Assignment 5 Supplement - Safety & RLHF"
    }
  },
  "modules": {
    "foundations": {
      "stage": "Foundation",
      "title": "Math, Tensors & PyTorch Thinking",
      "description": "Targeted closure of gaps that later become costly in Attention, Optimization, and Systems.",
      "outcome": "You can actively follow shapes, matrix operations, probabilities, gradients, and resources aloud.",
      "prereqs": [
        "Read Python confidently",
        "Basic idea of neural networks"
      ]
    },
    "tokenization": {
      "stage": "A1",
      "title": "Text → Tokens",
      "description": "Unicode, Bytes, and Byte-Pair Encoding (BPE) from raw text to stable token IDs.",
      "outcome": "You can mentally train a tokenizer, explain edge cases, and evaluate efficiency trade-offs.",
      "prereqs": [
        "Lists, Dictionaries, Files",
        "Rough asymptotic runtime"
      ]
    },
    "transformer": {
      "stage": "A1",
      "title": "Transformer Inside Out",
      "description": "From next-token prediction through Embeddings, RoPE, and Self-Attention to the full Pre-Norm block.",
      "outcome": "You can explain the purpose, shape, and data flow for every line of a Transformer block.",
      "prereqs": [
        "Module 00",
        "Tokenization"
      ]
    },
    "training": {
      "stage": "A1",
      "title": "Training, Optimization & Sampling",
      "description": "Loss, AdamW, learning rates, clipping, data batches, checkpoints, and autoregressive generation.",
      "outcome": "You can plan a training run, diagnose numerical errors, and read metrics correctly.",
      "prereqs": [
        "Transformer Block",
        "Derivatives & Logarithms"
      ]
    },
    "architecture": {
      "stage": "Deep Dive",
      "title": "Architecture Decisions & MoE",
      "description": "What modern models share, what varies, and why Mixture of Experts (MoE) is attractive.",
      "outcome": "You distinguish robust standards from empirical design decisions and know MoE costs.",
      "prereqs": [
        "Confident with Transformer"
      ]
    },
    "gpu": {
      "stage": "A2",
      "title": "GPU, Profiling & FlashAttention",
      "description": "Hardware hierarchy, Roofline, benchmarking, kernel fusion, tiling, Triton, and IO-aware attention.",
      "outcome": "You optimize after measurement and can explain whether compute or memory transfer is the bottleneck.",
      "prereqs": [
        "Resource Accounting",
        "Transformer Attention"
      ]
    },
    "distributed": {
      "stage": "A2",
      "title": "Distributed Training",
      "description": "Collectives, Data, Tensor, and Pipeline Parallelism, as well as Zero Redundancy Optimizer (ZeRO), Distributed Data Parallel (DDP), and Fully Sharded Data Parallel (FSDP).",
      "outcome": "You derive memory and communication costs for a parallelization strategy.",
      "prereqs": [
        "GPU Memory Hierarchy",
        "Training State"
      ]
    },
    "scaling": {
      "stage": "A3",
      "title": "Scaling Laws & Experiment Design",
      "description": "Power Laws, Compute-Optimum, IsoFLOPs, hyperparameter transfer, and clean extrapolation.",
      "outcome": "You plan small runs, fit robust curves, and name uncertainty instead of false precision.",
      "prereqs": [
        "Logs & Regression",
        "Training Costs"
      ]
    },
    "data": {
      "stage": "A4",
      "title": "Data: Collecting, Filtering, Deduplicating",
      "description": "From Common Crawl documents through language, Personally Identifiable Information (PII), and quality to MinHash, Locality-Sensitive Hashing (LSH), and tokenization.",
      "outcome": "You treat data as a measurable model component and can reduce leakage and duplicates.",
      "prereqs": [
        "Tokenizer",
        "Basic Statistics"
      ]
    },
    "evaluation": {
      "stage": "Cross-Cutting",
      "title": "Evaluation Without Self-Deception",
      "description": "Perplexity, Capability and Safety Benchmarks, validity, contamination, costs, and case-by-case analysis.",
      "outcome": "You choose evaluations matching the claim and recognize invalid comparisons.",
      "prereqs": [
        "Cross-Entropy",
        "Basic Statistics"
      ]
    },
    "alignment": {
      "stage": "A5",
      "title": "SFT, Preferences & DPO",
      "description": "Supervised Fine-Tuning (SFT), Reward Models, RLHF, and Direct Preference Optimization (DPO).",
      "outcome": "You trace the path from base model to controllable instruct model and know failure modes.",
      "prereqs": [
        "Training Loop",
        "Probabilities"
      ]
    },
    "rlvr": {
      "stage": "A5",
      "title": "RLVR, Policy Gradient & GRPO",
      "description": "Reinforcement Learning from Verifiable Rewards (RLVR), baselines, advantages, GRPO, and off-policy correction.",
      "outcome": "You derive the policy gradient, explain variance reduction, and interpret group normalization.",
      "prereqs": [
        "Log-Likelihood",
        "Expectation & Variance",
        "SFT"
      ]
    }
  },
  "concepts": {
    "shapes": {
      "title": "Tensor Shapes as a Type System",
      "level": "Foundations",
      "summary": "Tensor shapes describe not only storage, but also the meaning of each axis and which operations are valid.",
      "mental": "Imagine a tensor as a table whose axes have labels: B stands for batch, T for token positions, and D for features per token. A shape such as [B, T, D] therefore tells you what kind of content lives at each position. If you carry these labels through every operation, many mistakes become visible before you run the code.",
      "details": [
        "A tensor is a multidimensional arrangement of numbers; its Shape gives the length of each axis. In a language model, X with Shape [B, T, D] contains B sequences, each with T token positions, and each position holds a D-dimensional state vector. Two tensors can contain the same number of elements and occupy the same amount of memory yet mean completely different things if their axes are swapped.",
        "A Linear Layer is a learnable matrix multiplication. For X [B, T, D_in], it changes only the last axis and produces [B, T, D_out]. Batch and sequence remain independent leading axes. Broadcasting means that a missing axis, or an axis of length one, is repeated automatically; this is correct only when that repetition is also what you intend semantically.",
        "For Multi-Head Attention, a state is first rearranged from [B, T, H·d_h] to [B, H, T, d_h], where H is the number of Attention Heads and d_h is their width. Q and K then produce a score matrix [B, H, T, T], and Softmax normalizes over the final T axis of the Keys. With B=2, T=4, H=8, and d_h=64, Q therefore has Shape [2, 8, 4, 64], not [2, 4, 512]."
      ],
      "pitfalls": [
        "Swapping B and T: if the two axes happen to have the same length, the code may keep running while treating examples as positions and positions as examples.",
        "Using reshape as a repair: reshape preserves only the linear order of elements and cannot correct semantically swapped axes; the axis order must be changed explicitly.",
        "Accepting Broadcasting without checking it: an automatically repeated axis can hide a Shape error, for example by applying the same mask along the wrong dimension."
      ],
      "checks": [
        "A Linear Layer jointly produces Q, K, and V from X [B, T, D], with a total of 3H·d_h features. Which Shapes do you expect immediately after the Linear Layer and after splitting into Heads?",
        "Along which axis is Softmax applied in Attention, and why would the Query axis be the wrong choice?"
      ],
      "answers": [
        "Immediately after the Linear Layer, the Shape is [B, T, 3H·d_h]. After separating Q, K, and V and rearranging the axes, each of the three tensors has Shape [B, H, T, d_h].",
        "For each Query, Softmax runs over the Key axis: the final axis of the score matrix [B, H, T_query, T_key]. This makes the weights of the available Key positions sum to one for a fixed Query; normalizing over Queries would couple different information requests to one another."
      ]
    },
    "matmul": {
      "title": "Matrix Multiplication & Batch Matmul",
      "level": "Foundations",
      "summary": "Matrix multiplication forms weighted combinations and contracts exactly the shared inner axis.",
      "mental": "Think of each row of the left matrix as a request and each column of the right matrix as a possible output component. For every output entry, matching pairs of numbers are multiplied and then added. The shared inner axis is summed away, while the two outer axes remain.",
      "details": [
        "For A with Shape [m, k] and B with Shape [k, n], C=A·B has Shape [m, n]. An entry C[i,j] is the sum over l of A[i,l]·B[l,j]. Matrix multiplication therefore differs from the Hadamard product, which multiplies two equally shaped tensors element by element and does not contract an axis.",
        "Leading batch axes are not contracted: [B, m, k] multiplied by [B, k, n] gives [B, m, n]. A Linear Layer applied to X [B, T, D_in] uses exactly this principle and applies the same weight matrix to every example and every token position. In einsum notation, an axis that is absent from the result explicitly indicates that the operation sums over it.",
        "The standard multiplication [m, k] by [k, n] requires approximately 2mkn Floating-Point Operations, because a multiplication and an addition are both counted. In Attention, Q [B, H, T, d_h] and transposed K produce scores [B, H, T, T], so this part grows quadratically with T. Doubling T therefore quadruples the number of pairwise Query-Key comparisons."
      ],
      "pitfalls": [
        "Confusing a matrix product with an elementwise product: A*B does not combine features across a shared axis and is defined only for broadcast-compatible Shapes.",
        "Transposing a matrix by intuition alone: what matters is which labeled axis should be contracted; matching numerical Shape sizes do not prove that the semantics are correct.",
        "Counting only output elements as compute: each of the m·n results needs k multiplications and roughly k additions, which creates the factor 2k."
      ],
      "checks": [
        "Why does QKᵀ have Shape [T, T] for T Query positions and T Key positions per batch and Head?",
        "Approximately how many Floating-Point Operations does A [m, k] multiplied by B [k, n] require under the usual multiply-add convention?"
      ],
      "answers": [
        "Each of the T Queries is compared with each of the T Keys while the shared feature axis d_h is summed over. The Query axis and the Key axis remain as the two outer axes, producing T·T scores.",
        "It requires approximately 2mkn Floating-Point Operations. For each of the m·n output entries, k products and approximately the same number of additions are computed."
      ]
    },
    "probability": {
      "title": "Probability, Expected Value & Variance",
      "level": "Foundations",
      "summary": "Probabilities describe uncertainty; expected value and variance describe the mean and spread of random outcomes.",
      "mental": "Imagine repeating the same experiment many times. The expected value is the long-run average, while variance measures how widely individual results fluctuate around it. In learning, we usually observe only samples, which are noisy clues about these theoretical quantities.",
      "details": [
        "A discrete distribution assigns a nonnegative probability to every possible outcome, and those probabilities sum to one. Softmax turns arbitrary Logits, meaning unnormalized model scores, into such a categorical distribution. Sampling then draws an outcome according to those probabilities, whereas Greedy Decoding always selects only the most probable one.",
        "For a random variable X, the expected value E[X] is the probability-weighted sum of its values. The variance E[(X-E[X])²] measures the mean squared deviation from that value. An estimator can be unbiased, meaning that it is correct on average, yet still have such high variance that individual learning steps are extremely noisy.",
        "In Policy Gradient, the gradient of an expected Reward is estimated from sampled responses. A Baseline b(s) that depends only on the state may be subtracted from the Reward because the expectation of ∇log π(a|s)·b(s) is zero; the expected gradient stays the same, while its variance may decrease. When typical Rewards vary greatly between Prompts, R-b(s) evaluates a response relative to its Prompt instead of only by its absolute score."
      ],
      "pitfalls": [
        "Reading Logits as probabilities: Logits may be negative and do not sum to one; only Softmax produces probabilities.",
        "Equating low variance with low estimation error: an almost constant but systematically wrong estimator has low variance and still has high bias.",
        "Subtracting an action-dependent Baseline without checking it: its contribution generally does not vanish in expectation, so it can bias the gradient."
      ],
      "checks": [
        "Why can a state-only Baseline reduce variance in Policy Gradient without changing the expected gradient?",
        "In practical terms, what does high variance in the gradient estimator mean for training?"
      ],
      "answers": [
        "For a fixed state, E_a[∇log π(a|s)]=0. The additional term containing b(s) therefore has no effect on the gradient on average, but it can center the sampled Rewards in a useful way and reduce fluctuations between updates.",
        "Individual Mini-Batches then produce gradient steps whose direction or magnitude changes sharply, even if their average is correct. Training needs more samples, smaller learning rates, or variance reduction to make reliable progress."
      ]
    },
    "logs": {
      "title": "Logarithms, Log-Sum-Exp & Numerical Stability",
      "level": "Foundations",
      "summary": "Logarithms turn products into sums and keep extremely small probabilities numerically computable.",
      "mental": "Multiplying many token probabilities is like repeatedly shrinking a number that is already tiny. In log space, every multiplication becomes an addition, so the information does not immediately fall below the smallest representable number. Log-Sum-Exp applies the same stability idea when normalizing Logits.",
      "details": [
        "For positive numbers, log(a·b)=log(a)+log(b). The log-probability of a sequence is therefore the sum of its conditional token log-probabilities, even though the actual sequence probability is a product. Negative Log-Likelihood, abbreviated NLL, negates this sum and becomes small when the model assigns high probability to the target Tokens.",
        "For Logits z, Log-Sum-Exp is defined as log Σ_i exp(z_i). To compute it stably, let m=max(z) and evaluate m+log Σ_i exp(z_i-m), because every exponent is then at most zero. Log-Softmax directly returns z_i minus Log-Sum-Exp and avoids first materializing Softmax probabilities that may be extremely small.",
        "Cross-Entropy for a target Token is -log softmax(z)_target and can be computed stably directly from Logits. Perplexity is the exponential of the mean token NLL, so an NLL difference of 0.69 corresponds to roughly a factor of two in Perplexity. Means must be computed over the same set of Tokens with the same masking, or neither metric is comparable."
      ],
      "pitfalls": [
        "Allowing log(0): this produces negative infinity and can create NaN in later differences; stable formulas and correct masking avoid this path.",
        "Computing Softmax and then applying log: this order may round small probabilities down to zero even though Log-Softmax would directly return a finite value.",
        "Comparing Loss and Perplexity linearly: Perplexity is the exponential of the mean Loss, so equal differences in Loss correspond to multiplicative rather than additive changes."
      ],
      "checks": [
        "Why does subtracting the same maximum from every Logit leave the Softmax distribution unchanged?",
        "Why do token NLLs add up to a sequence NLL?"
      ],
      "answers": [
        "Every Softmax numerator and the denominator are multiplied by the same factor exp(-m). That factor cancels completely in the ratio, while the exponents become numerically smaller and safer.",
        "The autoregressive sequence probability is a product of conditional token probabilities. The logarithm turns this product into a sum, and negating it therefore produces the sum of the individual token NLLs."
      ]
    },
    "gradients": {
      "title": "Gradients, the Chain Rule & Autograd",
      "level": "Foundations",
      "summary": "Gradients measure local changes in Loss; Backpropagation computes them efficiently with the Chain Rule.",
      "mental": "The Forward Pass processes the Input step by step until it reaches the Loss and leaves behind a trace of the operations it used. The Backward Pass follows that trace in reverse and asks each operation how a small change in its Output would affect the Loss. Each operation combines this Upstream Gradient with its local derivative.",
      "details": [
        "The gradient of a scalar Loss with respect to a tensor has the same Shape as that tensor. Each entry describes the local change in Loss caused by a small increase in that particular entry. The negative gradient is therefore the direction of steepest local descent, although a large learning step can make this local approximation invalid.",
        "Autograd, or Automatic Differentiation, builds a computation graph during the Forward Pass and performs local Vector-Jacobian Products during the Backward Pass without storing complete Jacobian matrices. For Y=XW under the row-vector convention, for example, dX=dY·Wᵀ and dW=Xᵀ·dY, with sums over the batch and token axes. If a tensor contributes to the Loss along two paths, the Chain Rule adds the two gradient contributions.",
        "Many operations store activations or other residual values that their local derivative will need later. This makes Peak Memory grow roughly with Batch Size, Sequence Length, and number of Layers. Activation Checkpointing stores only selected intermediate states and repeats parts of the Forward Pass during the Backward Pass, trading memory for additional compute."
      ],
      "pitfalls": [
        "Not clearing gradients between Optimizer Steps: PyTorch accumulates them by default, so old and new Mini-Batches are added together unintentionally.",
        "Modifying required activations in-place: the Backward Pass then no longer finds the values on which the local derivative must be based.",
        "Applying a scalar derivative directly to vectors: Backpropagation works with Vector-Jacobian Products, so Shapes and sums across shared paths must be handled explicitly and correctly."
      ],
      "checks": [
        "Why are gradients added at a branch in the computation graph?",
        "Which quantities are needed for the Backward Pass of a matrix multiplication Y=XW?"
      ],
      "answers": [
        "If the same intermediate value influences the Loss along multiple paths, the total change in Loss is the sum of the changes along all paths. The multidimensional Chain Rule therefore combines the respective Upstream contributions at the shared node by addition.",
        "Computing dX requires the Upstream Gradient dY together with W, and computing dW requires dY together with X. Autograd therefore typically stores the required Inputs or reconstructs them when Activation Checkpointing is used."
      ]
    },
    "resource-accounting": {
      "title": "Resource Accounting: Parameters, Bytes & FLOPs",
      "level": "Core",
      "summary": "Resource accounting translates model Shapes into parameter counts, memory requirements, compute, and runtime limits.",
      "mental": "Treat training like a suitcase with separate compartments: weights, gradients, Optimizer State, and activations each occupy their own space. Then count the arithmetic operations, but do not confuse that theoretical work with hardware speed. A rough estimate before a Run prevents many expensive failed attempts.",
      "details": [
        "The parameter count of a Linear Layer without a Bias is D_in·D_out and does not depend on Batch Size or Sequence Length. For a dense Decoder Transformer with L blocks and Model Dimension D, a useful rough approximation is N_non-embedding≈12LD²; Embeddings, SwiGLU width, and Attention variants can change the factor. With L=24, doubling D quadruples the dominant D² term.",
        "Memory is not used only by weights: gradients, two AdamW moment tensors, and stored activations are also required. BFloat16, abbreviated BF16, uses two bytes per value, whereas 32-Bit Floating Point (FP32) uses four; Optimizer moments and, in some setups, master weights often remain in FP32 for stability. Activation memory also depends on B, T, D, and L, so it cannot be inferred from the parameter count alone.",
        "A matrix multiplication [m,k]·[k,n] costs approximately 2mkn Floating-Point Operations, abbreviated FLOPs. A common first approximation for dense Transformer training is C≈6ND_tokens: approximately 2ND_tokens for the Forward Pass and about twice as much additional work for the Backward Pass. Actual runtime also depends on attainable FLOP/s, memory traffic, communication, and utilization, so hardware Peak values are not a runtime guarantee."
      ],
      "pitfalls": [
        "Counting only the weights: with AdamW, gradients and moment states can require at least as much memory as the parameters before activations are considered.",
        "Mixing GB and GiB: hardware vendors usually use 10⁹ bytes, whereas GiB means 2³⁰ bytes; at large model sizes, this creates a meaningful difference.",
        "Assuming Peak TFLOP/s can be sustained: small matrices, data movement, communication, and idle time often reduce actual Model FLOPs Utilization substantially."
      ],
      "checks": [
        "Which four major memory blocks should you estimate separately when training with AdamW?",
        "When Sequence Length T is doubled, what happens to ordinary token-wise activations and to an explicitly stored Attention score matrix?"
      ],
      "answers": [
        "Count model parameters, parameter gradients, Optimizer States such as the two AdamW moments, and activations needed for the Backward Pass separately. Depending on the Mixed-Precision method, there may also be an FP32 master copy of the parameters.",
        "Token-wise activations with Shape [B,T,D] double when all other quantities stay fixed. An explicit score matrix [B,H,T,T] grows quadratically and therefore needs roughly four times as much memory; IO-aware Attention can avoid fully materializing it."
      ]
    },
    "unicode": {
      "title": "Unicode, Codepoints & UTF-8",
      "level": "Foundations",
      "summary": "Unicode defines text characters, UTF-8 translates their Codepoints into bytes, and visible characters may consist of several Codepoints.",
      "mental": "When working with text, always move down through three levels: what you see, which Unicode Codepoints form it, and which bytes the chosen Encoding stores. A visible é, for example, may be one Codepoint or a sequence consisting of e and a combining accent. To a computer, the two representations can be different even though they look identical.",
      "details": [
        "Unicode assigns integer Codepoints to abstract characters, such as U+0061 for a. A Grapheme is what people often perceive as one visible character, but it may consist of several Codepoints, such as a letter plus a combining accent. The length of a Python string is therefore neither a reliable count of visible Graphemes nor a count of its bytes.",
        "UTF-8 is a variable-length Encoding that translates one Codepoint into one to four bytes. Because every byte has a value from 0 through 255, a byte-based Tokenizer with 256 base symbols can represent every valid UTF-8 Input and does not need an Unknown Token for new scripts. However, not every sequence of bytes is valid UTF-8, and even a single BPE Token may contain only part of a multibyte character.",
        "Unicode Normalization can make canonically equivalent Codepoint sequences uniform, but it changes the exact byte sequence. This may improve tokenization, but it is a product decision because exact reversibility and special spellings can be affected. During Decoding, the bytes from all Tokens are first joined and only then decoded as UTF-8; invalid sequences require a defined error strategy."
      ],
      "pitfalls": [
        "Interpreting len(text) as a byte count: UTF-8 uses multiple bytes for many characters, so len(text.encode('utf-8')) can be substantially larger.",
        "Equating a Codepoint with a Grapheme: emoji sequences, combining accents, and some writing systems can represent one visible character with several Codepoints.",
        "Decoding every byte separately as UTF-8: this splits multibyte characters in the middle of their Encoding and produces errors or replacement characters."
      ],
      "checks": [
        "Why is a Vocabulary containing all 256 byte values complete for arbitrary valid UTF-8 text?",
        "Why can len(text) and len(text.encode('utf-8')) return different values?"
      ],
      "answers": [
        "Every valid UTF-8 text is ultimately a sequence of bytes, and every possible byte lies between 0 and 255. The Tokenizer can therefore initially represent any Input byte by byte, even if it has not yet learned longer Subword Tokens for it.",
        "The string length in Python counts Codepoints, whereas the length of the encoded bytes counts the actual UTF-8 bytes. ASCII Codepoints use one byte, while many other Codepoints use two to four bytes."
      ]
    },
    "bpe": {
      "title": "BPE (Byte-Pair Encoding)",
      "level": "Core",
      "summary": "Byte-Pair Encoding learns frequent byte sequences as new Tokens, shortening sequences without losing complete byte coverage.",
      "mental": "Start with 256 small building blocks from which any UTF-8 text can be assembled. Repeatedly find the most frequent adjacent pair and glue it together into a new building block. The order of these gluing steps is the learned model of the Tokenizer.",
      "details": [
        "Byte-Pair Encoding (BPE) combines the complete coverage of a byte Tokenizer with shorter sequences for frequent text patterns. The initial Vocabulary contains the 256 individual bytes plus defined Special Tokens. Every Merge operation adds exactly one new Token entry to the Vocabulary until the desired Vocabulary size is reached.",
        "Before counting, Pretokenization splits the corpus into coarse segments and stores their frequencies. Within those boundaries, BPE counts adjacent Token pairs, chooses the most frequent pair using a fixed tie-breaking rule, and replaces its occurrences with a new Token. After merging A,B into AB, only pair relationships involving the new Token or overlapping occurrences change, which incremental implementations exploit.",
        "During Encoding, a Pretoken is first split into bytes and then combined according to the learned Merge ranks. The ordered list is necessary because a later Merge can depend on a Token created by an earlier one; an unordered set does not contain this dependency. Special Tokens such as an End-of-Sequence marker are treated as indivisible hard boundaries and must neither be split nor merged across."
      ],
      "pitfalls": [
        "Storing Merges as an unordered set: it is then undefined which of several applicable steps takes priority, and Encoding can differ from training.",
        "Treating Special Tokens like ordinary text: they may be split into bytes or create pair statistics across document boundaries, losing their fixed meaning.",
        "Continuing to use all pair counts unchanged after a Merge: affected neighbors must be subtracted and recounted, or the very next most frequent pair will already be selected incorrectly.",
        "Breaking ties randomly: the same corpus can then produce different Vocabularies, which breaks tests, reproducibility, and stored Token IDs."
      ],
      "checks": [
        "Why is an unordered set of learned BPE Merges insufficient for deterministic Encoding?",
        "Which local pair relationships change when the pair A,B in the sequence L, A, B, R is merged into AB?"
      ],
      "answers": [
        "Merge rules can depend on one another because a later Token may be created only by an earlier Merge. The rank order also determines which applicable Merge runs first when pairs compete or overlap.",
        "The old relationships (L,A), (A,B), and (B,R) disappear for this occurrence. The new relationships (L,AB) and (AB,R) are created, while pairs outside this local neighborhood remain unchanged; overlapping identical occurrences must be handled consistently."
      ]
    },
    "tokenizer-tradeoffs": {
      "title": "Tokenizer Trade-offs",
      "level": "Core",
      "summary": "A Tokenizer trades Vocabulary size against Sequence Length, model cost, and fair coverage of different kinds of text.",
      "mental": "A small Vocabulary has only a few reusable building blocks, but it needs many of them for the same text. A large Vocabulary recognizes longer patterns as single Tokens, but the model must maintain a separate learnable vector and Output score for every additional Token. The best choice therefore depends jointly on the data, languages, model size, and deployment cost.",
      "details": [
        "Token fertility roughly describes how many Tokens a text or word requires; compression is often measured as bytes per Token. Fewer Tokens place more real text into a fixed Context Window and reduce many token-dependent costs. With full Attention, a shorter sequence can help especially strongly because the score matrix grows quadratically with T.",
        "A Vocabulary of size V requires an Embedding matrix [V,D] and an LM Head, meaning a Linear Layer from D to V Logits. Weight Tying can share the two weight matrices, but it removes neither the large Vocabulary nor the cost of the Output scores. Very large Vocabularies also more often contain rarely trained entries whose representations see little data.",
        "The optimal segmentation depends on the data: a Tokenizer trained on English can split other scripts into many bytes and consume their Context and compute budgets more quickly. Evaluation should therefore check bytes per Token by language and domain, exact Encode-Decode Roundtrip, Special Tokens, unseen scripts, and corrupted byte sequences. A real test corpus is more informative than a few hand-picked examples."
      ],
      "pitfalls": [
        "Measuring only English averages: good overall compression can hide substantially higher Token costs for lower-resource languages or code.",
        "Optimizing sequence shortening in isolation: a larger Vocabulary increases the Embedding, LM Head, and often Softmax cost, so total cost may rise again.",
        "Testing the Roundtrip only on clean ASCII: Unicode, Special Tokens, invalid byte combinations, and streaming boundaries reveal different classes of bugs."
      ],
      "checks": [
        "Why is a very large Vocabulary not free even if it produces shorter sequences?",
        "Which tests would you run before selecting a Tokenizer for a multilingual model?"
      ],
      "answers": [
        "As V grows, the Embedding matrix grows proportionally to V·D, and the LM Head must produce V Logits at every position. Rare Vocabulary entries also receive less training signal, so additional parameters do not automatically produce better representations.",
        "I would measure bytes per Token and Token fertility separately by language and domain, verify the exact Encode-Decode Roundtrip, and test Special Tokens and unseen scripts. I would also compare parameter and runtime costs at realistic Sequence Lengths and manually inspect problematic examples."
      ]
    },
    "lm-objective": {
      "title": "Autoregressive Language Model",
      "level": "Core",
      "summary": "At each position, an autoregressive Language Model predicts the next Token using only the preceding Context.",
      "mental": "Read a sequence from left to right and pause after every Token: which distribution would you assign to the next Token? During training, all true earlier Tokens are already known, so these questions can be asked in parallel. During generation, however, the next question must wait for the answer that was just generated.",
      "details": [
        "An autoregressive Language Model factorizes p(x₁,…,x_T) into the product of conditional probabilities p(x_t|x_<t). The Context x_<t contains only earlier Tokens, not the Token being predicted or any later Token. In log space, the sequence log-probability becomes the sum of the individual token log-probabilities.",
        "Teacher Forcing means that during training, the Forward Pass receives the true preceding Tokens as Context. From a sequence x₁,…,x_T, the Inputs are typically x₁,…,x_{T-1} and the Targets are x₂,…,x_T; a Causal Mask prevents future leakage within the parallel pass. The Logits have Shape [B,T-1,V], and Cross-Entropy compares the V scores at each position with the corresponding Target ID.",
        "During training, all positions can be computed at once because their correct Prefixes are available in the data. During Decoding, the Token at position t+1 is still unknown and must first be selected from the distribution at position t before it becomes new Context. This Feedback Loop makes standard Decoding sequential and also creates a difference between training with true Prefixes and generation with the model's own earlier mistakes."
      ],
      "pitfalls": [
        "Failing to shift Input and Target: the model then learns to copy the visible current Token instead of predicting the next one.",
        "Leaving future Tokens unmasked: the Loss may look artificially good because the correct answer is already in the Context even though it will not be available during Inference.",
        "Equating Teacher Forcing with free generation: Prefixes come from the data during training and from the model itself during Inference, so early errors change all later Contexts."
      ],
      "checks": [
        "Why can predictions for many positions be computed in parallel during training even though the model is autoregressive?",
        "Why does ordinary Decoding remain sequential without special methods?"
      ],
      "answers": [
        "All true Tokens, and therefore all required Prefixes, are already present in a training example. A single causally masked Transformer computation can produce a prediction at every position without first having to sample any prediction.",
        "The next Input Token is the Output Token the model has just selected, so it is not known in advance. Only after that choice can the Context be extended and the following distribution computed."
      ]
    },
    "embeddings": {
      "title": "Embeddings & Output Logits",
      "level": "Core",
      "summary": "Embeddings look up learnable vectors for discrete Token IDs; the LM Head maps states back to Vocabulary scores.",
      "mental": "A Token ID is like a catalog number and has no natural numerical closeness to other IDs. The Embedding matrix is the catalog: each ID selects exactly one row containing D learned features. At the end of the model, the state is compared with every Vocabulary row to produce scores for possible next Tokens.",
      "details": [
        "For a Vocabulary containing V Tokens and Model Dimension D, the Embedding matrix E has Shape [V,D]. Integer IDs [B,T] select rows from E and produce activations X [B,T,D]; there is no weighted averaging of the numerical ID values. Only the rows used in a Batch receive a direct Input Embedding gradient through this lookup.",
        "The LM Head is a Linear Layer, meaning a learnable matrix multiplication, from D features to V Logits. It transforms states [B,T,D] into unnormalized scores [B,T,V], and only Softmax turns them into probabilities. Computing all V scores can account for a meaningful share of parameters, compute, and memory traffic when V is large.",
        "Weight Tying uses the same weights for the Input Embedding and the LM Head, so the Output is typically computed with Eᵀ. This removes a separate matrix containing V·D parameters, but the [B,T,V] Logits must still be produced. The shared matrix receives gradients both from the Input lookups and from all Output comparisons."
      ],
      "pitfalls": [
        "Treating Token IDs as continuous measurements: ID 101 is not semantically closer to ID 102 than to ID 900; meaning lives in the learned rows.",
        "Interpreting Logits as probabilities: they may be arbitrary real values and are normalized only by Softmax.",
        "Treating Weight Tying as a free Output Layer: it saves parameters, but not the matrix multiplication or storage of the Vocabulary Logits."
      ],
      "checks": [
        "What are the Shapes of the Embedding matrix, Token IDs, embedded activations, and Output Logits?",
        "What does Weight Tying save, and which costs remain?"
      ],
      "answers": [
        "The Embedding matrix has Shape [V,D], the IDs [B,T], the resulting activations [B,T,D], and the Output Logits [B,T,V]. V is the Vocabulary size and D is the Model Dimension.",
        "Weight Tying saves the separate Output weight matrix with V·D parameters and connects the Input and Output representations. The computation of V Logits per position, their storage, and the Softmax cost still remain."
      ]
    },
    "rmsnorm": {
      "title": "RMSNorm & the Residual Path",
      "level": "Core",
      "summary": "RMSNorm stabilizes the scale of each Token state without subtracting its mean.",
      "mental": "Imagine the D-dimensional state of a Token as an arrow. RMSNorm measures its typical squared length and scales the arrow to a controlled magnitude before a Sub-Layer processes it. A learnable Gain then allows individual features to be weighted differently again.",
      "details": [
        "Root Mean Square Normalization (RMSNorm) computes rms(x)=sqrt(mean_i(x_i²)+ε) for each token vector x. Its Output is y_i=x_i/rms(x)·g_i with a learnable Gain g [D]. For X [B,T,D], normalization runs only over the final D axis, so Shape [B,T,D] is preserved.",
        "Unlike LayerNorm, RMSNorm does not subtract a mean and has no Bias in its usual form. This saves operations and parameter movement, although matrix multiplications still account for most FLOPs. For numerical safety, squaring and averaging are often temporarily computed in FP32 when the Input uses lower precision, and ε is placed inside the square root.",
        "In a Pre-Norm block, an update is x_new=x+F(RMSNorm(x)), where F may be Attention or a Feed-Forward Network. The Residual Path carries the original x forward directly, while only the Side Branch is normalized; this supports stable gradient flow in deep networks. After the final block, the state is usually normalized once more before the LM Head produces the Logits."
      ],
      "pitfalls": [
        "Normalizing across Batch or Sequence: other examples or positions would then affect a Token's scale even though RMSNorm is defined per Token across features.",
        "Centering RMSNorm like LayerNorm: subtracting the mean changes the operation and removes the defining difference between the two normalization variants.",
        "Adding RMSNorm(x), rather than x, to the Residual in a Pre-Norm block: this removes the direct Identity Path that is a central advantage of Pre-Norm."
      ],
      "checks": [
        "Along which axis does RMSNorm compute the quadratic mean for X [B,T,D], and what Shape does the Gain have?",
        "Why does the Main Path remain unchanged in the update x+F(RMSNorm(x))?"
      ],
      "answers": [
        "For every Batch and Sequence index, the mean runs over the final Feature axis D. The learnable Gain contains one value per Feature and therefore has Shape [D], which is broadcast over B and T.",
        "The Residual addition uses the original x on the left and carries it to the Output without normalization or matrix multiplication. RMSNorm affects only the Side Branch F, leaving an Identity Path for both signal and gradient."
      ]
    },
    "swiglu": {
      "title": "SwiGLU Feed-Forward Network",
      "level": "Core",
      "summary": "SwiGLU is a position-wise Feed-Forward Network that selects and mixes features with a learned SiLU Gate.",
      "mental": "Attention gathers information from other Token positions; SwiGLU then processes each Token independently. Two Linear Layers produce candidate features and a soft Gate for every Token. Their elementwise product determines which expanded features are passed on strongly.",
      "details": [
        "SwiGLU combines the activation function SiLU(z)=z·sigmoid(z) with a Gated Linear Unit, meaning a learnable Gate. A common formula is FFN(x)=W_down(SiLU(W_gate x)⊙W_up x), where ⊙ denotes elementwise multiplication. The Gate branch is smooth and can dampen values, pass them through, or change their sign.",
        "For X [B,T,D], W_gate and W_up each produce [B,T,F], where F is the inner Feed-Forward width. After SiLU and elementwise multiplication, W_down maps the tensor back to [B,T,D] so that Residual addition is possible. Every operation treats each of the B·T positions independently; only Attention mixes information along T.",
        "SwiGLU has three rather than two large weight matrices and would contain more parameters than a standard Multi-Layer Perceptron (MLP) at the same inner width. F is therefore often set to approximately 8D/3 rather than 4D and rounded to a hardware-friendly multiple. With this adjusted width, the parameter count remains roughly comparable, while Gating often yields better Language Model quality empirically."
      ],
      "pitfalls": [
        "Transforming across the Sequence axis T: the Feed-Forward Network should mix features within one Token; mixing positions is the role of Attention.",
        "Counting only two weight matrices: in addition to the two upward branches, SwiGLU needs a third matrix that maps back to D, changing parameter and FLOP comparisons.",
        "Applying SiLU only after combining the branches: SiLU is defined on one of the two branches before elementwise multiplication; a different order is a different architecture."
      ],
      "checks": [
        "What Shapes do the two upward branches, their elementwise product, and the final SwiGLU Output have for X [B,T,D]?",
        "Why is the inner width of SwiGLU often chosen to be smaller than 4D?"
      ],
      "answers": [
        "Both upward branches have Shape [B,T,F], as does their elementwise product. The Down Linear Layer maps F back to D, so the final Output has Shape [B,T,D] and can be added to the Residual.",
        "SwiGLU has three large matrices, whereas a standard two-layer MLP has only two. With F approximately 8D/3, 3DF≈8D², roughly matching the parameter count of a standard 4D MLP with 2·4D²."
      ]
    },
    "rope": {
      "title": "RoPE (Rotary Position Embedding)",
      "level": "Core",
      "summary": "RoPE encodes position by rotating pairs of Query and Key features through position-dependent angles.",
      "mental": "Imagine every two features as an arrow in a plane. The farther to the right a token appears, the farther this arrow is rotated; different feature pairs rotate at different frequencies. When you take the dot product of two rotated arrows, what matters most is the difference between their angles, and therefore the relative distance between their positions.",
      "details": [
        "Rotary Position Embedding (RoPE) splits the last dimension of a Query or Key vector into two-dimensional pairs. At position p, each pair is rotated by an angle p·ω_k, where the frequencies ω_k vary across pairs. The operation has no learnable parameters and does not change the tensor shape.",
        "In Multi-Head Attention, Q and K typically have shape [B,H,T,d_h], and RoPE rotates along the last axis d_h for every position along T. Because R_iᵀR_j is a rotation by the angle difference j-i, the dot product (R_i q)·(R_j k) depends on relative distance in a controlled way. The Head dimension must be even for this simple pairing scheme, and the sine and cosine values can be precomputed and cached for all positions and frequencies.",
        "RoPE is applied to Q and K before their Attention scores are computed, but not to V. The same position convention and frequencies must be used consistently across all Heads and Layers; otherwise, the dot products lose the intended relationship. Even though the angles are mathematically defined for longer positions, inference sequences longer than those seen during training are not automatically reliable because the model did not learn from those position ranges."
      ],
      "pitfalls": [
        "Implementing RoPE as an additive positional embedding: RoPE rotates feature pairs multiplicatively and therefore produces different dot-product properties.",
        "Rotating Q and K with different pairing or sign conventions: Their dot product will no longer correspond to the intended relative rotation.",
        "Applying RoPE to V as well: Values carry content after weighting; the position dependence is meant to arise in the Query-Key scores.",
        "Broadcasting sine and cosine over the Head axis instead of the feature axis: The code may still run, but different Heads or positions will receive the wrong angles."
      ],
      "checks": [
        "Why can the dot product of two vectors transformed with RoPE depend on the relative distance i-j?",
        "To which tensors and along which axis is RoPE applied when Q, K, and V have shape [B,H,T,d_h]?"
      ],
      "answers": [
        "For rotation matrices, (R_i q)ᵀ(R_j k)=qᵀR_iᵀR_j k. The product R_iᵀR_j is a rotation by the difference between the two position angles, so it depends on j-i rather than on the two positions separately.",
        "RoPE is applied to Q and K and rotates pairs along the final feature axis d_h, using position-dependent angles along T. V remains unchanged, while B and H act only as batch-like axes."
      ]
    },
    "attention": {
      "title": "Scaled Dot-Product Attention",
      "level": "Core",
      "summary": "Scaled Dot-Product Attention weights Value vectors according to how well Queries and Keys match.",
      "mental": "A Query describes what information a position is looking for, a Key describes what information a position offers, and a Value describes what it passes on when selected. Query-Key scores are normalized into weights. Each Query then receives a weighted mixture of the available Values.",
      "details": [
        "For Multi-Head Attention, let Q have shape [B,H,T_q,d_h], K have shape [B,H,T_k,d_h], and V have shape [B,H,T_k,d_v]. The matrix product QKᵀ produces scores of shape [B,H,T_q,T_k], comparing every Query with every Key. The formula is Attention(Q,K,V)=softmax(QKᵀ/sqrt(d_h))·V, and its output has shape [B,H,T_q,d_v].",
        "Dividing by sqrt(d_h) keeps the typical magnitude of the dot products stable: if the components were roughly independent with variance one, their unscaled sum would otherwise have variance d_h. Masks set forbidden scores to negative infinity before Softmax. Softmax runs over T_k, so the allowed Key weights sum to one for each fixed Query and can then be used to form a weighted mixture of V.",
        "Multi-Head Attention performs H smaller Attention computations in parallel and then rearranges their outputs into [B,T_q,H·d_v]. A final Linear Layer mixes the Head features back into the model dimension D. With D held fixed, more Heads usually mean smaller Head dimensions—not automatically more parameters or better quality."
      ],
      "pitfalls": [
        "Applying Softmax over the Query axis: Different requests would then compete with one another instead of each Query receiving its own set of Key weights.",
        "Dividing by sqrt(d_h) only after Softmax: The scaling must control the logits before the exponential; afterward, it can no longer meaningfully prevent saturation.",
        "Multiplying by a zero mask after Softmax: Forbidden positions have already received part of the normalization mass, so the remaining weights no longer sum to one.",
        "Treating Q, K, and V as model parameters: They are activation-dependent tensors; the learned quantities are the weights of the Linear Layers that produce them from the hidden states."
      ],
      "checks": [
        "What shape does the score matrix have per Batch and Head, and along which axis is Softmax applied?",
        "Why is QKᵀ divided by sqrt(d_h)?"
      ],
      "answers": [
        "Q [B,H,T_q,d_h] and K [B,H,T_k,d_h] produce scores [B,H,T_q,T_k]. Softmax normalizes the final axis T_k so that each Query obtains a distribution over its possible Keys.",
        "An unscaled dot product sums d_h contributions, so its typical variance grows with d_h. The division keeps scores on an approximately dimension-independent scale and prevents Softmax from becoming extremely sharp too early and producing very small gradients."
      ]
    },
    "causal-mask": {
      "title": "Causal Mask",
      "level": "Core",
      "summary": "A causal mask prevents a position from using information from the future during next-token training.",
      "mental": "Place a lower triangle of allowed cells over the Attention table. Row i is the Query at position i and may only see columns up to and including i. Everything to its right is made invisible before normalization.",
      "details": [
        "For a sequence of length T, the causal mask M has shape [T,T], with M[i,j] allowed exactly when j≤i. Row 0 therefore contains only the first Key, while the final row may see all preceding Keys. The same mask is broadcast across Batch B and Heads H onto scores of shape [B,H,T,T].",
        "Forbidden scores are set to negative infinity, or to a sufficiently negative representable value, before Softmax. Their exponentials therefore become zero, while the allowed entries are still normalized to sum to one. Masking only after Softmax would be wrong because forbidden entries would already have claimed part of the denominator.",
        "The mask enables Teacher Forcing for all positions in one parallel Forward Pass without revealing future target tokens. Padding masks may also be necessary and must be combined correctly with the causal mask. A fully masked row is dangerous because Softmax over only negative infinity values can produce NaN; every evaluated Query needs at least one valid Key."
      ],
      "pitfalls": [
        "Flipping the triangle: A position would then see future tokens instead of past tokens, and leakage would make the training Loss meaninglessly good.",
        "Masking after Softmax: The allowed weights are no longer normalized correctly because the denominator already included the forbidden positions.",
        "Creating a fully masked Query row: Softmax has no valid element to normalize and may produce NaN, which can spread through the entire model.",
        "Mixing Boolean mask conventions: Some APIs use True for allowed positions, while others use True for forbidden positions; copying a mask without checking can invert its meaning."
      ],
      "checks": [
        "Which positions may row 0 of a causal T×T mask see, and which positions may row i see?",
        "Why must the causal mask be applied to the scores before Softmax?"
      ],
      "answers": [
        "Row 0 may see only Key 0. More generally, Query i may see all Keys j with j≤i and no position j>i, because those tokens would not yet be known during autoregressive Decoding.",
        "Softmax distributes its total mass based on all finite input scores. If forbidden scores are set to negative infinity beforehand, they contribute exactly zero to the denominator and the allowed weights still form a valid distribution."
      ]
    },
    "transformer-block": {
      "title": "Pre-Norm Transformer Block",
      "level": "Core",
      "summary": "A Pre-Norm Transformer Block updates the same stream of hidden states first through Attention and then through a position-wise SwiGLU network.",
      "mental": "The Residual Stream is a wide highway along which the hidden state can flow unchanged through many Blocks. Two side roads read a normalized copy: Attention gathers information from other positions, and SwiGLU then processes the features of each token. The result of each side road is added back onto the highway.",
      "details": [
        "A Block receives x [B,T,D] and first computes x₁=x+Attention(RMSNorm(x)). It then computes y=x₁+SwiGLU(RMSNorm(x₁)). Both sublayers must return [B,T,D] so their outputs can be added element by element to the corresponding Residual state.",
        "RMSNorm is Pre-Norm because normalization happens before each sublayer, leaving the direct Residual path x or x₁ unchanged. Attention mixes information along the sequence axis T, while the position-wise Feed-Forward Network SwiGLU mixes features along D. The ordering is sequential: the second sublayer already sees the result of the first Residual update.",
        "A complete decoder Language Model first embeds IDs [B,T] into hidden states [B,T,D] and stacks L such Blocks without changing the shape. A final RMSNorm and an LM Head then follow; the LM Head is a Linear Layer from D to vocabulary size V and produces logits [B,T,V]. The constant Residual shape makes deep stacking straightforward, while parameter and activation memory grow approximately with L."
      ],
      "pitfalls": [
        "Using RMSNorm(x) rather than x as the Residual base: This normalizes the highway itself, so the architecture is no longer the Pre-Norm Block described here.",
        "Computing both Attention and SwiGLU from the same old x: In the sequential Block, the second branch must use x₁ and therefore already see the Attention update.",
        "Adding sublayer outputs with a different shape: An accidental broadcasting workaround is not a substitute for the required mapping back to [B,T,D].",
        "Forgetting the final Norm after L Pre-Norm Blocks: The unnormalized Residual Stream would then feed directly into the LM Head and may have an unfavorable scale."
      ],
      "checks": [
        "Which axis does the Attention branch mix, and which axis does the SwiGLU branch mix in a Transformer Block?",
        "Where do the two Residual additions occur, and which hidden state enters the second RMSNorm?"
      ],
      "answers": [
        "For each Query, Attention mixes information across token positions along T. SwiGLU works position-wise and mixes the feature axis D within each token; its Linear Layers do not connect different positions.",
        "First, Attention(RMSNorm(x)) is added to the original x to produce x₁. Then SwiGLU(RMSNorm(x₁)) is added to x₁, so the second RMSNorm receives the hidden state that Attention has already updated."
      ]
    },
    "cross-entropy": {
      "title": "Cross-Entropy & Negative Log-Likelihood",
      "level": "Core",
      "summary": "Cross-Entropy measures how much probability the Language Model assigns to the actual next token.",
      "mental": "Before each prediction, imagine the model distributing all of its confidence across the vocabulary. If much of that confidence lands on the correct token, the penalty is small; if almost none lands there, the penalty is large. This penalty is the Negative Log-Likelihood (NLL), which equals Cross-Entropy in next-token training.",
      "details": [
        "The Forward Pass—the model's forward computation—returns logits with shape B×T×V: B is the Batch size, T is the sequence length, and V is the vocabulary size. Each of the B×T positions has a target ID with shape B×T, and Softmax turns the V logits into a probability distribution.",
        "For a logit vector z and target y, the Loss is logsumexp(z) − z_y, which is exactly −log p(y). A stable implementation first subtracts the largest logit or directly uses Log-Sum-Exp, rather than materializing Softmax and the logarithm as two separate, numerically fragile operations.",
        "The mean must be taken only over valid target tokens; masked Padding tokens must be removed from both the sum and the denominator. Under a uniform distribution over V tokens, every p(y)=1/V and the Loss is therefore log(V), while a highly confident wrong prediction receives a particularly large penalty."
      ],
      "pitfalls": [
        "Computing the full Softmax first: Very large or small logits can overflow or underflow; the stable Log-Sum-Exp form avoids this.",
        "Averaging over sequences instead of valid tokens: Different sequence lengths or Padding then unintentionally change the weight of individual examples.",
        "Treating Cross-Entropy as a symmetric distance: It evaluates the model distribution relative to the given target and changes when those roles are reversed."
      ],
      "checks": [
        "What mean Cross-Entropy Loss results if the model uses a uniform distribution over V tokens at every position?",
        "Why must masked tokens be removed from both the Loss sum and its denominator?"
      ],
      "answers": [
        "Under a uniform distribution, p(y)=1/V. The per-token Loss is therefore −log(1/V)=log(V), and because every position has the same value, the mean is also log(V).",
        "A masked token should make no contribution to training. If it is removed from the sum but not the denominator, the Loss becomes artificially small; if it remains in both, the model unintentionally trains or evaluates on Padding instead of content."
      ]
    },
    "adamw": {
      "title": "AdamW",
      "level": "Core",
      "summary": "AdamW adapts the step size for each parameter using smoothed gradient moments and applies Weight Decay separately from the gradient update.",
      "mental": "A single Batch provides a noisy hint about how a parameter should change. AdamW therefore keeps two memories for every parameter: one for the smoothed direction and one for the typical squared gradient magnitude. Large, frequently occurring gradients are damped relative to smaller ones, while Weight Decay pulls parameters slightly toward zero in a separate step.",
      "details": [
        "After the Backward Pass—the backward computation of gradients—AdamW updates the first moment m_t=β₁m_{t−1}+(1−β₁)g_t and the second moment v_t=β₂v_{t−1}+(1−β₂)g_t². The first moment m smooths direction and sign, while v captures the local scale of the gradient.",
        "Because both moments start at zero, they are systematically too small during the first steps; Bias Correction therefore divides them by 1−β₁ᵗ and 1−β₂ᵗ, respectively. The adaptive update then uses approximately m̂/(√v̂+ε), where ε stabilizes division by extremely small values and t must equal one for the first update.",
        "Weight Decay is decoupled and applied as a separate shrinkage step θ←θ−αλθ rather than being mixed into g. For every trainable parameter, AdamW additionally stores m and v with the same shape as θ; a D_in×D_out matrix therefore creates two equally large Optimizer tensors and requires corresponding additional memory."
      ],
      "pitfalls": [
        "Correcting the first step with t=0: The terms 1−βᵗ then contain zero, making the Bias Correction undefined.",
        "Also adding Weight Decay as an L2 term to the gradient: This applies regularization twice and loses the decoupling that AdamW is designed to provide.",
        "Storing moment states at too low a precision: Rounding errors can make the second moment in particular—and therefore the update denominator—unreliable."
      ],
      "checks": [
        "Why does AdamW need Bias Correction for m and v during the first Optimizer steps?",
        "What does it mean in concrete terms that Weight Decay is decoupled from the gradient update in AdamW?"
      ],
      "answers": [
        "The moments m and v start at zero and initially contain only a few gradients, so their exponential averages are biased toward zero. Dividing by 1−β₁ᵗ and 1−β₂ᵗ corrects exactly this known initialization bias.",
        "Decoupled means that AdamW shrinks parameters directly in proportion to their current magnitude and does not insert this term into the adaptively scaled gradient. As a result, the effect of Weight Decay does not depend on the moments and their parameter-specific scaling in the same way."
      ]
    },
    "schedules": {
      "title": "Warmup & Cosine Schedule",
      "level": "Core",
      "summary": "A Learning-Rate Schedule controls how large the Optimizer steps are during different phases of training.",
      "mental": "At the beginning, the Optimizer barely knows the typical gradient scale, so Warmup raises the Learning Rate cautiously. During the main phase, the model can learn with larger steps. Toward the end, Cosine Decay lowers the Learning Rate smoothly so updates around a good solution become less noisy.",
      "details": [
        "During linear Warmup, the Learning Rate for step t<T_w grows proportionally as α_t=(t/T_w)α_max. This avoids abrupt, large updates while activations and Adam moments have not yet settled.",
        "For T_w≤t≤T_c, Cosine Decay uses half a cosine curve to interpolate from α_max to α_min; after T_c, the Learning Rate remains at α_min. At each boundary, both piecewise formulas must return the same value, or an off-by-one error will create an unexpected jump.",
        "The variable t counts Optimizer Steps, not individual Microbatches: with four accumulated Microbatches, the Scheduler advances only once, together with the parameter update. A Checkpoint must therefore include at least the current step and Scheduler state. Warmup-Stable-Decay is an alternative Schedule with a longer constant phase, but it does not use a different definition of a step."
      ],
      "pitfalls": [
        "Advancing the Scheduler after every Microbatch: With Gradient Accumulation, the entire Learning-Rate progression then runs too fast by the accumulation factor.",
        "Handling the Warmup and cosine boundaries inconsistently: The wrong less-than-or-equal comparison or an offset step can skip α_max or use it twice.",
        "Loading only the Optimizer when resuming: Without the step and Scheduler state, training continues with the wrong Learning Rate even though the parameters were loaded correctly."
      ],
      "checks": [
        "What Learning Rate must apply at the transition from linear Warmup to Cosine Decay?",
        "With Gradient Accumulation, which step should the Learning-Rate Schedule count?"
      ],
      "answers": [
        "At the end of Warmup, the Learning Rate must reach α_max, and the cosine phase must also begin at α_max. This keeps the Schedule continuous at the transition and avoids an unintended jump.",
        "The Schedule counts an actual Optimizer Step: the point at which the accumulated gradients trigger a parameter update. Several Microbatches whose gradients are only being collected do not yet increment this counter."
      ]
    },
    "clipping": {
      "title": "Global Gradient Clipping",
      "level": "Core",
      "summary": "Global Gradient Clipping limits the joint length of all gradients without changing their direction.",
      "mental": "Imagine concatenating every parameter gradient into one very long vector. If this arrow is shorter than the threshold, it remains unchanged; if it is too long, the entire arrow is scaled down uniformly. This prevents an unusual Batch from causing an extremely large Optimizer Step without arbitrarily cutting off individual coordinates.",
      "details": [
        "Gradient Clipping is applied after the Backward Pass and before the Optimizer Step to catch rare gradient spikes. It cannot repair a poor Learning Rate or faulty data, but it can prevent a single unstable step from immediately derailing training.",
        "The global L2 norm is ||g||₂=√(Σ_p Σ_i g_{p,i}²), a sum over every element of every parameter gradient. Every gradient is multiplied by the same factor min(1,c/(||g||₂+ε)); with norm 10 and threshold c=1, this factor is approximately 0.1.",
        "With Mixed Precision, scaled gradients must first be transformed back to their true magnitude before their norm is meaningful. Non-finite values such as NaN or infinity should be detected as a separate error, because multiplying them by a small factor does not turn them into valid gradients."
      ],
      "pitfalls": [
        "Clipping each parameter tensor separately: Different factors change the ratios between tensor gradients and therefore change the global search direction.",
        "Clipping before the Unscale step: This limits the artificially enlarged Mixed-Precision gradients instead of the actual gradients.",
        "Treating NaN as merely a large norm: Non-finite values remain invalid after scaling and should cause the step to be skipped or a diagnostic to be raised."
      ],
      "checks": [
        "Why does global norm clipping preserve the direction of the overall gradient?",
        "In what order should Unscale, Gradient Clipping, and the Optimizer Step occur with Mixed Precision?"
      ],
      "answers": [
        "Every component of every gradient is multiplied by the same positive scalar. This changes only the length of the combined gradient vector, not the ratios between its components and therefore not its direction.",
        "First, the gradients are transformed back from Loss Scaling, then checked for non-finite values and clipped using their true global norm. Only after that may the Optimizer update the parameters."
      ]
    },
    "training-loop": {
      "title": "Data Batches, Checkpoints & Reproducibility",
      "level": "Core",
      "summary": "A robust Training Loop connects data, model computation, gradients, updates, and complete state management into a reproducible process.",
      "mental": "Think of training as a pausable machine, not as a loop that merely changes weights. Its state includes not only the model, but also the Optimizer's memory, the current Learning-Rate phase, the position in the data, and the random states. A good Checkpoint freezes this machine so that, after loading, its next step would be semantically the same.",
      "details": [
        "One step loads inputs and targets shifted by one position, runs the Forward Pass, computes a scalar Loss, and starts the Backward Pass to obtain gradients. This is followed, when needed, by Unscale and Clipping, then the Optimizer Step and resetting the gradients; without the reset, gradients would accumulate across an unintended number of steps.",
        "A complete Checkpoint contains the model parameters, AdamW moments, Scheduler and step counter, and—when needed—the random states and the position or ordering of the data pipeline. Saving only model.state_dict is sufficient for inference, but it resets the adaptive moments and Learning-Rate phase when training resumes.",
        "Logging should record Loss and validation Loss together with the Learning Rate, processed tokens, tokens per second, peak memory, and runtime. Seeds for Python, NumPy, and the Framework help with debugging, but on a Graphics Processing Unit (GPU) they do not guarantee bit-for-bit repetition without deterministic Kernels, identical versions, and an identical data order."
      ],
      "pitfalls": [
        "Checkpointing only the model weights: Resumed training then has different Optimizer moments and a different Learning-Rate phase from the original run.",
        "Running validation with training behavior or gradients enabled: This wastes memory and can unintentionally affect stateful Layers or the training dataset.",
        "Measuring progress only in Batches: When Batch size or sequence length changes, Batches are not comparable; processed target tokens are the more stable unit."
      ],
      "checks": [
        "Which states must be saved so that training can continue as seamlessly as possible from a Checkpoint?",
        "Why is setting a single seed not enough for fully reproducible GPU training?"
      ],
      "answers": [
        "At minimum, save the model parameters, Optimizer state, Scheduler state, and global step. For the most faithful continuation, also save random states, the data position or Sampler state, the configuration, and relevant software versions.",
        "Randomness appears in initialization, data ordering, Sampling, and possible Dropout operations, often through several different generators. GPU Kernels may also use nondeterministic execution orders, so equal seeds do not necessarily produce equal bits unless the algorithms, versions, and input order are controlled as well."
      ]
    },
    "sampling": {
      "title": "Autoregressive Sampling",
      "level": "Core",
      "summary": "Autoregressive Sampling generates text by repeatedly forming a next-token distribution, selecting one token, and appending it to the context.",
      "mental": "The model does not write the entire answer in one step. It sees the context so far, assigns probabilities to exactly the next token, and makes a choice from that distribution. This choice changes the context and therefore every later distribution, which is why early randomness can have large downstream effects.",
      "details": [
        "For a Batch of sequences, the Forward Pass returns logits with shape B×T×V; Decoding needs only the final position, with shape B×V. After any allowed logit transformations, Softmax is applied, a token is drawn, and the process repeats until an End-of-Sequence token or a maximum length is reached.",
        "Temperature τ scales the logits as z/τ: values below one amplify differences, while values above one flatten the distribution. Top-p Sampling then keeps the smallest set of highest-probability tokens whose total mass is at least p and renormalizes only that set.",
        "A Key-Value Cache stores the already computed Key and Value states of earlier positions, so their corresponding Linear Layers—learnable linear mappings—do not need to run again. Greedy Decoding always chooses the locally most probable token, but it does not necessarily maximize the probability of the complete sequence because a second-best early choice may enable much better continuations later."
      ],
      "pitfalls": [
        "Substituting temperature zero into z/τ: The division is undefined; deterministic Decoding should be handled as a separate Greedy case.",
        "Forgetting stopping conditions: Without an End-of-Sequence token or a hard maximum length, generation can continue unnecessarily long.",
        "Recomputing the entire prefix at every step without a Cache: This runs the Linear Layers again for Key and Value states that are already known, wasting increasing amounts of compute as the context grows."
      ],
      "checks": [
        "How does a temperature below one change the next-token distribution, and why?",
        "Why does Greedy Decoding not guarantee the most probable complete sequence?"
      ],
      "answers": [
        "Dividing the logits by a number below one increases the gaps between them. Softmax responds exponentially to these gaps, so high logits receive more probability and low logits receive less, making the distribution sharper.",
        "Greedy Decoding optimizes only the conditional probability of the next token at each step. Sequence probability, however, is a product over all steps, and a locally somewhat less probable token may open up far more probable continuations later."
      ]
    },
    "pre-post-norm": {
      "title": "Pre-Norm vs. Post-Norm",
      "level": "Advanced",
      "summary": "Pre-Norm keeps the Residual path direct, whereas Post-Norm normalizes the sum of the Residual and the sublayer afterward.",
      "mental": "The Residual Stream is like a highway through the Transformer onto which every sublayer writes a correction. With Pre-Norm, this highway remains continuous and unchanged, while only the side road is normalized. With Post-Norm, the highway itself passes through a normalization after every addition, which can make the propagation of activations and gradients more sensitive in deep models.",
      "details": [
        "For activations x with shape B×T×D, Pre-Norm computes x'=x+F(Norm(x)), where F is an Attention or MLP transformation. Post-Norm instead uses x'=Norm(x+F(x)); in both cases, F(x) must have the same shape as x for the Residual addition to be defined.",
        "The direct identity path in Pre-Norm provides a contribution to the Backward Pass gradient that does not have to pass through the derivative of every intervening normalization. In very deep decoder Language Models, this typically makes optimization easier, reduces gradient spikes, and often permits less sensitive Learning Rates.",
        "Post-Norm is not inherently wrong and was used successfully in older Transformer architectures, but it often requires more careful Warmup or initialization. A Pre-Norm model usually still needs a final Norm after the last Block, before the Output Linear Layer maps the hidden state to vocabulary logits."
      ],
      "pitfalls": [
        "Adding Norm(x) rather than x as the Residual base in Pre-Norm: This removes exactly the unchanged identity path that defines the variant.",
        "Equating Post-Norm with an additional Norm outside the Residual branch: Modern double-Norm variants can contain extra Norms without implementing the classic Post-Norm equation.",
        "Omitting the final Norm in a Pre-Norm model: Activations with an uncontrolled final scale then feed directly into the Output Head."
      ],
      "checks": [
        "How do the Residual and gradient paths in x'=x+F(Norm(x)) differ from those in x'=Norm(x+F(x))?",
        "Why is there usually a final normalization at the end of a Pre-Norm Transformer?"
      ],
      "answers": [
        "With Pre-Norm, x is added unchanged to the output, allowing both the activation and part of the gradient to bypass every Block along an identity path. With Post-Norm, normalization follows the addition, so this main path passes through its transformation and derivative in every Block.",
        "Within the Blocks, only the side branches are normalized before processing; the continuing Residual Stream as a whole is not. The final Norm brings its last activation scale into a controlled range before vocabulary logits are computed from it."
      ]
    },
    "attention-variants": {
      "title": "MHA, MQA & GQA",
      "level": "Advanced",
      "summary": "Multi-Head Attention (MHA), Multi-Query Attention (MQA), and Grouped-Query Attention (GQA) differ in how many Query Heads have their own Key and Value Heads.",
      "mental": "Several searchers can each ask their own question; these are the Query Heads, parallel Attention subspaces. In Multi-Head Attention, every searcher also has a separate register of Keys and Values; in Multi-Query Attention, they all share one register. Grouped-Query Attention forms groups of searchers that share a register, creating a compromise between expressive power and inference cost.",
      "details": [
        "Multi-Head Attention (MHA) typically shapes Queries, Keys, and Values as B×H_q×T×d_head and sets H_kv=H_q. Each Attention Head is a parallel attention channel that computes its own compatibility scores across the T positions.",
        "Multi-Query Attention (MQA) uses H_kv=1, while Grouped-Query Attention (GQA) uses a smaller number 1<H_kv<H_q. With H_q=32 and H_kv=8, each group of four Query Heads shares the same Keys and Values; the mapping must be explicit in the shapes or broadcasting, and H_q must be divisible by H_kv.",
        "During autoregressive Decoding, the Key-Value Cache stores roughly two tensors per Layer with shape B×T×H_kv×d_head. Fewer Key-Value Heads therefore reduce Cache memory and bytes read almost proportionally, although MQA can cost some model quality; GQA often offers a favorable middle ground."
      ],
      "pitfalls": [
        "Confusing fewer Key-Value Heads with fewer Query Heads: MQA and GQA retain many Query Heads and share only Keys and Values.",
        "Considering only training FLOPs: The main benefit often appears during memory-bandwidth-bound Decoding because the Key-Value Cache is smaller.",
        "Combining arbitrary H_q and H_kv values: Without an integer group mapping, Query Heads cannot be assigned unambiguously to a Key-Value group."
      ],
      "checks": [
        "What is the Query-group size when H_q=32 and H_kv=8, and which tensors are shared within the group?",
        "Why does a smaller H_kv particularly accelerate autoregressive Decoding?"
      ],
      "answers": [
        "The group size is H_q/H_kv=4. Each of the four Query Heads uses its own slice of the Query parameters and Query activations; in code, these slices are usually computed together by a fused Linear Layer. Within the group, they share the same Key- and Value-Head activations.",
        "For each new token, the stored Keys and Values of all previous positions must be read. A smaller H_kv reduces exactly this Cache and its memory traffic, which often limits step-by-step Decoding more than raw compute performance does."
      ]
    },
    "moe": {
      "title": "MoE (Mixture of Experts)",
      "level": "Advanced",
      "summary": "A Mixture of Experts increases model capacity by activating only a few of many Feed-Forward experts for each token.",
      "mental": "Imagine a workshop with many specialists and a front desk. For each token, the front desk decides which small number of specialists should handle it instead of sending every token through every workshop. This lets the model contain a very large number of parameters even though only a small fraction of them performs computation for each token.",
      "details": [
        "A Mixture of Experts (MoE) usually replaces the dense Feed-Forward Network in a Transformer Block with E independent experts and a Router. For N tokens of width D, the Router produces scores of shape N×E, selects the top-k experts in each row, and combines their outputs using normalized routing weights.",
        "If k remains constant, increasing E raises the total parameter count, while the number of experts active per token—and therefore the dominant compute cost—grows very little. Total parameters thus describe stored capacity, whereas active parameters describe the portion actually used; the Router, dispatch, and combination still introduce additional costs.",
        "With Expert Parallelism, experts reside on different devices, so tokens are sent to their selected experts and then returned via All-to-All communication. Uneven routing overloads individual experts, which may require capacity limits, Load-Balancing objectives, or adaptive Router biases; a poor overflow strategy may drop tokens."
      ],
      "pitfalls": [
        "Equating total parameters with active parameters: A large MoE stores every expert, but computes only the selected k for a given token.",
        "Treating top-k routing as fully differentiable: The discrete selection does not provide an ordinary gradient to every rejected expert and is trained in practice with heuristic routing and balancing methods.",
        "Ignoring All-to-All communication: Across multiple devices, token dispatch and load imbalance can substantially reduce the theoretical compute advantage.",
        "Setting expert capacity without an overflow rule: With an uneven distribution, the system must specify whether tokens are rerouted, buffered, or dropped."
      ],
      "checks": [
        "Why can an MoE's total parameter count grow substantially without its active FLOPs per token growing by the same factor?",
        "Which two system properties make uneven routing problematic?"
      ],
      "answers": [
        "The Router activates only k of E experts for each token. If E grows while k and expert size remain constant, the model stores more parameters but still computes only k experts per token; only routing and communication costs are added.",
        "First, an overloaded expert can exceed its capacity, forcing tokens to wait, be rerouted, or be dropped. Second, an uneven distribution creates a straggler: other devices finish earlier and wait, while communication and runtime are determined by the most heavily loaded expert."
      ]
    },
    "gpu-model": {
      "title": "GPU Execution & Memory Model",
      "level": "Systems",
      "summary": "Graphics Processing Units (GPUs) achieve high throughput by running the same kind of work across many lightweight threads in parallel and deliberately moving data through a memory hierarchy.",
      "mental": "A Central Processing Unit (CPU), the conventional main processor, tries to finish a small number of tasks as quickly as possible one by one; a GPU distributes a very large number of similar tasks across many workers. These workers are organized into groups and can exchange small amounts of data quickly near the compute units. Good GPU programs therefore keep many workers busy and avoid unnecessary trips to large but more distant memory.",
      "details": [
        "A Grid consists of Thread Blocks, each Block is scheduled on a Streaming Multiprocessor (SM), and its Threads execute in Warps of typically 32 Threads. Under the Single Instruction, Multiple Threads (SIMT) model, a Warp executes the same instruction on different data; if Threads take different branches, the paths must partly be processed one after another.",
        "Each Thread has fast Registers, Threads in the same Block share a small and fast Shared Memory, and every Block can access the large High Bandwidth Memory (HBM). Register and Shared-Memory requirements limit how many Warps can be resident on an SM at the same time; enough resident Warps help hide memory latency by doing other work while one Warp waits.",
        "Neighboring Threads should read neighboring addresses so their accesses can be combined into a small number of wide memory transactions; this is called Memory Coalescing. In vector addition, Thread i can process element i exactly, whereas poorly scattered indices generate more HBM transactions and run more slowly despite performing the same number of additions."
      ],
      "pitfalls": [
        "Applying CPU latency intuition directly: A single GPU Thread is not especially fast; performance comes from the high aggregate throughput of many Threads.",
        "Treating Warp Divergence as truly parallel execution of both branches: Within a Warp, different paths are typically masked and executed one after another.",
        "Treating every memory type as equally expensive: Registers and Shared Memory are scarce and nearby, while repeated HBM accesses often form the bottleneck.",
        "Using maximum Occupancy as the only objective: More active Warps help only if Register pressure, data reuse, and the instruction mix do not become worse as a result."
      ],
      "checks": [
        "Why can a data-dependent branch within a Warp increase runtime?",
        "When is it worthwhile to load data from HBM into Shared Memory?"
      ],
      "answers": [
        "A Warp issues instructions to its Threads together. If some Threads need one branch and others need the second, the hardware will often execute one path with some Threads masked and then the other, so fewer compute units perform useful work at the same time.",
        "Shared Memory is worthwhile when multiple Threads in the same Block reuse the same or neighboring data. A one-time HBM read can then be replaced by many fast local accesses; if the data is used only once, the additional load may instead be pure overhead."
      ]
    },
    "roofline": {
      "title": "Arithmetic Intensity & Roofline",
      "level": "Systems",
      "summary": "The Roofline model combines compute performance, memory bandwidth, and data reuse into an upper performance bound for a Kernel.",
      "mental": "A compute factory can work only as fast as either its machines can calculate or its warehouse can deliver material. If every loaded value is used only once, the factory is more likely to wait for deliveries. If the same value is reused for many operations, the bottleneck shifts toward the compute units.",
      "details": [
        "Arithmetic Intensity (AI) is the number of floating-point operations performed per byte transferred from the memory level being considered. The Roofline model estimates the attainable rate as min(P_peak, BW×AI), where P_peak is the maximum compute rate in FLOP/s and BW is the memory bandwidth in bytes/s.",
        "At the Ridge Point AI*=P_peak/BW, the two limits meet. To the left, a Kernel is memory-bound because additional compute units provide little benefit; to the right, it is compute-bound because even sufficient data delivery cannot exceed the maximum compute rate.",
        "Element-wise operations often read and write several bytes for very few operations, whereas a well-tiled matrix multiplication reuses loaded values many times. Lower precision, Kernel Fusion, or Tiling can increase effective intensity, but the Roofline ceiling remains only an upper bound and does not fully account for factors such as launch overhead, Divergence, or poor utilization."
      ],
      "pitfalls": [
        "Swapping bytes and FLOPs: Arithmetic Intensity is FLOPs per byte; its reciprocal answers a different question.",
        "Mixing Peak values from different data types: A BF16 Tensor-Core Peak and an FP32 measurement do not produce a consistent Roofline model.",
        "Counting every Cache hit as an HBM access, or vice versa: Intensity depends on the memory boundary at which traffic is measured.",
        "Reading the ceiling as guaranteed performance: It states what is possible at most, not whether a specific Kernel reaches that limit."
      ],
      "checks": [
        "How do you use Arithmetic Intensity, Peak compute rate, and bandwidth to decide whether a Kernel is memory-bound?",
        "Why can Kernel Fusion improve a sequence of element-wise operations in the Roofline model?"
      ],
      "answers": [
        "Compute BW×AI and compare it with P_peak. If BW×AI is smaller, data delivery limits performance and the Kernel is memory-bound; if P_peak is smaller, the fundamental limit is on the compute side.",
        "Fusion can keep intermediate values in Registers or Shared Memory instead of writing them to HBM after each partial operation and reading them again. The number of useful operations remains similar, but fewer bytes are transferred, increasing Arithmetic Intensity and the bandwidth-limited performance ceiling."
      ]
    },
    "profiling": {
      "title": "Benchmarking & Profiling",
      "level": "Systems",
      "summary": "Benchmarking measures end-to-end runtime, while Profiling reveals which operations, Kernels, and memory events cause that runtime.",
      "mental": "A stopwatch tells you whether the entire journey became faster; a route log shows the intersection where you are waiting. Start with a reliable overall measurement, then open the Profiler to find the cause, and verify every optimization again with the same overall measurement. Otherwise, it is easy to optimize a conspicuous but unimportant section.",
      "details": [
        "A fair GPU Benchmark uses Warmup runs for compilation and Caches, measures multiple repetitions, and reports at least the mean and variability. Because CUDA calls are asynchronous with respect to the CPU, the program must synchronize before the start and after the measured work, or use correctly placed GPU Events.",
        "A Profiler places CPU calls, GPU Kernels, communication, and memory allocations on a Timeline and therefore shows where time or memory is spent. Profiling itself introduces overhead and can change Scheduling, so its duration measurements should not be treated as production latency without verification.",
        "Comparisons must use identical shapes, data types, devices, synchronization boundaries, and operating conditions. A faster isolated Softmax Kernel improves a Training Step noticeably only if Softmax previously accounted for a meaningful share of end-to-end time; otherwise, Amdahl's Law limits the overall effect."
      ],
      "pitfalls": [
        "Measuring the first cold run: Compilation, memory initialization, and empty Caches often make it unrepresentative of steady-state operation.",
        "Timing only the CPU call that launches a CUDA Kernel: This primarily measures enqueueing the work, not executing it on the GPU.",
        "Reporting a single run without variability: Background load and Scheduling can create an apparent improvement that disappears across repetitions.",
        "Reading Profiler percentages directly as unchanged runtime: Instrumentation can slow down the observed execution or change its clocking and Scheduling."
      ],
      "checks": [
        "Why is synchronization or a correctly placed GPU Event necessary for CUDA Benchmarking?",
        "When does a Profiler provide more insight than a pure end-to-end Timer?"
      ],
      "answers": [
        "CUDA work is usually only placed into a queue, and the CPU call returns before the GPU has finished. An appropriate synchronization boundary ensures that the measured interval includes actual execution rather than only Dispatch.",
        "A Profiler is needed when the total time is known but its cause is not. Its Timeline can reveal whether matrix multiplications, many small Kernels, data loading, memory allocations, or communication dominate, and whether computation and communication overlap."
      ]
    },
    "fusion-tiling": {
      "title": "Kernel Fusion & Tiling",
      "level": "Systems",
      "summary": "Kernel Fusion reduces intermediate traffic to HBM, while Tiling increases data reuse in fast on-chip memory.",
      "mental": "Think of HBM as a distant warehouse and a Streaming Multiprocessor as a workbench. Fusion performs several consecutive processing steps before sending an intermediate product back to the warehouse. Tiling places a suitably small batch of material on the workbench and reuses it there before fetching the next batch.",
      "details": [
        "Without Fusion, a chain of element-wise operations may launch a separate Kernel for every step, write an intermediate tensor to HBM, and immediately read it again. A fused Kernel keeps such values in Registers or Shared Memory and writes only the final result, reducing both launch overhead and memory traffic.",
        "For C=A@B, with A of shape M×K and B of shape K×N, a Block loads small Tiles from both matrices into Shared Memory using coalesced accesses. Many Threads reuse each loaded A and B element for several multiply-adds, accumulate partial sums in Registers, and work through the K axis one Tile at a time.",
        "Tile sizes simultaneously determine reuse, the number of Blocks, Register requirements, and Shared-Memory use. Tiles that are too large can leave fewer Blocks resident and reduce Occupancy; boundary Tiles require masks or Padding when M, N, or K is not exactly divisible by the Tile size."
      ],
      "pitfalls": [
        "Assuming that more Fusion is always better: Very large fused Kernels can increase Register pressure, compilation time, or Recomputation and become slower.",
        "Deriving a Tile size only from matrix dimensions: Hardware limits, memory alignment, and the number of Blocks that can be resident simultaneously all influence the best choice.",
        "Treating boundary Tiles like full Tiles: Unchecked Loads and Stores outside valid indices produce incorrect results or memory errors.",
        "Loading data into Shared Memory but using it only once: The Kernel pays additional copy and synchronization costs without gaining any reuse."
      ],
      "checks": [
        "Which HBM transfers can Fusion eliminate in a chain of several element-wise operations?",
        "Why can a larger Tile size be slower despite greater data reuse?"
      ],
      "answers": [
        "Intermediate results no longer need to be written to HBM after each operation and read back before the next one. Ideally, the fused Kernel reads its inputs once, keeps intermediate results on-chip, and writes only the final tensor.",
        "Larger Tiles require more Registers and Shared Memory per Block. As a result, fewer Blocks or Warps may fit on a Streaming Multiprocessor at once, latency is hidden less effectively, and boundary or alignment problems may outweigh the benefit of additional reuse."
      ]
    },
    "flash-attention": {
      "title": "FlashAttention as an IO-Aware Algorithm",
      "level": "Systems",
      "summary": "FlashAttention computes exact Attention block by block and avoids storing the quadratic Attention matrix in HBM.",
      "mental": "Standard Attention first writes a huge table containing every Query-Key pair and later reads it back. FlashAttention considers only small sections of that table at a time and maintains a running, numerically stable state for each Query row. The table is therefore computed implicitly but never exists as a complete tensor in large memory.",
      "details": [
        "Vanilla Attention computes S=QKᵀ/√d, P=softmax(S), and O=PV. For Q, K, and V with shapes B×H×T×d, P has shape B×H×T×T, so it grows quadratically with T and causes large volumes of HBM reads and writes in both the Forward and Backward Pass.",
        "FlashAttention loads Query, Key, and Value Tiles into fast on-chip memory and updates a running maximum, a normalization sum, and the weighted output for every Query row. When a new Block contains a larger maximum, the previous sums are rescaled accordingly; this Online Softmax is algebraically identical to Softmax over the complete row and is therefore not an approximation.",
        "The asymptotic compute remains approximately O(T²d), but HBM I/O and the peak of stored activations fall sharply because S and P are never fully materialized. During the Backward Pass, the required scores are recomputed from Q, K, and stored row statistics; causal implementations must also mask invalid future positions correctly within diagonal boundary Tiles."
      ],
      "pitfalls": [
        "Describing FlashAttention as sparse or approximate Attention: With the same mask, it computes the same mathematical output as dense Attention, only in a different order.",
        "Adding block-wise Softmax values without rescaling: Different Block maxima make the partial sums numerically and algebraically incompatible.",
        "Confusing less HBM I/O with fewer quadratic FLOPs: The number of Query-Key dot products remains quadratic in T for dense Attention.",
        "Allowing or rejecting complete causal boundary Blocks: On the diagonal, a Tile often contains both allowed and future positions and therefore needs an element-wise mask."
      ],
      "checks": [
        "Which large tensor does FlashAttention avoid materializing in HBM, and what shape would it have in Vanilla Attention?",
        "Why does Online Softmax produce exactly the same normalized output despite processing the row block by block?"
      ],
      "answers": [
        "The complete score or probability matrix S or P is not stored. With Batch B, H Heads, and sequence length T, it would have shape B×H×T×T and would therefore be especially large for long contexts.",
        "For every row, the algorithm maintains a running maximum and an exponential sum scaled relative to that maximum. If a new maximum appears, it rescales the previous contributions to the same reference; after the final Tile, the maximum, denominator, and weighted sum exactly match a computation over the complete row."
      ]
    },
    "checkpointing": {
      "title": "Activation Checkpointing",
      "level": "Systems",
      "summary": "Activation Checkpointing saves training memory by retaining selected activations and recomputing the others during the Backward Pass.",
      "mental": "Normally, the Forward Pass stores many intermediate results for the return journey. With Activation Checkpointing, it keeps only landmarks and reconstructs the section between two landmarks when the Backward Pass reaches it. You therefore pay additional compute time to keep fewer activations in memory at once.",
      "details": [
        "The Forward Pass through a checkpointed region stores its inputs or boundaries but suppresses many internal Saved Tensors. During the Backward Pass, the region is run forward again from those boundaries; this time the required intermediate values are materialized briefly and consumed immediately for gradient computation.",
        "Checkpointing reduces activation memory, not the memory used by parameters, gradients, or AdamW moments. The actual Peak consists of all Checkpoints retained for the long term plus the temporary activations of the region currently being reconstructed; the number and size of regions determine the trade-off.",
        "Random operations such as Dropout must use the same random state during Recomputation, or the Backward Pass describes a different function from the original Forward Pass. Activation Checkpointing must also not be confused with a training Checkpoint stored on disk, which makes a run resumable after a failure."
      ],
      "pitfalls": [
        "Treating Checkpointing as a free memory saving: The discarded Forward region must be computed again, increasing Step time.",
        "Assuming that an arbitrarily large region is optimal: A few large regions save boundary tensors but create a high temporary activation Peak during reconstruction.",
        "Changing random states during Recomputation: Different Dropout masks mean that the Forward value and the computed gradient no longer correspond.",
        "Counting parameter or Optimizer memory as saved: Activation Checkpointing leaves these states unchanged."
      ],
      "checks": [
        "Which class of memory does Activation Checkpointing reduce, and which three important classes does it not reduce?",
        "Why must the random state remain consistent when rerunning the Forward computation of a checkpointed region?"
      ],
      "answers": [
        "It reduces the activations and intermediate tensors stored for the Backward Pass. Model parameters, their gradients, and Optimizer state such as AdamW moments are not sharded or reduced by it.",
        "The Backward Pass should compute the derivative of exactly the function evaluated in the original Forward Pass. If a repeated Dropout operation creates a different mask, it reconstructs a different Computation Graph and the resulting gradient no longer belongs to the original output."
      ]
    },
    "collectives": {
      "title": "Collective Communication",
      "level": "Systems",
      "summary": "Collectives are coordinated communication patterns through which every Rank in a distributed group distributes, gathers, or reduces tensors.",
      "mental": "A Rank is one participating process with its own Graphics Processing Unit (GPU), and the World Size is the total number of participants. A Collective is a shared choreography: every Rank must enter the same operation in a compatible order. The pattern specifies which data each Rank owns afterward; the concrete network algorithm determines the time and bytes transferred.",
      "details": [
        "Broadcast copies a tensor from one source Rank to every Rank, while All-Gather concatenates the different Shards from all Ranks on every Rank. Reduce-Scatter performs an element-wise reduction over all inputs and leaves each Rank with only one result Shard, whereas All-Reduce gives the complete reduced result to every Rank.",
        "An All-Reduce can be understood as Reduce-Scatter followed by All-Gather. For a tensor of M bytes and W Ranks, a bandwidth-efficient Ring moves approximately 2(W−1)M/W bytes per Rank; the training algorithm must explicitly specify whether it needs the sum or the mean afterward.",
        "Many small Collectives are often dominated by startup latency, while a few large ones are more often dominated by bandwidth; Gradient Buckets balance these costs against early overlap with the Backward Pass. If Ranks call Collectives in different orders or with incompatible shapes, they may wait for different partners and enter a Deadlock."
      ],
      "pitfalls": [
        "Automatically interpreting All-Reduce as a mean: Many libraries sum by default, and dividing by the World Size is a separate semantic step.",
        "Confusing communication volume per Rank with total Cluster volume: The two quantities answer different capacity questions.",
        "Reducing many tiny gradients individually: Every call pays latency and can be much more expensive than a small number of suitable Buckets.",
        "Varying Collective order across Ranks: A single divergent branch can leave processes permanently waiting for different operations."
      ],
      "checks": [
        "What does each Rank own after Reduce-Scatter, and what does it own additionally after the following All-Gather?",
        "Why can many small All-Reduce calls be slow despite transferring few bytes in total?"
      ],
      "answers": [
        "After Reduce-Scatter, each Rank owns a different Shard of the tensor reduced across all Ranks. All-Gather then exchanges these Shards so that every Rank owns the complete reduced result; together, the two steps are equivalent to All-Reduce.",
        "Every call has fixed costs for coordination, Kernel launch, and network latency that a small message cannot amortize through a long transfer. Bucketing creates larger messages, but it must be balanced against the opportunity to overlap gradients that are ready early with the remainder of the Backward computation."
      ]
    },
    "ddp-zero-fsdp": {
      "title": "DDP, ZeRO & FSDP",
      "level": "Systems",
      "summary": "DDP replicates the training state, while ZeRO and FSDP increasingly shard Optimizer state, gradients, and parameters across Ranks.",
      "mental": "With Distributed Data Parallel, every workshop owns the same complete machine but processes a different portion of the Batch, then synchronizes its gradients. ZeRO first distributes the machine's heavy spare-parts stores and later distributes additional components across workshops. Fully Sharded Data Parallel goes as far as distributing parameters and temporarily reassembles only the Layer currently needed.",
      "details": [
        "Distributed Data Parallel (DDP) replicates the model, gradients, and Optimizer state on every Rank but splits the global Batch along B. Each Rank computes local gradients; an All-Reduce forms their global sum or mean so that identical parameters remain synchronized after the Optimizer Step.",
        "Zero Redundancy Optimizer (ZeRO) Stage 1 shards the Optimizer state, Stage 2 additionally shards the gradients, and Stage 3 additionally shards the parameters. Fully Sharded Data Parallel (FSDP) conceptually corresponds to Stage 3: before computing a Layer, it temporarily reconstructs the full Layer parameters from their Parameter Shards through All-Gather and releases them afterward; during the Backward Pass, Reduce-Scatter leaves each Rank with only its Gradient Shard.",
        "Sharding lowers persistent memory per Rank but introduces additional Collectives and short-lived Peaks during All-Gather. Prefetching and Buckets can overlap communication with the Forward or Backward Pass when dependencies and the network allow it; FSDP alone, however, does not automatically shard activations along the sequence or feature axis."
      ],
      "pitfalls": [
        "Computing the FSDP Peak from persistent Shards alone: During an All-Gather, at least the parameter Block currently needed is temporarily present in full.",
        "Equating local and global Batch size: With W Ranks and local Batch B_local, the global Batch is typically W×B_local, in addition to any Gradient Accumulation.",
        "Misassigning ZeRO Stages: Stage 1 covers Optimizer state, Stage 2 adds gradients, and only Stage 3 or FSDP also shards parameters.",
        "Treating linear Sharding as automatically producing linear Speedup: As Rank count grows, compute per Rank falls while latency, bandwidth, and temporary communication matter more."
      ],
      "checks": [
        "Which states are additionally sharded at ZeRO Stage 1, Stage 2, and Stage 3?",
        "Which Collectives does a simplified FSDP Layer need in the Forward and Backward Pass, and why?"
      ],
      "answers": [
        "Stage 1 shards Optimizer states such as the AdamW moments. Stage 2 additionally shards gradients, and Stage 3 also shards the model parameters; FSDP implements this complete Sharding one Block at a time.",
        "Before computation, a Rank needs the complete parameters of the current Layer and reconstructs them from the Shards using All-Gather. During the Backward Pass, local partial gradients are reduced and distributed by Reduce-Scatter so that each Rank retains only the complete Gradient Shard corresponding to its Parameter Shard."
      ]
    },
    "model-parallelism": {
      "title": "Tensor, Pipeline & Sequence Parallelism",
      "level": "Systems",
      "summary": "Tensor, Pipeline, and Sequence Parallelism split a model along different axes and therefore create different communication and utilization costs.",
      "mental": "A model that is too large can be divided by width, depth, or token positions. Tensor Parallelism partitions the work within a Layer, Pipeline Parallelism distributes consecutive Layers, and Sequence Parallelism distributes suitable activations along the sequence. The best choice depends on which state does not fit and which devices can communicate especially quickly with one another.",
      "details": [
        "Tensor Parallelism shards weight matrices along their input or output dimension. For X of shape N×D and W of shape D×D_ff, Column Parallelism produces an Output Shard N×(D_ff/W_tp) on each Rank, while Row Parallelism computes partial Outputs N×D_ff that are typically summed by All-Reduce; frequent per-Layer Collectives require fast connections within a Node.",
        "Pipeline Parallelism assigns consecutive Layers to different Stages and sends activations and their gradients between neighbors. Without Microbatches, only one Stage works at a time while the others wait; several Microbatches fill the Pipeline, but a Bubble of approximately W_pp−1 Stage times remains and becomes proportionally smaller as more Microbatches run in sequence.",
        "Sequence Parallelism shards position-wise activations of shape B×T×D along T, for example for normalization or Dropout, and uses All-Gather or Reduce-Scatter at transitions. In multidimensional setups, the product of the Data, Tensor, Pipeline, and other Parallelism degrees must equal the World Size; the mapping should place frequent Tensor Collectives on fast links and the less frequent Pipeline communication on comparatively slower links."
      ],
      "pitfalls": [
        "Treating Tensor Parallelism as communication-free: Shards of a matrix multiplication must be combined at defined points through All-Reduce or All-Gather.",
        "Ignoring Pipeline Bubbles: Too few Microbatches leave Stages waiting and destroy the expected Speedup.",
        "Equating Sequence Parallelism with Context Parallelism: Sequence Parallelism primarily shards position-wise activations, whereas Context Parallelism also distributes Attention over long contexts.",
        "Choosing Parallelism degrees whose product does not equal the World Size: The intended device arrangement is then incomplete or uses Ranks more than once."
      ],
      "checks": [
        "What shapes result under Column Parallelism for X∈R^{N×D} and W∈R^{D×D_ff} when W_tp Ranks split the output dimension?",
        "What creates a Pipeline Bubble, and how do Microbatches reduce its relative share?"
      ],
      "answers": [
        "Each Rank holds a Weight Shard with shape D×(D_ff/W_tp). Because every Rank uses the full X with shape N×D, it computes an Activation Shard N×(D_ff/W_tp); depending on the next operation, the Shards can remain separate or be combined through All-Gather.",
        "At the start and end of the Pipeline, not every Stage is occupied with a Microbatch yet, and in a simple sequential execution downstream Stages initially wait for data. More Microbatches keep the Pipeline in its filled steady state for longer, spreading the fixed fill and drain time across more useful work even though it does not disappear completely."
      ]
    },
    "power-laws": {
      "title": "Empirical Power Laws",
      "level": "Scaling",
      "summary": "Empirical Power Laws describe how a Language Model's Loss decreases predictably—but with diminishing returns—as parameters, data, or compute increase within an observed range.",
      "mental": "If you plot model size and Loss on logarithmic axes, a Power Law looks approximately like a straight line. Across the measured range, doubling model size then produces a similar relative—not absolute—improvement. The line is a useful trend, not a law of nature: its deviations and range of validity are part of the claim.",
      "details": [
        "A common model is L(N,D) ≈ E + A·N^(-α) + B·D^(-β): N is the number of model parameters, D is the number of training tokens, and E is a residual Loss on the data distribution under study that does not disappear through scaling alone. The positive exponents α and β indicate how quickly the parameter- and data-related terms fall. All constants are estimated from controlled training runs and are not universal architectural constants.",
        "If only one power term is relevant and the offset is handled correctly, then, for example, log(L−E) = log(A) − α·log(N). The slope in a Log-Log plot therefore reveals the exponent. In the complete additive formula, however, E or the other scaling term may dominate and bend the curve; fitting a naive straight line through raw logarithmic values is then misleading.",
        "Scaling Laws can help plan a larger run from smaller experiments or reveal whether model capacity or data is currently limiting. If B·D^(-β) dominates, for example, a larger model provides little benefit with the same dataset, whereas more suitable data may help. Before an expensive extrapolation, inspect prediction error on held-out runs, residuals, and any changes to the data, architecture, and training recipe."
      ],
      "pitfalls": [
        "A straight line through a few Log-Log points does not prove a permanent Power Law; outside the measured range, other bottlenecks or a different exponent may dominate.",
        "A high coefficient of determination alone is insufficient because systematic residuals or a poorly estimated offset E can produce bad extrapolations despite an apparently good fit.",
        "Failed or poorly tuned training runs are not merely random measurement noise; including them without review fits optimization failures rather than clean scaling behavior."
      ],
      "checks": [
        "What does the magnitude of the slope of a line in a Log-Log plot of Loss against model size mean?",
        "Why can the additive residual term E bend an apparently straight line in a Log-Log plot?"
      ],
      "answers": [
        "When L−E ∝ N^(−α), the slope is −α. It describes how strongly the remaining scalable Loss falls in relative terms when N increases by a fixed factor; a larger magnitude means faster improvement from additional parameters.",
        "As N grows, A·N^(−α) shrinks while E remains constant. Once E makes up a large share of total Loss, log(E + A·N^(−α)) is no longer linear in log(N), even though the variable term itself follows a Power Law."
      ]
    },
    "isoflops": {
      "title": "IsoFLOPs & Compute Optimum",
      "level": "Scaling",
      "summary": "An IsoFLOPs analysis searches, at fixed training compute, for the combination of model size and data volume that produces the lowest Loss.",
      "mental": "Imagine a fixed learning budget: a small model can see many examples but has little capacity; an enormous model can see only a few tokens under the same budget and remains undertrained. For every budget, there is a favorable point between these extremes. Repeating the search at several budgets reveals how the optimum moves as compute grows.",
      "details": [
        "For a dense decoder, training cost in Floating-Point Operations (FLOPs) is often approximated as C ≈ 6·N·D, where N denotes non-Embedding parameters and D denotes training tokens. At fixed C, D ≈ C/(6N): each model size tested is therefore assigned a matching token count. The factor 6 is a Napkin-Math approximation for the Forward and Backward Pass, not an exact hardware measurement.",
        "Plotting the final Loss of the runs against log(N) typically produces a U-shaped IsoFLOPs profile. On the left, limited model capacity is the constraint; on the right, the large model receives too few tokens or Optimizer Steps to realize its potential. Establishing the minimum credibly requires measurements on both sides and, for every point, a fairly tuned run trained all the way to its assigned budget.",
        "Several budgets produce pairs such as (C,N_opt) and (C,D_opt), to which power trends N_opt ∝ C^a and D_opt ∝ C^b can be fitted. Under the exact relationship C ∝ ND, the exponents should sum to approximately one. A real decision must additionally consider inference cost, memory limits, data quality, and Hyperparameters because the Compute Optimum optimizes only the defined training-Loss objective."
      ],
      "pitfalls": [
        "Testing only small or only large models reveals just one side of the U-shaped profile and can make a boundary measurement look like the optimum.",
        "Compute must be counted consistently across all runs; mixing theoretical FLOPs, wall-clock time, and differently efficient hardware utilization makes the profiles incomparable.",
        "Checkpoints from a single long run are not automatically independent, compute-optimally trained models of other sizes; architecture, Learning Rate, and the full optimization trajectory differ."
      ],
      "checks": [
        "In the usual approximation, how do you determine the token count D for a given budget C and chosen model size N?",
        "Why are several compute budgets needed instead of measuring only the minimum of one IsoFLOPs profile?"
      ],
      "answers": [
        "C ≈ 6ND implies D ≈ C/(6N). If you double N while keeping C unchanged, this approximation allows only half as many training tokens.",
        "One profile provides N_opt and D_opt only for that specific budget. Minima across several budgets are needed to reveal how both optimal quantities scale with C, so a trend can be extrapolated to a larger target budget and its stability can be checked."
      ]
    },
    "scaling-practice": {
      "title": "Scaling in Practice & μP",
      "level": "Scaling",
      "summary": "Maximum Update Parametrization and controlled Learning-Rate Schedules aim to transfer small scaling experiments to wider models without treating Hyperparameter transfer as a guarantee.",
      "mental": "When a Layer becomes wider, more contributions are added; the same initialization and Learning Rate can therefore produce a different activation and update scale. Maximum Update Parametrization (μP) defines small and large models as one consistent family in which these scales remain controlled. Warmup-Stable-Decay (WSD) is a separate tool: it separates a long, stable training phase from a deliberate finish with a decreasing Learning Rate.",
      "details": [
        "μP chooses initialization variances and Learning-Rate scalings based on the width and role of a matrix, such as an input, hidden, or output Layer. The goal is for individual activations at initialization, and their change after an update, to remain on the order of O(1) as width increases. μP is therefore a coherent parametrization system, not one global Learning-Rate multiplier.",
        "Within a consistent μP family, selected Hyperparameters can be tuned on a less expensive Proxy Model and transferred to a wider model. This requires the same parameter roles, suitable base widths, the same Optimizer, and correctly implemented scaling rules. The lecture results also warn that learnable Root Mean Square Normalization (RMSNorm) Gains, strong Weight Decay, or different Optimizers can disrupt transfer, and that the simple theory primarily addresses width scaling.",
        "A WSD Schedule raises the Learning Rate during Warmup, keeps it approximately constant during a Stable phase, and lowers it only during the Decay phase. A Checkpoint from the Stable phase can serve as a shared starting point for finishing phases of different lengths, making Scaling experiments less expensive. WSD does not, however, replace μP or fair comparison rules: compute, token count, and Decay-phase length must still be reported unambiguously."
      ],
      "pitfalls": [
        "If standard parametrization and μP rules are mixed for only selected matrices, the model belongs to no consistent family and successful Hyperparameter transfer should not be expected.",
        "A Learning Rate that remains stable across width must not be transferred without testing to greater depth, a different architecture, a different Optimizer, or strong regularization.",
        "WSD is not automatically better than every Cosine Schedule; its value depends on the comparison objective, and a Checkpoint before Decay is not equivalent to fully completed training."
      ],
      "checks": [
        "What concrete problem does μP try to solve when a network is made wider?",
        "Why can individual μP rules not be combined arbitrarily with a standard parametrization?"
      ],
      "answers": [
        "μP aims to prevent activations or the functional changes caused by an Optimizer Step from vanishing or exploding merely because width increased. This allows selected Hyperparameters tuned on a small model to have similar effects across widths.",
        "The scaling of one matrix influences the size of signals in subsequent Layers. Only the coordinated combination of initialization, Learning Rates, and parameter roles preserves the intended orders of magnitude; an isolated rule can break that balance elsewhere."
      ]
    },
    "data-pipeline": {
      "title": "Web Data Pipeline",
      "level": "Data",
      "summary": "A Web Data Pipeline turns raw Web archives into a reproducible training corpus through traceable conversion, filtering, Deduplication, mixing, and Tokenization.",
      "mental": "Think of the Pipeline as a refinery: every stage removes contaminants, but it can also discard valuable material and changes what the later model considers normal. A removed page cannot be diagnosed afterward if only the cleaned text was saved. Scores, decision reasons, and samples therefore belong to the Pipeline just as much as the final corpus does.",
      "details": [
        "The process begins with Web archives containing server responses and Hypertext Markup Language (HTML), from which visible main text must be extracted with the correct character encoding. Menus, Footers, and Scripts should disappear while article text remains, yet even established Extractors make different decisions. Errors here affect every later filter, which makes a reference to the raw source, the Extractor version, and manual before-and-after samples important.",
        "Order affects both runtime and results: inexpensive, coarse checks can reduce the data early, while expensive Classifiers run only on the remainder. Text normalization must be consistent before the corresponding Hashing or Deduplication stages, and overlap with validation data requires a separate check. For each document, log at least a stable identifier, source, language and quality scores, triggered rules, versions, and the resulting Keep, Mask, or Drop decision.",
        "After filtering and Deduplication, sources are mixed in deliberately chosen proportions and only then tokenized with document boundaries. A Pipeline that removes 30 percent of documents need not remove 30 percent of tokens because page lengths vary greatly. Retention rates should therefore be measured by documents, bytes, and tokens, as well as by language and domain, and their effects should be examined with manual samples and separate validation."
      ],
      "pitfalls": [
        "Reporting only the overall retention rate hides which filter disproportionately removed particular languages, domains, or long documents.",
        "Treating filters as interchangeable is incorrect: a poor HTML Extractor can trigger quality rules, for example, while changing normalization after Hashing can miss duplicates.",
        "Using validation examples for selection or leaving them verbatim in the training corpus creates contamination; a good validation Loss then partly measures memorization rather than generalization."
      ],
      "checks": [
        "What audit information would you store per document so that a later incorrect decision remains traceable?",
        "Why is filter order relevant both to cost and to the data distribution?"
      ],
      "answers": [
        "Useful fields include a stable document identifier, source or URL Hash, Extractor and Pipeline version, relevant intermediate statistics, scores, triggered rules, and the exact reason for the decision. For sensitive content, the audit trail should not repeat unmasked secrets; it should use safe references and aggregated signals instead.",
        "Early, inexpensive filters reduce the amount of data that costly models must process. The order also matters semantically because one step changes the text measured by the next, so the same individual rules can retain different documents when applied in a different order."
      ]
    },
    "quality-filtering": {
      "title": "Rules & Quality Classifiers",
      "level": "Data",
      "summary": "Transparent quality rules remove obvious Web junk, while a learned Quality Classifier scores documents by how closely they resemble the chosen positive examples.",
      "mental": "Rules are a coarse sieve: they can detect extremely short pages or unusually many symbols, for example, but they do not understand the content. A Classifier is a learned system of taste whose idea of quality comes from its positive and negative training data. The threshold determines whether you would rather retain more questionable data or lose more useful edge cases.",
      "details": [
        "Gopher-like rules inspect measurable properties such as document length, mean word length, the share of alphabetic words, or a large number of lines containing ellipses. They are fast, reproducible, and easy to trace back to a specific incorrect decision. They can nevertheless allow semantic nonsense through, while code, tables, lists, or other legitimate formats may fail incorrectly because of unusual statistics.",
        "To train a Quality Classifier, documents linked from trusted sites can serve as positive examples and random crawl pages as negative examples, for instance. A model such as fastText produces a score; a high Keep threshold usually raises the Precision of the retained set but lowers its Recall. The score expresses similarity to the operationalized training objective—it is neither objective quality nor automatically a calibrated probability.",
        "Thresholds should be studied on manually annotated samples and separately by language, source, and document type. A filter trained with an English encyclopedia as its only positive source may systematically undervalue good minority-language content or informal specialist forums, for example. Alongside Precision and Recall, you should therefore monitor data volume, subgroup errors, and the effect on an independent Language Model validation."
      ],
      "pitfalls": [
        "A high Classifier score is not a seal of truth; it mainly shows that a document matches the preferences and biases of the labeled reference data.",
        "One global threshold can overfilter domains with different text statistics even when the aggregate metric looks good.",
        "Using the same validation examples to train the model, select the threshold, and report filter quality underestimates the error on new Web data."
      ],
      "checks": [
        "How does a higher Keep threshold typically affect Precision, Recall, and data volume?",
        "How would you test whether a Quality Classifier disadvantages a particular language or domain?"
      ],
      "answers": [
        "A higher threshold retains fewer documents. Under normal conditions, Precision in the retained set rises while Recall and data volume fall; the exact curve must still be measured.",
        "I would manually evaluate an independent sample stratified by language or domain and report error rates and score distributions separately. I would also investigate how alternative thresholds or more balanced reference data change the retained token volume and domain-specific validation."
      ]
    },
    "pii-harm": {
      "title": "PII, Harmful Content & Governance",
      "level": "Data",
      "summary": "Handling personal and harmful content is a documented risk process involving detection, masking or removal, subgroup review, and deliberate Governance—not a perfect binary filter.",
      "mental": "A detector works more like a smoke alarm than an all-knowing judge: it can miss hazards and sound an alarm for harmless steam. Different risks therefore call for different actions, such as masking an email address, quarantining a document, or reviewing a borderline case. The chosen Policy helps determine which content and perspectives the model will later know.",
      "details": [
        "Personally Identifiable Information (PII) includes information through which people can be contacted or identified. Structured patterns such as email addresses or Internet Protocol Version 4 (IPv4) addresses can partly be detected with regular expressions and replaced with placeholders; even telephone numbers have many country-specific forms. Names, addresses, or identity inferred from a combination of individually innocuous details depend on context and require stronger models, source controls, or more restrictive measures.",
        "Classifiers for toxic or adult content learn a specific Label definition from annotated data and output a score under that definition. A threshold turns this score into Keep, Review, or Drop, while False Positives may affect legitimate medical or historical material or language used by minority groups. False Negatives remain relevant as well, so a filtered corpus does not automatically guarantee a safe model.",
        "Robust Governance records the version, purpose, thresholds, reason, and number of interventions without copying unmasked Secrets into Logs. Manual samples should cover positive and negative decisions as well as important subgroups; high-risk cases require quarantine, Access Control, and an escalation path. Legal and ethical decisions must not be delegated to a single model score."
      ],
      "pitfalls": [
        "A regular expression cannot detect all PII because many identifiers are ambiguous, vary internationally, or become personal only in context.",
        "False Positives are not free: overly aggressive masking can destroy useful examples, and filters can disproportionately remove particular groups or topics.",
        "Equating Harmful-Content Filtering with model safety is too simplistic because behavior also emerges from the remaining data, generalization, and later Post-Training."
      ],
      "checks": [
        "Which kinds of PII are more amenable to rule-based detection, and which require context?",
        "What information should the documentation for removed or masked data include?"
      ],
      "answers": [
        "Clearly structured formats such as many email or IP addresses are good candidates for rules, although edge cases still exist. Names, free-form postal addresses, relationships between people, or identification from several details require context, models, or source assessment.",
        "The documentation should include the Policy and purpose, detector and data version, thresholds, safe reason codes, quantities before and after intervention, and stratified error samples. Sensitive original values must not be copied into open Logs; audits should instead use controlled references and access rules."
      ]
    },
    "dedup": {
      "title": "Exact Dedup, MinHash & LSH",
      "level": "Data",
      "summary": "Exact Deduplication removes identical repetitions, while MinHash and Locality-Sensitive Hashing find similar documents at scale as candidates that are then verified.",
      "mental": "Exact duplicates have the same fingerprint and are easy to merge. For nearly identical documents, MinHash creates a short similarity sketch; Locality-Sensitive Hashing (LSH) places likely similar sketches into shared candidate buckets. Only a precise comparison determines whether a candidate pair actually belongs in a duplicate cluster.",
      "details": [
        "In Exact Deduplication, a clearly defined unit such as a document, paragraph, or line is normalized and hashed. Removing duplicate lines can eliminate recurring navigation and Boilerplate, but it can also delete intentionally repeated license text, headings, or standard phrases from many documents. The unit, normalization, and representative-selection rule are therefore part of the data definition, not merely implementation details.",
        "For Fuzzy Deduplication, a document is often represented as a set of word n-grams called Shingles; their Jaccard similarity is |S∩T|/|S∪T|. For a random MinHash, the probability that the minima match equals this Jaccard similarity, so the fraction of equal values in a longer signature estimates it. More Hash Functions reduce estimation noise, while a predefined, identical normalization determines the similarity that is actually being compared.",
        "LSH divides a signature of length k into b Bands with r Rows, so k=b·r, and creates a candidate pair whenever at least one Band matches completely. At fixed k, more, shorter Bands typically increase Recall and reduce the Precision of candidate retrieval. The pipeline should then compute true Jaccard similarity, cluster confirmed pairs transitively, and deliberately select a representative; Train-Validation contamination remains an additional, separate Deduplication task."
      ],
      "pitfalls": [
        "A collision in one LSH Band does not prove duplication; in the pipeline described here, LSH generates candidates that still need an exact similarity check.",
        "If text is normalized only after signatures are created, the signature and final Jaccard test compare different objects and may miss similar documents.",
        "Deduplicating only within the training corpus does not prevent Benchmark contamination; overlaps among training, validation, and test data must be searched for explicitly."
      ],
      "checks": [
        "Why can the fraction of equal MinHash components serve as an estimator of Jaccard similarity?",
        "At fixed signature length, what typically happens to Recall and Precision when the number of LSH Bands is increased?"
      ],
      "answers": [
        "For a random permutation or suitable Hash Function, the smallest element of the union is identical in both sets exactly when it comes from their intersection. The probability is |S∩T|/|S∪T|, which is Jaccard; many independent components estimate this probability through their match rate.",
        "More Bands mean shorter Bands, so a complete Band match occurs more easily. This finds more genuinely similar pairs, increasing Recall, but also produces more dissimilar candidates, usually decreasing Precision."
      ]
    },
    "perplexity-eval": {
      "title": "Perplexity & Likelihood Evaluation",
      "level": "Eval",
      "summary": "Perplexity exponentiates the mean negative token Log-Likelihood Loss and measures a Language Model's predictive quality only under a fixed Tokenizer, corpus, and context protocol.",
      "mental": "At every token, the metric asks: how surprised was the model by the token that actually followed? High target probability means little surprise; logarithms make the surprises additive, and taking the mean makes texts of different lengths comparable. Exponentiating the result lets you read it as a rough effective branching factor.",
      "details": [
        "For M evaluated tokens, the mean Negative Log-Likelihood (NLL) is L = −(1/M)·Σ_i log p(y_i|context_i), and Perplexity is PPL = exp(L). If L equals log(10), PPL is 10 and the geometric mean probability of the correct tokens is 0.1. Interpreting this as ten equally likely alternatives is an intuition, not a claim that every individual distribution is uniform.",
        "A fair comparison requires the same Tokenizer, document boundaries, Special Tokens, evaluated token positions, and context length. For long documents, overlapping Sliding Windows can provide context, but each target token should be counted only according to the specified rule. Resetting context at every short sequence measures a different, harder task than maintaining a continuous context.",
        "Perplexity is a smooth and inexpensive metric for Pretraining and Scaling experiments because every target token provides a signal. A low value on a corpus does not, however, prove factual accuracy, Instruction Following, Reasoning, or safety. Contamination can artificially lower Perplexity, and application-specific claims require additional evaluations that directly match them."
      ],
      "pitfalls": [
        "Perplexities from different Tokenizers are not directly comparable because the number and meaning of the predicted units differ.",
        "Exponentiating the sum rather than the mean NLL makes the result grow with text length, so it is no longer length-normalized Perplexity.",
        "Treating Perplexity as a universal quality score confuses good corpus modeling with capabilities that corpus Likelihood does not test directly."
      ],
      "checks": [
        "What Perplexity corresponds to a mean NLL of log(4), and how can it be interpreted intuitively?",
        "Why can the same text have different, not directly comparable Perplexities under two Tokenizers?"
      ],
      "answers": [
        "exp(log(4)) is 4. This corresponds to an effective branching factor of about four per evaluated token, or a geometric mean target-token probability of 1/4.",
        "The Tokenizers split the same text into different numbers and kinds of prediction units with different difficulty. Because NLL is averaged per token, the metric's unit changes; comparison would require a shared unit or exactly the same Tokenizer."
      ]
    },
    "benchmark-validity": {
      "title": "Benchmarks, Validity & Contamination",
      "level": "Eval",
      "summary": "A Benchmark is valid for a claim only when its tasks, model invocation, Scoring, data provenance, uncertainty, and costs align precisely with that claim.",
      "mental": "A thermometer can measure temperature well, but it does not automatically measure air quality; similarly, a high exam score does not answer every question about a Language Model. State the claim first—for example, reliable medical assistance—and then ask which realistic inputs and errors matter for it. Only then select the dataset and metric, and also inspect individual predictions.",
      "details": [
        "The evaluation system includes not only model weights but also the Prompt Template, Zero-Shot or Few-Shot examples, Chain-of-Thought, Tools, Sampling parameters, Token Budget, and any Judge Models. Changing these rules may compare methods or whole systems rather than models alone. The rules of the game must therefore be fixed and reported alongside the score.",
        "Accuracy, pass@k, and Pairwise Win Rate operationalize different objectives and carry sampling uncertainty. For n approximately independent binary tasks, an Accuracy p has approximate standard error sqrt(p(1−p)/n), although shared topics and subgroups may violate this simple assumption. An aggregate score can hide rare, costly, or asymmetrically dangerous errors, so subgroups, costs, and concrete failure cases also belong in the analysis.",
        "Validity suffers when test tasks appeared in Pretraining, the test set was repeatedly used for development, or the tasks are far removed from real use. Data provenance, overlap searches, an untouched test set, and possibly newer time-separated tasks reduce these risks but do not eliminate them entirely. An automated Judge is also a model with Bias and must be checked against human judgments and analyzed for errors."
      ],
      "pitfalls": [
        "Benchmarks with the same name are not automatically comparable when Prompting, answer parsers, Sampling Budget, or allowed Tools differ.",
        "Repeatedly tuning on the official test set effectively turns it into a development set and makes the reported score look too optimistic.",
        "Treating a Judge Model as an infallible reference overlooks position, style, length, and self-preference Bias as well as possible factual misjudgments."
      ],
      "checks": [
        "Which rules of the game must be fixed at minimum for a credible model comparison?",
        "Why is one aggregate Benchmark score insufficient to justify a deployment decision?"
      ],
      "answers": [
        "Specify the dataset and version, Prompt and Chat Template, Few-Shot examples, allowed Tools and Reasoning aids, Sampling and Token Budget, answer parser, metric or Judge, and cost measurement. It must also be clear whether model weights or a complete system are being compared.",
        "The mean hides uncertainty, subgroups, and concrete error types and says little about contamination or realism. A deployment decision must also consider error severity, latency, cost, and behavior on difficult edge cases that may have almost no weight in the average."
      ]
    },
    "sft": {
      "title": "SFT (Supervised Fine-Tuning)",
      "level": "Alignment",
      "summary": "Supervised Fine-Tuning trains a pretrained Language Model with next-token Cross-Entropy on desired Prompt-response demonstrations, primarily shifting its visible behavior.",
      "mental": "The model learns like an apprentice from worked examples: during training, it sees the correct text so far and must predict the next response token at each step. The underlying Language Model mechanism remains the same; what changes are the data distribution, role format, and often the Loss mask. It learns to imitate the demonstrations, not automatically whether its later freely generated complete answer achieves an objective.",
      "details": [
        "During Supervised Fine-Tuning (SFT), the Prompt and response are serialized using a fixed Chat Template, Role Markers, and an end-of-document marker. For response tokens, the typical objective is L_SFT = −Σ_t m_t·log πθ(y_t|x,y_<t), where mask m_t includes only the intended target positions. Some recipes also train on Prompt tokens; the important point is to specify the chosen semantics explicitly and not alter them accidentally through Packing or Padding.",
        "SFT is especially useful for expressing capabilities already present from Pretraining in a desired format, style, or Instruction-Following behavior. A small number of high-quality examples can strongly change safety or response behavior, while flawed demonstrations are imitated just as directly. Inserting rare facts through Fine-Tuning is unreliable and can teach the model to produce convincing but unsupported details or citations.",
        "A high Learning Rate, many Epochs, or a narrow data mix can cause Catastrophic Forgetting—the loss of previously learned capabilities—and Style Overfitting. Smaller updates, more diverse instruction data, or mixing in Pretraining data can reduce the loss of general capabilities. Evaluation should therefore cover not only the training format but also foundational capabilities, safety, Over-Refusal, and alternative Prompt forms."
      ],
      "pitfalls": [
        "Blindly including Prompt tokens in the Loss can spend compute imitating the input format even when only the response should be the learning target; conversely, a response mask is a deliberate recipe choice, not a law of nature.",
        "Using a different Chat Template during evaluation shifts Role Markers and context structure, so a good model may appear poor or unpredictable because of a protocol error.",
        "More SFT Epochs are not automatically better because the model can overfit a narrow style and degrade capabilities it previously possessed."
      ],
      "checks": [
        "Which tokens should contribute to the Loss in a response-masked SFT setup?",
        "Why can overly aggressive SFT degrade general capabilities even while training Loss falls?"
      ],
      "answers": [
        "The target tokens of the desired response, including deliberately chosen termination markers, contribute; Prompt tokens, Padding, and any unrelated packed-document regions receive mask value zero. The exact boundary must match the Chat Template and Shift-by-One implementation.",
        "The gradients optimize only the narrow Fine-Tuning distribution. With a high Learning Rate, many repetitions, or one-sided examples, parameters can shift enough to overwrite other Pretraining behaviors or make them harder to access even as SFT Loss continues to fall."
      ]
    },
    "reward-models": {
      "title": "Preference Data & Reward Model",
      "level": "Alignment",
      "summary": "A Reward Model learns from preference pairs a scalar proxy for which of two responses to the same Prompt is more likely to be preferred.",
      "mental": "The dataset does not say that a response is objectively worth 8.7 points; it says only that, for this Prompt, response A was chosen over B. The Reward Model tries to reproduce such pairwise decisions with an internal score. Its preferences therefore come from the annotation guidelines, Annotators, Prompt distribution, and response styles it was shown.",
      "details": [
        "For each Prompt x, at least two responses are generated and labeled under annotation guidelines as preferred y+ and rejected y−. Order, response length, writing style, Annotator demographics, and whether subject-matter verification actually occurred can influence the Label. Randomizing side position, using clear Rubrics, and conducting separate Quality Control reduce some, but not all, biases.",
        "The Reward Model rφ(x,y) outputs a scalar; in the Bradley-Terry model, P(y+ preferred) = sigmoid(rφ(x,y+)−rφ(x,y−)). It is trained with −log sigmoid(r+−r−), so only the difference between the two Rewards matters. A Prompt-dependent additive constant is therefore not identifiable, and the absolute Reward is neither a calibrated quality grade nor comparable across arbitrary setups.",
        "Before using the model as an optimization objective, evaluate Pairwise Accuracy, subgroups, and concrete errors on held-out preference pairs. Policy optimization produces responses outside the original training distribution, where systematic model errors can be exploited; this is Reward Hacking. Rising Proxy Reward alongside falling human or independent evaluation is a typical warning sign and calls for new data, constrained Policy Drift, or a different objective."
      ],
      "pitfalls": [
        "Equating a high Reward with true quality ignores that the model only approximates finite, biased preference Labels and extrapolates outside their distribution.",
        "Non-randomized positions or Length Bias can teach the Reward Model to prefer the first or longer response instead of the substantively better one.",
        "Good Accuracy on a random split of old pairs does not guarantee quality on responses from a subsequently optimized Policy, because that is exactly where Distribution Shift and Reward Hacking arise."
      ],
      "checks": [
        "Why is the difference between two Reward scores sufficient for the Bradley-Terry Loss?",
        "How would you recognize Reward Overoptimization during a training run?"
      ],
      "answers": [
        "The model represents preference probability as sigmoid(r+−r−); adding the same Prompt-dependent constant to both scores leaves the probability unchanged. Preference data therefore identifies relative ordering, not an absolute zero point.",
        "A sharply rising training Reward accompanied by stagnant or falling evaluations from humans, independent Judges, or real tasks is suspicious. Responses may also become more uniform, unnecessarily long, or tailored to known weaknesses of the Reward Model."
      ]
    },
    "rlhf": {
      "title": "RLHF (Reinforcement Learning from Human Feedback)",
      "level": "Alignment",
      "summary": "Classic Reinforcement Learning from Human Feedback optimizes a Language Model Policy against the score of a Reward Model learned from human preferences while limiting its divergence from a Reference Policy.",
      "mental": "The Reward Model pulls the Policy toward responses that people would probably prefer. A fixed Reference Policy acts like an elastic band, preventing optimization from moving arbitrarily far from the learned language distribution. Because the Policy generates its own responses, the data distribution on which it trains also changes continuously.",
      "details": [
        "In classic Reinforcement Learning from Human Feedback (RLHF), the trained Policy usually starts from a model produced through Supervised Fine-Tuning (SFT), while a copy is frozen as the Reference. On-Policy Rollouts are generated for Prompts, scored as complete responses by the Reward Model, and used to update the Policy with a Policy-Gradient method such as Proximal Policy Optimization; implementations may additionally use a Value Model as a Baseline. Unlike SFT, there is no prescribed target response and therefore no direct Cross-Entropy Loss per desired token.",
        "A simplified objective is J(π)=E[r(x,y)]−β·D_KL(π||π_ref), where D_KL denotes the Kullback-Leibler Divergence. In practice, divergence is often estimated through token Log Ratios on sampled responses or incorporated as a Reward penalty. The coefficient β controls the trade-off: too little constraint makes the Reward Model easier to exploit, while too much prevents useful behavioral change.",
        "Preferences can be less expensive than perfect demonstrations, especially when experts can verify a solution more easily than formulate one themselves. In return, RLHF requires annotation, expensive inference Rollouts, and a sensitive multi-model training system. Reward, Reference divergence, Entropy, response length, and independent capability and safety evaluations must be monitored together because Reward Overoptimization and Mode Collapse can occur despite an improved Proxy score."
      ],
      "pitfalls": [
        "A higher Reward-Model score does not prove a better Policy; after sufficiently strong optimization, it may instead indicate exploitation of a model error.",
        "Treating the same β value as equally strong regularization across models and implementations is wrong because Reward, token-aggregation, and divergence scales differ.",
        "Reusing old Rollouts arbitrarily often as if they were current On-Policy data creates Distribution Shift; without an appropriate correction, the Policy Gradient is biased."
      ],
      "checks": [
        "What roles do the trained Policy, Reference Policy, Reward Model, and Rollouts play in the classic RLHF Loop?",
        "What does β control in the KL-regularized RLHF objective?"
      ],
      "answers": [
        "The Policy generates responses and is updated, the frozen Reference defines the starting point for the divergence penalty, and the Reward Model scores complete responses as a preference proxy. Rollouts are the training examples generated by the current Policy; an optional Value Model can additionally reduce variance.",
        "β weights the penalty for divergence from the Reference relative to Reward. A higher effective weight keeps the Policy more conservative, while a weight that is too low allows larger changes and therefore greater risk of Reward Hacking or collapse."
      ]
    },
    "dpo": {
      "title": "DPO (Direct Preference Optimization)",
      "level": "Alignment",
      "summary": "Direct Preference Optimization trains a Policy directly on chosen and rejected responses relative to a fixed Reference, without a separate Reward Model or new On-Policy Rollouts during training.",
      "mental": "For the same Prompt, there is one preferred and one rejected response. Direct Preference Optimization (DPO) asks whether the current Policy has raised the preferred response more strongly relative to the Reference than the rejected response, then corrects this margin. This simplifies the Training Loop but still inherits all biases in the preference pairs.",
      "details": [
        "For Prompt x, preferred response y_w, and rejected response y_l, four conditional sequence Log-Probabilities are computed: two each under the trained Policy πθ and the frozen Reference π_ref. The DPO Logit is β·[(log πθ(y_w|x)−log π_ref(y_w|x))−(log πθ(y_l|x)−log π_ref(y_l|x))], and the Loss is its negative Log-Sigmoid. The sequence values sum only the intended response tokens; Prompt probabilities cancel in the difference when the Prompt is identical.",
        "The derivation begins with a Kullback-Leibler-regularized Reward objective and, under a nonparametric optimality assumption, expresses the implicit Reward through Policy-to-Reference Log Ratios. The unknown Prompt-dependent normalization cancels in the pairwise Reward difference. DPO therefore needs neither an explicit Reward Model nor a Critic or ongoing Rollout generation in its Training Loop, but it is not simply ordinary positive SFT.",
        "The coefficient β scales the Log-Ratio margin and comes from the trade-off with Reference regularization; it is not merely a second Learning Rate. Summed sequence Log-Probabilities and preference data can introduce length, format, or style Bias, which is why length-controlled variants exist. DPO should be evaluated on independent instruction, safety, and capability metrics because a simple Offline Loss does not make Reward Overoptimization fundamentally impossible."
      ],
      "pitfalls": [
        "Implementing DPO as Cross-Entropy on y_w minus Cross-Entropy on y_l without the Reference term changes the objective and removes relative regularization.",
        "Including Prompt, Padding, or Template tokens inconsistently in the sequence scores can make the four Log-Probabilities incomparable and create unwanted length effects.",
        "Removing Proximal Policy Optimization (PPO) and the Reward Model removes neither poor preference Labels nor Distribution Shift between Offline data and later use."
      ],
      "checks": [
        "Which four sequence Log-Probabilities form the preference margin in the DPO Logit?",
        "How does DPO differ conceptually from SFT on only the preferred response?"
      ],
      "answers": [
        "The required quantities are log πθ(y_w|x), log πθ(y_l|x), log π_ref(y_w|x), and log π_ref(y_l|x). First compute the Policy-to-Reference difference for each response, then compare the preferred response with the rejected one.",
        "SFT only raises the probability of a demonstrated target response. DPO uses both the preferred and rejected response and evaluates their relative change against a fixed Reference, so the update magnitude depends on the preference margin already achieved."
      ]
    },
    "rl-setup": {
      "title": "Language as an RL Problem",
      "level": "RL",
      "summary": "For Reinforcement Learning, a Language Model is treated as an episodic Policy: the Prompt plus the response so far is the state, the next token is the action, and a Verifier usually evaluates only the completed Trajectory.",
      "mental": "A response emerges as a path through many token decisions. After each action, the selected token is simply appended to the existing text; randomness comes from Sampling the Policy, not from this transition. Only at the end does, for example, a mathematics Grader check the solution and return a scalar Reward for the entire path.",
      "details": [
        "The initial state s_0 is a Prompt x from a task distribution ρ. At time t, the Policy samples a token a_t from πθ(·|s_t), and the next state is deterministically s_(t+1)=concat(s_t,a_t), until an end token or the length limit is reached. The complete sequence is called a Trajectory, Episode, or Rollout; its probability is the product of token probabilities and its logarithm is their sum.",
        "Reinforcement Learning from Verifiable Rewards (RLVR) maximizes J(θ)=E_(x∼ρ,y∼πθ)[R(x,y)] using an automatically verifiable Reward, such as an exact final answer or passing tests. Unlike SFT, there is no prescribed reference response whose tokens are imitated individually. A binary Reward observed only at the end is sparse, however, and does not directly reveal which intermediate step was good or bad.",
        "Rollout inference is part of the training system because the current Policy generates its own training examples. This distribution changes after updates, so an old static set of responses is not automatically On-Policy. The Verifier also limits the learning objective: Parser errors, incomplete tests, or exploitable formatting rules can receive Reward even when the intended task was not solved."
      ],
      "pitfalls": [
        "Treating RLVR data like a fixed Supervised Fine-Tuning dataset overlooks that the response distribution changes with every Policy update.",
        "Inventing unobserved intermediate Rewards changes the task and can reward incorrect Reasoning paths; Outcome Rewards initially provide only one signal for the complete response.",
        "A deterministic Verifier is not automatically ground truth because it may deterministically execute a faulty Parser, weak tests, or incomplete Ground Truth."
      ],
      "checks": [
        "What are the state, action, and Episode when a Language Model generates a response?",
        "Why does the training-data distribution change after a Policy update in On-Policy RLVR?"
      ],
      "answers": [
        "The state is the Prompt together with every token generated so far, the action is the next sampled token, and the Episode is the complete sequence up to the end token or length limit. A final Verifier assigns the Outcome Reward to this Episode.",
        "The Policy itself determines the probabilities of its responses. Once its parameters are updated, it samples different Trajectories or samples the same ones at different frequencies; earlier Rollouts therefore came from an older distribution."
      ]
    },
    "policy-gradient": {
      "title": "Log-Derivative Trick & Policy Gradient",
      "level": "RL",
      "summary": "The Policy Gradient rewrites the gradient of expected Reward as the expectation of Reward or Advantage times the gradient of the Log Policy, making it estimable from sampled responses.",
      "mental": "The Reward itself does not need to be differentiable: it serves as a weight for the Log-Probability of the sampled path. Good paths become more probable, while paths below a suitable Baseline become relatively less probable. Because individual Rollouts are random, many samples and Variance Reduction are needed instead of an exact gradient for each example.",
      "details": [
        "For J(θ)=Σ_y πθ(y|x)R(y), the Log-Derivative Trick gives ∇πθ=πθ∇log πθ and therefore ∇J=E_(y∼πθ)[R(y)∇log πθ(y|x)]. For a response, log πθ(y|x) decomposes into the sum of the Log-Probabilities of its generated tokens. A Monte Carlo estimator averages this expression over sampled Prompts and responses and can therefore optimize even a discrete test Reward.",
        "Subtracting a Baseline b(x) that does not depend on the particular sampled response leaves the expected gradient unchanged because E[∇log πθ(y|x)]=0. The Advantage A=R−b weights whether a Rollout was better or worse than expected for that Prompt. A well-chosen Baseline reduces variance, while a poor one can increase it; a Reward of 9 can therefore have negative Advantage when 10 was expected for that Prompt.",
        "When successes are rare, most Rollouts receive no positive Reward and the estimator is very noisy. Several diverse responses per Prompt and suitable Baselines improve the signal but do not fully solve Exploration. An Outcome Reward initially weights the Log-Probability of the entire response and does not causally identify which individual token caused the success."
      ],
      "pitfalls": [
        "Trying to Backpropagate through the Reward produced by the Verifier is unnecessary and usually impossible for discrete tests; the Log Policy is differentiated, while Reward is its sample weight.",
        "A Baseline that depends on the selected response or action can change the expected gradient and is not covered by the simple Unbiasedness argument.",
        "Comparing absolute Rewards across Prompts of very different difficulty can overweight easy tasks; a Prompt-dependent Baseline highlights relative success."
      ],
      "checks": [
        "How does the Log-Derivative Trick turn ∇θ E[R] into a Policy Gradient that can be estimated from samples?",
        "How can a Rollout with Reward 9 have a negative Advantage?"
      ],
      "answers": [
        "Write the expectation as Σ_y πθ(y|x)R(y), differentiate πθ, and replace ∇πθ with πθ∇log πθ. This yields E[R(y)∇log πθ(y|x)], whose mean over responses sampled from πθ is a Monte Carlo estimator.",
        "Advantage is relative to the Baseline: A=R−b(x). If the Baseline for this Prompt is 10, then A=9−10=−1; despite its high absolute Reward, the Rollout performed worse than expected."
      ]
    },
    "grpo": {
      "title": "GRPO (Group Relative Policy Optimization)",
      "level": "RL",
      "summary": "Group Relative Policy Optimization compares several responses to the same Prompt and uses their group-relative Rewards as Advantages, eliminating the need for a separate Value Model.",
      "mental": "Have several siblings solve the same task and evaluate them only relative to one another. Responses above the group mean are reinforced, while responses below it are weakened; the general difficulty of the task largely drops out. If all siblings receive the same evaluation, the group provides no direction for learning.",
      "details": [
        "Group Relative Policy Optimization (GRPO) samples G responses per Prompt, computes their Rewards r_j, and typically uses A_j=(r_j−μ)/(σ+ε), where μ is the group mean and σ is the standard deviation. Subtracting the group mean acts as a Prompt-local Baseline and preserves the Policy Gradient up to a known factor even though the same samples form the mean. Dividing by σ, in contrast, is an additional Reweighting heuristic: it equalizes group scales but no longer optimizes the exact original Expected-Reward Gradient.",
        "A response's Advantage weights the sum of the Log-Probabilities of its response tokens in the Policy Loss. Many implementations additionally average over sequence length; this gives each example a similar total weight but gives a token in a long response less weight than a token in a short one. Standard-deviation and length normalization are therefore not harmless constant factors—they can change Prompt and Length Bias.",
        "GRPO avoids training and running a Critic or Value Model but requires several Rollouts per Prompt. With a binary Reward, a group provides a relative signal only if at least one response is evaluated differently; all-wrong or all-correct groups become zero after centering. Group size, Sampling temperature, Verifier quality, and Exploration capability therefore strongly determine whether the method sees useful contrasts at all."
      ],
      "pitfalls": [
        "Mixing Rewards from different Prompts into one group destroys the local difficulty Baseline and lets easy tasks dominate the updates.",
        "When the standard deviation is zero, the implementation must not divide blindly; conceptually, a group without Reward differences contains no relative learning signal anyway.",
        "Treating standard-deviation or length normalization as mere numerical stabilization with no change to the objective is wrong because it systematically reweights groups and tokens."
      ],
      "checks": [
        "Why can the group mean replace a Value Model in GRPO?",
        "What Reweighting is introduced by standard-deviation normalization and sequence-length normalization?"
      ],
      "answers": [
        "Several Rollouts for the same Prompt provide a sample of the Rewards expected for that Prompt. Their mean serves as a local Baseline, so r_j−μ expresses whether a response is above or below the group level for exactly that task without a learned Value Function making a prediction.",
        "Dividing by the group standard deviation gives relatively larger normalized weights to groups with low Reward spread and relatively smaller weights to groups with high spread. Averaging over sequence length gives each response a similar total weight and therefore weakens individual tokens in long responses relative to tokens in short responses."
      ]
    },
    "off-policy": {
      "title": "Off-Policy Importance Ratios & Clipping",
      "level": "RL",
      "summary": "In Off-Policy training, Rollouts come from an older Policy; Importance Ratios correct this distribution shift, while Clipping trades off Bias, variance, and sample reuse.",
      "mental": "You are training on responses generated by an older version of the model. The ratio between their probability under today's model and their probability under the old model indicates how representative each old decision remains for the current Policy. If the two models differ strongly, a few responses can receive enormous weights; Clipping limits their influence but gives up exact correction in return.",
      "details": [
        "If the Behavior Policy π_0 generates a response y while the current Policy πθ has already been updated, the naive expectation under π_0 is not the desired On-Policy expectation under πθ. The sequence Importance Weight is w=πθ(y|x)/π_0(y|x)=exp(Σ_t[log πθ(y_t|x,y_<t)−log π_0(y_t|x,y_<t)]). With common support, it corrects Bias in principle, but because it is a product across many tokens its variance can become exponentially problematic with response length; the old Log-Probabilities must be recorded during Sampling.",
        "Token-wise Reweighting uses only the local Ratio at each position and has substantially lower variance than the complete sequence product. It is not, however, an exact sequence correction: the Prefix and later tokens still come predominantly from the old Policy, so the method optimizes a biased Surrogate Objective. More Minibatch Epochs per Rollout Batch save inference but increase Staleness and therefore both Ratio variance and the Bias of such approximations.",
        "Proximal Policy Optimization (PPO) and Group Relative Policy Optimization (GRPO) often use the clipped Surrogate term min(w_t·A, clip(w_t,1−ε,1+ε)·A). For positive Advantage, the incentive ends above 1+ε; for negative Advantage, it ends below 1−ε, limiting extreme updates. Clipping improves stability and reduces the influence of large Ratios but introduces additional Bias, so Clip Fraction, Policy divergence, and independent Reward should be monitored together."
      ],
      "pitfalls": [
        "Recomputing the old Log-Probabilities with the current model after an update makes numerator and denominator effectively equal and destroys the information about the Sampling Policy.",
        "Describing Clipping as an exact, unbiased Importance correction is wrong; it deliberately trades variance and update size for additional Bias.",
        "Multiplying probabilities directly in ordinary number space easily underflows or overflows for long sequences; Ratios should be computed from differences of stored Log-Probabilities."
      ],
      "checks": [
        "When is an Importance Ratio equal to one, and what does that mean?",
        "What trade-off does Clipping introduce into an Off-Policy Policy-Gradient estimator?"
      ],
      "answers": [
        "The Ratio is one when the current and old Policy assign the same probability to the action or sequence being considered; immediately during On-Policy Sampling, this holds up to numerical or implementation differences. The sample then needs no upweighting or downweighting for Policy Drift.",
        "Clipping prevents very large or very small Ratios from dominating individual updates and therefore often improves stability and variance. In return, the theoretically exact Importance Weight is truncated, the estimator becomes biased, and potentially useful signal from strongly changed samples may be discarded."
      ]
    }
  },
  "formulas": {
    "mean-var": {
      "cat": "Basics",
      "title": "Mean & Variance",
      "read": "The mean is the sum divided by n; variance is the expected squared deviation.",
      "purpose": "Describes location and spread; central for initialization, normalization, and policy gradient variance.",
      "dims": "xᵢ and μ have the same units; variance has squared units.",
      "vars": [
        [
          "n",
          "Number of observations"
        ],
        [
          "xᵢ",
          "Observation i"
        ],
        [
          "μ",
          "Mean"
        ],
        [
          "E",
          "Expectation"
        ]
      ],
      "intuition": "Squares prevent positive and negative deviations from canceling each other out.",
      "pitfall": "Standard deviation σ is √Var and has the same unit as x again.",
      "example": "For [1,3], μ=2, variance (with 1/n)=1.",
      "check": "Why is variance never negative?",
      "answer": "Every squared deviation (x−μ)² is at least zero. Therefore, a mean or expectation of exclusively non-negative numbers cannot be negative either."
    },
    "matmul": {
      "cat": "Linear Algebra",
      "title": "Matrix Multiplication",
      "read": "Each output is the dot product of an A-row with a B-column.",
      "purpose": "Fundamental operation for Linear Layers, Attention, and MLPs.",
      "dims": "Inner dimension k must match; outer dimensions m,n remain.",
      "vars": [
        [
          "m",
          "Number of rows/objects"
        ],
        [
          "k",
          "Contracted feature axis"
        ],
        [
          "n",
          "Output features"
        ],
        [
          "Cᵢⱼ",
          "Output at row i, column j"
        ]
      ],
      "intuition": "Many weighted sums simultaneously.",
      "pitfall": "Do not confuse with element-wise A⊙B.",
      "example": "(B·T×D) @ (D×D_out) → (B·T×D_out).",
      "check": "Which axis disappears and why?",
      "answer": "The common inner axis k disappears because contributions are summed over all k. The outer axes m and n still denote for which row and column a result is produced."
    },
    "chain-rule": {
      "cat": "Basics",
      "title": "Chain Rule",
      "read": "The upstream gradient is chained with the local derivative.",
      "purpose": "Mathematical foundation of backpropagation.",
      "dims": "∂L/∂x has the same shape as x; in vector cases, reverse-mode backpropagation computes a Vector-Jacobian Product.",
      "vars": [
        [
          "L",
          "Scalar objective function"
        ],
        [
          "x",
          "Input/parameter"
        ],
        [
          "y",
          "Intermediate result"
        ]
      ],
      "intuition": "How much does x change the intermediate value, and how much does that change the loss?",
      "pitfall": "At branches, multiple path contributions add up.",
      "example": "y=x², L=3y ⇒ dL/dx=3·2x.",
      "check": "Why is a full Jacobian not needed?",
      "answer": "Backpropagation requires only the product of the incoming gradient with the local Jacobian for a scalar loss, i.e., a Vector-Jacobian Product. Therefore, the full Jacobian does not need to be materialized or stored."
    },
    "softmax": {
      "cat": "Probability",
      "title": "Softmax",
      "read": "Exponentiate stabilized logits and normalize them to sum to one.",
      "purpose": "Turns relative scores into a categorical probability distribution.",
      "dims": "z and p have the same shape; normalization occurs over exactly one category axis.",
      "vars": [
        [
          "zᵢ",
          "Logit of category i"
        ],
        [
          "pᵢ",
          "Probability"
        ],
        [
          "m",
          "Maximum logit for stabilization"
        ]
      ],
      "intuition": "Only differences between logits matter; shifting all logits changes nothing.",
      "pitfall": "In attention, normalize over keys, not queries.",
      "example": "z=[0,0] ⇒ p=[0.5,0.5].",
      "check": "Why does −m not change the result?",
      "answer": "By subtracting m, both numerator and denominator are multiplied by the same factor exp(−m). This factor cancels out, leaving the probabilities unchanged."
    },
    "logsumexp": {
      "cat": "Numerics",
      "title": "Log-Sum-Exp",
      "read": "Pull out the maximum, sum safe exponential values, and add it back.",
      "purpose": "Stable normalization of logits and cross-entropy.",
      "dims": "Scalar per normalized row; same log unit as z.",
      "vars": [
        [
          "z",
          "Logit vector"
        ],
        [
          "m",
          "max(z)"
        ],
        [
          "LSE",
          "Logarithm of the exponential sum"
        ]
      ],
      "intuition": "Avoids overflow for large and underflow for small logits.",
      "pitfall": "Naive log(sum(exp(z))) can yield inf, even though the mathematical result is finite.",
      "example": "z=[1000,1000] ⇒ LSE=1000+log 2.",
      "check": "Which exp arguments arise after stabilization?",
      "answer": "After stabilization, the exponents are zⱼ−m and are all less than or equal to zero; at least one is exactly zero. Their exponential values thus lie in (0,1], avoiding overflow."
    },
    "autoregressive": {
      "cat": "Language Model",
      "title": "Autoregressive Factorization",
      "read": "The sequence probability is the product of conditional next-token probabilities.",
      "purpose": "Defines training and generation of a decoder language model.",
      "dims": "One scalar per sequence; each conditional distribution has V categories.",
      "vars": [
        [
          "T",
          "Sequence length"
        ],
        [
          "xₜ",
          "Token at position t"
        ],
        [
          "x&lt;ₜ",
          "All previous tokens"
        ]
      ],
      "intuition": "Complex sequences are decomposed into local predictions.",
      "pitfall": "The causal condition must not be violated during parallel training.",
      "example": "p(a,b)=p(a)·p(b|a).",
      "check": "Why does the product become a sum in log space?",
      "answer": "The logarithm satisfies log(a·b)=log(a)+log(b). Therefore, the product of conditional token probabilities becomes the sum of their log-probabilities."
    },
    "cross-entropy": {
      "cat": "Loss",
      "title": "Cross-Entropy / NLL",
      "read": "Average negative log-probability of the correct token.",
      "purpose": "Standard loss for next-token training; NLL stands for Negative Log-Likelihood.",
      "dims": "Dimensionless scalar; M is the number of evaluated tokens.",
      "vars": [
        [
          "zᵢ",
          "Logits for token position i"
        ],
        [
          "yᵢ",
          "Target ID"
        ],
        [
          "M",
          "Number of unmasked targets"
        ]
      ],
      "intuition": "Being confidently wrong is especially costly.",
      "pitfall": "Padding must be removed from the sum and denominator.",
      "example": "Target probability 0.5 ⇒ Loss ≈0.693.",
      "check": "What loss results from a uniform distribution over V tokens?",
      "answer": "With a uniform distribution, each of the V tokens has probability 1/V. The loss for the correct token is therefore −log(1/V)=log(V)."
    },
    "perplexity": {
      "cat": "Evaluation",
      "title": "Perplexity",
      "read": "Exponentiate the average token NLL.",
      "purpose": "Likelihood-based model quality on a fixed corpus and tokenizer.",
      "dims": "Dimensionless positive number, at least 1.",
      "vars": [
        [
          "M",
          "Number of evaluated tokens"
        ],
        [
          "p",
          "Target token probability"
        ],
        [
          "L",
          "average Cross-Entropy"
        ]
      ],
      "intuition": "Effective branching factor per token.",
      "pitfall": "Not directly comparable between different tokenizers.",
      "example": "Loss log(10) ⇒ PPL 10.",
      "check": "Why is PPL equal to 1 when Loss is 0?",
      "answer": "Perplexity is exp(Loss), and exp(0)=1. A loss of zero also means that probability one is assigned to each correct token, leaving effectively only one possibility."
    },
    "embedding-params": {
      "cat": "Resources",
      "title": "Embedding Parameters",
      "read": "Vocabulary size times model dimension.",
      "purpose": "Parameter and memory calculation for token embedding; with Weight Tying, the Output Head can use the same matrix.",
      "dims": "Number of parameters; Bytes = N_embed×Bytes per element.",
      "vars": [
        [
          "V",
          "Vocabulary size"
        ],
        [
          "D",
          "Model dimension"
        ]
      ],
      "intuition": "A D-dimensional row for each token.",
      "pitfall": "Without Weight Tying, remember to count the LM Head separately.",
      "example": "V=32k, D=4096 ⇒ approx. 131M parameters.",
      "check": "How does doubling V affect sequence and parameter costs?",
      "answer": "With fixed D, doubling V doubles the V·D embedding parameters and also the number of output logits per position. Sequences may become shorter through additional longer tokens, but neither the extent nor the occurrence of this shortening is guaranteed and depends on the learned vocabulary."
    },
    "linear-params": {
      "cat": "Resources",
      "title": "Linear Layer: Parameters & FLOPs",
      "read": "Weight matrix plus optional bias; Multiply-Add counts approximately two FLOPs.",
      "purpose": "Quick plausibility check for Linear Layers.",
      "dims": "N is number of parameters, FLOPs are operations per forward pass.",
      "vars": [
        [
          "d_in",
          "Input features"
        ],
        [
          "d_out",
          "Output features"
        ],
        [
          "B",
          "Batch"
        ],
        [
          "T",
          "Tokens per sequence"
        ]
      ],
      "intuition": "Each token uses the same matrix.",
      "pitfall": "Do not equate forward-pass and training FLOPs.",
      "example": "A bias-free D×D Linear Layer has D² parameters.",
      "check": "Why does T not appear in the parameter count?",
      "answer": "The weight matrix of the same Linear Layer is reused at all T token positions and not stored anew per position. Therefore, T affects the computational work of the forward pass, but not the parameter count."
    },
    "rmsnorm": {
      "cat": "Transformer",
      "title": "RMSNorm",
      "read": "Divide by the root mean square magnitude and scale per feature.",
      "purpose": "Stabilizes activation scales without mean centering.",
      "dims": "Input and Output […]×D; g ∈ ℝ^D.",
      "vars": [
        [
          "x",
          "Activation vector"
        ],
        [
          "D",
          "Feature width"
        ],
        [
          "g",
          "learnable scale"
        ],
        [
          "ε",
          "stability constant"
        ]
      ],
      "intuition": "Brings the typical vector magnitude to a controlled scale.",
      "pitfall": "Normalize over the last feature axis, not batch or tokens.",
      "example": "For D=2, x=[3,4], RMS=√12.5.",
      "check": "What shape must g have for broadcasting?",
      "answer": "The learnable scale g needs one entry per feature and thus has shape [D]. For explicit broadcasting, it can be viewed as [1,…,1,D], so that all batch and token axes use the same D values."
    },
    "swiglu": {
      "cat": "Transformer",
      "title": "SwiGLU",
      "read": "A SiLU gate multiplies a second feature branch; a third Linear Layer maps the result back to D.",
      "purpose": "Modern position-wise Feed-Forward Network (FFN).",
      "dims": "x: […]×D → two branches […]×D_ff → Output […]×D.",
      "vars": [
        [
          "W₁,W₃",
          "Up and Gate Linear Layers"
        ],
        [
          "W₂",
          "Down Linear Layer"
        ],
        [
          "⊙",
          "elementwise multiplication"
        ]
      ],
      "intuition": "The gate decides data-dependently which expanded features pass through.",
      "pitfall": "Three instead of two weight matrices in the parameter count.",
      "example": "Sequence positions remain independent; only features mix.",
      "check": "Which axis is not mixed?",
      "answer": "SwiGLU mixes the feature axis D or D_ff, but not the sequence axis T. Each token position is processed independently by the Feed-Forward Network with the same weights."
    },
    "rope": {
      "cat": "Transformer",
      "title": "RoPE Rotation",
      "read": "Rotate each feature pair by an angle that depends on position and frequency.",
      "purpose": "Encodes relative position in Q·K dot products.",
      "dims": "Shape remains B×H×T×d_k; d_k must be decomposable into pairs.",
      "vars": [
        [
          "p",
          "Token position"
        ],
        [
          "i",
          "Frequency pair"
        ],
        [
          "R(θ)",
          "2×2 rotation matrix"
        ]
      ],
      "intuition": "Angle differences carry relative distance information.",
      "pitfall": "Only rotate Q and K; do not rotate V.",
      "example": "Position 0 has an angle of 0 and remains unchanged.",
      "check": "Why is an even head dimension practical?",
      "answer": "RoPE treats features in pairs as two-dimensional planes and rotates each pair. With an even d_k, no unpaired features remain; an odd head dimension would require additional special handling."
    },
    "attention": {
      "cat": "Transformer",
      "title": "Scaled Dot-Product Attention",
      "read": "Compute scaled query-key scores, normalize over keys, and mix values.",
      "purpose": "Content-dependent information exchange between sequence positions.",
      "dims": "Q: …×T_q×d_k; K,V: …×T_k×d_k/d_v; Scores: …×T_q×T_k; Output: …×T_q×d_v.",
      "vars": [
        [
          "Q",
          "Queries: what is sought"
        ],
        [
          "K",
          "Keys: description of what is offered"
        ],
        [
          "V",
          "Values: content to be transferred"
        ],
        [
          "dₖ",
          "Key or head dimension"
        ]
      ],
      "intuition": "Each query builds a weighted mixture of all allowed values.",
      "pitfall": "Apply softmax over T_k, not T_q.",
      "example": "Identical scores result in an equal average of the values.",
      "check": "Why divide by √dₖ?",
      "answer": "If query and key components have approximately unit variance, the variance of their dot product grows proportionally to d_k. Dividing by √dₖ keeps the score scale roughly constant and prevents softmax from saturating early with wide heads."
    },
    "causal-attention": {
      "cat": "Transformer",
      "title": "Causal Attention Mask",
      "expr": "Sᵢⱼ = (qᵢ·kⱼ)/√dₖ + Mᵢⱼ,   Mᵢⱼ=0 for j≤i, otherwise −∞",
      "read": "Future key positions receive impossible scores before softmax.",
      "purpose": "Prevents information leakage during next-token training.",
      "dims": "M and S: T_q×T_k, broadcasted over batch and attention heads.",
      "vars": [
        [
          "i",
          "Query position"
        ],
        [
          "j",
          "Key position"
        ],
        [
          "M",
          "Additive mask"
        ]
      ],
      "intuition": "Row i can only see the past and present.",
      "pitfall": "Masking with 0 after softmax is incorrect.",
      "example": "Row 0 allows only column 0.",
      "check": "Which triangle contains −∞?",
      "answer": "The strictly upper triangle contains −∞, meaning all entries where the column index j is greater than the row index i. These entries represent future key positions that a query must not see yet."
    },
    "residual": {
      "cat": "Transformer",
      "title": "Pre-Norm Residual Update",
      "read": "Normalize the side branch, transform it, and add it to the unchanged residual stream.",
      "purpose": "Facilitates optimization of deep networks and preserves an identity path.",
      "dims": "x and F output must have exactly the same shape.",
      "vars": [
        [
          "x",
          "Residual stream"
        ],
        [
          "F",
          "Attention or MLP"
        ],
        [
          "Norm",
          "RMSNorm/LayerNorm"
        ]
      ],
      "intuition": "Each block writes a correction into a stable main stream.",
      "pitfall": "Do not add Norm(x) instead of x as the residual base.",
      "example": "Two such updates per transformer block.",
      "check": "Where is the direct gradient path?",
      "answer": "The direct gradient path runs through the addend x in the addition x′=x+F(Norm(x)). Its local derivative is the identity, allowing the gradient to bypass Norm and F on this path."
    },
    "transformer-params": {
      "cat": "Resources",
      "title": "Rough Transformer Parameter Count",
      "read": "Twelve times the number of layers times the model dimension squared.",
      "purpose": "Napkin math for a dense decoder with attention and an MLP of roughly 4D width.",
      "dims": "Parameter count; architectural details change the factor.",
      "vars": [
        [
          "L",
          "Number of blocks"
        ],
        [
          "D",
          "Model dimension"
        ],
        [
          "12",
          "Approx. 4D² Attention + 8D² MLP"
        ]
      ],
      "intuition": "Width costs quadratically, depth linearly.",
      "pitfall": "Embeddings, GQA, SwiGLU width, and bias can change the approximation.",
      "example": "Doubling L ⇒ N roughly doubles; doubling D ⇒ quadruples.",
      "check": "Why does D² dominate?",
      "answer": "The large weight matrices of a block connect dimensions that are both proportional to D, such as D×D or D×D_ff with D_ff proportional to D. Thus, each block mainly costs a constant factor times D² parameters."
    },
    "temperature": {
      "cat": "Sampling",
      "title": "Temperature",
      "read": "Divide logits by a positive temperature before softmax.",
      "purpose": "Controls sharpness and diversity during sampling.",
      "dims": "T is a dimensionless scalar.",
      "vars": [
        [
          "zᵢ",
          "Logit"
        ],
        [
          "T",
          "Temperature"
        ],
        [
          "pᵢ",
          "Adjusted probability"
        ]
      ],
      "intuition": "T<1 amplifies differences, T>1 smooths them.",
      "pitfall": "Do not use T=0 numerically; handle greedy separately.",
      "example": "T→∞ approaches uniform distribution, T→0 concentrates on maxima.",
      "check": "Which direction increases diversity?",
      "answer": "A higher temperature T>1 smooths the distribution and typically increases sampling diversity. A lower positive temperature sharpens it and concentrates more mass on the largest logits."
    },
    "adamw": {
      "cat": "Optimization",
      "title": "AdamW Update",
      "read": "Smooth direction and squared magnitude, correct initialization bias, normalize the update, and apply weight decay separately.",
      "purpose": "Adaptive standard optimizer for Transformer training.",
      "dims": "m, v, θ, g have parameter shape; β, η, λ, ε are scalars.",
      "vars": [
        [
          "gₜ",
          "gradient"
        ],
        [
          "mₜ",
          "first moment"
        ],
        [
          "vₜ",
          "second raw moment"
        ],
        [
          "β₁,β₂",
          "smoothing"
        ],
        [
          "η",
          "learning rate"
        ],
        [
          "λ",
          "weight decay"
        ]
      ],
      "intuition": "Rare large gradients are relatively damped; consistent direction accumulates.",
      "pitfall": "Do not forget bias correction: m̂=m/(1−β₁ᵗ), v̂=v/(1−β₂ᵗ).",
      "example": "Bias correction is particularly large at the first step.",
      "check": "Why is AdamW decay not the same term as L2 in Adam?",
      "answer": "An L2 term is added to the gradient in Adam and then scaled together with it by the adaptive moment estimators. In contrast, AdamW applies weight decay as a separate, direct shrinkage step on the parameters, so that the decay effect does not depend on the coordinate-wise Adam scaling."
    },
    "cosine-lr": {
      "cat": "Optimization",
      "title": "Warmup + Cosine Decay",
      "read": "After linear warmup, the learning rate decays cosinusoidally from maximum to minimum.",
      "purpose": "Stable early steps and gentle late decay.",
      "dims": "t, T, T_w in optimizer steps; η is learning rate.",
      "vars": [
        [
          "T_w",
          "warmup steps"
        ],
        [
          "T",
          "total steps"
        ],
        [
          "η_max/min",
          "boundary learning rate"
        ]
      ],
      "intuition": "No hard edge in decay; slope is zero at both ends.",
      "pitfall": "For t<T_w, a separate linear formula applies.",
      "example": "In the middle of the decay, η lies exactly midway between min and max.",
      "check": "Which η applies at t=T?",
      "answer": "At the defined end of the decay t=T, η=η_min. The cosine term reaches its final value there, provided T is used as the last scheduler step and not as a count with different indexing."
    },
    "gradient-clip": {
      "cat": "Optimization",
      "title": "Global Norm Clipping",
      "read": "Scale all gradients together only if their global norm exceeds c.",
      "purpose": "Limits extreme updates without changing gradient direction.",
      "dims": "c has units of gradient norm.",
      "vars": [
        [
          "g",
          "concatenation of all gradients"
        ],
        [
          "c",
          "maximum norm"
        ],
        [
          "ε",
          "stabilization"
        ]
      ],
      "intuition": "A long arrow is shortened, not truncated component-wise.",
      "pitfall": "In mixed precision, unscale first, then clip.",
      "example": "||g||=10, c=1 ⇒ all components ×0.1.",
      "check": "Why does the angle remain the same?",
      "answer": "In global clipping, all gradient entries are multiplied by the same positive factor. This changes only the length of the total vector, while its direction and thus its angle remain unchanged."
    },
    "global-batch": {
      "cat": "Training",
      "title": "Global Batch Size",
      "read": "Microbatch per rank times accumulation steps times world size.",
      "purpose": "Connects data volume per optimizer step with distributed setup.",
      "dims": "Number of sequences; tokens per step additionally ×T.",
      "vars": [
        [
          "B_micro",
          "sequences per forward pass and rank"
        ],
        [
          "G_accum",
          "gradient accumulation"
        ],
        [
          "W",
          "number of data-parallel ranks"
        ]
      ],
      "intuition": "All contributions are merged before a joint update.",
      "pitfall": "With tensor parallelism, not every rank increases the data batch size.",
      "example": "2×8×16=256 sequences globally.",
      "check": "Which parallelism axis belongs in W?",
      "answer": "W includes only data-parallel ranks that process different data examples and aggregate their gradients for a joint update. Pure tensor or pipeline-parallel ranks, however, share the same examples or model and do not automatically increase the global data batch."
    },
    "training-flops": {
      "cat": "Resources",
      "title": "Training Compute",
      "read": "Approximately six FLOPs per parameter and training token.",
      "purpose": "Rough compute and scaling calculation for dense Transformers.",
      "dims": "C in FLOPs, N parameters, D_tokens number of tokens.",
      "vars": [
        [
          "C",
          "total training compute"
        ],
        [
          "N",
          "non-embedding or model parameters per convention"
        ],
        [
          "D_tokens",
          "processed tokens"
        ]
      ],
      "intuition": "Forward roughly 2N, backward roughly double that additionally.",
      "pitfall": "State the convention used for N and any additional Attention costs.",
      "example": "Double tokens ⇒ roughly double compute.",
      "check": "Where does the factor 6 come from roughly?",
      "answer": "For dense matrix weights, the forward pass costs roughly 2 FLOPs per parameter and token. The backward pass computes both activation and parameter gradients and costs approximately another 4, resulting in about 6ND_tokens in total."
    },
    "mfu": {
      "cat": "Resources",
      "title": "MFU (Model FLOPs Utilization)",
      "expr": "MFU = modeled FLOP/s ÷ hardware peak FLOP/s",
      "read": "Divide useful modeled compute rate by theoretical peak rate.",
      "purpose": "Roughly compares end-to-end training efficiency across setups.",
      "dims": "Dimensionless fraction or percentage.",
      "vars": [
        [
          "Model FLOP/s",
          "LM operations per second counted according to convention"
        ],
        [
          "Peak",
          "hardware maximum for matching data type"
        ]
      ],
      "intuition": "How much of the idealized compute ceiling is realized as model work?",
      "pitfall": "Different FLOP conventions or sparsity skew comparisons.",
      "example": "400 TFLOP/s at 1000 peak ⇒ 40% MFU.",
      "check": "Why can a poor data pipeline lower MFU?",
      "answer": "If the data pipeline does not deliver batches in time, the GPU waits and performs no model operations during this time. The measured model FLOP/s decrease, while the theoretical hardware peak remains constant, so Model FLOPs Utilization drops."
    },
    "speedup": {
      "cat": "Systems",
      "title": "Speedup & Scaling Efficiency",
      "read": "Speedup compares runtime; efficiency additionally divides by the number of resources p.",
      "purpose": "Evaluates parallel acceleration.",
      "dims": "Both dimensionless; T in the same time unit.",
      "vars": [
        [
          "p",
          "Devices/Processes"
        ],
        [
          "T₁",
          "Runtime on one resource"
        ],
        [
          "Tₚ",
          "Runtime on p resources"
        ]
      ],
      "intuition": "Linear speedup p means 100% scaling efficiency.",
      "pitfall": "Do not mix up strong and weak scaling.",
      "example": "1 GPU 8s, 4 GPUs 2.5s ⇒ S=3.2,E=80%.",
      "check": "Why can E decrease with p?",
      "answer": "With more resources, communication, synchronization, and scheduling overhead grow, while serial work is not accelerated. As a result, T_p usually decreases slower than 1/p, causing S(p)/p and thus efficiency to drop."
    },
    "arithmetic-intensity": {
      "cat": "GPU",
      "title": "Arithmetic Intensity",
      "expr": "AI = FLOPs / Bytes from slow memory",
      "read": "Useful compute operations per transferred byte.",
      "purpose": "Classifies whether a kernel needs more bandwidth or compute power.",
      "dims": "FLOPs/Byte.",
      "vars": [
        [
          "FLOPs",
          "Operations"
        ],
        [
          "Bytes",
          "Relevant memory traffic, usually HBM"
        ]
      ],
      "intuition": "Reuse data often before sending it back to slow HBM.",
      "pitfall": "The cache level being counted must be specified.",
      "example": "200 FLOPs with 100 Bytes ⇒ AI=2 FLOPs/Byte.",
      "check": "Why does fusion usually increase AI?",
      "answer": "Fusion keeps intermediate values between multiple operations on the chip and avoids writing them to and re-reading from High Bandwidth Memory. With nearly the same compute work, the transferred byte count decreases, thus increasing FLOPs per Byte."
    },
    "roofline": {
      "cat": "GPU",
      "title": "Roofline Limit",
      "read": "Achievable performance is at most the smaller of compute peak and bandwidth roof.",
      "purpose": "Simple bottleneck model for GPU kernels.",
      "dims": "P in FLOP/s; BW Byte/s; AI FLOP/Byte.",
      "vars": [
        [
          "P_peak",
          "Theoretical compute power"
        ],
        [
          "BW",
          "Memory bandwidth"
        ],
        [
          "AI",
          "Arithmetic Intensity"
        ]
      ],
      "intuition": "Left side counts data delivery, right side counts compute units.",
      "pitfall": "A roof is not a guaranteed measured performance.",
      "example": "BW=1 TB/s, AI=10 ⇒ Bandwidth roof 10 TFLOP/s.",
      "check": "How is the Ridge Point calculated?",
      "answer": "At the Ridge Point, the compute roof and bandwidth roof are equal: P_peak=BW·AI. Therefore, AI_ridge=P_peak/BW with the unit FLOPs per Byte."
    },
    "online-softmax": {
      "cat": "GPU",
      "title": "Online Softmax Update",
      "read": "Update running maximum and rescale previous normalization before adding a new block.",
      "purpose": "Enables exact block-wise softmax in FlashAttention.",
      "dims": "m,ℓ scalar per query row; s_j block scores.",
      "vars": [
        [
          "m",
          "Previous maximum"
        ],
        [
          "m_b",
          "Block maximum"
        ],
        [
          "ℓ",
          "Previous exponential sum"
        ],
        [
          "sⱼ",
          "New scores"
        ]
      ],
      "intuition": "If a larger maximum appears, old contributions must be converted to the new scale.",
      "pitfall": "Output accumulator must be rescaled with the same factor.",
      "example": "New maximum +2 ⇒ old exp-sum ×e⁻².",
      "check": "Which two statistics suffice for normalization?",
      "answer": "Per query row, the previous maximum m and the correspondingly scaled exponential sum ℓ suffice. With these two quantities, new blocks can be included stably and correct normalization determined at the end; an output accumulator is additionally maintained for weighted values."
    },
    "memory-state": {
      "cat": "Systems",
      "title": "Training State per Parameter",
      "read": "Add weight, gradient, optional master weight, and two Adam moments.",
      "purpose": "Memory budget and sharding analysis.",
      "dims": "Bytes per parameter × N.",
      "vars": [
        [
          "param",
          "Model weight, often BF16"
        ],
        [
          "grad",
          "Gradient"
        ],
        [
          "master",
          "FP32 copy, setup-dependent"
        ],
        [
          "m,v",
          "FP32 Adam state"
        ]
      ],
      "intuition": "The visible model is only part of the training memory.",
      "pitfall": "Framework details change the exact byte count; activations are additional.",
      "example": "2+2+4+4+4=16 Bytes/parameter in a common mixed-precision model.",
      "check": "Which parts does ZeRO-1/2/3 shard?",
      "answer": "ZeRO-1 shards optimizer states, ZeRO-2 additionally shards gradients, and ZeRO-3 additionally shards model parameters across data parallel ranks. With ZeRO-3, required parameters are temporarily gathered for computation but remain sharded outside these phases."
    },
    "kv-cache": {
      "cat": "Inference",
      "title": "KV Cache Size",
      "read": "Keys plus values for all layers, sequences, positions, and key-value heads.",
      "purpose": "Dominant memory calculation in autoregressive decoding.",
      "dims": "Bytes.",
      "vars": [
        [
          "2",
          "K and V"
        ],
        [
          "L",
          "Layers"
        ],
        [
          "B",
          "Batch"
        ],
        [
          "T",
          "Cached tokens"
        ],
        [
          "H_kv",
          "Number of Key-Value Heads"
        ],
        [
          "d_head",
          "Head width"
        ]
      ],
      "intuition": "Cache grows linearly with context and batch.",
      "pitfall": "With GQA, H_kv is smaller than the number of query heads.",
      "example": "Halve H_kv ⇒ roughly half KV cache.",
      "check": "Why does MQA help especially during decoding?",
      "answer": "Multi-Query Attention uses only one shared key and value head for many query heads, drastically reducing H_kv. During token-by-token decoding, old keys and values must be constantly read from memory, so the smaller cache saves both capacity and memory bandwidth."
    },
    "moe-output": {
      "cat": "Architecture",
      "title": "MoE Output",
      "read": "Mix outputs of selected experts with router weights.",
      "purpose": "Sparse activation of many feed-forward experts.",
      "dims": "Each E_e(x) and y have the same model shape; g_e is scalar per token/expert.",
      "vars": [
        [
          "Eₑ",
          "Expert MLP"
        ],
        [
          "gₑ",
          "Router weight"
        ],
        [
          "TopK",
          "Set of active experts"
        ]
      ],
      "intuition": "Each token uses only a few specialists.",
      "pitfall": "Router weighting and capacity/load-balancing rules are part of the system.",
      "example": "K=2 activates two out of 64 experts.",
      "check": "What scales with total vs. active experts?",
      "answer": "The number of stored parameters and model capacity grow mainly with the total number of experts. Compute work per token and the immediately used expert activations scale primarily with TopK, i.e., the number of actually active experts; communication and load balancing add additional system costs."
    },
    "ring-allreduce": {
      "cat": "Parallelism",
      "title": "Ring All-Reduce Volume",
      "expr": "Bytes per Rank ≈ 2·(W−1)/W · M",
      "read": "Reduce-Scatter plus All-Gather move almost one tensor volume per rank each.",
      "purpose": "Bandwidth model for gradient synchronization.",
      "dims": "Bytes per rank.",
      "vars": [
        [
          "W",
          "World Size"
        ],
        [
          "M",
          "Tensor size in bytes"
        ],
        [
          "2",
          "Two ring phases"
        ]
      ],
      "intuition": "Each rank sends small chunks in a circle, instead of sending everything to a center.",
      "pitfall": "Latency term and duplex/topology details are missing in this approximation.",
      "example": "For large W, the volume approaches 2M.",
      "check": "Why doesn't it grow linearly with W?",
      "answer": "The tensor is split into W chunks, and each rank moves only W−1 chunks of size M/W in each of the two ring phases. The total volume 2(W−1)M/W therefore approaches the constant value 2M for large W, rather than growing linearly with W."
    },
    "pipeline-efficiency": {
      "cat": "Parallelism",
      "title": "Pipeline Bubble (Simplified 1F1B Model)",
      "read": "Microbatches divided by microbatches plus fill/drain overhead.",
      "purpose": "Rough efficiency estimate of a pipeline with p stages.",
      "dims": "Dimensionless ratio.",
      "vars": [
        [
          "m",
          "Microbatches per batch"
        ],
        [
          "p",
          "Pipeline stages"
        ]
      ],
      "intuition": "More microbatches amortize the pipeline filling cost.",
      "pitfall": "Exact schedules, unbalanced stages, and communication change the value.",
      "example": "m=8,p=4 ⇒ E≈8/11≈73%.",
      "check": "What is the cost of very large m?",
      "answer": "Very large m reduces the relative pipeline bubble but generates more scheduling and communication operations. With a fixed global batch, individual microbatches become smaller and may underutilize matrix multiplications; with fixed microbatch size, batch size and latency increase instead."
    },
    "scaling-law": {
      "cat": "Scaling",
      "title": "Chinchilla-style Loss Model",
      "read": "Irreducible loss plus parameter- and data-limited power terms.",
      "purpose": "Models training loss over model size and token count.",
      "dims": "L,E dimensionless (Nats/token); N parameters, D tokens.",
      "vars": [
        [
          "E",
          "Asymptotic loss"
        ],
        [
          "A,B",
          "Scales"
        ],
        [
          "α,β",
          "Positive exponents"
        ],
        [
          "N",
          "Parameters"
        ],
        [
          "D",
          "Tokens"
        ]
      ],
      "intuition": "More model or data helps with diminishing marginal returns.",
      "pitfall": "Empirical fit model; architecture, data, and training recipe must be comparable.",
      "example": "In log-log space, each dominant term yields approximately a straight line.",
      "check": "What happens for N,D→∞?",
      "answer": "For positive exponents, A/N^α and B/D^β vanish as N and D approach infinity. The modeled loss limit is therefore the irreducible term E."
    },
    "isoflops": {
      "cat": "Scaling",
      "title": "IsoFLOPs Condition",
      "read": "With fixed compute, each model size determines the affordable token count.",
      "purpose": "Generates profiles of equal training FLOPs for compute optimality.",
      "dims": "C FLOPs, N parameters, D tokens.",
      "vars": [
        [
          "C",
          "Compute budget"
        ],
        [
          "N",
          "Model parameters"
        ],
        [
          "D",
          "Training tokens"
        ]
      ],
      "intuition": "Larger model sees less data at the same budget.",
      "pitfall": "Valid as a rough dense-transformer approximation, not an accounting of every operation.",
      "example": "Doubling N ⇒ halving D.",
      "check": "Why does a loss minimum typically arise along the profile?",
      "answer": "At very small N, the model is capacity-limited despite many affordable tokens; at very large N, too few training tokens remain due to D=C/(6N). Between these extremes, a compute-optimal compromise with minimal loss typically emerges."
    },
    "logistic": {
      "cat": "Data",
      "title": "Logistic Probability",
      "read": "A linear score function is mapped by sigmoid to 0 to 1.",
      "purpose": "Simple model for quality or language classification.",
      "dims": "x feature vector, w same shape, p dimensionless.",
      "vars": [
        [
          "x",
          "Document features"
        ],
        [
          "w,b",
          "Learned parameters"
        ],
        [
          "σ",
          "Sigmoid"
        ]
      ],
      "intuition": "Large positive scores mean high class probability.",
      "pitfall": "Calibration and threshold are separate questions.",
      "example": "Score 0 ⇒ p=0.5.",
      "check": "What does a stricter threshold change in Precision/Recall?",
      "answer": "A stricter, i.e., higher threshold classifies fewer examples as positive. Recall cannot increase and usually decreases, while precision often increases because weaker positive scores are excluded; however, a precision increase is not guaranteed without assumptions about score quality."
    },
    "precision-recall": {
      "cat": "Evaluation",
      "title": "Precision & Recall",
      "read": "Precision asks: How many of the found items are correct? Recall asks: How many of the correct items were found?",
      "purpose": "Evaluates filters, safety mechanisms, and PII detection.",
      "dims": "Ratios between 0 and 1.",
      "vars": [
        [
          "TP",
          "true positive"
        ],
        [
          "FP",
          "false positive"
        ],
        [
          "FN",
          "false negative (missed positive)"
        ]
      ],
      "intuition": "Stricter filters often increase Precision and decrease Recall—or vice versa, depending on the definition of the positive class.",
      "pitfall": "Explicitly define the positive class; for data filtering, either \"keep\" or \"remove\" can be the positive class.",
      "example": "8 TP, 2 FP, 4 FN ⇒ P=.8, R=.667.",
      "check": "Which error is riskier for PII?",
      "answer": "If \"positive\" means personally identifiable information (PII) is detected and removed, a False Negative is more critical for security: the PII remains undetected in the dataset. A False Positive removes non-problematic data, primarily harming data quantity or quality."
    },
    "jaccard": {
      "cat": "Data",
      "title": "Jaccard Similarity",
      "read": "Intersection divided by union.",
      "purpose": "Similarity of shingle sets for near-deduplication.",
      "dims": "Ratio from 0 to 1.",
      "vars": [
        [
          "A,B",
          "sets of n-gram shingles"
        ]
      ],
      "intuition": "Shared content relative to all unique content.",
      "pitfall": "Sets ignore frequency; normalization and shingle size have a strong influence.",
      "example": "{a,b} and {b,c} ⇒ 1/3.",
      "check": "When is J exactly 1?",
      "answer": "For sets with a non-empty union, J is exactly one if A and B contain the same elements, i.e., A=B. The special case of two empty sets requires an explicit convention because the formula yields 0/0."
    },
    "minhash": {
      "cat": "Data",
      "title": "MinHash Property",
      "read": "The probability of equal MinHash values corresponds to the Jaccard similarity.",
      "purpose": "Estimates set similarity with a compact signature.",
      "dims": "Probability/ratio.",
      "vars": [
        [
          "h_min",
          "minimum under random permutation/hash order"
        ],
        [
          "J",
          "Jaccard"
        ]
      ],
      "intuition": "The smallest element of the union lies in the intersection with probability equal to the Jaccard index.",
      "pitfall": "A single hash function is a very noisy estimator; signatures use many hashes.",
      "example": "100 components, 80 match ⇒ estimator 0.8.",
      "check": "Why do we need independent hash orders?",
      "answer": "Independent hash orders provide approximately independent Bernoulli observations for whether the minima match. Their mean estimates Jaccard with decreasing variance; strongly correlated hash orders would contribute little additional information."
    },
    "lsh": {
      "cat": "Data",
      "title": "LSH Candidate Probability",
      "read": "At least one of b bands must match in all r rows.",
      "purpose": "Makes similar MinHash signatures scalable into candidates.",
      "dims": "s and P between 0 and 1; b, r are integers.",
      "vars": [
        [
          "s",
          "true/estimated similarity"
        ],
        [
          "r",
          "rows per band"
        ],
        [
          "b",
          "number of bands"
        ]
      ],
      "intuition": "AND within a band, OR across bands creates an S-curve.",
      "pitfall": "LSH generates candidates, not final duplicate decisions.",
      "example": "More b increases candidate recall and computational load.",
      "check": "What does a larger r do?",
      "answer": "A larger r requires more matching signature rows within each band, making the candidate condition stricter. For 0<s<1, s^r decreases, thus reducing the candidate probability, which usually lowers recall and the number of candidates, but reduces false positives."
    },
    "accuracy-se": {
      "cat": "Evaluation",
      "title": "Accuracy & Standard Error",
      "read": "Hit rate plus approximate sampling uncertainty.",
      "purpose": "Shows whether small benchmark differences are plausibly measurable.",
      "dims": "Ratios; n is the number of independent tasks.",
      "vars": [
        [
          "k",
          "correct answers"
        ],
        [
          "n",
          "tasks"
        ],
        [
          "SE",
          "standard error"
        ]
      ],
      "intuition": "More examples reduce uncertainty approximately by 1/√n.",
      "pitfall": "Tasks are not always independent; prompt/sampling variance adds additional noise.",
      "example": "Acc=.5, n=100 ⇒ SE≈.05.",
      "check": "How does quadrupling n affect the SE?",
      "answer": "If n is quadrupled, √n grows by a factor of two. The standard error, which is approximately proportional to 1/√n, therefore halves."
    },
    "sft-loss": {
      "cat": "Alignment",
      "title": "SFT Loss with Response Mask",
      "read": "Cross-entropy only over the response tokens marked by m.",
      "purpose": "Supervised Fine-Tuning (SFT) on instruction data.",
      "dims": "Loss is dimensionless; m_t ∈ {0,1}.",
      "vars": [
        [
          "x",
          "prompt"
        ],
        [
          "y",
          "response"
        ],
        [
          "mₜ",
          "loss mask"
        ],
        [
          "πθ",
          "policy/LM"
        ]
      ],
      "intuition": "The prompt provides context; the desired behavior is imitated in the response.",
      "pitfall": "Correctly mask chat template and padding tokens.",
      "example": "Only three response tokens ⇒ denominator 3.",
      "check": "When might one intentionally train on prompt tokens?",
      "answer": "Prompt tokens can be intentionally trained when the goal is not just response imitation, but to model the full conversation format or an entire text sequence. It must then be clearly documented that user and template content are also part of the learning objective."
    },
    "bradley-terry": {
      "cat": "Alignment",
      "title": "Bradley-Terry Preference Model",
      "read": "The sigmoid of the reward difference gives the probability of the observed preference.",
      "purpose": "Trains reward models from answer pairs.",
      "dims": "Rewards are scalar scores; probability is between 0 and 1.",
      "vars": [
        [
          "y⁺",
          "preferred answer"
        ],
        [
          "y⁻",
          "rejected answer"
        ],
        [
          "r",
          "reward model"
        ]
      ],
      "intuition": "Only relative order, not absolute zero point, is identifiable.",
      "pitfall": "Both answers must belong to the same prompt.",
      "example": "Equal rewards ⇒ preference probability .5.",
      "check": "What happens when the same constant is added to both rewards?",
      "answer": "The common constant cancels out completely in (r⁺+c)−(r⁻+c). Therefore, reward difference, sigmoid probability, and Bradley-Terry loss remain unchanged."
    },
    "kl": {
      "cat": "Alignment",
      "title": "KL Divergence",
      "read": "Expected log-probability difference under p.",
      "purpose": "Measures directed distribution deviation, e.g., policy from reference.",
      "dims": "Nats with natural log; non-negative.",
      "vars": [
        [
          "p",
          "first distribution"
        ],
        [
          "q",
          "reference distribution"
        ]
      ],
      "intuition": "Expensive when p places mass where q expects little.",
      "pitfall": "Not symmetric; D_KL(p||q) ≠ D_KL(q||p).",
      "example": "p=q ⇒ KL=0.",
      "check": "Why can KL become infinite?",
      "answer": "KL(p||q) becomes infinite if there is an event with p(x)>0 but q(x)=0. Then the sum contains the positively weighted term log(p(x)/0)=+∞."
    },
    "rlhf-objective": {
      "cat": "Alignment",
      "title": "KL-Regularized RLHF Objective",
      "read": "Maximize expected reward, but penalize deviation from the reference policy.",
      "purpose": "Controls reward optimization and language distribution drift.",
      "dims": "Reward and β·KL must have compatible scales.",
      "vars": [
        [
          "π",
          "trained policy"
        ],
        [
          "π_ref",
          "fixed reference"
        ],
        [
          "r",
          "reward"
        ],
        [
          "β",
          "KL strength"
        ]
      ],
      "intuition": "Reward pulls, reference holds fixed.",
      "pitfall": "β is setup-dependent; same value is not universal.",
      "example": "Large β ⇒ more conservative policy.",
      "check": "Which risk increases with too small β?",
      "answer": "With too small β, the binding to the reference policy is weak, allowing the policy to aggressively exploit the reward proxy. This increases risks such as reward hacking, loss of language quality, mode collapse, and strong distributional drift."
    },
    "dpo": {
      "cat": "Alignment",
      "title": "DPO Loss",
      "read": "Rank the preferred response above the rejected response using their policy-to-reference log-ratios.",
      "purpose": "Direct Preference Optimization (DPO) without separate on-policy RL loop.",
      "dims": "Sequence log-probabilities and loss are dimensionless.",
      "vars": [
        [
          "y⁺/y⁻",
          "chosen/rejected"
        ],
        [
          "πθ",
          "trained policy"
        ],
        [
          "π_ref",
          "fixed reference"
        ],
        [
          "β",
          "scaling"
        ]
      ],
      "intuition": "Improve relative preference compared to the base model.",
      "pitfall": "Aggregate log-probabilities over exactly the same answer tokens.",
      "example": "If the DPO logit is 0, loss=log 2.",
      "check": "Why are πθ log-probs alone not enough for this form?",
      "answer": "The reference log-probabilities measure how strongly the trained policy reorders the preferred against the rejected answer relative to the base model. Without them, exactly this KL-related comparison basis is missing; what would remain is a different pairwise policy objective, not the specified DPO loss."
    },
    "expected-reward": {
      "cat": "RL",
      "title": "Expected Reward",
      "read": "Average reward over prompts and answers sampled by the policy.",
      "purpose": "Basic objective of RLVR and policy gradient methods.",
      "dims": "Unit of the reward.",
      "vars": [
        [
          "ρ",
          "prompt distribution"
        ],
        [
          "πθ",
          "policy"
        ],
        [
          "R",
          "outcome reward"
        ]
      ],
      "intuition": "The policy determines its own training answers.",
      "pitfall": "A small static sample set is not the same expected value after policy updates.",
      "example": "Binary verifier reward ⇒ J is success rate of rollouts.",
      "check": "Over which two random sources is averaging done?",
      "answer": "Averaging is first over prompts x from the prompt distribution ρ and then over answers y sampled from the policy πθ(.|x). The random token decisions of an answer are contained in the random variable y."
    },
    "policy-gradient": {
      "cat": "RL",
      "title": "Policy Gradient",
      "read": "Weight the log-policy gradient of a sampled answer with its reward.",
      "purpose": "Unbiased sample gradient for non-differentiable reward.",
      "dims": "Same parameter shape as θ.",
      "vars": [
        [
          "J",
          "expected reward"
        ],
        [
          "R",
          "sampleable reward"
        ],
        [
          "πθ",
          "policy"
        ],
        [
          "∇θ logπ",
          "score function"
        ]
      ],
      "intuition": "Make rewarded samples more likely.",
      "pitfall": "High variance; in practice use advantage instead of raw reward.",
      "example": "R=0 yields no update in the naive binary variant.",
      "check": "Where is ∇π=π∇logπ used?",
      "answer": "Start with ∇J=Σ p(x)∇πθ(y|x)R(x,y) and replace ∇πθ with πθ∇logπθ. The resulting factor πθ turns the sum back into an expectation over responses sampled from the policy."
    },
    "advantage": {
      "cat": "RL",
      "title": "Advantage & Baseline",
      "read": "Compare the reward of a response with an expected baseline for the prompt.",
      "purpose": "Reduces policy gradient variance and provides a relative signal.",
      "dims": "Same unit as reward.",
      "vars": [
        [
          "R",
          "observed reward"
        ],
        [
          "b(x)",
          "action-independent baseline"
        ],
        [
          "A",
          "relative advantage"
        ]
      ],
      "intuition": "A 9 can be bad if 10 is normal for this prompt.",
      "pitfall": "The baseline must not depend on the sampled action to remain unbiased.",
      "example": "R=9, b=10 ⇒ A=−1.",
      "check": "Why does subtracting b not change the expected gradient?",
      "answer": "Since b(x) does not depend on the sampled response, E_y[b(x)∇logπθ(y|x)] = b(x)∇Σ_yπθ(y|x) = b(x)∇1 = 0. Thus, subtraction does not change the expected gradient but can reduce its variance."
    },
    "grpo-advantage": {
      "cat": "RL",
      "title": "GRPO Group Normalization",
      "read": "Center and scale rewards of multiple responses to the same prompt.",
      "purpose": "Group Relative Policy Optimization (GRPO) without a learned value model.",
      "dims": "A is dimensionless, R is any reward scale.",
      "vars": [
        [
          "G",
          "responses per prompt"
        ],
        [
          "Rᵢ",
          "reward of response i"
        ],
        [
          "ε",
          "protection against zero group std"
        ]
      ],
      "intuition": "Compares within the same task difficulty.",
      "pitfall": "Std normalization reweights groups by reward spread and is an algorithmic choice.",
      "example": "Rewards [0,1] ⇒ centered advantages with opposite signs.",
      "check": "What happens with [1,1,1]?",
      "answer": "For rewards [1,1,1], the group mean is one and each centered advantage is zero, so there is no relative learning signal. The standard deviation is also zero and must be safeguarded by ε or a defined special case during normalization."
    },
    "importance-ratio": {
      "cat": "RL",
      "title": "Importance Ratio",
      "read": "How much more likely is the stored action under the new policy compared to the rollout policy?",
      "purpose": "Corrects off-policy distribution shift.",
      "dims": "Positive dimensionless factor.",
      "vars": [
        [
          "π_old",
          "policy at sampling"
        ],
        [
          "πθ",
          "current policy"
        ],
        [
          "aₜ,sₜ",
          "token action and state"
        ]
      ],
      "intuition": "Samples that the new policy would generate more frequently receive higher weight.",
      "pitfall": "Compute the log-probability difference in log space and exponentiate only afterward; large ratios have high variance.",
      "example": "Same policies ⇒ ρ=1.",
      "check": "Why must old log probabilities be stored?",
      "answer": "The importance ratio needs the denominator probability under exactly the policy that generated the sample. After an update, that probability cannot be reconstructed from the new policy; recomputing the supposedly ‘old’ log probabilities with the new policy would produce an incorrect ratio, potentially exactly 1."
    },
    "ppo-clip": {
      "cat": "RL",
      "title": "PPO Clipped Surrogate",
      "read": "Use the more pessimistic of free and clipped ratio updates.",
      "purpose": "Proximal Policy Optimization (PPO) limits harmful large policy changes on old rollouts.",
      "dims": "The loss has the same units as the reward/advantage.",
      "vars": [
        [
          "ρ",
          "importance ratio"
        ],
        [
          "A",
          "advantage"
        ],
        [
          "ε",
          "clip range"
        ]
      ],
      "intuition": "Improvements beyond the trust region are not further rewarded.",
      "pitfall": "Sign of A determines which ratio side is clipped.",
      "example": "A>0 and ρ>1+ε ⇒ term capped at 1+ε.",
      "check": "What happens with negative A and very small ρ?",
      "answer": "For A<0 and ρ<1−ε, the minimum selects the clipped term (1−ε)A because the negative sign reverses magnitude. Further decreasing the probability of this bad action is thus not additionally rewarded and provides no further gradient incentive in this region."
    }
  },
  "formulaRefs": {
    "matmul": "A1 p. 17–18",
    "rmsnorm": "A1 p. 19–20 · L3 p. 14",
    "swiglu": "A1 p. 21–22 · L3 p. 18, 21–23",
    "rope": "A1 p. 22–23 · L3 p. 30–34",
    "softmax": "A1 p. 23–24 · L6 p. 33–34",
    "attention": "A1 p. 24",
    "causal_attention": "A1 p. 24–26",
    "residual": "A1 p. 42–43",
    "cross_entropy": "A1 p. 28–29",
    "perplexity": "L12 p. 6",
    "adamw": "A1 p. 31–32",
    "cosine_lr": "A1 p. 33–34",
    "gradient_clip": "A1 p. 33–34",
    "training_flops": "L2 p. 2, 9–11 · A3 p. 2",
    "online_softmax": "A2 p. 24–25 · L5 p. 46–50",
    "roofline": "L5 p. 20 · L6 p. 3",
    "mfu": "L2 p. 10",
    "ring_allreduce": "A2 p. 40",
    "pipeline_efficiency": "L7 p. 31",
    "transformer_params": "A3 p. 8",
    "isoflops": "A3 p. 2",
    "jaccard": "A4 p. 10–11",
    "minhash": "A4 p. 10",
    "lsh": "A4 p. 11 (candidate formula derived)",
    "expected_reward": "A5 p. 7, 9",
    "policy_gradient": "A5 p. 9–10",
    "advantage": "A5 p. 10 · L17 p. 2–3",
    "grpo_advantage": "A5 p. 11–13 · L16 p. 30–36",
    "importance_ratio": "A5 p. 32–34",
    "ppo_clip": "A5 p. 34–35",
    "bradley_terry": "A5 Supplement p. 15",
    "dpo": "A5 Supplement p. 15–17 · L15 p. 55–58"
  },
  "assignments": {
    "a1": {
      "title": "Basics - Building a Transformer LM",
      "stage": "Foundation → working LM",
      "goal": "Build the complete stack yourself, from a reversible byte Tokenizer through training, Checkpointing, and generation. LM means Language Model.",
      "prereqs": [
        "Python bytes/str, iterators, Counter, Regex, and file I/O",
        "Tensor shapes, Broadcasting, Views, Autograd, Modules, and state_dict",
        "Matrix multiplication/Einsum, logarithms, Softmax, and the Chain Rule"
      ],
      "models": [
        "Tokenizer = a reversible Codec with a learned compression vocabulary, not a dictionary of meanings.",
        "Every Neural Network operation is a shape contract; name the axes before implementing it.",
        "Training is a State Machine: data → logits → Loss → gradient → Clip → AdamW → Schedule → Checkpoint."
      ],
      "milestones": [
        "Explain Unicode/UTF-8 and BPE by hand on a tiny corpus",
        "Test primitive Modules individually with a Shape Ledger and hand-computable tests",
        "Assemble the Block and LM; sanity-check parameters/FLOPs/memory",
        "Connect Loss, AdamW, Schedule, Clipping, Data Loader, and Checkpoint into a Loop",
        "Reliably overfit a tiny Batch, verify Save/Reload, and only then move to TinyStories",
        "Run controlled experiments: change only one variable at a time"
      ],
      "checks": [
        "Why can UTF-8 bytes not be decoded one at a time?",
        "What shapes do Q, K, V, and the scores have before and after the Head split?",
        "Why is masking applied before Softmax, and why divide by √dₖ?",
        "Which states belong in a reproducible Checkpoint?"
      ],
      "hints": [
        "State the input, output, axes, and invariant for a 1–3-token example.",
        "Decompose the system until the first stage where reversibility, shape, or probability normalization is violated.",
        "Build a hand-computable test and compare one Module at a time—do not wait for the total Loss."
      ],
      "pitfalls": [
        "Unicode character = byte",
        "Merge order does not matter",
        "Masking with 0",
        "backward() updates parameters",
        "Comparing Perplexity directly across Tokenizers"
      ],
      "done": [
        "Primitive tests pass",
        "BPE round trip, including Unicode/Special Tokens",
        "Shapes documented",
        "Tiny Batch overfit",
        "Save/Reload produces identical logits and resumes correctly",
        "Experiment log containing configuration, seed, tokens, and learning curve"
      ],
      "checkAnswers": [
        "UTF-8 encodes a Unicode Code Point using one to four bytes depending on the character. A single continuation byte does not contain enough information and is often not a valid UTF-8 sequence by itself; decoding is valid only after the complete byte sequence has been assembled.",
        "From an input X with shape [B,T,D], Q, K, and V initially each have shape [B,T,D] when D=H·d_head. During the Head split, D is divided into H parallel Attention Heads—separate Attention subspaces—and usually rearranged into [B,H,T,d_head]. The product QKᵀ sums over d_head and produces scores of shape [B,H,T,T].",
        "The mask must act before Softmax so that forbidden future positions receive a score of negative infinity and therefore exactly zero weight, while the allowed positions are still normalized to sum to one. Dividing by √d_k keeps the typical magnitude of Query-Key dot products stable as Head width grows and prevents Softmax from saturating too early.",
        "A reproducible Checkpoint contains at least model parameters, Optimizer state including moments and step counters, and Learning-Rate Scheduler state. It should additionally include training progress and data position, random states for CPU, GPU, and the data pipeline, and the Mixed-Precision Scaler when applicable. The relevant configuration and data and software versions must also be known; otherwise, the same numerical state cannot be resumed reliably."
      ]
    },
    "a2": {
      "title": "Systems - Profiling & Parallelism",
      "stage": "Correct → measurably efficient",
      "goal": "Learn Single-GPU and Multi-GPU training through reliable measurement, IO-aware Kernels, and explicit state ownership.",
      "prereqs": [
        "Ability to explain the A1 model confidently",
        "Asynchronous GPU timing, the memory hierarchy, and FLOPs/bytes",
        "FP32, FP16, BF16, and Autograd Saved Tensors",
        "Rank, World Size, and Collective Communication"
      ],
      "models": [
        "Performance work: classify the bottleneck → measure → change one hypothesis.",
        "FlashAttention is exact Attention using Tiling, Online Softmax, and Recomputation—not an approximation.",
        "Distributed training = an ownership table plus a Timeline: Who owns which tensor at what time?"
      ],
      "milestones": [
        "Create a theoretical FLOP/byte/memory worksheet",
        "Benchmark with Warmup, synchronization, and variability; then use a Profiler",
        "Measure Mixed Precision and Activation Checkpointing separately",
        "Cover Triton foundations, Flash Forward/Backward, and edge cases",
        "Run a Collective Microbenchmark, DDP, Overlap, Optimizer Sharding, and FSDP",
        "Build cost models for DP/FSDP/TP/2D with units"
      ],
      "checks": [
        "Why does GPU timing require synchronization?",
        "Compute-bound or memory-bound: what evidence supports the classification?",
        "Which states are sufficient for Online Softmax?",
        "What is sharded per Rank before, during, and after FSDP computation?"
      ],
      "hints": [
        "Is the problem correctness, memory, compute, communication, or measurement?",
        "Draw the shape, bytes, owner, and Timeline of every dominant tensor.",
        "Reduce to two Ranks and small non-square shapes; instrument each event exactly once."
      ],
      "pitfalls": [
        "Measuring without Warmup",
        "BF16 automatically halves Peak memory",
        "FlashAttention is approximate",
        "async_op is complete when the call returns",
        "DDP reduces parameters",
        "FSDP remains fully sharded during computation"
      ],
      "done": [
        "Reproducible timing statistics",
        "Theoretical and measured memory are plausible",
        "Flash implementation is correct across shapes, masks, and gradients",
        "Profiler supports the claimed Speedup/Overlap",
        "Distributed tests repeatedly pass without races",
        "Ownership and accounting are correct"
      ],
      "checkAnswers": [
        "GPU operations are usually launched asynchronously: the CPU regains control before the Kernel has finished on the GPU. Without synchronization, a CPU Timer therefore measures mainly the short launch time; an appropriate barrier or GPU timing method must ensure that the measured work has actually completed.",
        "The classification requires measurements relative to hardware limits: attained FLOP/s, attained memory bandwidth, and Arithmetic Intensity—the number of operations per transferred byte. If performance is near the bandwidth ceiling of the Roofline model and improves when memory traffic falls, the Kernel is memory-bound; if it is near the Compute Peak and responds mainly to fewer arithmetic operations, it is compute-bound. A Profiler should support the hypothesis with Kernel times and memory transfers.",
        "Online Softmax needs a running maximum m for each Query row and a running exponential sum ℓ expressed relative to that maximum. If a new Block changes m, earlier contributions are rescaled to the new reference; producing the complete Attention result additionally requires a Value accumulator that is rescaled in the same way.",
        "With Fully Sharded Data Parallel (FSDP), parameters, gradients, and Optimizer states are generally present on every Rank only as a Shard between compute phases. For the Forward Pass and the necessary part of the Backward Pass, one Layer's parameters are temporarily reconstructed in full through All-Gather. They are then released or resharded, and gradients are distributed to their owners through Reduce-Scatter, returning the persistent state to a sharded form."
      ]
    },
    "a3": {
      "title": "Scaling Laws",
      "stage": "Runs → robust decision",
      "goal": "Use a limited experiment budget to predict a compute-optimal target configuration together with its uncertainty.",
      "prereqs": [
        "Log-Log transformation and Power Laws",
        "Regression, residuals, uncertainty, and Holdout",
        "Parameter/FLOP accounting and experimental confounders"
      ],
      "models": [
        "Scaling Law = an empirical decision model, not a law of nature.",
        "IsoFLOPs trades model size against token count at constant compute; both extremes are poor.",
        "The small budget is an Active Experimental Design for the large decision."
      ],
      "milestones": [
        "Reproduce synthetic IsoFLOPs data",
        "Check valid architectures, runtimes, and the budget ledger in advance",
        "Plan geometric compute tiers and the Run Matrix",
        "Bracket the minimum on both sides within each tier",
        "Fit the Lower Envelope; inspect residuals and Leave-One-Tier-Out predictions",
        "Justify the final configuration with sensitivity and an uncertainty range"
      ],
      "checks": [
        "Derive D=C/(6N).",
        "Does every optimum truly lie inside the measured size range?",
        "Which tuning decision could distort the exponent?",
        "How sensitive is the final prediction to the choice of Fit?"
      ],
      "hints": [
        "Plot the raw data and Log-Log view; mark only the best completed Run for each compute tier.",
        "Check whether every minimum is bracketed or lies at the edge of the search range.",
        "Leave out one tier at a time, predict it, and vary both the Fit form and data selection."
      ],
      "pitfalls": [
        "Putting every Run into the optimum Fit",
        "A high R² proves extrapolation",
        "Treating a partial Loss as a finished Run",
        "Treating 6ND as exact",
        "Blindly rounding a continuous estimate to a discrete architecture"
      ],
      "done": [
        "Budget ledger contains no duplicates",
        "Optima are bracketed",
        "Fit, residuals, Holdout, and sensitivity are documented",
        "Target satisfies API constraints",
        "Predicted Loss includes uncertainty",
        "Method is reproducible"
      ],
      "checkAnswers": [
        "For a dense Transformer, training compute is roughly approximated as C≈6ND, with N parameters and D processed tokens. Holding C fixed and dividing both sides by 6N directly gives D=C/(6N); the relationship is a planning approximation, not an exact count of every operation.",
        "A measured optimum is truly bracketed only when it lies inside the tested size range and larger Loss values were observed on both sides. If the best Run is the smallest or largest measurement, it reveals only a boundary minimum; the true optimum may lie outside the search range.",
        "Uneven Learning-Rate tuning can distort the estimated Scaling exponent: if large models are tuned carefully while small models use an unsuitable fixed Learning Rate, the value of adding parameters appears too large. Systematically changing the architecture or training recipe with size is similarly problematic because the Fit then attributes several effects to Scaling.",
        "The final prediction is robust when plausible Fit variants, data selections, and Leave-One-Tier-Out tests produce similar target values for N, D, and Loss. If these values move substantially, the claim depends on a small number of modeling choices and must be reported as sensitive with a correspondingly wide uncertainty range. Without the concrete Runs, this sensitivity cannot be expressed as one number."
      ]
    },
    "a4": {
      "title": "Data - Filtering & Deduplication",
      "stage": "Raw Web → auditable corpus",
      "goal": "Build a traceable data pipeline whose filtering effects and downstream value can be measured.",
      "prereqs": [
        "Streaming, Encoding, HTML, and Regex boundaries",
        "Precision/Recall, Confusion Matrix, and thresholds",
        "Sets, Hashing, Jaccard, and MinHash/LSH",
        "Multiprocessing, seeds, and Data Lineage"
      ],
      "models": [
        "Every filter shifts the later model distribution.",
        "Classifier score + threshold is a Policy with asymmetric error costs.",
        "Near-Deduplication is Retrieval plus Verification: signature → candidates → true comparison → cluster."
      ],
      "milestones": [
        "Manually annotate a small raw sample with a Rubric",
        "Audit HTML, language, and PII with adversarial examples",
        "Calibrate harm/quality rules and a Classifier using a labeled sample",
        "Validate Exact Deduplication and MinHash/LSH on toy sets",
        "Log stage-wise counts, Reason Codes, IDs, and rejected samples",
        "Tokenize, check Leakage, and compare under a fixed model budget"
      ],
      "checks": [
        "Which PII False Positives occur in code?",
        "How do more LSH Bands affect Recall and cost?",
        "Why must candidates be verified exactly?",
        "How does filter order affect cost and distribution?"
      ],
      "hints": [
        "Preserve the raw ID and Reason Code; inspect retained and rejected documents together.",
        "Build a small manually labeled Audit set and a Confusion Matrix for each stage.",
        "Compare variants at the same token and training budget on the target validation set."
      ],
      "pitfalls": [
        "Classifier score = truth",
        "Regex detects PII completely",
        "An LSH Bucket proves duplication",
        "Deleting every cluster member",
        "Reporting only total yield instead of stage counts",
        "Copying validation data into the corpus"
      ],
      "done": [
        "Primitive tests and Audit sets",
        "Deterministic pipeline",
        "Reason Codes and stage counts",
        "LSH candidates verified and clusters are transitive",
        "Retained/rejected documents explained manually",
        "No validation Leakage",
        "Fixed-budget training with a data-related conclusion"
      ],
      "checkAnswers": [
        "In source code, email-like placeholders, IP addresses for local tests, UUIDs, version numbers, or long numeric IDs often resemble Personally Identifiable Information (PII). Documentation examples and test data can also intentionally contain telephone numbers or addresses without referring to a real person. A purely syntactic filter flags such cases as False Positives and can therefore damage useful code.",
        "At a fixed signature length, more Bands in Locality-Sensitive Hashing (LSH) mean that each Band contains fewer Rows and can match completely more easily. This raises the probability of finding a similar pair as a candidate, increasing Recall. At the same time, it creates more candidates and False Positives, so memory use, comparisons, and total cost rise while Precision typically falls.",
        "LSH is a probabilistic Retrieval step and deliberately also produces collisions between pairs below the desired similarity threshold. Only a precise comparison—such as the true Jaccard similarity of normalized Shingle sets—determines whether a candidate pair should count as a duplicate. Without this Verification, random Bucket matches would distort entire clusters and deletion decisions.",
        "Early, inexpensive filters can greatly reduce data volume and therefore accelerate costly later Classifiers or Deduplication. Their order also changes the distribution seen by later stages, however, and a document rejected early can no longer be classified or clustered correctly later. Filters are therefore not generally interchangeable, and stage counts and rejection reasons must be audited for each ordering."
      ]
    },
    "a5": {
      "title": "Alignment & RL",
      "stage": "Understand stochastic estimators",
      "goal": "Understand Prompting, SFT, DPO, Policy Gradient, GRPO, and Off-Policy methods as measurable learning systems—not as a magical RL Loop.",
      "prereqs": [
        "Expectation, variance, and conditional probability",
        "Sequence Log-Probability and Sampling",
        "Padding/response masks and Gradient Accumulation",
        "Evaluation across multiple seeds"
      ],
      "models": [
        "Policy Gradient is Log-Likelihood training weighted by self-generated samples.",
        "Baselines reduce variance; group and length normalization can reweight the objective.",
        "Off-Policy Ratios correct a distribution at the cost of variance; Clipping trades Bias for stability."
      ],
      "milestones": [
        "Establish Prompting Baselines with a Parser/format Audit",
        "Derive REINFORCE and a Baseline on the binary toy problem",
        "Test masks, Log-Probabilities, Rewards, group Advantages, and aggregation individually",
        "Verify one On-Policy GRPO Step end to end, including gradient direction",
        "Compare variants under controlled conditions and across multiple seeds",
        "Audit old/new Policy, Ratios, Clipping, and Clip Fraction",
        "Optional and separate: Zero-Shot → SFT → Preference Data → DPO → Alignment Tax"
      ],
      "checks": [
        "Why not Backpropagate directly through sampled tokens?",
        "When does a Baseline remain unbiased?",
        "What happens when all group Rewards are identical?",
        "Reward rises while Entropy falls: success or collapse?"
      ],
      "hints": [
        "For every tensor, record its shape, mask, Policy version, and intended gradient direction.",
        "Reduce to B=1, G=2, and a few tokens; calculate Advantage, Ratios, and Loss direction by hand.",
        "Log Reward, format, Entropy, length, gradient norm, KL, Ratio, and Clip Fraction; identify the first metric that turns."
      ],
      "pitfalls": [
        "RL = SFT on correct samples",
        "Every Baseline is unbiased",
        "Normalization is neutral",
        "More Off-Policy updates are free",
        "Reward proves Reasoning",
        "One seed is enough",
        "DPO requires Online Rollouts"
      ],
      "done": [
        "Baselines and Parser Audit",
        "Toy derivations",
        "Mask/Log-Probability/Reward/Loss tests",
        "Stable On-Policy Step with correct gradient direction",
        "Complete Logging",
        "Fair Multi-Seed comparisons",
        "Old and new Policy clearly separated",
        "Failure cases and variability reported"
      ],
      "checkAnswers": [
        "Sampling a token index is a discrete choice and does not change smoothly under small changes to the logits, so there is no ordinary differentiable path from the sampled index to the Reward. Policy Gradient—the gradient method for a stochastic Policy—works around this with the Log-Derivative Trick and weights the gradient of the sampled trajectory's Log-Probability by its Reward or Advantage.",
        "A Baseline remains unbiased in the usual Policy-Gradient estimator when, for a given state or Prompt, it does not depend on the action or response that was just sampled. Its expected contribution b(x)·E[∇log π(y|x)] is then zero because probabilities across all responses sum to one. It may therefore depend on the Prompt and be learned, but it must be treated as an action-independent comparison value during the Policy update.",
        "If every Reward in a Prompt group is identical, each Reward equals the group mean and every centered Advantage becomes zero. The group standard deviation is also zero and must be handled safely in the implementation; conceptually, there is still no relative signal that favors one response over its siblings.",
        "Rising Reward alongside falling Entropy is neither proof of success nor certain collapse by itself. It can reflect desirable concentration on better responses if held-out evaluation, true correctness, and format quality improve with it; it can also indicate Reward Hacking or Mode Collapse if diversity, language quality, or generalization deteriorate. Distinguishing them requires, among other evidence, validation Reward, response length, KL Divergence from the Reference, qualitative failure cases, and multiple seeds."
      ]
    }
  },
  "labs": {
    "shapes": {
      "title": "Tensor Shape Tracer",
      "desc": "Trace B, T, D, and H through Embedding, QKV, Attention, and Output.",
      "mental": "Token IDs are initially just integers. A learned Embedding table replaces each ID with a vector; the resulting activation tensor is conventionally called X and contains one D-dimensional vector for every token.",
      "formula": "X = E_vocab[token_ids]  →  Q = XW_Q, K = XW_K, V = XW_V  →  d_head = D/H  →  S_raw = QKᵀ/√d_head  →  L = S_raw + M  →  A = softmax(L)  →  Y = Concat(AV)W_O",
      "symbols": [["B","Batch size: how many sequences are processed together."],["T","Number of token positions in each sequence."],["D","Model dimension: features per token in the Residual Stream."],["H","Number of parallel Attention Heads."],["d_head","Features per Head; d_head = D/H."],["V_vocab","Number of entries in the Embedding table; do not confuse it with the Value tensor V."],["X","Activations after the Embedding; not a weight matrix."],["S_raw, L, A","Raw Dot-Product scores, masked logits, and the weights produced from them by Softmax."]],
      "observe": "Change only T first. Before moving it, predict where T appears in each Shape and why it occurs twice in the score matrix.",
      "misconception": "H does not create H full copies of model dimension D. D is split across H Heads with d_head = D/H features each.",
      "transferQuestion": "Which shapes change when only the sequence length doubles, and which parameter counts stay the same?",
      "transferAnswer": "If only T doubles, activations like B×T×D as well as Q, K, and V with B×H×T×d_head become twice as long along the sequence axis. In contrast, attention scores with B×H×T×T contain four times as many elements because both position axes grow. Parameter counts like V_vocab×D for the Embedding or D×D_out for weight matrices remain unchanged, as trainable matrices do not depend on the length of a specific input sequence."
    },
    "bpe": {
      "title": "BPE Merge Game",
      "desc": "Observe pair counting, deterministic merges, and vocabulary growth.",
      "mental": "Byte-Pair Encoding (BPE) starts from small symbols, counts adjacent pairs across the entire corpus, and replaces the most frequent pair everywhere with a new symbol. This simplified lab operates on Unicode characters, not yet on UTF-8 bytes.",
      "formula": "p* = argmax_p count(p)  →  corpus = replace_non_overlapping(corpus, p*)  →  vocabulary = vocabulary ∪ {merge(p*)}",
      "symbols": [["p","An adjacent symbol pair."],["count(p)","The frequency of that pair across the complete mini-corpus."],["p*","The most frequent pair selected for the next merge."],["V","Vocabulary: all currently available symbols and merge results."]],
      "observe": "Before each merge, identify the pair that is most frequent across the corpus and predict how many tokens its non-overlapping replacement will remove.",
      "misconception": "The most frequent word is not merged. Each step selects exactly one adjacent pair and replaces all of its non-overlapping occurrences.",
      "transferQuestion": "How does a larger vocabulary affect sequence length, embedding cost, and low-resource languages?",
      "transferAnswer": "A larger Byte-Pair Encoding vocabulary usually contains longer learned subwords and can therefore represent the same text with fewer tokens. However, the embedding matrix grows proportionally to V×D; without weight tying, an output matrix also growing with V is added. Rare or data-scarce languages only benefit if their patterns occur frequently enough in the merge data; otherwise, they remain highly fragmented despite the larger overall vocabulary."
    },
    "attention": {
      "title": "Attention Matrix",
      "desc": "Change temperature, query, and causal mask; explain the weight shift.",
      "mental": "A Query describes what a token position is looking for, Keys describe what positions offer, and Values carry the information that is eventually mixed. Each Query therefore forms its own distribution over all allowed Keys.",
      "formula": "S_raw,ij = q_i·k_j/√d_head  →  L_ij = (S_raw,ij + M_ij)/τ  →  A_i = softmax(L_i over j)  →  z_i = Σ_j A_ijv_j",
      "symbols": [["i, j","Query position i and Key/Value position j."],["q, k, v","Query, Key, and Value vectors in one Attention Head."],["S_raw, L","Raw Dot-Product scores and the logits passed into Softmax after mask and temperature."],["M","Causal mask; forbidden future positions receive −∞."],["τ","Temperature: values below 1 sharpen differences."],["A_ij","Attention weight from Query i to position j; each allowed row sums to 1."]],
      "observe": "Change the Query, temperature, and mask one at a time. Explain whether raw scores, allowed positions, or only the Softmax distribution changed.",
      "misconception": "Softmax does not run over Query rows. For every Query i, it normalizes across Key columns j; Values determine the content afterward, not the scores.",
      "transferQuestion": "Construct a score vector for which temperature has almost no effect. Why?",
      "transferAnswer": "An example is the score vector [2, 2, 2] over three allowed key positions. By dividing by any positive temperature, all three values remain equal, so Softmax always yields [1/3, 1/3, 1/3]. Temperature only modifies differences between scores; with identical scores, there are no differences to amplify or dampen."
    },
    "optimizer": {
      "title": "Learning Rate & AdamW",
      "desc": "Examine Warmup/Cosine and a scalar AdamW update path.",
      "mental": "The learning-rate schedule sets the global step size. Adam adapts the gradient step using running moments; AdamW applies Weight Decay separately and directly to the parameters.",
      "formula": "θ_t = (1 − η_tλ)θ_{t−1} − η_t m̂_t/(√v̂_t + ε)",
      "symbols": [["θ","A trainable parameter."],["η_t","Learning Rate at Optimizer step t."],["λ","Weight-Decay strength."],["m̂_t, v̂_t","Bias-corrected first and second gradient moments."],["ε","Small constant for numerical stability."]],
      "observe": "Change only the step, warmup, gradient, or Weight Decay at a time. Separate the effect of the schedule from the adaptive gradient step and the Decay term.",
      "misconception": "The simplified first step does not describe later AdamW steps, whose moments contain training history. Weight Decay is also decoupled from the adaptive gradient term.",
      "transferQuestion": "What must be saved alongside the optimizer so the learning-rate schedule resumes correctly?",
      "transferAnswer": "Alongside the model and optimizer, at least the global optimizer step or the full scheduler state must be saved. The warmup or cosine schedule calculates the current learning rate from exactly this progress and cannot reliably derive it from the AdamW moments. With gradient accumulation, the actual parameter update step counts, not the number of microbatches read."
    },
    "resources": {
      "title": "Parameter, Memory & Compute Calculator",
      "desc": "Estimate model size, mixed training state, naively materialized Attention scores, and training time.",
      "mental": "Parameters, persistent training state, activations, and compute are separate budgets. Back-of-the-envelope calculations check orders of magnitude; they do not replace measuring the concrete model and Framework.",
      "formula": "N ≈ 12L·D_model² + V_vocab·D_model  ·  mixed training state ≈ 16N bytes  ·  C_train ≈ 6N·D_tokens  ·  naive full scores = B·H·L·T²",
      "symbols": [["L","Number of Transformer Layers."],["D_model","Model dimension or width."],["V_vocab","Vocabulary size."],["N","Number of trainable parameters; the displayed formula assumes Weight Tying."],["D_tokens","Total number of training tokens; not the model dimension."],["16N bytes","Example total mixed-precision training state: parameters, gradients, an FP32 master copy, and two Adam moments."],["B, H, T","Batch size, number of Heads, and context length."]],
      "observe": "Double L, D_model, V, and T one at a time. Check which terms respond linearly, quadratically, or not at all.",
      "misconception": "16N bytes is neither just AdamW Optimizer state nor total GPU memory. It describes one mixed-precision assumption; activations, temporary buffers, and communication are additional.",
      "transferQuestion": "Which assumption behind this approximation breaks for Mixture of Experts or very long contexts?",
      "transferAnswer": "The approximation essentially assumes a dense transformer where total parameters and active parameters per token largely coincide. With Mixture of Experts, only a few experts are activated per token, so total parameters, active compute work, routing, and communication must be calculated separately. For very long contexts, the quadratic T×T attention terms and their activations become so significant that the rough calculation 6ND or a purely parameter-based memory estimate is no longer sufficient."
    },
    "roofline": {
      "title": "GPU Roofline Explorer",
      "desc": "Find the ridge point and classify a kernel as memory- or compute-bound.",
      "mental": "A Kernel can run only as fast as both the compute units and data transfer allow. The lower of those two limits is the current performance roof.",
      "formula": "P_attainable = min(P_peak, BW_HBM·AI)  ·  AI = FLOPs/HBM bytes transferred  ·  AI_ridge = P_peak/BW_HBM",
      "symbols": [["P_attainable","Upper bound on attainable compute throughput."],["P_peak","Maximum compute throughput of the hardware."],["BW_HBM","High Bandwidth Memory (HBM) bandwidth in bytes per second."],["AI","Arithmetic Intensity: arithmetic operations per byte transferred from HBM."],["AI_ridge","Boundary between the bandwidth and compute limits."]],
      "observe": "Move AI across the ridge point. Check when more arithmetic per loaded byte increases performance and when only P_peak remains limiting.",
      "misconception": "Memory-bound means bandwidth-limited. It does not automatically mean that memory capacity is full or that an out-of-memory error is imminent.",
      "transferQuestion": "What concrete code change can move a memory-bound kernel to the right?",
      "transferAnswer": "A specific change is to fuse several consecutive element-wise operations into one kernel. Intermediate values then remain in registers or fast on-chip memory, instead of being written to High Bandwidth Memory and read again after each step. With a similar number of arithmetic operations, the number of transferred bytes decreases, thereby increasing arithmetic intensity and moving the point to the right in the Roofline diagram."
    },
    "parallelism": {
      "title": "Parallelism Ownership Map",
      "desc": "Compare DDP, ZeRO/FSDP, Tensor, and Pipeline Parallelism.",
      "mental": "Distributed training requires two separate questions: which Rank owns each state persistently, and which data must be communicated or reconstructed temporarily for a compute step?",
      "formula": "DDP: M_rank ≈ P + G + O  ·  ZeRO-2: M_rank ≈ P + (G + O)/W  ·  FSDP/ZeRO-3: M_rank ≈ (P + G + O)/W + temporary gathers",
      "symbols": [["P, G, O","Bytes for parameters, gradients, and Optimizer state."],["W","World Size: number of participating Ranks."],["DDP","Distributed Data Parallel: a full model copy on every Rank."],["ZeRO","Zero Redundancy Optimizer: progressively distributes redundant training state."],["FSDP","Fully Sharded Data Parallel: parameters, gradients, and Optimizer state are distributed."],["Collective","Joint communication such as All-Reduce, All-Gather, or Reduce-Scatter."]],
      "observe": "Switch the strategy and World Size. Explain separately what is stored persistently per Rank and what communication is needed during Forward or Backward.",
      "misconception": "A persistent 1/W shard does not mean a Rank never sees a full Layer. FSDP temporarily reconstructs Layer parameters with All-Gather for computation.",
      "transferQuestion": "Which strategy would you use within a node and which across nodes, and why?",
      "transferAnswer": "Within a node, I would place Tensor Parallelism on GPUs connected by fast links, as this involves All-Reduce or All-Gather operations in many layers where connections like NVLink are critical. Across slower inter-node links, Pipeline Parallelism is often suitable because adjacent stages primarily exchange activations point-to-point and microbatches can keep the pipeline busy. This is not a universal rule: model size, batch size, bubble fraction, and specific network topology must be measured before final partitioning."
    },
    "scaling": {
      "title": "IsoFLOPs Explorer",
      "desc": "Balance parameters and tokens under a fixed compute budget.",
      "mental": "At fixed training compute, a larger model can see fewer tokens and a smaller model can see more. The compute equation supplies feasible allocations; only measured loss curves show which allocation is favorable.",
      "formula": "C ≈ 6N·D_tokens  ·  r = D_tokens/N  ·  N = √(C/(6r))  ·  D_tokens = rN",
      "symbols": [["C","Training compute in Floating-Point Operations (FLOPs)."],["N","Number of model parameters."],["D_tokens","Number of training tokens; not D_model."],["r","Ratio of training tokens per parameter."]],
      "observe": "Change the compute budget and r separately. Predict how N and D_tokens move, and distinguish a compute-feasible point from an empirically measured optimum.",
      "misconception": "Fixed C does not determine a compute optimum. The control selects r; whether that ratio is good must be estimated from properly bracketed runs.",
      "transferQuestion": "How would you test whether the displayed optimum is only a boundary minimum?",
      "transferAnswer": "I would train additional model sizes on both sides of the previously best point at the same compute budget while keeping data quantity, tuning rules, and evaluation comparable. A reliable IsoFLOPs minimum is only bracketed when loss increases for both smaller and larger models. If loss continues to improve up to the new boundary, the previous winner was only a boundary minimum and the search range must be expanded again."
    },
    "data-pipeline": {
      "title": "Data Filter Audit",
      "desc": "Change filter stages and inspect what is falsely kept or discarded.",
      "mental": "A data pipeline is a sequence of fallible decisions. A document is retained only if it passes every active exclusion filter, so both rejected and retained examples must be audited by subgroup and reason.",
      "formula": "keep(d) = ∧_k f_k(d)  ·  quality_pass(d) = 1[q(d) ≥ τ]",
      "symbols": [["d","A document."],["f_k(d)","Binary decision from filter stage k."],["q(d)","Estimated quality score of the document."],["τ","Selected quality threshold."],["PII","Personally Identifiable Information; identifying personal information that is masked here."],["∧","Logical AND: every active condition must be true."]],
      "observe": "Raise the threshold and disable filters one at a time. Deliberately look for valuable false positives and remember that stage order can change later decisions.",
      "misconception": "A stricter threshold does not automatically produce a better corpus. It can disproportionately remove valuable domains or languages.",
      "transferQuestion": "Which rejected examples would you audit manually to detect filtering bias?",
      "transferAnswer": "I would stratify discarded examples near each filter threshold by language, source, domain, and rejection reason. Minority languages and legitimate medical, historical, technical, or identity-related texts are particularly important because simple quality and safety heuristics can disproportionately affect these groups. For each group, I would log the fraction of falsely discarded documents and specific error types, rather than just looking at the overall retention rate of the pipeline."
    },
    "evaluation": {
      "title": "Evaluation Design Clinic",
      "desc": "Match claims to suitable metrics and discover invalid comparisons.",
      "mental": "Start with a testable claim, then define the protocol and metric that make it measurable. A score always belongs to the complete evaluation setup, not just to the model weights.",
      "formula": "Accuracy p̂ = k/n  ·  SE(p̂) ≈ √(p̂(1−p̂)/n)  ·  Perplexity = exp(mean token NLL)",
      "symbols": [["k, n","Number of correct and total evaluated examples."],["p̂","Measured Accuracy."],["SE","Standard Error: rough uncertainty from finite sample size."],["NLL","Negative Log-Likelihood: negative logarithm of the target-token probability."],["MMLU","Massive Multitask Language Understanding: a multiple-choice knowledge benchmark."]],
      "observe": "Choose the claim first and the metric second. Check which setup details can invalidate an apparently like-for-like score comparison.",
      "misconception": "A benchmark score is not a pure property of the weights. Tokenizer, Prompt template, decoding, data, extraction, and scorer all affect it.",
      "transferQuestion": "Which system component besides the model weights can change a benchmark score?",
      "transferAnswer": "Even the tokenizer, prompt or chat template, context handling, and decoding parameters can change a score, even if model weights remain identical. For open-ended answers, extraction rules or a judge model are added; for tool-assisted systems, retrieval and tools are also included. A benchmark therefore evaluates the fully specified evaluation system, not an isolated weight file."
    },
    "grpo": {
      "title": "GRPO Advantage Simulator",
      "desc": "Vary group rewards and standard-deviation normalization; observe the relative learning signal.",
      "mental": "Group Relative Policy Optimization (GRPO) compares multiple responses to the same Prompt. An Advantage does not say whether a Reward is absolutely good; it says whether that Reward is above or below its group mean.",
      "formula": "μ = (1/G)Σ_i R_i  →  A_center,i = R_i−μ  →  optional: A_norm,i = (R_i−μ)/(σ+ε)",
      "symbols": [["G","Number of responses in one Prompt group."],["R_i","Reward for response i."],["μ, σ","Mean and standard deviation of the group Rewards."],["A_i","Group-relative Advantage of response i."],["ε","Small constant that prevents division by zero."]],
      "observe": "Change one Reward and observe every Advantage. Pay special attention to groups with equal Rewards and to the difference between centering with and without σ normalization.",
      "misconception": "A positive Reward can have a negative Advantage when it lies below the group mean. Equal Rewards provide no learning signal after centering.",
      "transferQuestion": "How does standard-deviation normalization change the weighting of easier and harder prompt groups?",
      "transferAnswer": "In Group Relative Policy Optimization, a reward difference within each prompt group is divided by its standard deviation. The same absolute distance thus receives greater weight in a group with small spread and lesser weight in a group with large spread, so prompt groups are reweighted according to their reward spread. If all answers in a group have the same reward, the centered numerator is zero and the group provides no relative learning signal despite the stabilization term."
    }
  },
  "diagnostic": {
    "0": {
      "q": "X has shape (B,T,D), W has shape (D,4D). What is the output shape of X@W?",
      "opts": [
        "(B,T,4D)",
        "(B,4T,D)",
        "(D,T,4B)"
      ],
      "why": "Linear acts on the last axis; B and T remain."
    },
    "1": {
      "q": "Why is max(z) subtracted in stable Softmax?",
      "opts": [
        "The distribution remains unchanged, overflow risk decreases",
        "To make the sum less than 1",
        "For an unbiased gradient"
      ],
      "why": "Softmax is invariant to common logit shifts."
    },
    "2": {
      "q": "At a graph branch, x influences the loss via two paths. What happens during backward pass?",
      "opts": [
        "The path gradients add up",
        "Only the shorter path counts",
        "The gradients are multiplied"
      ],
      "why": "The derivative of a sum is the sum of the contributions."
    },
    "3": {
      "q": "Which statement about backward() is correct?",
      "opts": [
        "It accumulates gradients; the optimizer updates parameters",
        "It updates parameters directly",
        "It automatically clears old gradients"
      ],
      "why": "Autograd and Optimizer are separate; gradients accumulate by default."
    },
    "4": {
      "q": "Over which axis does Attention-Softmax normalize?",
      "opts": [
        "Over Key positions per Query",
        "Over Query positions per Key",
        "Over the batch axis"
      ],
      "why": "Each Query builds a distribution over allowed Keys."
    },
    "5": {
      "q": "Which branch mixes sequence positions?",
      "opts": [
        "Attention",
        "position-wise MLP",
        "RMSNorm"
      ],
      "why": "MLP and Norm work position-wise; Attention exchanges information."
    },
    "6": {
      "q": "A GPU timer measures only very short time without synchronization. Likely why?",
      "opts": [
        "GPU work was started asynchronously only",
        "The kernel is always memory-bound",
        "BF16 rounds the time"
      ],
      "why": "CPU dispatch ends before GPU work is completed."
    },
    "7": {
      "q": "What does Activation Checkpointing primarily reduce?",
      "opts": [
        "stored activations against recomputation",
        "optimizer state against communication",
        "parameters against smaller vocabulary"
      ],
      "why": "It trades activation memory for additional forward passes."
    },
    "8": {
      "q": "With C≈6ND and fixed C: N doubles. What holds for D?",
      "opts": [
        "D halves",
        "D doubles",
        "D remains the same"
      ],
      "why": "D=C/(6N)."
    },
    "9": {
      "q": "What does an LSH collision mean?",
      "opts": [
        "Candidate pair that still needs verification",
        "Proof of identical documents",
        "Proof of same language"
      ],
      "why": "Locality-Sensitive Hashing (LSH) is retrieval, not final decision."
    },
    "10": {
      "q": "When is Perplexity directly comparable?",
      "opts": [
        "With the same tokenizer and evaluation setup",
        "Always between any LMs",
        "Only with the same parameter count"
      ],
      "why": "Tokenization and context handling define the unit."
    },
    "11": {
      "q": "All G answers of a prompt have the same reward. What does group-centered GRPO-Advantage yield?",
      "opts": [
        "No relative learning signal",
        "Maximal positive signal",
        "Randomly unbiased signal"
      ],
      "why": "After subtracting the group mean, all advantages are zero."
    }
  },
  "quiz": {
    "0": {
      "q": "Why is Byte-level BPE complete?",
      "opts": [
        "Every input can be represented as bytes",
        "Every word is in the vocabulary",
        "UTF-8 always has one byte per character"
      ],
      "why": "Bytes form the universal base level."
    },
    "1": {
      "q": "Why scale QKᵀ by 1/√dₖ?",
      "opts": [
        "So that score variance does not grow with dₖ",
        "To make the matrix square",
        "To normalize V"
      ],
      "why": "Unscaled dot-products saturate Softmax with increasing dimension."
    },
    "2": {
      "q": "What is decoupled in AdamW?",
      "opts": [
        "Weight decay from adaptive gradient step",
        "Warmup from cosine",
        "Gradient from loss"
      ],
      "why": "Decay is applied directly to parameters."
    },
    "3": {
      "q": "Which advantage is typical for GQA?",
      "opts": [
        "Smaller KV cache",
        "No softmax needed",
        "No output linear layer"
      ],
      "why": "Grouped-Query Attention (GQA) shares keys and values across query groups."
    },
    "4": {
      "q": "What does FlashAttention not change?",
      "opts": [
        "The O(T²D) compute complexity",
        "HBM traffic",
        "Materialization of the full score matrix"
      ],
      "why": "It is an IO-aware exact algorithm."
    },
    "5": {
      "q": "Besides optimizer state, what does ZeRO-2 shard additionally?",
      "opts": [
        "Gradients",
        "Activations",
        "Data"
      ],
      "why": "ZeRO-1 optimizer, ZeRO-2 additionally gradients, ZeRO-3 additionally parameters."
    },
    "6": {
      "q": "How do you recognize a usable IsoFLOPs minimum?",
      "opts": [
        "Measurement points lie on both sides",
        "It is the largest run",
        "R² is exactly 1"
      ],
      "why": "A boundary minimum is not bracketed."
    },
    "7": {
      "q": "P(MinHash(A)=MinHash(B)) corresponds to which quantity?",
      "opts": [
        "Jaccard similarity",
        "Cosine loss",
        "Precision"
      ],
      "why": "This is the central MinHash property."
    },
    "8": {
      "q": "What should a benchmark comparison always disclose?",
      "opts": [
        "Prompting, scoring and costs",
        "Only the highest score",
        "Only parameter count"
      ],
      "why": "These rules define the compared system."
    },
    "9": {
      "q": "Which component does DPO not need during training?",
      "opts": [
        "new on-policy rollouts",
        "reference log-probs",
        "preference pairs"
      ],
      "why": "DPO optimizes offline on pairs."
    },
    "10": {
      "q": "Why use a baseline in policy gradient?",
      "opts": [
        "Reduce variance",
        "Make reward differentiable",
        "Normalize policy"
      ],
      "why": "A suitable action-independent baseline preserves the expected gradient."
    },
    "11": {
      "q": "What is the trade-off of PPO clipping?",
      "opts": [
        "Stability against bias",
        "Memory against accuracy",
        "Tokens against parameters"
      ],
      "why": "Clipping cuts high-variance ratios, but changes the estimator."
    }
  },
  "glossary": {
    "g0": {
      "def": "Automatic differentiation of a Computation Graph.",
      "cat": "Foundations",
      "detail": "During the Forward Pass, Autograd records which tensor operations produced a result and then uses the Chain Rule in the Backward Pass to compute the required derivatives. This means gradients do not have to be derived by hand even for complex models. The convenience costs memory for intermediate values; PyTorch also accumulates gradients by default until they are explicitly reset."
    },
    "g1": {
      "def": "Byte-Pair Encoding: repeatedly merging frequent token pairs.",
      "cat": "Tokenization",
      "detail": "Byte-Pair Encoding (BPE) starts with small units and repeatedly merges the most frequent neighboring pair into a new token. Byte-based BPE can therefore represent any input text without unknown characters. More merges typically shorten sequences but enlarge the vocabulary and may split rare or cross-language patterns in unfavorable ways."
    },
    "g2": {
      "def": "BFloat16: a 16-bit format with an FP32-like exponent range.",
      "cat": "Systems",
      "detail": "Brain Floating Point 16 (BF16), usually called BFloat16, uses eight exponent bits like FP32 but far fewer mantissa bits. Its large value range makes overflow and underflow during Mixed-Precision training less common than with FP16, while reducing memory use and data transfer relative to FP32. The lower precision can lose small updates, so critical states such as Optimizer moments often remain in FP32."
    },
    "g3": {
      "def": "A saved training state; not to be confused with Activation Checkpointing.",
      "cat": "Training",
      "detail": "Ideally, a Checkpoint stores not only model parameters but also the Optimizer State, Learning-Rate Scheduler, training step, random states, and position in the data pipeline. This allows an interrupted run to continue as reproducibly as possible or an earlier model state to be evaluated. Activation Checkpointing is different: it discards selected activations and recomputes them during the Backward Pass, trading additional compute for lower memory use."
    },
    "g4": {
      "def": "A coordinated communication operation across multiple Ranks.",
      "cat": "Parallelism",
      "detail": "Collective Communication is a jointly executed communication operation involving multiple Ranks—that is, processes or devices. All-Reduce, for example, synchronizes aggregated values on every Rank, while Reduce-Scatter distributes the result and All-Gather reconstructs distributed parts. All participants must call Collectives in a compatible order; many small operations are also especially sensitive to communication latency."
    },
    "g5": {
      "def": "NVIDIA's platform and programming model for GPU computing.",
      "cat": "GPU",
      "detail": "Compute Unified Device Architecture (CUDA) is NVIDIA's platform and programming model for general-purpose computation on Graphics Processing Units (GPUs). The Host launches GPU Kernels whose many Threads process data in parallel, while the Compiler, Runtime, and Libraries handle important parts of hardware control. CUDA provides a mature ecosystem but ties applications to NVIDIA hardware."
    },
    "g6": {
      "def": "Distributed Data Parallel: replicated model, split Batch, synchronized gradients.",
      "cat": "Parallelism",
      "detail": "Distributed Data Parallel (DDP) keeps a complete model copy on every Rank and processes a different part of the Mini-Batch there. During the Backward Pass, Gradient Buckets are synchronized through All-Reduce so that every copy subsequently performs the same parameter update. DDP increases training throughput but does not reduce per-device memory for the model and Optimizer state."
    },
    "g7": {
      "def": "Direct Preference Optimization: directly optimizing preference pairs relative to a Reference.",
      "cat": "Alignment",
      "detail": "For a preference pair, Direct Preference Optimization (DPO) increases the relative probability of the preferred response over the rejected response, each measured against a frozen Reference Policy. A logistic Loss controls how strongly the trained Policy may diverge from the Reference. DPO needs neither new On-Policy Rollouts nor a separate Reward Model during optimization, but it remains sensitive to data quality, the β parameter, and length and format Bias."
    },
    "g8": {
      "def": "End of Sequence: a token marking the end of a sequence.",
      "cat": "Tokenization",
      "detail": "End of Sequence (EOS) is a special token whose probability the model learns like that of any other next token. If EOS is selected during generation, Decoding can stop; it should be clearly distinguished from Padding used to fill a Batch. Missing or incorrectly masked EOS examples can easily produce unnecessarily long, abruptly truncated, or prematurely terminated outputs."
    },
    "g9": {
      "def": "Floating-Point Operation; FLOP/s, by contrast, is a rate.",
      "cat": "Systems",
      "detail": "A Floating-Point Operation (FLOP) is one floating-point operation and serves as a rough measure of computational work. Counting conventions often treat a fused multiplication and addition as two FLOPs, so the convention used should be stated. FLOP/s instead measures a compute rate, and a low theoretical FLOP count does not guarantee short runtime because memory accesses and communication may dominate."
    },
    "g10": {
      "def": "Fully Sharded Data Parallel: shards parameters, gradients, and Optimizer state.",
      "cat": "Parallelism",
      "detail": "Fully Sharded Data Parallel (FSDP) distributes parameters, gradients, and Optimizer states across multiple Ranks instead of replicating them in full everywhere. Parameters needed to compute a Layer are typically reconstructed temporarily through All-Gather, and the resulting gradients are distributed again through Reduce-Scatter. This enables larger models per device, but it adds communication and can create new memory Peaks through temporarily complete parameters and Prefetching."
    },
    "g11": {
      "def": "Grouped-Query Attention: several Query Heads share Key-Value groups.",
      "cat": "Architecture",
      "detail": "Grouped-Query Attention (GQA) assigns several Query Heads to each shared Key and Value group. Compared with Multi-Head Attention, this reduces the Key-Value Cache and lowers memory traffic especially during autoregressive Decoding; compared with Multi-Query Attention, it retains more separate Key-Value representations. GQA is therefore a quality-efficiency compromise, but it requires a clean mapping and usually divisible Head counts."
    },
    "g12": {
      "def": "Group Relative Policy Optimization: group-relative Advantages without a Value Model.",
      "cat": "RL",
      "detail": "Group Relative Policy Optimization (GRPO) generates several responses per Prompt and derives their Advantages from relative Rewards within that group, without training a separate Value Model. These Advantages weight a Policy Gradient that is often additionally constrained through Importance Ratios, Clipping, or Reference regularization. This avoids the Critic but requires several generations; if every response receives the same Reward, the group provides no relative learning signal."
    },
    "g13": {
      "def": "High Bandwidth Memory: large external GPU memory.",
      "cat": "GPU",
      "detail": "High Bandwidth Memory (HBM) is stacked dynamic memory with a very wide interface that serves as the large external memory of modern accelerators. Despite its high bandwidth, HBM is farther from the compute units than Registers or shared on-chip memory and often bottlenecks data-intensive Kernels. Tiling, Kernel Fusion, and methods such as FlashAttention therefore accelerate computation mainly by avoiding unnecessary HBM transfers."
    },
    "g14": {
      "def": "A parallel Attention subspace; in Multi-Head Attention it has its own Query, Key, and Value slices, while Grouped-Query or Multi-Query Attention shares Key/Value slices.",
      "cat": "Transformer",
      "detail": "In classic Multi-Head Attention (MHA), an Attention Head uses its own slices of the Query, Key, and Value parameters and computes a separate Attention pattern from them. In Grouped-Query Attention (GQA) or Multi-Query Attention (MQA), Query slices remain separate while several or all Query Heads share the same Key and Value slices. In typical implementations, one shared or fused Linear Layer produces the activations for many Heads at once, after which they are reshaped into Head slices. At a fixed model dimension, adding Heads reduces each Head's dimension and therefore does not automatically increase capacity."
    },
    "g15": {
      "def": "Experiments with equal compute and varying model/data allocation.",
      "cat": "Scaling",
      "detail": "IsoFLOPs experiments hold total training compute approximately constant while varying model size and the number of training tokens. Under the approximation C ≈ 6ND, a fixed budget C and model size N imply token count D ≈ C/(6N), allowing the lowest-Loss trade-off to be found empirically. Measurements must bracket the minimum on both sides, and the result applies only to the architecture, data distribution, and compute convention studied."
    },
    "g16": {
      "def": "The intersection divided by the union of two sets.",
      "cat": "Data",
      "detail": "The Jaccard similarity of two sets is the size of their intersection divided by the size of their union and lies between zero and one. Text Deduplication often compares sets of character or word Shingles, capturing local overlap but not their frequency or complete ordering. MinHash can estimate Jaccard efficiently, while Locality-Sensitive Hashing finds candidates that should then be checked as exactly as possible."
    },
    "g17": {
      "def": "A function executed on a GPU across many Threads.",
      "cat": "GPU",
      "detail": "A GPU Kernel is a function that, once launched by the Host, is executed in parallel by many Threads in a Grid. Its runtime depends not only on the number of arithmetic operations but also on memory accesses, Thread Divergence, compute-unit Occupancy, and Arithmetic Intensity. Kernel Fusion can save launch overhead and HBM intermediate values, although excessive Fusion may increase Register demand and reduce parallelism."
    },
    "g18": {
      "def": "Kullback-Leibler Divergence: a directed difference between distributions.",
      "cat": "Probability",
      "detail": "The Kullback-Leibler Divergence D_KL(P||Q) measures how strongly the distribution of interest P differs from the Reference distribution Q by taking, under P, the mean logarithm of the ratio P/Q. In Language Model training, it can prevent an optimized Policy from moving too far from a Reference Model, for example. It is directed and therefore not a symmetric distance; if Q assigns probability zero to an event possible under P, the Divergence can even be infinite."
    },
    "g19": {
      "def": "Stored Keys and Values from earlier tokens for faster Decoding.",
      "cat": "Inference",
      "detail": "The Key-Value Cache (KV-Cache) stores the previously computed Keys and Values of earlier tokens in every Attention Layer. During autoregressive Decoding, the model then needs to compute only the new values for the next token and can access the stored values directly. This significantly accelerates inference but requires memory that grows linearly with context length, Batch size, Layer count, and the number of Key-Value Heads."
    },
    "g20": {
      "def": "An unnormalized score before Softmax.",
      "cat": "Probability",
      "detail": "A Logit is an unnormalized score that the model assigns to every possible next token. Softmax transforms Logits into probabilities, with only their relative differences mattering; adding the same constant to all of them changes nothing. Scaling with a temperature can make the distribution sharper or flatter without changing the ordering of the Logits."
    },
    "g21": {
      "def": "Locality-Sensitive Hashing: candidate retrieval for similar signatures.",
      "cat": "Data",
      "detail": "Locality-Sensitive Hashing (LSH) organizes similar MinHash signatures so that every document does not have to be compared with every other document. A signature is typically divided into Bands; if every value in one Band matches, the document pair becomes a candidate. The number and size of Bands control the trade-off between missed duplicates and additional false candidates, so an exact similarity comparison usually follows."
    },
    "g22": {
      "def": "Model FLOPs Utilization: modeled compute rate relative to Hardware Peak.",
      "cat": "Systems",
      "detail": "Model FLOPs Utilization (MFU) compares the floating-point operations performed for the model per second with the theoretical Peak performance of the hardware. A low value may indicate memory accesses, communication, small matrices, or other waiting, while a high value signals good use of the compute units. Because counted model operations and Hardware Peaks depend on convention and numerical format, MFU values are meaningful to compare only when calculated consistently."
    },
    "g23": {
      "def": "A compact, probabilistic estimate of Jaccard similarity.",
      "cat": "Data",
      "detail": "MinHash maps a set, such as a document's Shingles, to a compact signature using the smallest values under several independent Hash orderings. The expected fraction of matching signature components for two sets equals their Jaccard similarity. This saves memory and accelerates the search for similar documents, but it remains a probabilistic estimator and should be followed by an exact comparison before making final duplicate decisions."
    },
    "g24": {
      "def": "Multi-Layer Perceptron; in a Transformer, usually the position-wise Feed-Forward Network.",
      "cat": "Transformer",
      "detail": "In a Transformer, a Multi-Layer Perceptron (MLP) is usually the position-wise Feed-Forward Network consisting of an expanding Linear Layer, a nonlinearity or Gating function, and a contracting Linear Layer. It processes each token position independently and transforms its features, whereas Attention exchanges information between positions. MLP Blocks often contain a large share of the model parameters and therefore require substantial compute."
    },
    "g25": {
      "def": "Mixture of Experts: sparse selection of a few experts per token.",
      "cat": "Architecture",
      "detail": "In a Mixture of Experts (MoE), a Router selects only a few specialized Feed-Forward experts for each token. This allows the total parameter count to grow substantially without computing every expert for every token. The capacity gain comes with additional communication, high memory use, and possible load imbalances when the Router selects some experts far more often than others."
    },
    "g26": {
      "def": "Multi-Query Attention: every Query Head shares one Key-Value pair.",
      "cat": "Architecture",
      "detail": "In Multi-Query Attention (MQA), the Query Heads retain separate Query-parameter slices and Query activations but share a single Key and Value Head pair. A shared or fused Linear Layer can produce the slices efficiently in one operation. This reduces the Key-Value Cache and especially the memory-bandwidth requirement during Decoding; Grouped-Query Attention is a compromise with multiple Key-Value groups, but fewer of them than Query Heads."
    },
    "g27": {
      "def": "NVIDIA Collective Communications Library for GPU communication.",
      "cat": "Parallelism",
      "detail": "The NVIDIA Collective Communications Library (NCCL) provides optimized Collective Communication operations such as All-Reduce, All-Gather, and Reduce-Scatter across multiple GPUs. Distributed Data Parallel uses All-Reduce, for example, to synchronize gradients among model replicas. Performance depends strongly on network topology, message size, and overlap with computation; NCCL is the communication layer, not the Parallelism algorithm itself."
    },
    "g28": {
      "def": "Negative Log-Likelihood: the negative logarithm of the target probability.",
      "cat": "Loss",
      "detail": "The Negative Log-Likelihood (NLL) of a target token is the negative logarithm of the probability the model assigns to that token. The values are summed over a sequence and often averaged across all valid tokens during training; with One-Hot targets, minimizing NLL is equivalent to minimizing Cross-Entropy. The logarithmic form heavily penalizes very small target probabilities, and exponentiating the mean token NLL gives Perplexity."
    },
    "g29": {
      "def": "The share of usable parallel GPU execution relative to resource limits.",
      "cat": "GPU",
      "detail": "GPU Occupancy describes what fraction of the maximum possible Warps can be active simultaneously on a Streaming Multiprocessor. Register demand, shared memory, and Block size limit how many Blocks can remain resident at once and hide latency. Higher Occupancy is not automatically faster, however, because memory bandwidth, Instruction-Level Parallelism, and efficient data reuse also matter."
    },
    "g30": {
      "def": "The data comes from the current Policy.",
      "cat": "RL",
      "detail": "In Reinforcement Learning, On-Policy means that the training data was generated by the Policy currently being optimized. After a substantial update, older Trajectories technically come from a different Policy and therefore cannot be reused unchanged without limit. This reduces Distribution Shift between data generation and the update, but it is usually less sample-efficient than Off-Policy methods."
    },
    "g31": {
      "def": "The exponential of the mean token NLL.",
      "cat": "Evaluation",
      "detail": "Perplexity is the exponential of the mean Negative Log-Likelihood per token and can be interpreted as an effective number of plausible continuations. A lower value means that the model assigns higher probability on average to tokens in a fixed evaluation corpus. Meaningful comparisons require the same Tokenizer, context handling, and data preparation; the metric does not directly measure factual accuracy, Instruction Following, or safety."
    },
    "g32": {
      "def": "Personally Identifiable Information: information that identifies a person.",
      "cat": "Data",
      "detail": "Personally Identifiable Information (PII) includes information through which a person can be identified directly or in combination with other attributes. In addition to names and identification numbers, this includes context-dependent combinations of location, contact, or biographical data. Detecting and removing PII before training reduces privacy and memorization risks, but the process is error-prone and must be tested on labeled samples for both missed and incorrectly removed content."
    },
    "g33": {
      "def": "In a Language Model, a distribution over the next token or complete responses.",
      "cat": "RL",
      "detail": "In Reinforcement Learning, a Policy maps every state or history to a probability distribution over possible actions. In a Language Model, the actions are next tokens, and the probability of a complete response is the product of their conditional token probabilities. The Policy produces behavior and must therefore be distinguished from the Reward Model, which evaluates responses, and the Value Model, which estimates expected future Reward."
    },
    "g34": {
      "def": "Proximal Policy Optimization: Policy Gradient with bounded Importance Ratios.",
      "cat": "RL",
      "detail": "Proximal Policy Optimization (PPO) is a Policy-Gradient method that uses the probability ratio between the new Policy and the data-generating Policy and clips this ratio in the optimization objective. The sign of the Advantage determines whether an observed action should become more or less likely, while Clipping makes excessively large updates unattractive. PPO is often more stable than an unconstrained Policy-Gradient update, but it requires fresh Trajectories and, despite Clipping, does not guarantee a hard upper bound on the actual Policy change."
    },
    "g35": {
      "def": "Initial text segmentation before BPE merges.",
      "cat": "Tokenization",
      "detail": "Pretokenization first divides raw text into segments before a method such as Byte-Pair Encoding (BPE) applies its learned Subword merges. Rules for whitespace, punctuation, Unicode characters, or byte sequences determine the boundaries across which later merges are possible. This early decision affects the vocabulary, sequence lengths, and character offsets and must therefore be implemented identically during training and inference."
    },
    "g36": {
      "def": "One process/device within a distributed World.",
      "cat": "Parallelism",
      "detail": "A Rank is a uniquely numbered process in a distributed Process Group and is often assigned to exactly one accelerator. Collective Communication operations use this number to distinguish participating processes. The global Rank applies across all machines, while the local Rank numbers only the processes within one machine."
    },
    "g37": {
      "def": "The main activation path into which Blocks add corrections.",
      "cat": "Transformer",
      "detail": "The Residual Stream holds one model-dimension vector per token and passes it through every Transformer Block. Attention and the Feed-Forward Network do not replace this vector; each adds a computed correction to it. This identity path preserves information and helps gradients flow through deep models, but every Residual addition requires identical shapes."
    },
    "g38": {
      "def": "Reinforcement Learning from Human Feedback: optimization using feedback derived from people.",
      "cat": "Alignment",
      "detail": "Reinforcement Learning from Human Feedback (RLHF) uses human preference judgments, usually first to train a Reward Model. The Language Model Policy is then optimized to receive high predicted Reward while regularization keeps it close to a Reference Policy. This can represent human preferences that are difficult to formalize, but it is expensive and vulnerable to errors or exploitable weaknesses in the Reward Model."
    },
    "g39": {
      "def": "Reinforcement Learning from Verifiable Rewards: RL with automatically checkable Rewards.",
      "cat": "RL",
      "detail": "Reinforcement Learning from Verifiable Rewards (RLVR) evaluates generated responses using automatically checkable criteria such as exact solutions, program tests, or formal proofs. From its own Rollouts, the Policy learns which responses more often lead to a successful verification result. This removes the need for a learned Reward Model and reduces human labeling, but the method is mostly limited to domains with reliable Verifiers and can suffer from sparse Rewards."
    },
    "g40": {
      "def": "Root Mean Square Normalization without mean centering.",
      "cat": "Transformer",
      "detail": "Root Mean Square Normalization (RMSNorm) divides each token's activation vector by its root mean square magnitude and then multiplies it by learnable scale values. Unlike Layer Normalization, it does not subtract the mean and is therefore somewhat simpler and less expensive. It stabilizes activation scales but does not remove a common offset; the normalization axis and stability constant must also be chosen correctly."
    },
    "g41": {
      "def": "An upper bound from Compute Peak and bandwidth×Arithmetic Intensity.",
      "cat": "GPU",
      "detail": "The Roofline model bounds attainable compute performance by the smaller of maximum compute rate and memory bandwidth times Arithmetic Intensity. Below the Ridge Point, a Kernel is typically memory-bound; above it, compute-bound. The model helps choose among data reuse, Fusion, and compute optimization, but it describes only a theoretical upper bound, not guaranteed runtime."
    },
    "g42": {
      "def": "Rotary Position Embedding: position-dependent rotation of Q and K.",
      "cat": "Transformer",
      "detail": "Rotary Position Embedding (RoPE) rotates pairs of Query and Key features through position- and frequency-dependent angles. This makes their dot product depend on relative position difference without adding a separate position vector to the activations. The method preserves tensor shape and works well within the training context, although extrapolation to very long contexts may require additional frequency scaling."
    },
    "g43": {
      "def": "Supervised Fine-Tuning: imitating desired responses with Cross-Entropy.",
      "cat": "Alignment",
      "detail": "Supervised Fine-Tuning (SFT) trains a pretrained model on desired Prompt-response pairs using a Cross-Entropy Loss. Under Teacher Forcing, it predicts each next target token from the correct preceding context. The method is stable and comparatively simple, but it only imitates its training examples and does not directly optimize human preferences or the success of a complete response."
    },
    "g44": {
      "def": "Single Instruction, Multiple Threads: a GPU execution model.",
      "cat": "GPU",
      "detail": "Single Instruction, Multiple Threads (SIMT) is an execution model in which many logically separate Threads apply the same instruction to different data at the same time. A GPU typically groups such Threads into Warps and schedules them together. Regular computation is therefore very efficient, while divergent branches within a Warp must execute one after another and cost performance."
    },
    "g45": {
      "def": "Swish-Gated Linear Unit: a gated Transformer MLP.",
      "cat": "Transformer",
      "detail": "The Swish-Gated Linear Unit (SwiGLU) computes two Linear-Layer outputs from the input, applies the Sigmoid Linear Unit (SiLU) to one, and multiplies them element-wise. A third Linear Layer maps the gated result back to the model dimension. The data-dependent Gate is often more capable than a simple Feed-Forward Network with ReLU or GELU, but it requires three weight matrices and therefore a suitably reduced inner width for fair parameter comparisons."
    },
    "g46": {
      "def": "Sharding individual Layer or matrix axes across devices.",
      "cat": "Parallelism",
      "detail": "Tensor Parallelism divides the weight and compute axes of individual Layers across multiple devices so that each Rank performs only part of a large matrix operation. Partial results must be combined or redistributed within the Layer through Collective Communication. This allows Layers that do not fit on one device to run, but introduces frequent communication; unlike Data Parallelism, a Rank does not hold a complete model copy."
    },
    "g47": {
      "def": "Block-wise processing for data reuse in fast memory.",
      "cat": "GPU",
      "detail": "Tiling divides large tensor operations into Blocks whose data fits in Registers, Shared Memory, or Cache. A Block can reuse loaded values several times before accessing slower global memory again. Suitable Tile sizes increase Arithmetic Intensity, while Tiles that are too large cause Register pressure and Tiles that are too small create loading overhead; boundary Tiles also require correct masking."
    },
    "g48": {
      "def": "A reversible Codec between text/bytes and token IDs.",
      "cat": "Tokenization",
      "detail": "A Tokenizer converts text reversibly into a sequence of discrete token IDs according to fixed rules and decodes those IDs back into text. Subword Tokenizers learn frequent byte or character sequences, not their meanings. Vocabulary choice affects sequence length, Embedding parameters, language coverage, and compute cost; Special Tokens, unfamiliar scripts, and exact round-trip reconstruction must therefore also be tested."
    },
    "g49": {
      "def": "A Python-like language for GPU Kernels.",
      "cat": "GPU",
      "detail": "Triton is a Python-like domain-specific language for writing custom GPU Kernels. Developers describe block-wise programs and memory accesses, while the Compiler maps execution onto Threads and hardware instructions. Triton makes Kernel Fusion and Tiling easier than low-level hardware programming, but it does not remove the need to choose efficient layouts, Tile sizes, and boundary masks."
    },
    "g50": {
      "def": "A group of typically 32 GPU Threads that receives instructions together.",
      "cat": "GPU",
      "detail": "On NVIDIA GPUs, a Warp is a group of usually 32 Threads scheduled together under the Single Instruction, Multiple Threads (SIMT) model. Contiguous memory accesses by those Threads can be combined efficiently, while divergent control-flow paths within the Warp are serialized. A Warp is a hardware execution unit and is not equivalent to a freely synchronizable Thread Block."
    },
    "g51": {
      "def": "A shared matrix for the Input Embedding and Output Linear Layer.",
      "cat": "Transformer",
      "detail": "With Weight Tying, the model uses the same parameters for the Input Embedding matrix and, transposed, for the Output Linear Layer that produces logits. This removes approximately vocabulary size times model dimension additional parameters and directly couples the input and output representations. The technique requires compatible dimensions and restricts the two roles to a shared representation space, which need not be optimal for every architecture."
    },
    "g52": {
      "def": "The number of Ranks in a distributed group.",
      "cat": "Parallelism",
      "detail": "World Size is the total number of Ranks belonging to a particular distributed Process Group. It determines how many participants jointly execute a Collective operation such as All-Reduce. In hybrid setups, global, Data-Parallel, and Tensor-Parallel groups can have different World Sizes, so the total device count does not automatically equal the Data-Parallel scaling factor."
    },
    "g53": {
      "def": "Zero Redundancy Optimizer: staged Sharding of training state.",
      "cat": "Parallelism",
      "detail": "The Zero Redundancy Optimizer (ZeRO) distributes redundant training states across Data-Parallel Ranks. Stage 1 shards Optimizer states, Stage 2 additionally shards gradients, and Stage 3 also shards model parameters. This greatly reduces persistent memory per Rank but requires additional Collective Communication and can create relevant memory Peaks while parameters are temporarily reconstructed."
    },
    "g54": {
      "def": "A Linear Layer applies the same learned weight matrix to every input vector; LLM literature often calls this a Projection.",
      "cat": "Foundations",
      "detail": "For an input vector x, a Linear Layer typically computes y = xW + b using a learned weight matrix W and an optional Bias b. It can change the feature dimension or create new mixtures of the existing features; the same matrix is applied at every token position. In LLM literature, Projection usually means exactly this learned linear mapping, not necessarily a geometric orthogonal projection. The Query, Key, Value, and Output Linear Layers in Attention are common examples."
    }
  },
  "symbols": {
    "s0": {
      "meaning": "Batch size",
      "context": "Tensors / Training",
      "dimension": "Scalar; in A5 sometimes number of prompts"
    },
    "s1": {
      "meaning": "Sequence length",
      "context": "Transformer",
      "dimension": "Tokens; do not confuse with temperature"
    },
    "s2": {
      "meaning": "Vocabulary size",
      "context": "Tokenizer / Embedding",
      "dimension": "Scalar"
    },
    "s3": {
      "meaning": "Value matrix",
      "context": "Attention",
      "dimension": "B×H×T×dᵥ"
    },
    "s4": {
      "meaning": "Width of the residual stream",
      "context": "Transformer",
      "dimension": "Scalar"
    },
    "s5": {
      "meaning": "Key/Value head dimension",
      "context": "Attention",
      "dimension": "usually D/H"
    },
    "s6": {
      "meaning": "Inner MLP width",
      "context": "Transformer",
      "dimension": "often approx. 8D/3 for SwiGLU"
    },
    "s7": {
      "meaning": "Number of attention heads",
      "context": "Transformer",
      "dimension": "Scalar"
    },
    "s8": {
      "meaning": "Input/activations",
      "context": "Tensors",
      "dimension": "often B×T×D"
    },
    "s9": {
      "meaning": "Query, Key, Value activations",
      "context": "Attention",
      "dimension": "B×H×T×d_head"
    },
    "s10": {
      "meaning": "Weight matrices of the attention linear layers",
      "context": "Attention",
      "dimension": "do not confuse with Q/K/V activations"
    },
    "s11": {
      "meaning": "Score matrix before softmax",
      "context": "Attention",
      "dimension": "B×H×T_q×T_k"
    },
    "s12": {
      "meaning": "Attention probabilities",
      "context": "Attention",
      "dimension": "same shape as scores"
    },
    "s13": {
      "meaning": "Additive/boolean mask",
      "context": "Attention",
      "dimension": "T_q×T_k; check API semantics"
    },
    "s14": {
      "meaning": "All model parameters",
      "context": "Optimization",
      "dimension": "Parameter structure"
    },
    "s15": {
      "meaning": "Rotation angle",
      "context": "RoPE",
      "dimension": "Context-dependent, not model parameter"
    },
    "s16": {
      "meaning": "Loss",
      "context": "Training",
      "dimension": "Scalar"
    },
    "s17": {
      "meaning": "Log-sum-exp per row",
      "context": "FlashAttention",
      "dimension": "Scalar per query"
    },
    "s18": {
      "meaning": "Numerical stabilization",
      "context": "Norm / Optimizer",
      "dimension": "Small positive scalar"
    },
    "s19": {
      "meaning": "Clip width",
      "context": "PPO",
      "dimension": "Different context than stability ε"
    },
    "s20": {
      "meaning": "Sampling temperature",
      "context": "Decoding",
      "dimension": "Positive scalar"
    },
    "s21": {
      "meaning": "Learning rate",
      "context": "Optimization",
      "dimension": "Positive scalar"
    },
    "s22": {
      "meaning": "Gradient",
      "context": "Optimization",
      "dimension": "Same shape as θ"
    },
    "s23": {
      "meaning": "Adam moments",
      "context": "Optimization",
      "dimension": "Same shape as θ"
    },
    "s24": {
      "meaning": "Adam smoothing factors",
      "context": "Optimization",
      "dimension": "[0,1)"
    },
    "s25": {
      "meaning": "Weight decay coefficient",
      "context": "Optimization",
      "dimension": "Scalar"
    },
    "s26": {
      "meaning": "Model parameters",
      "context": "Scaling",
      "dimension": "Number of parameters"
    },
    "s27": {
      "meaning": "Number of devices/examples",
      "context": "Systems / Statistics",
      "dimension": "Check context explicitly"
    },
    "s28": {
      "meaning": "Training tokens",
      "context": "Scaling",
      "dimension": "Token count"
    },
    "s29": {
      "meaning": "Compute budget",
      "context": "Scaling",
      "dimension": "FLOPs"
    },
    "s30": {
      "meaning": "Floating-point operation",
      "context": "Systems",
      "dimension": "Work; FLOP/s is rate"
    },
    "s31": {
      "meaning": "Memory or network bandwidth",
      "context": "Systems",
      "dimension": "Bytes/s"
    },
    "s32": {
      "meaning": "World size, i.e., number of ranks",
      "context": "Parallelism",
      "dimension": "Positive integer"
    },
    "s33": {
      "meaning": "Arithmetic intensity",
      "context": "GPU",
      "dimension": "FLOPs/Byte"
    },
    "s34": {
      "meaning": "Reward",
      "context": "Reinforcement Learning",
      "dimension": "Scalar"
    },
    "s35": {
      "meaning": "Prompt distribution",
      "context": "Reinforcement Learning",
      "dimension": "Probability distribution"
    },
    "s36": {
      "meaning": "Language model as policy",
      "context": "Reinforcement Learning",
      "dimension": "Token/sequence distribution"
    },
    "s37": {
      "meaning": "Reference/rollout policy",
      "context": "Alignment / RL",
      "dimension": "Fixed or old policy"
    },
    "s38": {
      "meaning": "Prompt/state",
      "context": "Reinforcement Learning",
      "dimension": "Token sequence"
    },
    "s39": {
      "meaning": "Response/action",
      "context": "Reinforcement Learning",
      "dimension": "Sequence or token"
    },
    "s40": {
      "meaning": "Advantage",
      "context": "Reinforcement Learning",
      "dimension": "Reward scale or normalized"
    },
    "s41": {
      "meaning": "Generations per prompt",
      "context": "GRPO",
      "dimension": "Integer"
    },
    "s42": {
      "meaning": "Importance ratio",
      "context": "Off-policy RL",
      "dimension": "Positive scalar"
    },
    "s43": {
      "meaning": "Group mean/standard deviation",
      "context": "GRPO",
      "dimension": "Per prompt group"
    },
    "s44": {
      "meaning": "Preferred/rejected response",
      "context": "DPO / Reward Model",
      "dimension": "Sequences"
    },
    "s45": {
      "meaning": "Jaccard similarity",
      "context": "LSH",
      "dimension": "0 to 1"
    },
    "s46": {
      "meaning": "Bands / rows per band",
      "context": "LSH",
      "dimension": "Integers; signature length k=br"
    },
    "s47": {
      "meaning": "True/False positives/negatives",
      "context": "Evaluation",
      "dimension": "Counts"
    }
  },
  "ui": {
    "__patterns": [
      {
        "source": "^Weiter · (\\d+) von (\\d+)$",
        "flags": "u",
        "target": "Next · $1 of $2"
      },
      {
        "source": "^Weiter · (\\d+) von (\\d+) in Modul (\\d+)$",
        "flags": "u",
        "target": "Next · $1 of $2 in module $3"
      },
      {
        "source": "^Nächstes Modul · (\\d+)$",
        "flags": "u",
        "target": "Next module · $1"
      },
      {
        "source": "^(\\d+)% Kompetenz$",
        "flags": "u",
        "target": "$1% mastery"
      },
      {
        "source": "^(\\d+) min · (\\d+) Konzepte · (\\d+) Labs$",
        "flags": "u",
        "target": "$1 min · $2 concepts · $3 labs"
      },
      {
        "source": "^Stufe: (.+) · (\\d+) Formeln$",
        "flags": "u",
        "target": "Level: $1 · $2 formulas"
      },
      {
        "source": "^(.+) · (\\d+) Meilensteine · (\\d+) Selbstchecks$",
        "flags": "u",
        "target": "$1 · $2 milestones · $3 self-checks"
      },
      {
        "source": "^(\\d+)/(\\d+) Konzepte begonnen$",
        "flags": "u",
        "target": "$1/$2 concepts started"
      },
      {
        "source": "^(\\d+) Lesezeichen$",
        "flags": "u",
        "target": "$1 bookmarks"
      },
      {
        "source": "^Priorität: (.+)$",
        "flags": "u",
        "target": "Priority: $1"
      },
      {
        "source": "^(\\d+) von (\\d+) Konzepten$",
        "flags": "u",
        "target": "$1 of $2 concepts"
      },
      {
        "source": "^(\\d+) Konzepte$",
        "flags": "u",
        "target": "$1 concepts"
      },
      {
        "source": "^(\\d+) Formeln · Die vollständige Formel bleibt schon im geschlossenen Zustand sichtbar\\.$",
        "flags": "u",
        "target": "$1 formulas · The complete formula remains visible while the item is collapsed."
      },
      {
        "source": "^(\\d+) Symbole · Ein Symbol kann je nach Kapitel etwas anderes bedeuten\\.$",
        "flags": "u",
        "target": "$1 symbols · A symbol may mean different things in different chapters."
      },
      {
        "source": "^(\\d+) Begriffe$",
        "flags": "u",
        "target": "$1 terms"
      },
      {
        "source": "^Hinweis (\\d+)$",
        "flags": "u",
        "target": "Hint $1"
      },
      {
        "source": "^Hinweis (\\d+):$",
        "flags": "u",
        "target": "Hint $1:"
      },
      {
        "source": "^(\\d+)/(\\d+) richtig\\. (.+)$",
        "flags": "u",
        "target": "$1/$2 correct. $3"
      },
      {
        "source": "^Karte (\\d+) / (\\d+)$",
        "flags": "u",
        "target": "Card $1 / $2"
      },
      {
        "source": "^(\\d+) Suchergebnisse verfügbar\\. Mit Pfeiltasten auswählen\\.$",
        "flags": "u",
        "target": "$1 search results available. Use the arrow keys to select."
      },
      {
        "source": "^(\\d+)/(\\d+) Dokumente behalten$",
        "flags": "u",
        "target": "$1/$2 documents kept"
      },
      {
        "source": "^Antwort (\\d+)$",
        "flags": "u",
        "target": "Response $1"
      },
      {
        "source": "^(.+) – CS336 Lernwerk$",
        "flags": "u",
        "target": "$1 – CS336 Learning Lab"
      },
      {
        "source": "^Gewicht für (.+)$",
        "flags": "u",
        "target": "Weight for $1"
      },
      {
        "source": "^Softmax-Gewichte für Query „(.+)“$",
        "flags": "u",
        "target": "Softmax weights for query ‘$1’"
      },
      {
        "source": "^Summe: ([0-9.]+)\\. Niedrigere Temperatur schärft nur Unterschiede zwischen erlaubten Scores\\.$",
        "flags": "u",
        "target": "Sum: $1. A lower temperature sharpens only the differences between allowed scores."
      },
      {
        "source": "^η am Step (\\d+)$",
        "flags": "u",
        "target": "η at step $1"
      },
      {
        "source": "^BW·AI = (.+); Peak = (.+)\\. Das kleinere Dach begrenzt\\.$",
        "flags": "u",
        "target": "BW·AI = $1; peak = $2. The lower roof is the limiting one."
      },
      {
        "source": "^(.+) Dokumente behalten$",
        "flags": "u",
        "target": "$1 documents kept"
      },
      {
        "source": "^Gespeichert\\. Niedrigste Bereiche: (.+)\\. Schließe den Dialog für deinen aktualisierten Fokus\\.$",
        "flags": "u",
        "target": "Saved. Lowest-scoring areas: $1. Close the dialog to see your updated focus."
      },
      {
        "source": "^Erkläre (.+) ohne Vorlage\\.$",
        "flags": "u",
        "target": "Explain $1 without looking at a reference."
      },
      {
        "source": "^Modul (\\d+) · (.+)$",
        "flags": "u",
        "target": "Module $1 · $2"
      },
      {
        "source": "^(.+) · Formelkarte$",
        "flags": "u",
        "target": "$1 · Formula card"
      },
      {
        "source": "^(.+) · Lernmodus – keine Abgabelösungen$",
        "flags": "u",
        "target": "$1 · Learning mode – no ready-to-submit solutions"
      },
      {
        "source": "^Interaktives Lab · (.+)$",
        "flags": "u",
        "target": "Interactive lab · $1"
      },
      {
        "source": "^Q \\((.+)\\) · Kᵀ \\((.+)\\) → (.+)\\. H teilt D in (\\d+) Attention Heads mit dₖ=(.+)\\.$",
        "flags": "u",
        "target": "Q ($1) · Kᵀ ($2) → $3. H splits D into $4 Attention Heads with dₖ=$5."
      },
      {
        "source": "^Die Score-Aktivierung wächst mit B·H·T² = ([0-9.,]+) Elementen\\. Die Parameter der Linear Layers hängen nicht von B oder T ab\\.$",
        "flags": "u",
        "target": "The score activation grows with B·H·T² = $1 elements. The parameters of the Linear Layers do not depend on B or T."
      },
      {
        "source": "^Merge-Regeln: (.+)$",
        "flags": "u",
        "target": "Merge rules: $1"
      },
      {
        "source": "^Scorematrix QKᵀ/√d$",
        "flags": "u",
        "target": "Score matrix QKᵀ/√d"
      },
      {
        "source": "^Scorematrix QKᵀ/√d \\+ Maske$",
        "flags": "u",
        "target": "Score matrix QKᵀ/√d + mask"
      },
      {
        "source": "^Lernrate über 100 Schritte: Warmup bis zur maximalen Lernrate, danach Cosine-Abfall\\. Aktueller Schritt (\\d+), Lernrate (.+)\\.$",
        "flags": "u",
        "target": "Learning rate over 100 steps: warmup to the maximum learning rate, followed by cosine decay. Current step $1, learning rate $2."
      },
      {
        "source": "^Roofline-Diagramm: (.+) bei (.+) FLOP pro Byte, erreichbare Leistung (.+) TFLOP pro Sekunde und Ridge Point (.+) FLOP pro Byte\\.$",
        "flags": "u",
        "target": "Roofline diagram: $1 at $2 FLOP per byte, attainable performance $3 TFLOP per second, and ridge point $4 FLOP per byte."
      },
      {
        "source": "^Niedrigste Bereiche: (.+)\\. Schließe den Dialog für deinen aktualisierten Fokus\\.$",
        "flags": "u",
        "target": "Lowest-scoring areas: $1. Close the dialog to see your updated focus."
      },
      {
        "source": "^richtig\\. Erkläre jetzt drei Antworten laut ohne auf die Optionen zu schauen\\.$",
        "flags": "u",
        "target": "correct. Now explain three answers aloud without looking at the options."
      },
      {
        "source": "^richtig\\. Öffne die betroffenen Konzepte und beantworte die Frage später erneut\\.$",
        "flags": "u",
        "target": "correct. Open the relevant concepts and answer the question again later."
      },
      {
        "source": "PII maskiert",
        "flags": "gu",
        "target": "PII masked"
      },
      {
        "source": "PII sichtbar",
        "flags": "gu",
        "target": "PII visible"
      },
      {
        "source": "keine PII",
        "flags": "gu",
        "target": "no PII"
      },
      {
        "source": "· verworfen:",
        "flags": "gu",
        "target": "· rejected:"
      },
      {
        "source": "Gute Richtung\\. ",
        "flags": "gu",
        "target": "Good direction. "
      },
      {
        "source": "Wähle eine Metrik, die das behauptete Verhalten direkt operationalisiert\\. ",
        "flags": "gu",
        "target": "Choose a metric that directly operationalizes the claimed behavior. "
      },
      {
        "source": "Wähle zuerst Behauptung und Messregel – erst danach darf ein Score Bedeutung bekommen\\. ",
        "flags": "gu",
        "target": "Choose the claim and measurement rule first; only then can a score be meaningful. "
      },
      {
        "source": "Perplexity braucht gleichen Tokenizer, Kontext und Korpus\\.",
        "flags": "gu",
        "target": "Perplexity requires the same tokenizer, context handling, and corpus."
      },
      {
        "source": "Accuracy braucht Prompt-/Scoringregeln und Kontaminationsprüfung\\.",
        "flags": "gu",
        "target": "Accuracy requires explicit prompting and scoring rules plus contamination checks."
      },
      {
        "source": "Pairwise Judges brauchen Judge-Bias-, Kosten- und Einzelfallanalyse\\.",
        "flags": "gu",
        "target": "Pairwise judges require analyses of judge bias, cost, and individual cases."
      },
      {
        "source": "Berichte sowohl gefährliche Durchlässe als auch Überverweigerung\\.",
        "flags": "gu",
        "target": "Report both harmful requests that pass through and excessive refusal."
      },
      {
        "source": "Latenz allein reicht nicht; Throughput, Batch, Hardware und Kosten gehören dazu\\.",
        "flags": "gu",
        "target": "Latency alone is not enough; throughput, batch size, hardware, and cost also matter."
      },
      {
        "source": "Positive Advantages erhöhen im idealisierten Gradient-Ascent die Logwahrscheinlichkeit; negative senken sie\\. ",
        "flags": "gu",
        "target": "In idealized gradient ascent, positive Advantages increase log-probability and negative Advantages decrease it. "
      },
      {
        "source": "Durch σ teilen macht die Skala gruppenabhängig\\.",
        "flags": "gu",
        "target": "Dividing by σ makes the scale group-dependent."
      },
      {
        "source": "Ohne σ bleibt die Rewardskala erhalten\\.",
        "flags": "gu",
        "target": "Without σ, the reward scale is preserved."
      },
      {
        "source": "\\bSprache\\b",
        "flags": "gu",
        "target": "Language"
      },
      {
        "source": "\\bQualität\\b",
        "flags": "gu",
        "target": "Quality"
      },
      {
        "source": "\\bgeshardet\\b",
        "flags": "gu",
        "target": "sharded"
      },
      {
        "source": "idle; all-gather für Compute",
        "flags": "gu",
        "target": "idle; all-gathered for compute"
      },
      {
        "source": "\\bOperatorachsen\\b",
        "flags": "gu",
        "target": "operator axes"
      },
      {
        "source": "\\bLayergruppen\\b",
        "flags": "gu",
        "target": "layer groups"
      },
      {
        "source": "^(.+) · Stufe: (.+) · (\\d+) Formeln$",
        "flags": "u",
        "target": "$1 · Level: $2 · $3 formulas"
      },
      {
        "source": "^(.+) · ✓ angewandt$",
        "flags": "u",
        "target": "$1 · ✓ applied"
      },
      {
        "source": "^(.+) · ○ offen$",
        "flags": "u",
        "target": "$1 · ○ open"
      },
      {
        "source": "\\bZeitversetzt sicher\\b",
        "flags": "gu",
        "target": "Retained over time"
      },
      {
        "source": "\\bGesehen\\b",
        "flags": "gu",
        "target": "Seen"
      },
      {
        "source": "\\bErklärt\\b",
        "flags": "gu",
        "target": "Explained"
      },
      {
        "source": "\\bAngewandt\\b",
        "flags": "gu",
        "target": "Applied"
      },
      {
        "source": "\\bNeu\\b",
        "flags": "gu",
        "target": "New"
      }
    ],
    "CS336 Lernwerk - Language Models from Scratch": "CS336 Learning Lab - Language Models from Scratch",
    "Zum Lerninhalt springen": "Skip to learning content",
    "Hauptnavigation": "Main navigation",
    "CS336 Lernwerk": "CS336 Learning Lab",
    "Verstehen durch Bauen": "Understand by building",
    "Navigation schließen": "Close navigation",
    "Gesamtfortschritt": "Overall progress",
    "Navigation öffnen": "Open navigation",
    "Lernwerk durchsuchen": "Search the learning lab",
    "Konzepte, Formeln, Symbole, Assignments …": "Concepts, formulas, symbols, assignments …",
    "Suchergebnisse": "Search results",
    "Notizen öffnen": "Open notes",
    "Konto und Synchronisation öffnen": "Open account and sync settings",
    "Farbschema wechseln": "Switch color scheme",
    "Lernwerk": "Learning Lab",
    "Dialog": "Dialog",
    "Dialog schließen": "Close dialog",
    "Heute": "Today",
    "Lernpfad": "Learning Path",
    "Konzepte": "Concepts",
    "Formeln & Symbole": "Formulas & Symbols",
    "Abruftraining": "Retrieval Practice",
    "Glossar": "Glossary",
    "Notizen": "Notes",
    "Neu": "New",
    "Gesehen": "Seen",
    "Erklärt": "Explained",
    "Angewandt": "Applied",
    "Zeitversetzt sicher": "Retained over time",
    "Gespeichert": "Saved",
    "Gespeichert.": "Saved.",
    "Lesezeichen entfernt": "Bookmark removed",
    "Lab als angewandt markiert": "Lab marked as applied",
    "Lab-Markierung entfernt": "Lab marker removed",
    "--- Automatisch aus zwei Geräten zusammengeführt ---": "--- Automatically merged from two devices ---",
    "Lokales Speichern fehlgeschlagen": "Local save failed",
    "Nur lokale Speicherung": "Local storage only",
    "Anmelden und synchronisieren": "Sign in and sync",
    "Synchronisierung läuft": "Sync in progress",
    "Mit Supabase synchronisiert": "Synced with Supabase",
    "Offline – Änderungen bleiben lokal": "Offline – changes remain on this device",
    "Synchronisierung prüfen": "Check sync",
    "Konto und Synchronisation": "Account and sync",
    "Synchronisationskonflikt konnte nicht zusammengeführt werden.": "The sync conflict could not be merged.",
    "Als App installiert.": "Installed as an app.",
    "Das Lernwerk läuft im Home-Screen-Modus.": "The learning lab is running in Home Screen mode.",
    "Auf diesem Gerät installieren": "Install on this device",
    "Auf iPhone/iPad installieren:": "Install on iPhone/iPad:",
    "In Safari „Teilen“ und dann „Zum Home-Bildschirm“ wählen.": "In Safari, tap Share, then Add to Home Screen.",
    "Du kannst die Seite im Browser verwenden oder über das Browsermenü zum Startbildschirm hinzufügen.": "You can use the site in your browser or add it to your Home Screen from the browser menu.",
    "Konto & Synchronisation": "Account & Sync",
    "Lokaler Modus": "Local mode",
    "Die Lernhilfe funktioniert vollständig lokal.": "The learning aid works fully offline on this device.",
    "Für die Cloud-Synchronisation fehlen noch die Supabase-Projektwerte.": "The Supabase project settings required for cloud sync have not been configured yet.",
    "Anmelden": "Sign in",
    "Geräteübergreifendes Lernen": "Learn across devices",
    "Melde dich mit dem im Supabase-Dashboard angelegten Konto an. Registrierung ist bewusst deaktiviert.": "Sign in with the account created in the Supabase dashboard. Public registration is intentionally disabled.",
    "E-Mail": "Email",
    "Passwort": "Password",
    "Anmeldung läuft …": "Signing in …",
    "Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.": "Sign-in failed. Check your email and password.",
    "Angemeldet – Lernstand wird synchronisiert": "Signed in – syncing learning progress",
    "Lokale Änderungen ausstehend": "Local changes pending",
    "Aktuell synchronisiert": "Up to date",
    "Angemeldet als": "Signed in as",
    "Supabase-Benutzer": "Supabase user",
    "Fortschritt, Notizen und Lesezeichen werden zwischen deinen Geräten synchronisiert. Theme und zuletzt geöffnete Seite bleiben gerätespezifisch.": "Progress, notes, and bookmarks are synced across your devices. The theme and last-opened page remain device-specific.",
    "Jetzt synchronisieren": "Sync now",
    "Abmelden": "Sign out",
    "Synchronisierung geprüft": "Sync checked",
    "Abgemeldet": "Signed out",
    "Private PDF-Anbindung ist noch nicht konfiguriert.": "Private PDF access has not been configured yet.",
    "Melde dich an, um die private Quelle zu öffnen.": "Sign in to open this private source.",
    "PDFs benötigen eine Internetverbindung.": "PDFs require an internet connection.",
    "PDF konnte nicht sicher geöffnet werden.": "The PDF could not be opened securely.",
    "Helles Farbschema": "Light color scheme",
    "Dunkles Farbschema": "Dark color scheme",
    "Musterlösung anzeigen": "Show model answer",
    "Konzeptnavigation": "Concept navigation",
    "Ende des Lernpfads": "End of the learning path",
    "Zur Lernpfadübersicht →": "Back to the learning path →",
    "Kompetenz": "Mastery",
    "Stufe:": "Level:",
    "Formeln": "Formulas",
    "Lesezeichen entfernen": "Remove bookmark",
    "Konzept speichern": "Save concept",
    "Interaktiv": "Interactive",
    "✓ angewandt": "✓ applied",
    "○ offen": "○ open",
    "Meilensteine": "Milestones",
    "Selbstchecks": "Self-checks",
    "Wofür?": "What is it for?",
    "So liest du sie": "How to read it",
    "Dimensionen": "Dimensions",
    "Intuition": "Intuition",
    "Beispiel": "Example",
    "Typischer Fehler": "Common mistake",
    "Abrufcheck": "Retrieval check",
    "Variablen im Kontext": "Variables in context",
    "LaTeX kopieren": "Copy LaTeX",
    "★ Gespeichert": "★ Saved",
    "☆ Speichern": "☆ Save",
    "Vollständig öffnen": "Open full page",
    "Kontext": "Context",
    "Dimension oder Warnung": "Dimension or warning",
    "Ausführlicher erklärt": "Detailed explanation",
    "Dein Tutor für CS336": "Your CS336 tutor",
    "Verstehen, bevor du implementierst.": "Understand before you implement.",
    "Ein lernorientierter Begleiter für Language Models from Scratch: Erklärungen, Experimente, Formeln und gestufte Assignment-Hinweise – lokal und ohne Abgabelösungen.": "A learning-focused companion for Language Models from Scratch: explanations, experiments, formulas, and staged assignment hints – available locally and without ready-to-submit solutions.",
    "Nächster Fokus": "Next focus",
    "Lernen fortsetzen": "Continue learning",
    "Diagnose wiederholen": "Retake diagnostic",
    "12-Minuten-Diagnose": "12-minute diagnostic",
    "Kompetenzfortschritt": "Mastery progress",
    "Konzepte begonnen": "concepts started",
    "Lesezeichen": "Bookmarks",
    "Diagnose vorhanden": "Diagnostic completed",
    "Diagnose offen": "Diagnostic pending",
    "Start hier": "Start here",
    "Deine Lücken sollen die Reihenfolge bestimmen.": "Let your knowledge gaps determine the order.",
    "Die Diagnose prüft Anwendung statt Begriffsabfrage und markiert Bereiche als bereit, auffrischen oder Blocker.": "The diagnostic tests application rather than vocabulary recall and marks areas as ready, review, or blockers.",
    "Diagnose starten": "Start diagnostic",
    "Heute sinnvoll": "A useful session for today",
    "Ein kleiner Mix aus Fundament, Kurs und Abruf.": "A short mix of foundations, course material, and retrieval practice.",
    "Schnellzugriff": "Quick access",
    "Direkt dorthin, wo du gerade arbeiten willst.": "Jump directly to what you want to work on.",
    "Notation, Dimensionen und Fehlerbilder": "Notation, dimensions, and common failure modes",
    "Assignment Coach": "Assignment Coach",
    "Meilensteine und gestufte Hinweise": "Milestones and staged hints",
    "Lernlabore": "Learning labs",
    "Vorhersagen und Parameter testen": "Test predictions and parameters",
    "Diagnose": "Diagnostic",
    "Priorität:": "Priority:",
    "Konzentriere dich zuerst auf die niedrigsten Bereiche; bekannte Module kannst du schneller durch Selbstchecks passieren.": "Focus on the lowest-scoring areas first; you can move through familiar modules more quickly using the self-checks.",
    "Neu prüfen": "Retake",
    "Tensorformen": "Tensor shapes",
    "Numerik": "Numerical stability",
    "Gradienten": "Gradients",
    "Daten": "Data",
    "Kurslandkarte": "Course map",
    "Vom Byte zum ausgerichteten Sprachmodell": "From bytes to an aligned language model",
    "Die Reihenfolge ist absichtlich kausal: Formen und Wahrscheinlichkeiten tragen den Transformer; dieser trägt Training, Systems, Daten, Evaluation und Reinforcement Learning.": "The order is intentionally causal: shapes and probability support the Transformer; the Transformer supports training, systems, data, evaluation, and Reinforcement Learning.",
    "Ziel:": "Goal:",
    "Modul öffnen": "Open module",
    "Voraussetzungen & Quellen": "Prerequisites & sources",
    "Die Schicht unter dem Code": "The layer beneath the code",
    "Jede Erklärung startet mit einem mentalen Modell, vertieft die Mechanik und endet mit Abruf- und Transferfragen.": "Each explanation starts with a mental model, develops the mechanics, and ends with retrieval and transfer questions.",
    "Konzepte durchsuchen …": "Search concepts …",
    "Konzepte durchsuchen": "Search concepts",
    "Nach Modul filtern": "Filter by module",
    "Alle Module": "All modules",
    "Kein Treffer.": "No results.",
    "Probiere englische Begriffe, Symbole oder die globale Suche.": "Try English terms, symbols, or the global search.",
    "Interaktive Lernlabore": "Interactive Learning Labs",
    "Erst vorhersagen, dann verändern": "Predict first, then change one thing",
    "Die Labs sind keine Animation zum Anschauen. Formuliere zuerst deine Erwartung, ändere genau einen Parameter und erkläre das Resultat.": "The labs are not animations to watch. State your expectation first, change exactly one parameter, and explain the result.",
    "Lernschleife:": "Learning loop:",
    "Vorhersagen → Parameter ändern → Ergebnis beobachten → mit Formel erklären → auf einen neuen Fall übertragen.": "Predict → change one parameter → observe the result → explain it with a formula → transfer it to a new case.",
    "Tafelwerk": "Formula Reference",
    "Formeln & Symbole mit Kontext": "Formulas & Symbols in Context",
    "Nicht nur kopieren: lies jede Formel, prüfe Dimensionen, verstehe ihre Einsatzgrenze und teste dich selbst.": "Do not merely copy: read every formula, check its dimensions, understand where it applies, and test yourself.",
    "Σ Formeln": "Σ Formulas",
    "α Symbole": "α Symbols",
    "Formeln und Symbole durchsuchen": "Search formulas and symbols",
    "Nach Kategorie filtern": "Filter by category",
    "Alle Kategorien": "All categories",
    "Symbole": "Symbols",
    " · Die vollständige Formel bleibt schon im geschlossenen Zustand sichtbar.": " · The complete formula remains visible while the item is collapsed.",
    " · Ein Symbol kann je nach Kapitel etwas anderes bedeuten.": " · A symbol may mean different things in different chapters.",
    "Prüfe Schreibweise oder entferne einen Filter.": "Check the spelling or remove a filter.",
    "Selbst lösen, gezielt Unterstützung holen": "Solve it yourself, get targeted support",
    "Die KI-Regeln des Kurses erlauben konzeptuelle Hilfe, nicht die Implementierung. Deshalb entsperrt eine eigene Hypothese nur allgemeine, gestufte Denkhinweise.": "The course AI policy permits conceptual help, not implementation. That is why your own hypothesis unlocks only general, staged reasoning hints.",
    "Lernmodus – keine Abgabelösungen.": "Learning mode – no ready-to-submit solutions.",
    "Der Coach liefert Voraussetzungen, Invarianten, Tests und Reflexionsfragen. Code und konkrete Deliverables bleiben deine Arbeit.": "The coach provides prerequisites, invariants, tests, and reflection questions. Code and concrete deliverables remain your work.",
    "Kannst du es ohne Vorlage erklären?": "Can you explain it without looking at a reference?",
    "Beantworte erst aus dem Gedächtnis. Feedback erklärt den Grund, nicht nur richtig oder falsch.": "Answer from memory first. The feedback explains why, not merely whether you were right or wrong.",
    "12 Kernfragen": "12 core questions",
    "Die Fragen decken A1 bis A5 ab. Dein Resultat verändert nicht automatisch den Kompetenzstatus – entscheide danach bewusst.": "The questions cover A1 through A5. Your result does not change mastery levels automatically – decide deliberately afterward.",
    "Stattdessen Karteikarten": "Use flashcards instead",
    "Antworten prüfen": "Check answers",
    "Ich weiß es nicht": "I don't know",
    "Richtig. ": "Correct. ",
    "Noch nicht. ": "Not yet. ",
    "richtig.": "correct.",
    "Erkläre jetzt drei Antworten laut ohne auf die Optionen zu schauen.": "Now explain three answers aloud without looking at the options.",
    "Öffne die betroffenen Konzepte und beantworte die Frage später erneut.": "Open the relevant concepts and answer the question again later.",
    "Abkürzungen und Fachbegriffe": "Abbreviations and technical terms",
    "Deutsch erklärt, englisch suchbar und nach Kurskontext gekennzeichnet.": "Explained in English, searchable in both languages, and labeled by course context.",
    "Begriff oder Abkürzung …": "Term or abbreviation …",
    "Glossar durchsuchen": "Search glossary",
    "Begriffe": "terms",
    "Probiere den englischen Begriff oder eine Abkürzung.": "Try the English term or an abbreviation.",
    "Dein Arbeitsgedächtnis": "Your working memory",
    "Notizen & Lesezeichen": "Notes & Bookmarks",
    "Schreibe Fragen, Erklärversuche und Fehlannahmen auf. Änderungen bleiben offline verfügbar und werden nach dem Login zwischen deinen Geräten synchronisiert.": "Write down questions, attempts at explanations, and misconceptions. Changes remain available offline and sync across your devices after sign-in.",
    "Freie Notizen": "Free-form notes",
    "Was kann ich noch nicht erklären? Welche Hypothese teste ich als Nächstes?": "What can I not explain yet? Which hypothesis will I test next?",
    "Notizen speichern": "Save notes",
    "Fortschritt exportieren": "Export progress",
    "Fortschritt importieren": "Import progress",
    "Gespeicherte Konzepte": "Saved concepts",
    "Noch keine.": "None yet.",
    "Gespeicherte Formeln": "Saved formulas",
    "Reflexionsprompt": "Reflection prompt",
    "„Ich dachte ___, beobachtete ___; deshalb ändere ich meine Erklärung zu ___.“": "‘I thought ___, observed ___; therefore I am changing my explanation to ___.’",
    "Notizen gespeichert": "Notes saved",
    "Zurück zur Übersicht": "Back to overview",
    "← Zurück zur Übersicht": "← Back to overview",
    "← Lernpfad": "← Learning Path",
    "← Konzepte": "← Concepts",
    "← Tafelwerk": "← Formula Reference",
    "← Assignments": "← Assignments",
    "← Labs": "← Labs",
    "Nicht gefunden": "Not found",
    "Dieser Lerninhalt existiert nicht.": "This learning item does not exist.",
    "Der Link ist möglicherweise veraltet. Nutze die Navigation oder kehre zur Übersicht zurück.": "The link may be outdated. Use the navigation or return to the overview.",
    "Modul": "Module",
    "Was du danach können sollst": "What you should be able to do afterward",
    "Nutze die Stufen bewusst: gesehen ist noch nicht beherrscht.": "Use the levels deliberately: having seen something is not the same as mastering it.",
    "Passende Labs": "Relevant labs",
    "Vorhersage zuerst, Erklärung zuletzt.": "Prediction first, explanation last.",
    "So nutzt du dieses Modul": "How to use this module",
    "Die Konzepte und Labs stehen in ihrer Lernreihenfolge direkt im Lernpfad. Diese Seite ergänzt nur Voraussetzungen, Quellen und Fortschritt.": "Concepts and labs appear in learning order directly in the learning path. This page only adds prerequisites, sources, and progress.",
    "Zum Modul im Lernpfad": "Go to this module in the learning path",
    "Quellen": "Sources",
    "Fortschritt": "Progress",
    "Mentales Modell": "Mental model",
    "Schritt für Schritt": "Step by step",
    "Typische Fehlannahmen": "Common misconceptions",
    "Aktiver Selbstcheck": "Active self-check",
    "Antworte zuerst selbst. Öffne danach die Musterlösung und vergleiche Begründung und Begriffe.": "Answer on your own first. Then open the model answer and compare the reasoning and terminology.",
    "Deine Erklärung in eigenen Worten": "Your explanation in your own words",
    "Ohne abzulesen: Ich erkläre es so …": "Without looking: I would explain it like this …",
    "Zu Notizen hinzufügen": "Add to notes",
    "Verknüpfte Formeln": "Linked formulas",
    "Kompetenzstufe": "Mastery level",
    "Wähle nur, was du belegen kannst.": "Choose only what you can demonstrate.",
    "Schreibe zuerst deinen Erklärversuch.": "Write your own explanation first.",
    "Erklärversuch zu Notizen hinzugefügt": "Explanation added to notes",
    "Formelkarte": "Formula card",
    "Formel": "Formula",
    "So liest du sie:": "How to read it:",
    "Dimensions- und Plausibilitätscheck": "Dimension and sanity check",
    "Kleines Beispiel": "Small example",
    "Antworte zuerst selbst und begründe deine Antwort. Öffne danach die Musterlösung.": "Answer on your own first and justify your answer. Then open the model answer.",
    "Quelle": "Source",
    "Einsatzgrenze": "Scope and limitations",
    "Formeln gelten unter den angegebenen Shapes und Annahmen. Bei Framework-APIs zusätzlich Achsen-, Masken- und Reduktionskonvention prüfen.": "Formulas apply under the stated shapes and assumptions. For framework APIs, also check axis, mask, and reduction conventions.",
    "Lernmodus – keine Abgabelösungen": "Learning mode – no ready-to-submit solutions",
    "KI-Richtlinie:": "AI policy:",
    "Erst eigener Versuch, dann gestufte Konzept- und Testhinweise. Der Coach erzeugt weder Code noch abgabefertige Antworten.": "Try it yourself first, then use staged conceptual and testing hints. The coach produces neither code nor ready-to-submit answers.",
    "Mentale Modelle": "Mental models",
    "Readiness-Selbstcheck": "Readiness self-check",
    "Versuche jede Frage zuerst selbst. Die aufklappbaren Konzeptantworten helfen beim Lernen, enthalten aber keinen Assignment-Code.": "Try each question yourself first. The expandable conceptual answers help you learn but contain no assignment code.",
    "Konzeptantwort anzeigen": "Show conceptual answer",
    "Deine Hypothese vor einem Hinweis": "Your hypothesis before a hint",
    "Was erwartest du, was beobachtest du, und welche Invariante könnte verletzt sein?": "What do you expect, what do you observe, and which invariant might be violated?",
    "Mindestens 20 Zeichen. Beispielstruktur: Ich erwarte …, beobachte …, mein kleinster trennender Test ist …": "At least 20 characters. Example structure: I expect …, observe …, and my smallest discriminating test is …",
    "Hypothese speichern": "Save hypothesis",
    "Hinweise werden nach einer eigenen, gespeicherten Hypothese entsperrt.": "Hints unlock after you save your own hypothesis.",
    "Hinweis": "Hint",
    "Definition of Done": "Definition of Done",
    "Voraussetzungen": "Prerequisites",
    "Verknüpfte Konzepte": "Linked concepts",
    "Originalquellen": "Original sources",
    "Formuliere eine konkretere Hypothese (mindestens 20 Zeichen).": "Write a more specific hypothesis (at least 20 characters).",
    "Hypothese gespeichert – Hinweise freigeschaltet": "Hypothesis saved – hints unlocked",
    "LaTeX kopiert": "LaTeX copied",
    "Kopieren nicht verfügbar": "Copying is unavailable",
    "Interaktives Lab": "Interactive lab",
    "Ziel & Vorhersage": "Goal & prediction",
    "Vor dem Regler:": "Before using a control:",
    "Formel-Wiederholung · zum Öffnen Symbolerklärungen anzeigen": "Formula refresher · open for symbol explanations",
    "Symbole in diesem Lab": "Symbols in this lab",
    "Typische Fehlannahme:": "Common misconception:",
    "Arbeitsweise:": "Method:",
    "Notiere eine Vorhersage. Ändere genau einen Regler. Beschreibe Beobachtung und Ursache mit einer verknüpften Formel.": "Write down a prediction. Change exactly one control. Describe the observation and its cause using a linked formula.",
    "Transfer": "Transfer",
    "Formuliere zuerst selbst eine Begründung. Öffne danach die Lösungsidee und vergleiche die Ursache, nicht nur das Ergebnis.": "Formulate your own reasoning first. Then open the solution idea and compare the cause, not just the result.",
    "Lösungsidee anzeigen": "Show solution idea",
    "✓ Als angewandt markiert": "✓ Marked as applied",
    "Als angewandt markieren": "Mark as applied",
    "Welche Shapes ändern sich, wenn nur die Sequenzlänge verdoppelt wird – und welche Parameterzahlen bleiben gleich?": "Which shapes change when only the sequence length is doubled, and which parameter counts stay the same?",
    "Wie beeinflusst ein größeres Vokabular Sequenzlänge, Embeddingkosten und seltene Sprachen?": "How does a larger vocabulary affect sequence length, embedding cost, and low-resource languages?",
    "Konstruiere einen Scorevektor, bei dem Temperatur fast keine Wirkung hat. Warum?": "Construct a score vector for which temperature has almost no effect. Why?",
    "Welche Größe muss beim Resume zusammen mit dem Optimizer gespeichert werden, damit die Lernrate fortgesetzt wird?": "What must be saved alongside the optimizer so the learning-rate schedule resumes correctly?",
    "Welche Annahme dieser Näherung bricht bei Mixture of Experts oder sehr langen Kontexten?": "Which assumption behind this approximation breaks for Mixture of Experts or very long contexts?",
    "Welche konkrete Codeänderung kann einen memory-bound Kernel nach rechts verschieben?": "What concrete code change can move a memory-bound kernel to the right?",
    "Welche Strategie würdest du innerhalb eines Nodes und welche über Nodes legen – warum?": "Which strategy would you use within a node and which across nodes, and why?",
    "Wie würdest du prüfen, ob das angezeigte Optimum nur ein Randminimum ist?": "How would you test whether the displayed optimum is only a boundary minimum?",
    "Welche verworfenen Beispiele würdest du manuell auditieren, um Filterbias zu erkennen?": "Which rejected examples would you audit manually to detect filtering bias?",
    "Welche Systemkomponente außer den Modellgewichten kann einen Benchmarkscore verändern?": "Which system component besides the model weights can change a benchmark score?",
    "Wie ändert Standardabweichungsnormalisierung die Gewichtung leichter und schwerer Promptgruppen?": "How does standard-deviation normalization change the weighting of easier and harder prompt groups?",
    "Erkläre das Ergebnis ohne auf die Oberfläche zu schauen.": "Explain the result without looking at the interface.",
    "Eingaben": "Inputs",
    "Batchgröße B": "Batch size B",
    "Tokens pro Sequenz T": "Tokens per sequence T",
    "Modelldimension D": "Model dimension D",
    "Ändere genau einen Wert. Lies danach jede Shape mit ihren Achsennamen, nicht nur als Zahlenfolge.": "Change exactly one value. Then read every Shape by its axis names, not merely as a sequence of numbers.",
    "Vorhersage: Welche Achse wird durch H aufgeteilt?": "Prediction: which axis is split into H parts?",
    "Interaktives Ergebnis": "Interactive result",
    "Mini-Korpus": "Mini-corpus",
    "Wörter mit Leerzeichen": "Space-separated words",
    "Zurücksetzen": "Reset",
    "Häufigstes Paar mergen": "Merge most frequent pair",
    "Ties werden hier lexikographisch gelöst, damit das Resultat deterministisch bleibt.": "Ties are broken lexicographically here so the result remains deterministic.",
    "Kontrollen": "Controls",
    "Queryposition": "Query position",
    "Der": "The",
    "Hund": "dog",
    "jagt": "chases",
    "ihn": "him",
    "Temperatur": "Temperature",
    "Kausale Maske aktiv": "Causal mask enabled",
    "Die Scores sind didaktische, feste QKᵀ/√d-Werte. Beobachte nur Softmax und Maske.": "The scores are fixed, didactic QKᵀ/√d values. Focus only on Softmax and the mask.",
    "Aktueller Step": "Current step",
    "Warmup-Steps": "Warmup steps",
    "Max-Lernrate η": "Maximum learning rate η",
    "Modellannahmen": "Model assumptions",
    "Breite D": "Width D",
    "Modelldimension D_model": "Model dimension D_model",
    "Vokabular V": "Vocabulary V",
    "Sequenz T": "Sequence T",
    "Trainingstokens": "Training tokens",
    "Trainingstokens D_tokens": "Training tokens D_tokens",
    "HBM-Bandbreite": "HBM bandwidth",
    "Ridge Point = Peak/Bandbreite. Links davon dominiert HBM-Traffic.": "Ridge point = peak/bandwidth. HBM traffic dominates to its left.",
    "Strategie": "Strategy",
    "Parallelisierungsart": "Parallelism strategy",
    "Frage zuerst: Wem gehört Parameter, Gradient und Optimizer-State zu jedem Zeitpunkt?": "First ask: who owns each parameter, gradient, and optimizer state at every point in time?",
    "Compute-Budget": "Compute budget",
    "GPU-Stunden": "GPU hours",
    "Effektive PFLOP/s pro GPU": "Effective PFLOP/s per GPU",
    "Token/Parameter-Verhältnis r=D/N": "Token-to-parameter ratio r=D/N",
    "Token/Parameter-Verhältnis r=D_tokens/N": "Token-to-parameter ratio r=D_tokens/N",
    "Das Optimum ist schematisch. In A3 muss r aus mehreren eingeklammerten IsoFLOPs-Profilen geschätzt werden.": "The optimum is schematic. In A3, r must be estimated from several bracketed IsoFLOPs profiles.",
    "Der Regler wählt nur eine compute-kompatible Aufteilung. Das Lossprofil ist schematisch; in A3 muss ein günstiges r aus mehreren eingeklammerten IsoFLOPs-Profilen geschätzt werden.": "The control selects only a compute-feasible allocation. The loss profile is schematic; in A3, a favorable r must be estimated from several bracketed IsoFLOPs profiles.",
    "Filterstufen": "Filter stages",
    "Englisch-Sprachfilter": "English-language filter",
    "PII maskieren": "Mask PII",
    "Qualitätsschwelle": "Quality threshold",
    "Audit immer sowohl verworfene als auch behaltene Beispiele.": "Always audit both rejected and retained examples.",
    "Behauptung": "Claim",
    "Was möchtest du belegen?": "What do you want to demonstrate?",
    "Das Modell sagt Domänentext gut voraus": "The model predicts in-domain text well",
    "Es beantwortet Wissensfragen": "It answers knowledge questions",
    "Es folgt Instruktionen": "It follows instructions",
    "Es verweigert schädliche Anfragen angemessen": "It appropriately refuses harmful requests",
    "Es ist kosteneffizient im Einsatz": "It is cost-efficient in deployment",
    "Gewählte Metrik": "Selected metric",
    "Latenz, Durchsatz und Kosten": "Latency, throughput, and cost",
    "Paarung prüfen": "Check pairing",
    "Rewards einer Promptgruppe": "Rewards for one prompt group",
    "Durch Gruppen-Std normalisieren": "Normalize by group standard deviation",
    "Mean-Centering vergleicht innerhalb des Prompts; Std-Normalisierung ändert zusätzlich die Gruppengewichtung.": "Mean-centering compares responses within a prompt; standard-deviation normalization additionally changes the weighting across groups.",
    "Lab folgt.": "Lab coming soon.",
    "Shape Ledger": "Shape ledger",
    "Shape Ledger: vom Token zum Attention-Output": "Shape ledger: from token to Attention output",
    "Jede Zeile zeigt erst die Bedeutung, dann die aktuelle Shape, danach Achsen und Rechnung. Q, K und V sind drei verschiedene Tensoren mit derselben Shape.": "Each row first gives the meaning, then the current Shape, followed by axes and calculation. Q, K, and V are three different tensors with the same Shape.",
    "Eingabe: Token-IDs": "Input: token IDs",
    "Die Eingabe enthält für jede Sequenz T ganzzahlige Token-IDs. Eine ID ist nur ein Index in die Embedding-Tabelle und noch kein gelernter Merkmalsvektor.": "The input contains T integer token IDs for each sequence. An ID is only an index into the Embedding table and is not yet a learned feature vector.",
    "Sequenzen im Batch": "sequences in the Batch",
    "Tokenpositionen je Sequenz": "token positions per sequence",
    "Embedding-Lookup erzeugt X": "The Embedding lookup produces X",
    "Die gelernte Tabelle E hat V Zeilen für das Vokabular und D Spalten für Merkmale. Für jede Token-ID wird eine Zeile nachgeschlagen. Das Ergebnis heißt konventionell X: der aktuelle Aktivierungstensor im Residual Stream.": "The learned table E has V rows for the vocabulary and D columns for features. One row is looked up for every token ID. The result is conventionally called X: the current activation tensor in the Residual Stream.",
    "Die gelernte Tabelle E_vocab hat V_vocab Zeilen für das Vokabular und D Spalten für Merkmale. Für jede Token-ID wird eine Zeile nachgeschlagen. Das Ergebnis heißt konventionell X: der aktuelle Aktivierungstensor im Residual Stream. V_vocab ist die Vokabulargröße; V bezeichnet später den Value-Tensor.": "The learned table E_vocab has V_vocab rows for the vocabulary and D columns for features. One row is looked up for every token ID. The result is conventionally called X: the current activation tensor in the Residual Stream. V_vocab is the vocabulary size; V later denotes the Value tensor.",
    "Sequenzen": "sequences",
    "Tokenpositionen": "token positions",
    "Merkmale pro Token": "features per token",
    "Drei Linear Layers erzeugen Q, K und V": "Three Linear Layers produce Q, K, and V",
    "Dasselbe X läuft durch drei getrennte gelernte Gewichtsmatrizen. Danach wird D in H Heads aufgeteilt und die Head-Achse nach vorn verschoben. Jede der drei Größen Q, K und V besitzt die folgende vierdimensionale Shape.": "The same X passes through three separate learned weight matrices. D is then split across H Heads and the Head axis is moved forward. Each of the three tensors Q, K, and V has the following four-dimensional Shape.",
    "Attention Heads": "Attention Heads",
    "Merkmale pro Head": "features per Head",
    "QKᵀ erzeugt rohe Compatibility Scores": "QKᵀ produces raw compatibility scores",
    "Für jeden Head vergleicht jede Queryposition i ihren Query-Vektor mit dem Key-Vektor jeder Position j. Der Dot Product ist ein roher Compatibility Score: größer bedeutet im aktuellen Merkmalsraum passender. Erst Maske und Softmax machen daraus Gewichte.": "For every Head, each Query position i compares its Query vector with the Key vector at every position j. The Dot Product is a raw compatibility score: larger means a better match in the current feature space. Only the mask and Softmax turn these scores into weights.",
    "Heads": "Heads",
    "Querypositionen i": "Query positions i",
    "Keypositionen j": "Key positions j",
    "Maske und Softmax erzeugen Attention-Gewichte": "Mask and Softmax produce Attention weights",
    "Eine kausale Maske setzt unerlaubte zukünftige Keys auf −∞. Softmax läuft für jede Query über die letzte Achse T_key; deshalb summiert sich jede erlaubte Queryzeile auf 1. Die Shape bleibt gleich.": "A causal mask sets forbidden future Keys to −∞. For each Query, Softmax runs over the final T_key axis, so every allowed Query row sums to 1. The Shape remains unchanged.",
    "Eine kausale Maske setzt unerlaubte zukünftige Keys auf −∞. Zusammen mit S_raw entstehen die maskierten Logits L. Softmax läuft für jede Query über die letzte Achse T_key; deshalb summiert sich jede erlaubte Queryzeile auf 1. Die Shape bleibt gleich.": "A causal mask sets forbidden future Keys to −∞. Together with S_raw it produces the masked logits L. For each Query, Softmax runs over the final T_key axis, so every allowed Query row sums to 1. The Shape remains unchanged.",
    "Querypositionen": "Query positions",
    "Gewichte über Keys": "weights over Keys",
    "Values mischen, Heads verbinden, Output abbilden": "Mix Values, concatenate Heads, map the output",
    "A bildet pro Query eine gewichtete Summe der Value-Vektoren. Danach werden die H Head-Vektoren wieder zu D Merkmalen verbunden und durch W_O gemischt. Der Block gibt deshalb wieder einen D-dimensionalen Vektor pro Token aus.": "For each Query, A forms a weighted sum of the Value vectors. The H Head vectors are then concatenated back into D features and mixed by W_O. The block therefore outputs one D-dimensional vector per token again.",
    "A bildet pro Query eine gewichtete Summe der Value-Vektoren. Z liegt noch als [B, H, T, d_head] vor: Vor dem Verbinden werden H und T zurückgetauscht, dann werden H·d_head Merkmale zu D zusammengefasst und durch W_O gemischt.": "For each Query, A forms a weighted sum of the Value vectors. Z is still arranged as [B, H, T, d_head]: before concatenation, H and T are transposed back, then H·d_head features are reshaped into D and mixed by W_O.",
    "verbundene Merkmale": "concatenated features",
    "Aktuelle Kurzrechnung": "Current short calculation",
    "Sofortergebnis": "Immediate result",
    "Head-Breite": "Head width",
    "Score-Kontraktion pro Head": "Score contraction per Head",
    "Score-Elemente insgesamt": "Total score elements",
    "Warum änderte sich genau das?": "Why did exactly that change?",
    "Warum stehen die Achsen an diesen Stellen?": "Why are the axes in these positions?",
    "B zählt unabhängige Sequenzen. Es bleibt deshalb die erste Achse jedes Aktivierungstensors und vergrößert die Elementzahl linear, ohne die Formen der Gewichtsmatrizen zu ändern.": "B counts independent sequences. It therefore remains the first axis of every activation tensor and increases the element count linearly without changing the Shapes of weight matrices.",
    "T zählt Tokenpositionen. In Q, K und V steht es an dritter Stelle, weil beim Aufteilen zusätzlich H vor die Tokenachse gesetzt wird: [B, H, T, d_head]. In den Scores steht T zweimal – einmal für Queryposition i und einmal für Keyposition j.": "T counts token positions. In Q, K, and V it appears in the third position because splitting inserts H before the token axis: [B, H, T, d_head]. In the scores, T appears twice—once for Query position i and once for Key position j.",
    "D ist die Gesamtzahl der Merkmale pro Token. Bei festem H ändert sich damit d_head = D/H; Batch-, Head- und Tokenachsen bleiben unverändert.": "D is the total number of features per token. With H fixed, d_head = D/H therefore changes, while the Batch, Head, and token axes remain unchanged.",
    "H ändert die Zahl der Heads und bei festem D entgegengesetzt d_head = D/H. Das Produkt H·d_head bleibt D, deshalb endet der Block wieder mit D Merkmalen pro Token.": "H changes the number of Heads and, with D fixed, changes d_head = D/H in the opposite direction. The product H·d_head remains D, so the block ends with D features per token again.",
    "Die Reihenfolge der Achsen ist ein Vertrag: X beginnt als [B, T, D]. Beim Aufteilen der letzten Achse wird daraus zunächst [B, T, H, d_head] und durch Transpose [B, H, T, d_head].": "Axis order is a contract: X starts as [B, T, D]. Splitting its final axis first gives [B, T, H, d_head], and transposing gives [B, H, T, d_head].",
    "Merksatz: Aktivierungsshapes hängen von B und T ab; Shapes gelernter Gewichtsmatrizen wie W_Q ∈ ℝ^(D×D) nicht. Deshalb ändert längerer Kontext den Rechen- und Aktivierungsspeicher, aber nicht die Parameterzahl.": "Remember: activation Shapes depend on B and T, while Shapes of learned weight matrices such as W_Q ∈ ℝ^(D×D) do not. A longer context therefore changes compute and activation memory, but not parameter count.",
    "X nach Embedding": "X after embedding",
    "Q, K, V pro Attention Head": "Q, K, V per Attention Head",
    "Kontraktion:": "Contraction:",
    "H teilt D in": "H splits D into",
    "Attention Heads mit": "Attention Heads with",
    "Die Score-Aktivierung wächst mit": "The score activation grows with",
    "Elementen. Die Parameter der Linear Layers hängen nicht von B oder T ab.": "elements. The parameters of the Linear Layers do not depend on B or T.",
    "Keine Paare mehr": "No pairs left",
    "Toy-Modell: Die Startsymbole sind hier Unicode-Zeichen. Echtes Byte-level BPE startet stattdessen von UTF-8-Bytes; die Paarzählung und Merge-Logik sind dieselben.": "Toy model: the initial symbols here are Unicode characters. True byte-level BPE starts from UTF-8 bytes instead; pair counting and merge logic are the same.",
    "Häufigste Nachbarpaare": "Most frequent adjacent pairs",
    "Aktuell häufigstes Paar": "Current most frequent pair",
    "Aktuelle Sequenzgröße": "Current sequence size",
    "Symbole im Mini-Korpus": "symbols in the mini-corpus",
    "Merge-Regeln:": "Merge rules:",
    "Merge-Regeln: noch keine": "Merge rules: none yet",
    "noch keine": "none yet",
    "+ Maske": "+ mask",
    "Von QKᵀ-Scores zu Attention-Gewichten": "From QKᵀ scores to Attention weights",
    "Von rohen QKᵀ-Scores zu Attention-Gewichten": "From raw QKᵀ scores to Attention weights",
    "Jede Zelle ist ein Compatibility Score zwischen einer Queryzeile und einer Keyspalte. Ein Score ist noch keine Wahrscheinlichkeit; erst Maske, Temperatur und Softmax erzeugen Gewichte.": "Each cell is a compatibility score between a Query row and a Key column. A score is not yet a probability; only the mask, temperature, and Softmax produce weights.",
    "Jede rohe Zelle S_raw misst die Compatibility zwischen einer Queryzeile und einer Keyspalte. Die Tabelle zeigt die daraus nach Maske und Temperatur entstehenden Logits L. Weder Score noch Logit ist bereits eine Wahrscheinlichkeit; erst Softmax erzeugt Gewichte.": "Each raw cell S_raw measures compatibility between a Query row and a Key column. The table shows the logits L produced after mask and temperature. Neither a score nor a logit is already a probability; only Softmax produces weights.",
    "Beziehung": "Relationship",
    "Aktuelle Query vor Maske und Temperatur": "Current Query before mask and temperature",
    "In Softmax eingesetzte Werte": "Values passed into Softmax",
    "Ergebnis": "Result",
    "Softmax-Gewichte für die gewählte Query": "Softmax weights for the selected Query",
    "Was passiert danach?": "What happens next?",
    "Die Gewichte mischen die Value-Vektoren: z_i = Σ_j A_ijv_j. Dieses Lab zeigt keine konkreten Values und kann deshalb den Outputvektor z_i nicht numerisch ausrechnen; es zeigt den vollständigen Weg bis zu den Mischgewichten.": "The weights mix the Value vectors: z_i = Σ_j A_ijv_j. This lab does not provide concrete Values and therefore cannot calculate the output vector z_i numerically; it shows the complete path up to the mixing weights.",
    "Jede erlaubte Zeile summiert sich zu 1. Eine niedrigere Temperatur schärft nur Unterschiede zwischen erlaubten Scores; maskierte Positionen bleiben bei Gewicht 0.": "Every allowed row sums to 1. A lower temperature sharpens only differences between allowed scores; masked positions remain at weight 0.",
    "Attention-Scores: Zeilen sind Queries, Spalten sind Keys.": "Attention scores: rows are queries and columns are keys.",
    "Attention-Logits: Zeilen sind Queries, Spalten sind Keys.": "Attention logits: rows are Queries and columns are Keys.",
    "Query / Key": "Query / key",
    "Gewicht für": "Weight for",
    "Summe:": "Sum:",
    "Niedrigere Temperatur schärft nur Unterschiede zwischen erlaubten Scores.": "A lower temperature sharpens only the differences between allowed scores.",
    "Lernratenverlauf": "Learning-rate schedule",
    "Vertikale Achse: Learning Rate η · horizontale Achse: Optimizer-Step t": "Vertical axis: Learning Rate η · horizontal axis: Optimizer step t",
    "Schedule am aktuellen Step": "Schedule at the current step",
    "Vereinfachter erster AdamW-Step": "Simplified first AdamW step",
    "Einsetzen": "Substitution",
    "Lernrate über 100 Schritte: Warmup bis zur maximalen Lernrate, danach Cosine-Abfall.": "Learning rate over 100 steps: warmup to the maximum learning rate, followed by cosine decay.",
    "Aktueller Schritt": "Current step",
    "Lernrate": "Learning rate",
    "0 Schritte · Lernrate 0": "0 steps · learning rate 0",
    "100 Schritte · Lernrate η": "100 steps · learning rate η",
    "θ neu aus θ=1, vereinfachtem erstem AdamW-Step": "new θ from θ=1 and a simplified first AdamW step",
    "Beim ersten Moment-korrigierten Schritt ist m̂≈g und √v̂≈|g|. Das zeigt die adaptive Skalierung, ersetzt aber keinen vollständigen Mehrschritt-Simulator.": "At the first bias-corrected step, m̂≈g and √v̂≈|g|. This illustrates adaptive scaling but does not replace a complete multi-step simulator.",
    "Parameter ≈12LD²+VD": "Parameters ≈12LD²+VD",
    "Überschlagsrechnung mit eingesetzten Werten": "Back-of-the-envelope calculation with current values",
    "Modellparameter N": "Model parameters N",
    "Persistenter AdamW-State": "Persistent AdamW state",
    "Gemischter Trainingszustand": "Mixed training state",
    "Naiv materialisierte Attention-Scoreelemente": "Naively materialized Attention-score elements",
    "Attention-Scoreelemente": "Attention score elements",
    "Trainings-Compute": "Training compute",
    "Idealisierte Laufzeit": "Idealized runtime",
    "Warum reagieren die Regler unterschiedlich?": "Why do the controls behave differently?",
    "L und V stehen linear in der Parameterschätzung. D_model steht im dominanten Transformer-Term quadratisch. T verändert diese Parameterzahl nicht, lässt die hier gezeigten vollständigen Attention-Scores aber quadratisch wachsen.": "L and V enter the parameter estimate linearly. D_model enters the dominant Transformer term quadratically. T does not change this parameter count, but it makes the full Attention scores shown here grow quadratically.",
    "L und V_vocab stehen linear in der Parameterschätzung. D_model steht im dominanten Transformer-Term quadratisch. T verändert diese Parameterzahl nicht, lässt naiv materialisierte vollständige Attention-Scores aber quadratisch wachsen.": "L and V_vocab enter the parameter estimate linearly. D_model enters the dominant Transformer term quadratically. T does not change this parameter count, but it makes naively materialized full Attention scores grow quadratically.",
    "Die Parameterformel nimmt Weight Tying an; ohne geteiltes Input-Embedding und Output Linear Layer kommt ungefähr V_vocab·D_model hinzu. Die 16 Byte setzen BFloat16-Parameter und -Gradienten, eine FP32-Masterkopie und zwei FP32-Adam-Momente voraus. FlashAttention materialisiert die vollständige T²-Scorematrix nicht. Die 6N·D_tokens-Rechnung ist eine Konventionsnäherung, keine exakte Operationszählung.": "The parameter formula assumes Weight Tying; without a shared Input Embedding and Output Linear Layer, approximately V_vocab·D_model is added. The 16 bytes assume BFloat16 parameters and gradients, an FP32 master copy, and two FP32 Adam moments. FlashAttention does not materialize the full T² score matrix. The 6N·D_tokens calculation is a conventional approximation, not an exact operation count.",
    "AdamW-State bei 16 Byte/Parameter": "AdamW state at 16 bytes per parameter",
    "T²-Scoreelemente über alle Layer, B=H=1": "T² score elements across all layers, B=H=1",
    "bei effektiv 400 TFLOP/s": "at an effective 400 TFLOP/s",
    "Näherung:": "Approximation:",
    "Aktivierungen, GQA/SwiGLU-Details, Embedding-Tying, Kommunikation und Attention-Zusatz-FLOPs sind setupabhängig. Nutze die Rechnung zum Plausibilisieren, nicht als Speicherzusage.": "Activations, GQA/SwiGLU details, embedding tying, communication, and additional Attention FLOPs depend on the setup. Use this calculation as a sanity check, not as a memory guarantee.",
    "Roofline-Dach": "Roofline roof",
    "Vertikale Achse: erreichbare Leistung in TFLOP/s · horizontale Achse: Arithmetic Intensity in FLOP/Byte, logarithmisch": "Vertical axis: attainable performance in TFLOP/s · horizontal axis: Arithmetic Intensity in FLOP/byte, logarithmic",
    "Vertikale Achse: erreichbare Leistung in TFLOP/s · horizontale Achse: Arithmetic Intensity in FLOP pro HBM-Byte, logarithmisch": "Vertical axis: attainable performance in TFLOP/s · horizontal axis: Arithmetic Intensity in FLOPs per HBM byte, logarithmic",
    "Am Ridge Point": "At the ridge point",
    "Roofline-Diagramm mit logarithmischer Arithmetic-Intensity-Achse": "Roofline diagram with a logarithmic Arithmetic-Intensity axis",
    "Bandbreiten-Dach": "Bandwidth roof",
    "Compute-Dach": "Compute roof",
    "Erreichbare Obergrenze": "Attainable upper bound",
    "Warum diese Klassifikation?": "Why this classification?",
    "BW·AI ist kleiner als P_peak: Der Kernel wartet im Modell auf Datentransfer. Mehr Arithmetic Intensity oder Bandbreite kann das Dach anheben.": "BW·AI is below P_peak: in this model the Kernel waits for data transfer. More Arithmetic Intensity or bandwidth can raise the roof.",
    "P_peak ist kleiner als BW·AI: Zusätzliche Arithmetic Intensity hebt das Dach nicht weiter an; nun begrenzt die Rechenleistung.": "P_peak is below BW·AI: additional Arithmetic Intensity no longer raises the roof; compute throughput is now the limit.",
    "BW_HBM·AI und P_peak sind gleich groß: Der Kernel liegt genau am Ridge Point; beide Dächer treffen sich.": "BW_HBM·AI and P_peak are equal: the Kernel lies exactly at the ridge point where both roofs meet.",
    "BW_HBM·AI ist kleiner als P_peak: Der Kernel wartet im Modell auf HBM-Datentransfer. Mehr Arithmetic Intensity oder HBM-Bandbreite kann das Dach anheben.": "BW_HBM·AI is below P_peak: in this model the Kernel waits for HBM data transfer. More Arithmetic Intensity or HBM bandwidth can raise the roof.",
    "P_peak ist kleiner als BW_HBM·AI: Zusätzliche Arithmetic Intensity hebt das Dach nicht weiter an; nun begrenzt die Rechenleistung.": "P_peak is below BW_HBM·AI: additional Arithmetic Intensity no longer raises the roof; compute throughput is now the limit.",
    "Roofline-Diagramm:": "Roofline diagram:",
    "bei": "at",
    "erreichbare Leistung": "attainable performance",
    "pro Sekunde und Ridge Point": "per second and ridge point",
    "pro Byte.": "per byte.",
    "Niedrige Arithmetic Intensity": "Low Arithmetic Intensity",
    "Hohe Arithmetic Intensity": "High Arithmetic Intensity",
    "Das kleinere Dach begrenzt.": "The lower roof is the limiting one.",
    "voll repliziert": "fully replicated",
    "P steht für Parameter, G für Gradienten und O für Optimizer-State. Die Boxen zeigen den dauerhaften Besitz pro Rank; temporäre Gathers können darüber hinausgehen.": "P stands for parameters, G for gradients, and O for Optimizer state. The boxes show persistent ownership per Rank; temporary gathers can exceed it.",
    "Parameter": "parameters",
    "Optimizer-State": "Optimizer state",
    "Speichernäherung pro Rank": "Memory approximation per Rank",
    "Dominante Kommunikation": "Dominant communication",
    "DDP teilt den Batch, aber nicht den persistenten Zustand: Der Speicher pro Rank schrumpft mit größerem W nicht; der replizierte Gesamtzustand des Clusters wächst.": "DDP splits the Batch but not persistent state: memory per Rank does not shrink as W grows, while total replicated state across the cluster increases.",
    "voll, danach All-Reduce": "full, followed by All-Reduce",
    "Gradient All-Reduce": "Gradient All-Reduce",
    "Teilt den Batch; einfache Rechenparallelität, aber State wächst nicht mit W.": "Splits the batch; straightforward compute parallelism, but state does not shrink with W.",
    "geshardet": "sharded",
    "Spart Gradient und Optimizer State; Parameter bleiben repliziert.": "Saves gradient and optimizer-state memory; parameters remain replicated.",
    "idle; all-gather für Compute": "idle; all-gathered for compute",
    "Layerweise All-Gather + Reduce-Scatter": "Per-layer All-Gather + Reduce-Scatter",
    "Maximaler State-Speichervorteil, mehr Lifecycle- und Peak-Komplexität.": "Maximum state-memory savings, with greater lifecycle and peak-memory complexity.",
    "Operatorachsen": "operator axes",
    "All-Reduce / All-Gather im Layer": "All-Reduce / All-Gather within the layer",
    "Teilt Breite; schnelle Interconnects innerhalb eines Nodes bevorzugt.": "Splits model width; prefer fast interconnects within a node.",
    "Layergruppen": "layer groups",
    "Aktivierungen zwischen Stages": "Activations between stages",
    "Teilt Tiefe; Microbatches amortisieren Pipeline-Bubbles.": "Splits model depth; microbatches amortize pipeline bubbles.",
    "dominantes Kommunikationsmuster": "dominant communication pattern",
    "Schematisches Compute-Optimum": "Schematic compute optimum",
    "Compute-kompatible Aufteilung": "Compute-feasible allocation",
    "Parameter bei gewähltem r": "Parameters at the selected r",
    "Plausibilitätscheck": "Sanity check",
    "Illustratives IsoFLOPs-Lossprofil": "Illustrative IsoFLOPs loss profile",
    "Vertikale Achse: schematischer Validation Loss · horizontale Achse: Parameter N bei festem C": "Vertical axis: schematic validation loss · horizontal axis: parameters N at fixed C",
    "Vertikale Achse: schematischer Validation Loss · horizontale Achse: Parameter N bei festem C · Ring: aktuell gewähltes r": "Vertical axis: schematic validation loss · horizontal axis: parameters N at fixed C · ring: currently selected r",
    "Schematisches IsoFLOPs-Lossprofil mit markierter aktueller Aufteilung": "Schematic IsoFLOPs loss profile with the current allocation highlighted",
    "viele Tokens": "many tokens",
    "wenige Tokens": "few tokens",
    "Der Ring bewegt sich mit dem gewählten r entlang derselben festen-Compute-Kurve. Die Kurve bleibt ein didaktischer Loss-Proxy und ist nicht aus echten Runs gefittet; ein empirisches Optimum braucht Messpunkte auf beiden Seiten.": "The ring moves along the same fixed-compute curve with the selected r. The curve remains a didactic loss proxy and is not fitted to real runs; an empirical optimum requires measurements on both sides.",
    "Die Formel erzeugt nur einen compute-kompatiblen Punkt für das gewählte r. Die Losskurve ist illustrativ und nicht aus echten Runs gefittet; ein empirisches Optimum braucht Messpunkte auf beiden Seiten.": "The formula produces only a compute-feasible point for the selected r. The loss curve is illustrative and not fitted to real runs; an empirical optimum requires measurements on both sides.",
    "N bei gewähltem r": "N at the selected r",
    "U-förmiges schematisches IsoFLOPs-Lossprofil: links kleine Modelle mit vielen Tokens, rechts große Modelle mit wenigen Tokens.": "U-shaped schematic IsoFLOPs loss profile: small models with many tokens on the left, large models with few tokens on the right.",
    "Kleines N · viele Tokens": "Small N · many tokens",
    "Großes N · wenige Tokens": "Large N · few tokens",
    "Die Losskurve ist absichtlich illustrativ, nicht aus echten Runs gefittet. A3 verlangt Messpunkte beidseits jedes Minimums.": "The loss curve is intentionally illustrative and is not fitted to real runs. A3 requires measurements on both sides of every minimum.",
    "Tutorial mit Code": "Tutorial with code",
    "Kopiertes Tutorial": "Copied tutorial",
    "Forum mit E-Mail": "Forum post with email",
    "Deutscher Fachartikel": "German technical article",
    "SEO-Wortsalat": "SEO word salad",
    "Counter-Speech-Zitat": "Counter-speech quotation",
    "Sprache": "Language",
    "Qualität": "Quality",
    "Dokumente behalten": "documents kept",
    "Entscheidungsregel": "Decision rule",
    "Aktuelles Ergebnis": "Current result",
    "Behalterate": "retention rate",
    "PII-Maskierung ist hier eine Transformation und kein Ausschlussfilter: Sie verändert markierte Inhalte, entscheidet aber nicht über keep(d).": "PII masking is a transformation here, not an exclusion filter: it changes marked content but does not decide keep(d).",
    "PII maskiert": "PII masked",
    "PII sichtbar": "PII visible",
    "keine PII": "no PII",
    "· verworfen:": "· rejected:",
    "Beobachte den möglichen False Positive „Deutscher Fachartikel“ und den kontextabhängigen Grenzfall „Counter-Speech-Zitat“.": "Observe the possible false positive ‘German technical article’ and the context-dependent edge case ‘counter-speech quotation.’",
    "Perplexity braucht gleichen Tokenizer, Kontext und Korpus.": "Perplexity requires the same tokenizer, context handling, and corpus.",
    "Accuracy braucht Prompt-/Scoringregeln und Kontaminationsprüfung.": "Accuracy requires explicit prompting and scoring rules plus contamination checks.",
    "Pairwise Judges brauchen Judge-Bias-, Kosten- und Einzelfallanalyse.": "Pairwise judges require analyses of judge bias, cost, and individual cases.",
    "Berichte sowohl gefährliche Durchlässe als auch Überverweigerung.": "Report both harmful requests that pass through and excessive refusal.",
    "Latenz allein reicht nicht; Throughput, Batch, Hardware und Kosten gehören dazu.": "Latency alone is not enough; throughput, batch size, hardware, and cost also matter.",
    "Plausible Primärmetrik": "Plausible primary metric",
    "Metrik passt nicht zur Behauptung": "The metric does not match the claim",
    "Design vor dem Score": "Design before score",
    "Gute Richtung. ": "Good direction. ",
    "Wähle eine Metrik, die das behauptete Verhalten direkt operationalisiert. ": "Choose a metric that directly operationalizes the claimed behavior. ",
    "Wähle zuerst Behauptung und Messregel – erst danach darf ein Score Bedeutung bekommen. ": "Choose the claim and measurement rule first; only then can a score be meaningful. ",
    "Immer zusätzlich prüfen": "Always check as well",
    "Einzelinstanzen und Failure Modes": "Individual examples and failure modes",
    "Prompting, Sampling und Scorer": "Prompting, sampling, and the scorer",
    "Kontamination, Streuung und Kosten": "Contamination, variance, and cost",
    "Gruppenrelatives Lernsignal": "Group-relative learning signal",
    "Gruppenmittel": "Group mean",
    "Streuung": "Spread",
    "Advantage je Antwort": "Advantage per response",
    "Gruppenmittel μ": "Group mean μ",
    "Gruppen-Std σ": "Group standard deviation σ",
    "Antwort": "Response",
    "Alle Rewards sind gleich: Nach Zentrierung gibt es kein relatives Lernsignal.": "All rewards are equal: after centering, there is no relative learning signal.",
    "Positive Advantages erhöhen im idealisierten Gradient-Ascent die Logwahrscheinlichkeit; negative senken sie.": "In idealized gradient ascent, positive Advantages increase log-probability and negative Advantages decrease it.",
    "Durch σ teilen macht die Skala gruppenabhängig.": "Dividing by σ makes the scale group-dependent.",
    "Ohne σ bleibt die Rewardskala erhalten.": "Without σ, the reward scale is preserved.",
    "Grundlagen-Diagnose": "Foundations diagnostic",
    "12 Minuten · ohne Hilfsmittel": "12 minutes · closed book",
    "Beantworte aus deinem aktuellen Verständnis. Das Ergebnis priorisiert den Lernpfad, benotet dich aber nicht.": "Answer from your current understanding. The result prioritizes your learning path but does not grade you.",
    "Auswerten": "Evaluate",
    "Bitte beantworte alle Fragen.": "Please answer every question.",
    "Niedrigste Bereiche:": "Lowest-scoring areas:",
    "Schließe den Dialog für deinen aktualisierten Fokus.": "Close the dialog to see your updated focus.",
    "Karteikarten": "Flashcards",
    "Aktives Abrufen": "Active retrieval",
    "Karte": "Card",
    "Antwort anzeigen": "Show answer",
    "Zurück": "Previous",
    "Nächste Karte": "Next card",
    "Antwort sichtbar": "Answer shown",
    "Fortschritt exportiert": "Progress exported",
    "Fortschritt importiert": "Progress imported",
    "Ungültige Fortschrittsdatei": "Invalid progress file",
    "Konzept": "Concept",
    "Symbol": "Symbol",
    "Kein Treffer": "No results",
    "Keine Suchergebnisse.": "No search results.",
    "Probiere englische Begriffe, Unicode-Symbole oder Codebezeichner wie d_model.": "Try English terms, Unicode symbols, or code identifiers such as d_model.",
    "Suchergebnisse verfügbar. Mit Pfeiltasten auswählen.": "search results available. Use the arrow keys to select.",
      "z. B. d_model, ∇, Perplexity, 6ND …": "e.g. d_model, ∇, Perplexity, 6ND …",
      "Merge-Regeln: noch keine": "Merge rules: none yet",
      "noch keine": "none yet"
  }
});
