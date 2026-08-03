window.CS336_EN = Object.freeze({
  "nav": {
    "dashboard": "Overview",
    "path": "Lectures",
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
    "l10": {
      "label": "Lecture 10 - Inference & Serving"
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
    "l14": {
      "label": "Lecture 14 - Filtering & Deduplication"
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
      "stage": "Prerequisite Sprint",
      "title": "Python, PyTorch, Math & Tensor Thinking",
      "description": "Targeted closure of the practical and mathematical gaps that otherwise cost many debugging hours in A1 and A2.",
      "outcome": "You can track data representations, tensor state, modules, tests, shapes, gradients, and resources as verifiable contracts.",
      "prereqs": [
        "Read basic Python syntax",
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
      "title": "GPU, Profiling, Triton & FlashAttention",
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
    "inference": {
      "stage": "Deployment",
      "title": "Inference & Serving",
      "description": "Prefill, decoding, the Key-Value Cache (KV Cache), latency, throughput, and the main serving optimizations from Lecture 10.",
      "outcome": "You can decompose an inference workload, estimate memory and bottlenecks, and make justified serving trade-offs.",
      "prereqs": [
        "Transformer Attention",
        "GPU Roofline"
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
    "data": {
      "stage": "A4",
      "title": "Data: Collecting, Filtering, Deduplicating",
      "description": "From Common Crawl documents through Language Identification, KenLM, fastText, and Data Selection via Importance Resampling (DSIR) to Bloom Filters, MinHash, Locality-Sensitive Hashing (LSH), and tokenization.",
      "outcome": "You can justify model-based data selection, audit its distributional effects, and build memory-efficient, verifiable deduplication stages.",
      "prereqs": [
        "Tokenizer",
        "Basic Statistics",
        "Evaluation Without Self-Deception"
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
    "python-engineering": {
      "title": "Python Data Contracts: Text, Bytes, Streaming & Determinism",
      "level": "Prerequisite",
      "summary": "Before a tokenizer can process text, Python must translate raw documents into bytes unambiguously, read large corpora piece by piece, and make every transformation reproducible.",
      "context": "This is the start of the data path: raw document → Python text (str) → UTF-8 bytes → tokenizer → token IDs. This concept stops at the tokenizer's reliable input; later concepts explain how Byte-Pair Encoding learns tokens and how token IDs become training batches.",
      "why": "If text and bytes are confused, iterators become empty unnoticed, or ties are resolved incidentally, the resulting token corpus changes. That can corrupt characters, drop documents, and make two supposedly identical experiments diverge.",
      "terms": [
        ["Unicode", "A standard that assigns an abstract code point to every text symbol; it does not yet specify the bytes stored in a file."],
        ["UTF-8", "Unicode Transformation Format 8-bit: an encoding that stores Unicode code points as one to four bytes."],
        ["Byte-Pair Encoding (BPE)", "A tokenization method that joins frequent adjacent byte sequences into longer tokens."],
        ["iterator / generator", "A Python object that yields values one at a time on demand and may be exhausted after one pass."],
        ["Counter", "A Python counting container; during BPE training it can count the frequencies of adjacent byte pairs."],
        ["regular expression (regex)", "A text pattern that can define how pretokenization initially splits raw text into pieces."],
        ["I/O", "Input/output: deliberately reading and writing either text or binary data."],
        ["deterministic", "The same input and configuration produce exactly the same result under documented rules."]
      ],
      "mental": "Picture the data pipeline as a row of labeled handoff points. At every point, state which representation arrives, which one leaves, and whether the stream can be read again. Many apparently complicated tokenizer failures are really a swapped handoff between text, bytes, and a one-shot iterator.",
      "details": [
        "The path starts with a raw document, such as a text file or web response. Python reads it either as text or as raw bytes. Normalization, tokenization, and storage come only after that decision. Label every pipeline edge with its input, output, and permitted reverse conversion so that any point where information can be lost remains visible.",
        "Python str holds Unicode code points, while bytes holds only numbers from 0 through 255. encode('utf-8') translates text into bytes, and decode('utf-8') translates a complete, valid byte sequence back into text. The character é, for example, becomes the two UTF-8 bytes 195 and 169; neither byte alone is the character é. Text-mode files yield str, binary-mode files yield bytes, and every conversion must name both an encoding and an error policy.",
        "A byte-level tokenizer based on Byte-Pair Encoding (BPE) may process individual byte values as IDs because its initial vocabulary contains all 256 possible bytes. It must not decode each byte separately: first it reassembles all bytes belonging to the text, then decodes the complete sequence as UTF-8. The testable contract is decode(encode(text)) = text. The dedicated BPE concept explains how frequent pairs are selected and stored.",
        "An iterator yields one item whenever the caller asks for the next value; a generator is a convenient way to create such an iterator with yield. This lets a corpus be processed document by document without keeping it all in working memory, but the iterator may be empty after one pass. In a BPE pipeline, a regular expression often defines pretokenization—the initial split of raw text into bounded pieces—and Counter can then count the frequencies of adjacent byte pairs. File input/output (I/O) must additionally choose text or binary mode deliberately.",
        "Reproducibility here means that identical input bytes, configuration, and rules create identical output. If several BPE pairs have the same frequency, the trainer therefore needs a fixed tie-breaking rule; parallel execution must not change the order. Stable document IDs and logged transformation reasons also reveal which stage changed or rejected a document. Tiny adversarial examples whose complete output you know by hand test this contract more reliably than one large end-to-end run."
      ],
      "pitfalls": [
        "Silently mixing str and bytes moves encoding errors to a later point where they are harder to diagnose.",
        "Reusing a generator and expecting data on the second pass: the first pass may already have exhausted it.",
        "Decoding every UTF-8 byte separately splits multibyte characters in the middle of their encoding.",
        "Letting ties depend on a data structure's incidental iteration order: identical inputs can then produce different tokenizers."
      ],
      "checks": [
        "What path does the character é take from a Python str to UTF-8 bytes and back, and at which point is decode valid?",
        "Why does a generator save memory, and why can a second pass still return no documents?",
        "Which inputs and rules must be fixed for two BPE training runs to produce exactly the same merges?"
      ],
      "answers": [
        "The str value é becomes the UTF-8 bytes 195 and 169. A tokenizer may process those values separately, but only the complete reassembled sequence may be decoded as UTF-8; that produces é again.",
        "A generator retains only the state needed for its next item rather than the complete corpus. Each request consumes one item, so after the end the same iterator is exhausted unless the data source is reopened or a new generator is created.",
        "You need identical input bytes, the same pretokenization, special-token rules, stopping condition, and a fixed tie-break for equal frequencies. Data order and parallel execution must not alter the resulting merge order."
      ]
    },
    "pytorch-tensors": {
      "title": "PyTorch Tensors: Storage, Strides, Views, Dtype & Device",
      "level": "Prerequisite",
      "summary": "A tensor is a view of memory with a shape, strides, data type, and device; this metadata determines correctness, cost, and which operations are valid.",
      "mental": "Do not picture a tensor only as a finished block of numbers. Picture it as directions into flat storage: a starting position plus a step size for each axis. transpose can change only those directions without copying data. A later operation that requires contiguous storage must physically rearrange the data. Shape alone therefore never tells the whole story.",
      "details": [
        "Storage holds the actual numbers; shape gives the axis lengths, and strides state how many storage elements a step along each axis skips. Slicing and transpose often create views that share the same storage. contiguous creates a new contiguous copy when needed. reshape may return a view but is allowed to copy; view requires a compatible memory layout. When costs or errors are surprising, inspect not only shape but also strides, contiguity, and possible shared storage.",
        "dtype determines value range, precision, and bytes per element; device determines whether a tensor resides, for example, on a CPU or GPU. Operations generally require compatible devices and data types. FP16, BF16, and FP32 have different numerical properties: BFloat16 (BF16) has a large exponent range but fewer mantissa bits, so critical reductions are often accumulated in FP32. A cast does not automatically save memory if FP32 master parameters, gradients, or temporary buffers still exist.",
        "Broadcasting aligns shapes from the right and treats missing axes, or axes of length one, as repeatable. einsum makes semantic axes explicit: repeated indices are paired, and indices absent from the output are summed over. Before each operation, write down the input axes, contracted axes, and output axes. On a GPU, calls are often asynchronous, so a CPU timer without synchronization measures only dispatching the work rather than its runtime."
      ],
      "pitfalls": [
        "Calling view blindly after transpose: the new stride order is often incompatible with the requested flattened view.",
        "Assuming a shape-compatible broadcast is semantically correct: a batch, head, or token value may be repeated across the wrong axis.",
        "Counting only the visible BF16 tensor: Autograd, the optimizer, and temporary operations can hold additional tensors with other data types."
      ],
      "checks": [
        "Why can transpose preserve the same storage and number of elements, while contiguous requires additional memory?",
        "A mask [Tq,Tk] should apply to scores [B,H,Tq,Tk]. How is it broadcast, and what incorrect mask might remain unnoticed despite compatible dimensions?"
      ],
      "answers": [
        "transpose changes only the shape and strides of a view and can therefore keep pointing to the same storage. contiguous must physically write the elements next to one another in their new logical order, creating new storage when the layout is not already contiguous.",
        "The two missing leading axes are treated as length one, so the same [Tq,Tk] mask applies to every batch item and head. A dangerous case is an accidentally square [B,Tk] or [H,Tk] mask that also becomes broadcastable after singleton axes are inserted, but describes examples or heads rather than query positions."
      ]
    },
    "pytorch-state": {
      "title": "PyTorch Modules, State, Tests & Reproducible Resume",
      "level": "Prerequisite",
      "summary": "A trainable system consists of registered model state, an Autograd graph, optimizer state, randomness, and data progress—not weights alone.",
      "mental": "Think of training as a state machine. The module describes the current function, Autograd collects derivatives from the current execution, the optimizer owns additional memory, and the data pipeline plus random-number generators determine the next input. A checkpoint is complete only if the machine could perform the same next step after loading it.",
      "details": [
        "An nn.Module automatically registers submodules and nn.Parameter attributes. Only registered parameters appear in parameters() and state_dict(), so only those are found by an optimizer or checkpoint. A buffer is persistent module state that is not trained, such as a precomputed table. An ordinary tensor in a local variable, by contrast, does not automatically belong to model state and is not guaranteed to follow a device move.",
        "Autograd builds a computation graph during the forward pass from operations on tensors whose requires_grad flag is set. backward accumulates gradients in leaf parameters; it neither updates weights nor clears old gradients. A typical step therefore separates zero_grad, the forward pass, a scalar loss, backward, optional gradient clipping, optimizer.step, and scheduler.step. train() and eval() change the behavior of certain modules, but do not replace no_grad for inference without gradient tracking.",
        "A strong test isolates exactly one contract: tiny non-square shapes, values you can calculate by hand, edge cases, expected data types, and one clearly named invariant. To resume training, save the model, optimizer, scheduler, global update step, data position, and Random Number Generator (RNG) states for the relevant devices. The strongest test compares an uninterrupted branch with a save/reload branch: under controlled deterministic conditions, the next batch, loss, update, and resulting parameters must match."
      ],
      "pitfalls": [
        "Keeping parameters in a plain Python list or only as temporary tensors: the module may not register them.",
        "Calling optimizer.step before backward or without zero_grad: the resulting state transition is not the intended training step.",
        "Saving only the model state_dict and calling the run exactly resumable: optimizer moments, schedule, RNG states, and data position are missing."
      ],
      "checks": [
        "How do a parameter, buffer, gradient, and optimizer state differ in whether they are learned and how they are saved?",
        "How would you prove that a checkpoint does not merely load, but resumes training reproducibly?"
      ],
      "answers": [
        "Parameters are trainable, registered module state; buffers are registered state that is not optimized by gradients. Gradients arise from a particular backward execution and accumulate on parameters. Optimizer state such as Adam moments and step counters is additional history managed by the optimizer. Parameters and buffers live in the model state_dict, while optimizer state lives in a separate optimizer state_dict.",
        "I would branch a deterministic run at one checkpoint. Branch A trains one more step without interruption. Branch B saves, reconstructs every object, loads the complete state, and performs the same next step. Batch data, loss, gradients or update, and resulting parameters must agree within the expected numerical tolerance."
      ]
    },
    "shapes": {
      "title": "Tensor Shapes as a Type System",
      "level": "Foundations",
      "summary": "Tensor shapes describe not only storage, but also the meaning of each axis and which operations are valid.",
      "mental": "Imagine a tensor as a table whose axes have labels: B stands for batch, T for token positions, and D for features per token. A shape such as [B, T, D] therefore tells you what kind of content lives at each position. If you carry these labels through every operation, many mistakes become visible before you run the code.",
      "details": [
        "A tensor is a multidimensional arrangement of numbers; its Shape gives the length of each axis. In a language model, X with Shape [B, T, D] contains B sequences, each with T token positions, and each position holds a D-dimensional state vector. Two tensors can contain the same number of elements and occupy the same amount of memory yet mean completely different things if their axes are swapped.",
        "A Linear Layer is a learned feature mixer. A feature here is initially one coordinate x_i in a token's D-dimensional state vector—not automatically a human-named property. For every output feature o, the Layer computes the weighted sum y_o=b_o+Σ_i x_iW_i,o. The column W[:,o] is therefore its own mixing recipe learned during training: it determines how strongly each input feature i contributes to the new output feature o. The optional Bias b_o is the output's starting value when x=0. Backpropagation changes W and b so that useful mixtures reduce the Loss.",
        "The same mixing recipe is applied independently at every Batch and Token position of X [B,T,D_in]: W [D_in,D_out] produces Y [B,T,D_out]. W has no B or T axis and therefore cannot directly mix sequences or token positions. Position-wise does not mean context-free: in later Blocks, X may already contain information from other tokens mixed in by earlier Attention Layers; the Linear Layer then remixes those existing features within each token vector. In a Transformer, separate matrices W_Q, W_K, and W_V turn the same token state into features for three different roles; other Linear Layers mix Attention Heads, expand and contract MLP features, or produce vocabulary Logits. LLM literature often calls this learned mapping a Projection.",
        "For Multi-Head Attention, a state is first rearranged from [B, T, H·d_h] to [B, H, T, d_h], where H is the number of Attention Heads and d_h is their width. Q and K then produce a score matrix [B, H, T, T], and Softmax normalizes over the final T axis of the Keys. With B=2, T=4, H=8, and d_h=64, Q therefore has Shape [2, 8, 4, 64], not [2, 4, 512]."
      ],
      "pitfalls": [
        "Swapping B and T: if the two axes happen to have the same length, the code may keep running while treating examples as positions and positions as examples.",
        "Using reshape as a repair: reshape preserves only the linear order of elements and cannot correct semantically swapped axes; the axis order must be changed explicitly.",
        "Accepting Broadcasting without checking it: an automatically repeated axis can hide a Shape error, for example by applying the same mask along the wrong dimension."
      ],
      "checks": [
        "What does one output feature y_o of a Linear Layer compute, what is learned, and why do B and T remain unchanged for X [B,T,D_in]?",
        "A Linear Layer jointly produces Q, K, and V from X [B, T, D], with a total of 3H·d_h features. Which Shapes do you expect immediately after the Linear Layer and after splitting into Heads?",
        "Along which axis is Softmax applied in Attention, and why would the Query axis be the wrong choice?"
      ],
      "answers": [
        "It computes y_o=b_o+Σ_i x_iW_i,o, a learned weighted mixture of every input feature of the same token. The weights W and, when present, Bias b are learned. Because the same matrix is applied separately to every [b,t] pair and itself contains only D_in and D_out axes, Batch B and Token axis T remain unchanged.",
        "Immediately after a conceptually joint and often technically fused QKV Linear Layer, the Shape is [B,T,3H·d_h]. After separating Q, K, and V and rearranging axes, each tensor has Shape [B,H,T,d_h]. Mathematically, these are three separate learned mappings; an implementation may store their matrices side by side for one faster Matmul.",
        "For each Query, Softmax runs over the Key axis: the final axis of the score matrix [B, H, T_query, T_key]. This makes the weights of the available Key positions sum to one for a fixed Query; normalizing over Queries would couple different information requests to one another."
      ]
    },
    "matmul": {
      "title": "Matrix Multiplication & Batch Matmul",
      "level": "Foundations",
      "summary": "Matrix multiplication forms weighted combinations and contracts exactly the shared inner axis.",
      "mental": "Imagine every column of a weight matrix as its own mixing recipe. The recipe gives every input feature a dial value, multiplies each feature by its dial, and adds all contributions into exactly one new output feature. Many columns mean many different recipes applied to the same input at once.",
      "details": [
        "For A with Shape [m, k] and B with Shape [k, n], C=A·B has Shape [m, n]. An entry C[i,j] is the sum over l of A[i,l]·B[l,j]. Matrix multiplication therefore differs from the Hadamard product, which multiplies two equally shaped tensors element by element and does not contract an axis.",
        "A concrete Linear Layer exposes these weighted sums: for x=[2,−1], W=[[1,0,2],[3,−1,1]], and b=[0.5,1,−2], the result is y=xW+b=[−0.5,2,1]. For example, y_1=2·1+(−1)·3+0.5=−0.5. Two input features become three new mixtures. In a real model, individual numerical axes usually do not have simple human-assigned meanings; useful distributed features emerge through training.",
        "Leading Batch axes are not contracted: X [B,T,D_in] multiplied by W [D_in,D_out] gives Y [B,T,D_out]. The same calculation runs independently at every [b,t], so a Linear Layer mixes features but not tokens. PyTorch stores weight in nn.Linear(D_in,D_out) as [D_out,D_in] and computes x @ weight.T + bias; the row-vector convention used here instead names W as [D_in,D_out]. Both describe the same operation.",
        "The standard multiplication [m, k] by [k, n] requires approximately 2mkn Floating-Point Operations, because a multiplication and an addition are both counted. In Attention, Q [B, H, T, d_h] and transposed K produce scores [B, H, T, T], so this part grows quadratically with T. Doubling T therefore quadruples the number of pairwise Query-Key comparisons."
      ],
      "pitfalls": [
        "Confusing a matrix product with an elementwise product: A*B does not combine features across a shared axis and is defined only for broadcast-compatible Shapes.",
        "Transposing a matrix by intuition alone: what matters is which labeled axis should be contracted; matching numerical Shape sizes do not prove that the semantics are correct.",
        "Counting only output elements as compute: each of the m·n results needs k multiplications and roughly k additions, which creates the factor 2k."
      ],
      "checks": [
        "For x=[2,−1], W=[[1,0,2],[3,−1,1]], and b=[0.5,1,−2], calculate y. What is mixed, and what explicitly is not?",
        "Why does QKᵀ have Shape [T, T] for T Query positions and T Key positions per batch and Head?",
        "Approximately how many Floating-Point Operations does A [m, k] multiplied by B [k, n] require under the usual multiply-add convention?"
      ],
      "answers": [
        "y=[−0.5,2,1]. Each of the three columns of W mixes the two input features with different weights and adds its Bias. For a tensor X [B,T,2], this calculation runs separately at every [b,t]; the Layer mixes the feature axis, but neither different Batch examples nor different Token positions.",
        "Each of the T Queries is compared with each of the T Keys while the shared feature axis d_h is summed over. The Query axis and the Key axis remain as the two outer axes, producing T·T scores.",
        "It requires approximately 2mkn Floating-Point Operations. For each of the m·n output entries, k products and approximately the same number of additions are computed."
      ]
    },
    "einsum-notation": {
      "title": "Einsum Notation & einops: Naming Axes Instead of Counting Them",
      "level": "Foundations",
      "summary": "An einsum pattern describes a tensor operation over named axes: axes sharing a name are coupled, axes missing from the output are summed away, and three dots stand for any number of leading axes.",
      "terms": [
        ["einsum", "The Einstein summation convention as a function: it describes a contraction over named axes instead of axis positions."],
        ["contraction", "Summing over an axis shared by two tensors; this is exactly what a matrix multiplication does."],
        ["einops", "A library that expresses tensor operations over named axes; the A1 handout explicitly recommends it for this class."],
        ["rearrange", "An einops operation that reorders, merges, or splits axes without combining any values."],
        ["reduce", "An einops operation that removes an axis using sum, mean, max, or min."],
        ["jaxtyping", "An annotation style such as Float[Tensor, \"batch seq d\"]: it documents axis names but does not check them at runtime."]
      ],
      "mental": "Think of an einsum pattern as a table caption. On the left stand the axis names of every input, on the right those of the desired output. A name appearing in both inputs couples their positions; a name missing on the right is summed over all its values and disappears. What matters is therefore no longer which position an axis sits at, but what it is called.",
      "details": [
        "The grammar has two parts. Left of the arrow stand the inputs, separated by commas, each with the names of its axes. Right of the arrow stands the desired output. For x with Shape [2,3,4] named batch seq d_in and W with Shape [5,4] named d_out d_in, einsum(x, W, \"... d_in, d_out d_in -> ... d_out\") yields Shape [2,3,5]. d_in appears in both inputs and is missing on the right, so it is coupled and summed away; d_out appears only in the second input and on the right, so it survives as the new feature axis. The three dots stand for any number of leading axes that are passed through unchanged.",
        "The gain over @, transpose, and view lies in the readability of the contract. Lecture 2 puts both spellings side by side: z = x @ y.transpose(-2, -1) forces you to translate −2 and −1 back into axis meanings in your head, whereas einsum(x, y, \"... seq1 hidden, ... seq2 hidden -> ... seq1 seq2\") writes the same computation with its roles attached. The documentation is the implementation. Einsum is first of all a notation: for the usual two-operand contractions PyTorch lowers it to the same matmul kernels, so the gain lies in avoided axis mistakes, not automatically in speed.",
        "Besides einsum, two more operations belong to the toolkit. rearrange reorders, merges, or splits axes without combining values: rearrange(x, \"... (heads d_head) -> ... heads d_head\", heads=H) splits a combined axis, and rearrange(x, \"... heads d_head -> ... (heads d_head)\") merges it again. When splitting, you must supply one of the two lengths, because the product alone does not determine the split. Bracket order is part of the contract: (heads d_head) and (d_head heads) produce the same axis length but arrange the same numbers differently. reduce removes an axis with a reduction, for example reduce(x, \"... hidden -> ...\", \"sum\").",
        "In A1 the same three patterns keep reappearing: the Linear Layer as einsum(x, W, \"... d_in, d_out d_in -> ... d_out\"), the Attention scores as einsum(Q, K, \"... query d_k, ... key d_k -> ... query key\"), and the mixing of the Values as einsum(A, V, \"... query key, ... key d_v -> ... query d_v\"). The three dots satisfy exactly the handout's requirement that the modules tolerate any number of leading Batch-like axes — that is [T,D] as well as [B,T,D] and [B,H,T,D]. In addition, jaxtyping annotations such as Float[Tensor, \"batch seq d_in\"] document the expected axis names in the signature; they are pure documentation and check nothing at runtime."
      ],
      "pitfalls": [
        "Writing a pattern by axis order instead of by meaning: as soon as two axes happen to have the same length — Query and Key at equal sequence length, or d_in and d_out in a square layer — the wrong pattern also yields a valid Shape and silently computes something else.",
        "Overlooking that a name missing on the right is summed away: dropping key from \"-> ... query key\" quietly turns a score matrix into a sum over all Keys.",
        "Using the same name for two different roles: in \"... d, d d -> ... d\" axes are coupled that have nothing to do with each other semantically.",
        "Guessing bracket order when splitting: (heads d_head) and (d_head heads) have the same length but distribute the values across the Heads differently.",
        "Mistaking einsum for an optimization or jaxtyping for a check: the former is a notation, the latter an annotation without runtime effect."
      ],
      "checks": [
        "What Shape does einsum(x, W, \"... d_in, d_out d_in -> ... d_out\") produce for x [2,3,4] and W [5,4], and which axis disappears, and why?",
        "Q and K both have [B,H,T,d_k]. Why is the pattern \"... query d_k, ... key d_k -> ... key query\" not detectable as wrong from the Shape, and what goes wrong afterwards?",
        "How do you split [B,T,H·d_head] into [B,H,T,d_head], and which piece of information is strictly required for that?"
      ],
      "answers": [
        "The result has Shape [2,3,5]. d_in appears in both inputs and is missing from the output, so it is coupled and summed away — exactly the contraction of a matrix multiplication. The leading axes 2 and 3 are passed through unchanged by the three dots, and d_out of length 5 remains as the new feature axis.",
        "Both patterns produce [B,H,T,T], because the Query and Key axes have the same length T; the Shape therefore cannot reveal the mistake. What you get, however, is the transposed score matrix: a Softmax over the last axis then normalizes over the Queries instead of the Keys, and a causal mask hits the wrong triangle. You would notice only through nonsensical Attention weights or a test with T_query ≠ T_key.",
        "With rearrange(x, \"... seq (heads d_head) -> ... heads seq d_head\", heads=H) in one step. Supplying one of the two lengths — here heads=H — is strictly required, because the product H·d_head alone does not determine the split. The bracket order must additionally match how the output features of the Q/K/V matrix are arranged, otherwise values land in the wrong Heads."
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
    "transformer-ledger": {
      "title": "A1 Architecture Ledger: Parameters & Forward FLOPs",
      "level": "Core",
      "summary": "The A1 ledger counts every matrix in the specified bias-free Decoder architecture exactly and separates stored parameters from compute performed for a concrete sequence.",
      "mental": "Write the architecture as a bill of materials: two Vocabulary matrices; four Attention projections, three SwiGLU matrices, and two RMSNorm gains per block; plus one final norm. For FLOPs, every matrix is applied at T token positions, while QKᵀ and PV each contribute a T²D term. Sum only after every line has an owner.",
      "details": [
        "The A1 convention uses untied Token Embedding and LM Head matrices with V·D parameters each, no Biases, two RMSNorm gains per block, and one final RMSNorm gain. A block has four D×D matrices for Q, K, V, and Output, plus two D×F and one F×D matrix for SwiGLU. Therefore P_block=4D²+3DF+2D and P_total=2VD+L(4D²+3DF+2D)+D. RoPE contributes no trainable parameters.",
        "For a bias-free matrix multiplication [m,n]@[n,p], A1 counts exactly 2mnp Floating-Point Operations (FLOPs). The four Attention projections cost 8TD² together, QKᵀ and the product of Attention weights with V cost 4T²D together, and the three SwiGLU matrices cost 6TDF. The LM Head costs 2TDV, giving F_forward=L(8TD²+4T²D+6TDF)+2TDV.",
        "The number of Heads H cancels out of the exact Attention accounting as long as H·d_head=D: H Heads that each cost proportionally to d_head sum back to D. Doubling T doubles projection, SwiGLU, and Head compute but quadruples the 4T²D Attention-mixing term. This contract is specific to the explicit A1 architecture and must not be confused with the rough training approximation C≈6ND_tokens."
      ],
      "pitfalls": [
        "Omitting the LM Head because Weight Tying is possible even though this A1 contract explicitly assumes untied matrices, or adding Biases the architecture does not contain.",
        "Counting only two SwiGLU matrices or only QKᵀ in Attention; the gate, value branch, output projection, and PV product are separate matrix multiplications."
      ],
      "checks": [
        "Which individual terms form P_total when the Embedding and LM Head are not tied?",
        "Why does the T² term not depend on H at fixed D, and what happens when T doubles?"
      ],
      "answers": [
        "Embedding and LM Head contribute 2VD. Each of L blocks contributes 4D² for Q, K, V, and Output, 3DF for the three SwiGLU matrices, and 2D for two RMSNorm gains. The final RMSNorm adds D; RoPE and Biases add nothing in this contract.",
        "Each Head costs proportionally to T²d_head, so H Heads cost H·T²d_head=T²D. Doubling T doubles every token-wise matrix cost but quadruples QKᵀ and PV because both Query and Key position axes grow."
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
        "During Encoding, a Pretoken is first split into bytes and then combined according to the learned Merge ranks. The ordered list is necessary because a later Merge can depend on a Token created by an earlier one; an unordered set does not contain this dependency. Special Tokens such as an End-of-Sequence marker are treated as indivisible hard boundaries and must neither be split nor merged across. Decoding runs the other way: the byte strings of all IDs are concatenated first, and only then is the whole buffer read as UTF-8. Because an arbitrary sequence of IDs need not form a valid encoding, decoding uses errors='replace' — malformed positions become the replacement character U+FFFD instead of raising an exception."
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
      "mental": "A Token ID is like a catalog number and has no natural numerical closeness to other IDs. The Embedding matrix is the catalog: each ID selects exactly one row containing D learned features. That row is only the starting state of one Token occurrence; position and context turn it into a contextual representation inside the Transformer Blocks. At the end, an LM Head produces scores for all possible next Tokens.",
      "details": [
        "For a Vocabulary containing V Tokens and Model Dimension D, the Embedding matrix E has Shape [V,D]. Integer IDs [B,T] select rows from E and produce activations X [B,T,D]; there is no weighted averaging of the numerical ID values. Only the rows used in a Batch receive a direct Input Embedding gradient through this lookup.",
        "The LM Head is a Linear Layer, meaning a learnable matrix multiplication, from D features to V Logits. It transforms states [B,T,D] into unnormalized scores [B,T,V], and only Softmax turns them into probabilities. Computing all V scores can account for a meaningful share of parameters, compute, and memory traffic when V is large.",
        "Weight Tying uses the same weights for the Input Embedding and the LM Head, so the Output is typically computed with Eᵀ. Without Weight Tying, the LM Head owns a separate learned matrix [D,V], so it is not literally comparing against the same Embedding rows. Weight Tying saves V·D parameters, but the [B,T,V] Logits must still be produced. The shared matrix receives gradients from both the Input lookups and all Output comparisons.",
        "An Input Embedding is static in the sense that the same Token ID selects the same table row at lookup time. The later Hidden State is contextual: RoPE or other position information, Attention, and MLP updates change each occurrence according to its position and neighboring Tokens. Two equal Tokens may therefore start identically yet carry very different meanings at the end of the model."
      ],
      "pitfalls": [
        "Treating Token IDs as continuous measurements: ID 101 is not semantically closer to ID 102 than to ID 900; meaning lives in the learned rows.",
        "Interpreting Logits as probabilities: they may be arbitrary real values and are normalized only by Softmax.",
        "Treating Weight Tying as a free Output Layer: it saves parameters, but not the matrix multiplication or storage of the Vocabulary Logits."
      ],
      "checks": [
        "What are the Shapes of the Embedding matrix, Token IDs, embedded activations, and Output Logits?",
        "What does Weight Tying save, and which costs remain?",
        "Why can two occurrences of the same Token ID with the same Input Embedding later have different Hidden States?"
      ],
      "answers": [
        "The Embedding matrix has Shape [V,D], the IDs [B,T], the resulting activations [B,T,D], and the Output Logits [B,T,V]. V is the Vocabulary size and D is the Model Dimension.",
        "Weight Tying saves the separate Output weight matrix with V·D parameters and connects the Input and Output representations. The computation of V Logits per position, their storage, and the Softmax cost still remain.",
        "Both occurrences initially select the same row from E. They then receive position-dependent Q/K rotations and use Attention to read different contexts; each Block consequently adds different Attention and MLP corrections. A Hidden State therefore represents the concrete occurrence in context, not only its Token ID."
      ]
    },
    "parameter-initialization": {
      "title": "Parameter Initialization for Assignment 1 (A1)",
      "level": "Core",
      "summary": "Before training starts, every learnable weight table needs starting numbers. Assignment 1 (A1) specifies three different starting rules for Linear Layers, Embeddings, and Root Mean Square Normalization (RMSNorm).",
      "terms": [
        ["Linear Layer", "A component that creates new output numbers from several input numbers by using weighted sums."],
        ["d_in", "The number of input numbers read by one weighted sum."],
        ["d_out", "The number of new output numbers produced by the Layer."],
        ["W", "The table of learnable Linear-Layer weights; every cell needs a starting value before training."],
        ["Mean μ", "The center of a distribution. μ=0 means positive and negative starting weights are centered around zero."],
        ["Variance σ²", "The square of the standard deviation. It describes spread, but it is not the value PyTorch expects as std."],
        ["Standard deviation σ", "The typical distance of random values from their mean. This is the value expected by the std argument."],
        ["Truncated normal distribution", "A bell-shaped distribution that does not allow values beyond fixed limits; torch.nn.init.trunc_normal_ produces such values."]
      ],
      "mental": "Imagine one output as a sum of many small contributions. If many random weights of the same size are added, the sum can easily become too large. A wider Linear Layer therefore starts with smaller individual weights. Initialization only chooses this starting point; training changes the weights afterwards.",
      "details": [
        "The small numerical case above separates two quantities that are easy to confuse. The assignment rule first gives the variance, which is the square of the spread. PyTorch's std argument expects the standard deviation instead. You must therefore take a square root between those steps; the two truncation limits are then built from that result.",
        "Only now use the general notation. For a Linear Layer, the prescribed variance is σ²=2/(d_in+d_out). Therefore torch.nn.init.trunc_normal_ receives std=√(2/(d_in+d_out)). mean=0 places the center at zero; a=−3σ and b=+3σ remove the rare larger values. The rule makes individual starting weights smaller when the Layer has more inputs or outputs.",
        "Embeddings explicitly do not use this width rule. Their weight table uses mean=0, std=1, a=−3, and b=+3. The RMSNorm Gain is simpler still: every one of its D values starts at 1, so the Gain does not change the already normalized features at the beginning.",
        "Put each rule in the constructor of the relevant Module. A test checks the arguments, limits, and Module type. It does not require a finite random matrix to have exactly the theoretical variance: randomness and truncation make the measured value only approximate. Loaded Checkpoint weights must not be initialized again."
      ],
      "pitfalls": [
        "Passing 2/(d_in+d_out) directly as std: the Handout formula specifies σ², while trunc_normal_ expects σ, its square root.",
        "Applying the Linear rule to Embeddings or setting their bounds to ±3σ_linear: A1 explicitly requires Embedding std=1 and bounds [−3,3].",
        "Randomly initializing the RMSNorm Gain or reinitializing a loaded Checkpoint: the first destroys the neutral start, while the second overwrites learned state."
      ],
      "checks": [
        "Which arguments are passed to torch.nn.init.trunc_normal_ for a Linear Layer with d_in=64 and d_out=192?",
        "Why is testing for exactly empirical variance σ² after trunc_normal_ inappropriate, and which properties should be checked instead?"
      ],
      "answers": [
        "σ=sqrt(2/(64+192))=sqrt(1/128)≈0.0884. The call uses mean=0, std≈0.0884, a=−3σ≈−0.265, and b=3σ≈0.265. Those values would be wrong for an Embedding, where std=1, a=−3, and b=3.",
        "Truncation changes the realized distribution, and a finite random sample does not have an exactly prescribed variance anyway. Instead check that std is computed from the correct formula and passed as a standard deviation, all values fall inside the correct bounds, Embeddings use their separate rule, and the RMSNorm Gain consists entirely of ones."
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
        "SwiGLU has three rather than two large weight matrices and would contain more parameters than a standard Multi-Layer Perceptron (MLP) at the same inner width. F is therefore often set to approximately 8D/3 rather than 4D and rounded to a hardware-friendly multiple. Assignment 1 fixes that rounding: d_ff ≈ 8/3·d_model, brought to a multiple of 64. With this adjusted width, the parameter count remains roughly comparable, while Gating often yields better Language Model quality empirically."
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
      "summary": "RoPE encodes position with A1-exact angles and rotations of adjacent Query and Key feature pairs.",
      "mental": "Imagine the adjacent features [0,1], [2,3], … as separate arrows in planes. The farther right a Token appears, the farther each arrow rotates; later feature pairs use a slower frequency through Θ. When two rotated arrows are compared by a Dot Product, the difference between their angles, and therefore their relative positional distance, matters.",
      "details": [
        "A1 indexes Token position i and feature pair k∈{1,…,d/2} and defines the exact angle as θ_i,k=i/Θ^((2k−2)/d). In mathematical one-based notation, the pair is q_(2k−1:2k); in a zero-based array these are the adjacent coordinates [0,1], [2,3], …. Each pair is rotated by [[cosθ,−sinθ],[sinθ,cosθ]]. The final dimension d must be even, while the Shape and norm of every pair remain unchanged.",
        "In Multi-Head Attention, Q and K typically have Shape [B,H,T,d]. RoPE selects the angles named by token_positions along T and rotates the final feature axis; it must tolerate any number of leading batch-like axes. Because R_iᵀR_j is a rotation by the angle difference, (R_i q)·(R_j k) depends on relative offset j−i in a controlled way. RoPE sits after the Q/K Linear Layers and before QKᵀ; V remains unchanged.",
        "Sine and cosine depend only on position, pair index, Θ, and d. A1 therefore recommends one shared RoPE Module referenced by every Layer instead of identical tables per Layer. Precomputed values are registered with self.register_buffer(..., persistent=False): they follow device moves but are not nn.Parameters, receive no gradients, and stay out of the state_dict because they can be reconstructed deterministically. This does not automatically make inference beyond the trained position range reliable."
      ],
      "pitfalls": [
        "Implementing RoPE as an additive positional embedding: RoPE rotates feature pairs multiplicatively and therefore produces different dot-product properties.",
        "Replacing A1's adjacent pairs with Half-Split pairs from the first and second halves: this common alternative is a different coordinate layout and breaks the supplied A1 tests even though a fully adapted implementation can be mathematically consistent.",
        "Applying RoPE to V as well: Values carry content after weighting; the position dependence is meant to arise in the Query-Key scores.",
        "Writing a negative exponent or multiplying by i·Θ^((2k−2)/d) instead of dividing i/Θ^((2k−2)/d): later pairs then rotate faster rather than slower and reference values disagree.",
        "Storing sine and cosine as Parameters or as a persistent Buffer in every Layer: that creates learnable or redundant Checkpoint state for one fixed shared function."
      ],
      "checks": [
        "Why can the dot product of two vectors transformed with RoPE depend on the relative distance i-j?",
        "Which angles and coordinate pairs does A1 require for d=4, Θ=100, and position i=2?",
        "Why is the sine/cosine state a shared non-persistent Buffer rather than either a Parameter or an ordinary local tensor?"
      ],
      "answers": [
        "For rotation matrices, (R_i q)ᵀ(R_j k)=qᵀR_iᵀR_j k. The product R_iᵀR_j is a rotation by the difference between the two position angles, so it depends on j-i rather than on the two positions separately.",
        "For k=1, θ_(2,1)=2/100^0=2 and rotates the adjacent zero-based coordinates [0,1]. For k=2, θ_(2,2)=2/100^(2/4)=0.2 and rotates [2,3]. Half-Split pairs [0,2] and [1,3] do not satisfy the A1 contract.",
        "The values are fixed deterministic functions of position, Θ, and d and must be identical across Layers. A registered Buffer follows the Module to the correct device; persistent=False keeps it out of state_dict. A Parameter would incorrectly receive gradients, while an ordinary attribute has a weaker device and Module-state contract."
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
    "token-array-loading": {
      "title": "From the Token File to a Next-Token Batch",
      "level": "Core",
      "summary": "After tokenization, integer token IDs are stored compactly on disk and loaded as small input and target windows shifted by one position for training.",
      "context": "The earlier tokenization stage has already turned raw text into one long sequence of integer IDs. This concept starts at that file and ends with two PyTorch tensors, X and Y; the next concept uses them in a complete training step.",
      "why": "A wrong data type can silently read the same file bytes as different token IDs, a one-position boundary mistake (an off-by-one error) creates incorrect or short targets, and loading everything can exhaust working memory. These three contracts must hold before the first model run.",
      "terms": [
        ["token ID", "An integer index into a tokenizer vocabulary; the number is an address, not a measured quantity."],
        ["batch", "A group of training examples that the model processes in parallel during one step."],
        ["context length", "The number m of consecutive input tokens shown to the model in one training example."],
        ["input / target", "Input is the token sequence shown to the model; target is the correct sequence shifted one position forward that the model must predict."],
        ["memory mapping (np.memmap)", "A file-backed array view for which the operating system loads only the pages that are actually touched."],
        ["NPY file format", "NumPy's own array file format; its header stores metadata such as the array dimensions (shape) and data type alongside the values."],
        ["dtype (data type)", "The rule that specifies how many bits one array element uses and how those bits are interpreted as a number."],
        ["Long tensor (torch.long)", "A PyTorch tensor of 64-bit integers; embedding lookups expect token indices in this format."]
      ],
      "mental": "Picture the tokenized corpus as one very long tape of numbers stored on disk. Place a window of length m+1 over it: the first m numbers are input X and the final m numbers are target Y shifted exactly one position to the right. Memory mapping means that only the currently touched parts of the tape enter working memory.",
      "details": [
        "The tokenizer writes the corpus as a flat integer array x. Let n be the number of stored token IDs, V the vocabulary size, B the number of examples per batch, and m the context length per example. Every ID must lie from 0 through V−1. X and Y are not separate source files; they are small windows cut from x on demand.",
        "When x is too large for working memory, np.memmap opens a documented raw binary file as a file-backed array. For this raw format, dtype and byte order are mandatory parts of the file contract. For an NPY file created by np.save, use np.load(..., mmap_mode='r') instead so that its header, shape, and dtype are interpreted correctly.",
        "The dtype contract starts before serialization: check token IDs in chunks for 0≤ID<V and also require V−1≤np.iinfo(dtype).max before converting them to the storage type. Otherwise, writing 70000 as uint16 can wrap it to 4464, which may later pass 0≤ID<V unnoticed. Record the format, dtype, byte order, element count, and, when possible, a checksum or known boundary values. Verify that metadata when opening the file; only data of unknown provenance needs a deliberate, chunked full scan. Computing min(x) and max(x) before every Batch would instead touch the complete memory map and defeat on-demand loading in the hot path.",
        "For each of the B examples, choose a start index s_b uniformly. The input window is X_b=x[s_b:s_b+m], and the target window is Y_b=x[s_b+1:s_b+m+1]. Both contain exactly m token IDs; at every aligned position, the model is asked to predict the immediately following token. The corpus must therefore contain at least m+1 tokens.",
        "The final valid start is n−m−1 because Y still needs the element at index s_b+m. NumPy's sampling upper bound is exclusive, so it must be n−m, not n−m+1. With n=10 and m=4, starts 0 through 5 are valid. At s=5, X=x[5:9] and Y=x[6:10]; s=6 would require the nonexistent element x[10].",
        "Only the small slices are copied and converted to torch.long, meaning signed 64-bit integers, before they move to the requested compute device. PyTorch embeddings expect integer indices rather than floating-point values. A fast test checks X.shape=Y.shape=[B,m], 0≤X,Y<V, and Y_b[:-1]=X_b[1:] for every batch example b. The complete memory map must not be copied accidentally into a regular array."
      ],
      "pitfalls": [
        "Opening a raw binary file and an NPY file in the same way: NPY contains metadata that a bare np.memmap does not interpret automatically.",
        "Guessing the dtype or checking only after serialization: the file can return plausible values despite a wrong element width, signedness, or byte order, and a narrow integer dtype can already have wrapped token IDs while writing.",
        "Using n−m+1 as the exclusive upper bound: this permits s=n−m, for which Y contains only m−1 elements.",
        "Copying the memory map in full immediately, which discards the benefit of loading only the required pages.",
        "Computing min(x) and max(x) inside every loader call: both operations scan the complete file instead of only the current batch windows."
      ],
      "checks": [
        "What is the complete data path from the stored token file to tensors X and Y?",
        "Why is n−m the exclusive upper bound for start indices, and which starts are valid when n=10 and m=4?",
        "How can a memory map return incorrect tokens without raising an error, and which checks catch that before training?"
      ],
      "answers": [
        "Tokenization creates a flat integer array on disk. A memory map opened with the correct file format and dtype supplies small windows of length m+1; their first m values become X and their final m values become Y before both move to the target device as torch.long tensors.",
        "Y needs indices s+1 through s+m, so s+m≤n−1 and therefore s<n−m. With n=10 and m=4, the exclusive bound is 6 and the valid starts are exactly 0, 1, 2, 3, 4, and 5.",
        "Memory mapping interprets raw bytes according to dtype and byte order, and a wrong interpretation need not cause a loading error. Before serialization, require both 0≤token ID<V and V−1≤np.iinfo(dtype).max so no ID can wrap. When opening, verify the format, documented dtype, byte order, expected length, and known values; perform any necessary full scan once in chunks rather than inside every Batch call."
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
    "architecture-stability-shapes": {
      "title": "Architecture Stability & Shape Decisions",
      "level": "Deep Dive",
      "summary": "Stability mechanisms constrain problematic Logit and Attention scales; shape decisions distribute parameters, sequential work, and hardware efficiency.",
      "mental": "A Transformer architecture has two control panels. Stability controls how large Logits and Attention scores may become before exponentials make training fragile. Shape decisions control where parameters and sequential work live: width, depth, Heads, MLP size, serial or parallel branches, and auxiliary future-token heads. These choices preserve many external Shapes, but they change the function, runtime, and optimization behavior.",
      "details": [
        "Cross-Entropy depends on differences between output Logits: adding the same constant everywhere leaves Softmax and Cross-Entropy unchanged. Their common offset can therefore drift without improving predictions. z-loss penalizes the squared logsumexp(logits) and anchors that direction. QK Norm acts elsewhere: it normalizes Query and Key before their Dot Product so Attention scores do not grow without control. Logit soft-capping uses c·tanh(z/c), which is almost the identity for small magnitudes but bounded between −c and +c. None of these mechanisms replaces numerically stable Softmax.",
        "In a serial Pre-Norm block, Attention changes the Residual Stream first and the MLP reads that changed state. In a parallel block, Attention and MLP read the same normalized input and their outputs are added together. Both variants return B×T×D, but they are not algebraically equivalent. Parallel blocks can share one Norm and make input matrix multiplications easier to fuse. Common comparison heuristics are d_ff≈4D for a dense two-matrix MLP, d_ff≈8D/3 for parameter-matched SwiGLU, and H_q·d_head≈D. These are empirical defaults, not type rules.",
        "The depth-width aspect ratio distributes a fixed parameter budget. More Layers create more sequential stages and usually more latency; greater width creates larger matrix multiplications that often parallelize more efficiently. Lecture 3 shows a broad empirically strong family rather than one universal optimum. Multi-Token Prediction (MTP) adds lightweight auxiliary modules and extra training losses for further future positions. It may enrich training signal or support a draft path, but it does not remove the main model's autoregressive dependency and is not guaranteed free inference speedup."
      ],
      "pitfalls": [
        "Treating z-loss, QK Norm, and soft-capping as one mechanism even though they control a shared Logit offset, Q/K scale, and individual Logit magnitudes respectively.",
        "Assuming parallel and serial blocks are functionally identical because their input and output Shapes match; the serial MLP sees the current Attention result.",
        "Treating 4D, 8D/3, one Head ratio, or one depth-width ratio as a natural law—or counting MTP predictions as independently generated final tokens."
      ],
      "checks": [
        "Every output Logit is increased by the same constant a. What changes in Softmax, Cross-Entropy, and z-loss?",
        "For D=1024 and H_q=16, derive d_head, the usual dense-MLP width, and the parameter-matched SwiGLU width. Why can a parallel block still behave differently from a serial block?"
      ],
      "answers": [
        "Softmax and Cross-Entropy remain unchanged because only Logit differences matter. But logsumexp(z+a)=logsumexp(z)+a, so z-loss changes and penalizes the shared drift.",
        "d_head=1024/16=64. The usual dense MLP has d_ff≈4096; parameter-matched SwiGLU has d_ff≈8·1024/3≈2731 and is normally rounded for hardware. In the serial block, the MLP reads the state already changed by Attention; in the parallel block, both branches read the same input. Matching Shapes therefore do not imply the same function."
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
    "moe-routing-capacity": {
      "title": "MoE Routing, Load Balance & Expert Capacity",
      "level": "Deep Dive",
      "summary": "Sparse MoE compute works only when the selection rule, Expert Capacity, overflow, and load distribution form one mathematical and distributed-systems contract.",
      "mental": "A Mixture of Experts is a workshop with many specialists and a Router. Sparse compute works only if each token reaches a few useful Experts while every device receives enough work. Routing quality and systems capacity are therefore one coupled problem: a mathematically confident choice can still overload one Expert, drop tokens, and leave other hardware idle.",
      "details": [
        "For T token states of width D, a Router produces E scores per token; Token-Choice Top-k selects a few Experts and mixes their outputs back into the Residual Stream. Some architectures normalize before Top-k and others only over selected Experts, so the exact gate definition belongs to the contract. Expert Choice reverses selection: each Expert chooses a fixed number of tokens. Its load is controlled directly, but a token may be chosen by zero, one, or several Experts; exactly k Experts per token are no longer guaranteed.",
        "Token Choice creates variable loads. A Capacity Factor turns the uniform average T·k/E into a finite slot count per Expert. If more assignments arrive, the implementation must drop, reroute, or process overflow with variable capacity; silently ignoring it is incorrect. With capacity-limited routing, one token's result may therefore even depend on other tokens in its routing group. The Switch auxiliary balance loss couples hard assignment fractions f_i with average soft Router probabilities P_i. Its coefficient trades load uniformity against the actual Language-Model objective.",
        "Router z-loss controls Router-Logit magnitude and is not a load-balancing loss. DeepSeek v3 instead also uses one bias per Expert for Top-k selection and adapts it from observed load; the original scores may still supply mixture weights. Upcycling initializes several Experts from a trained dense MLP, adds a Router, and continues sparse training. It retains useful knowledge but does not immediately create specialized Experts: symmetry breaking, load control, and validation remain necessary."
      ],
      "pitfalls": [
        "Confusing Expert Capacity with model capacity: it is a slot budget per routing group, not a parameter count.",
        "Treating auxiliary balance loss, Router z-loss, and per-Expert bias as interchangeable; they act on load, Logit scale, and selection respectively.",
        "Assuming Expert Choice guarantees service for every token or that upcycling immediately creates specialized Experts."
      ],
      "checks": [
        "A routing group has T=12 tokens, E=4 Experts, k=2 assignments per token, and Capacity Factor c_f=1. How many assignments fit per Expert, and what must happen if one receives eight?",
        "Distinguish auxiliary balance loss, Router z-loss, per-Expert bias, and upcycling by their direct effect."
      ],
      "answers": [
        "There are T·k=24 assignments; uniform load is 24/4=6, so C_expert=ceil(1·24/4)=6. Eight assignments exceed capacity by two. The implementation must explicitly drop, reroute, or support variable-capacity sparse compute.",
        "Auxiliary balance loss provides gradient pressure toward more even load. Router z-loss controls Logit or log-partition drift. Per-Expert bias changes Top-k selection from observed load without necessarily changing the mixture weight. Upcycling is an initialization from a dense MLP and replaces neither balancing nor continued training."
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
        "Neighboring Threads should read neighboring addresses so their accesses can be combined into a small number of wide memory transactions; this is called Memory Coalescing. In vector addition, Thread i can process element i exactly, whereas poorly scattered indices generate more HBM transactions and run more slowly despite performing the same number of additions.",
        "Besides the general compute units, modern GPUs contain Tensor Cores: specialized circuits that execute small matrix multiplications as a single hardware operation. Matrix multiplications therefore reach a floating-point rate more than an order of magnitude higher than elementwise operations, and lower precision such as BF16 or FP8 raises that rate further. An accelerator's advertised peak performance consequently applies only to matrix multiplications in the matching data type; compute that is not expressed as a matrix multiplication cannot use these units."
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
        "Tile sizes simultaneously determine reuse, the number of Blocks, Register requirements, and Shared-Memory use. Tiles that are too large can leave fewer Blocks resident and reduce Occupancy; boundary Tiles require masks or Padding when M, N, or K is not exactly divisible by the Tile size. On real hardware this produces performance cliffs instead of smooth curves: when a matrix dimension grows just past a multiple of the Tile size, additional barely filled boundary Tiles appear, or one extra barely filled wave of Blocks starts on the Streaming Multiprocessors (Wave Quantization), and throughput drops visibly even though the amount of compute barely changes."
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
    "triton-kernels": {
      "title": "Thinking in Triton Kernels: Grid, Blocks, Strides & Masks",
      "level": "Systems",
      "summary": "A Triton program describes the work of one GPU program block; the grid, offsets, strides, and masks map a tensor operator onto many parallel blocks.",
      "mental": "Instead of scheduling one thread for every individual element, you write a small block program. program_id states which part of the output that block owns. From this index, the block computes its offsets, loads only valid elements, performs vectorized computation, and writes its part back. Correctness begins with ownership: which block is allowed to write each output position exactly once?",
      "details": [
        "The launch grid determines how many instances of the same Triton kernel run. tl.program_id(axis) identifies one instance along a grid axis; from it you might compute offsets = pid·BLOCK_SIZE + arange(0,BLOCK_SIZE). A mask offsets<n protects edge positions when n is not divisible by the block size. Loads outside the mask need a neutral other value suitable for the operation: zero for a sum, and usually negative infinity for a maximum or Softmax.",
        "Strides translate multidimensional logical indices into memory addresses. For a tensor X[i,j], the address is base + i·stride_i + j·stride_j, so kernels must deliberately support non-contiguous layouts. Accesses are coalesced when neighboring lanes read neighboring memory addresses. A mathematically correct transposition of block axes can still be very slow when it spreads accesses across large strides.",
        "Block size, number of Warps, and staging affect parallelism, register pressure, data reuse, and occupancy. Autotuning must operate only over variants that are already correct and must use representative shapes; otherwise it optimizes a special case. Tests should compare small, non-divisible, and non-square shapes, different strides, and several data types against a trusted reference. Only then should warmup, synchronization, quantiles, and profiling be used for performance."
      ],
      "pitfalls": [
        "Choosing the grid and BLOCK_SIZE so that several programs write the same output or edge values have no owner.",
        "Using zero as other for masked Softmax loads: zero can exceed valid negative logits and then incorrectly receive probability mass.",
        "Testing only contiguous inputs: a kernel can return the expected shapes yet read incorrect addresses for other strides.",
        "Choosing block parameters from one warm measurement: compile time, asynchronous dispatch, and shape-specific behavior can distort the comparison."
      ],
      "checks": [
        "For a vector of length n, how do you derive one program's offsets and edge mask from program_id and BLOCK_SIZE?",
        "Why are strides part of operator semantics rather than merely a performance detail?"
      ],
      "answers": [
        "For program pid, the block starts at pid·BLOCK_SIZE. With local lanes r=0,…,BLOCK_SIZE−1, the global offsets are pid·BLOCK_SIZE+r; exactly the lanes with offset<n are valid. The grid needs ceil(n/BLOCK_SIZE) programs so that every valid index has exactly one owner.",
        "Strides determine which memory address a logical index denotes. If a kernel ignores them, transposed, sliced, or otherwise non-contiguous views cause it to read values different from the tensor's logical content. The same strides also determine whether neighboring lanes access memory coalescently, but correctness comes first."
      ]
    },
    "kernel-contracts": {
      "title": "2D Triton & FlashAttention Backward",
      "level": "Systems",
      "summary": "A2 requires explicit tile, mask, partial-buffer, and recomputation contracts for two-dimensional Triton kernels and FlashAttention backward, not merely a general idea of tiling.",
      "mental": "A Triton program owns a rectangular tile, not automatically one full row or matrix. Two program IDs choose row and column tiles, and every memory address needs the corresponding boundary mask. Flash backward likewise does not store the large score matrix: Q, K, V, O, and the row-wise Log-Sum-Exp statistic suffice to regenerate probabilities block by block and assemble gradients.",
      "details": [
        "A two-dimensional launch grid may have shape (ceil_div(R,BR), ceil_div(C,BC)). program_id(0) and program_id(1) choose the two tile axes; offsets are pid·block_size plus arange. A Block Pointer records the base, full shape, strides, offsets, block shape, and memory order. Loads and stores at the boundary need the joint mask row<R and col<C so the final tile remains safe on both axes.",
        "For the weighted row-sum kernel y_r=Σ_d X_rd·w_d, the gradients are dX_rd=g_r·w_d and dw_d=Σ_r X_rd·g_r. dX can be written independently per element. Several row tiles contribute to the same dw_d, however, so without atomics each row program produces a partial buffer of shape [n_row_tiles,D], followed by a second kernel that reduces its first axis. A barrier inside one program does not synchronize different programs.",
        "FlashAttention backward stores Q, K, V, O, and L=logsumexp(S) for each Query row. It computes D_row=rowsum(O⊙dO), reconstructs S=QKᵀ/√d with the same causal mask and P=exp(S−L), then dV=PᵀdO, dP=dOVᵀ, dS=P⊙(dP−D_row), dQ=dSK/√d, and dK=dSᵀQ/√d. As a numerical invariant, every unmasked dS row sums approximately to zero."
      ],
      "pitfalls": [
        "Checking only the column mask: in a genuine 2D grid, both the final row tile and the final column tile may extend beyond the matrix.",
        "Using a different causal mask or Log-Sum-Exp axis during backward; reconstructed probabilities and gradients then become wrong despite plausible Shapes."
      ],
      "checks": [
        "What grid and partial-buffer shapes result for R=37, D=70, BR=16, and BD=32?",
        "Which tensors are stored for FlashAttention backward, and which row invariant should dS satisfy?"
      ],
      "answers": [
        "The 2D grid has ceil(37/16)=3 row tiles and ceil(70/32)=3 column tiles. Without atomics, the row reduction for dw uses a partial buffer [3,70]; column tiles write disjoint D ranges within each partial row.",
        "Q, K, V, O, and the row statistic L are stored. Scores and P are reconstructed with identical scaling and masking. Because Softmax is invariant to a common row offset, the sum of dS across each allowed Key row must be numerically close to zero."
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
    "distributed-runtime": {
      "title": "Distributed Runtime: Groups, Ordering & Critical Path",
      "level": "Systems",
      "summary": "Distributed Data Parallel (DDP) is correct only when Process Groups, tensor ordering, asynchronous lifetimes, and the Data-Parallel degree match explicitly; speedup then depends on the overlap-aware critical path.",
      "mental": "Every Rank is a process, but World Size always belongs to a specific Process Group. All members must enter matching Collectives with compatible Shapes in the same order. An asynchronous handle means only that work was launched. A dependency or wait boundary is what makes the tensor safe to consume and permits a correct Optimizer Step.",
      "details": [
        "A Rank identifies a process inside a Process Group, and world_size is the number of members in that particular group. In a multidimensional layout, W_total=d·t·p for the Data-, Tensor-, and Pipeline-Parallel degrees. Only d enlarges the global data batch: B_global=B_micro·accum·d. Tensor- and Pipeline-Parallel Ranks split the same example or model and must not be counted again as independent data copies.",
        "Collectives are distributed control-flow contracts. The same operation, compatible tensor shape, and compatible ordering must occur on every group member, or one Rank may wait for a message another never sends. async_op returns a handle, not completed gradients. Before reusing its buffer or performing the Optimizer Step, the program needs wait or a proven stream dependency.",
        "DDP keeps parameters replicated, computes local Losses, and synchronizes gradient buckets when their parameters become ready during backward. Small buckets start early but pay latency more often; large buckets amortize latency but start later. In a ring, All-Reduce moves approximately 2(W−1)M/W bytes per Rank, while Reduce-Scatter or All-Gather moves (W−1)M/W. The critical path can be checked with T_step≈T_compute+max(0,T_comm−T_overlap)."
      ],
      "pitfalls": [
        "Using total device count as World Size everywhere; Batch Size, Collective membership, and sharding may each be governed by a different Process Group.",
        "Treating a returned async handle as completion and updating parameters before gradient synchronization has actually finished."
      ],
      "checks": [
        "What are total World Size and global Batch Size for d=4, t=4, p=2, B_micro=2, and accumulation=4?",
        "Which conditions prevent a Collective deadlock, and how does overlap appear in the critical path?"
      ],
      "answers": [
        "The total Rank count is 4·4·2=32. The global data batch is only 2·4·4=32 examples per Optimizer Step because Tensor and Pipeline Parallelism process the same examples and do not multiply the data batch.",
        "Every member of the group must call compatible Collectives with matching Shapes and in matching order; asynchronous work must complete before dependent use. Only T_overlap can hide communication, so uncovered time max(0,T_comm−T_overlap) is added to compute."
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
        "Pipeline Parallelism assigns consecutive Layers to different Stages and sends activations and their gradients between neighbors. Without Microbatches, only one Stage works at a time while the others wait; several Microbatches fill the Pipeline, but a Bubble of approximately W_pp−1 Stage times remains and becomes proportionally smaller as more Microbatches run in sequence. Advanced schedules shrink the Bubble further by splitting the Backward Pass into activation and weight gradients and moving the weight-gradient computation into otherwise idle waiting slots (zero-bubble pipelining).",
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
        "Scaling Laws can help plan a larger run from smaller experiments or reveal whether model capacity or data is currently limiting. If B·D^(-β) dominates, for example, a larger model provides little benefit with the same dataset, whereas more suitable data may help. Before an expensive extrapolation, inspect prediction error on held-out runs, residuals, and any changes to the data, architecture, and training recipe.",
        "Besides model size and data, the lecture also treats training hyperparameters: the critical batch size is the batch size beyond which additional data parallelism yields strongly diminishing returns. Below it, doubling the batch removes almost half of the optimization steps; above it, a larger batch costs extra FLOPs without further reducing the required number of steps. It is estimated from the gradient noise scale, the ratio of gradient noise to gradient signal, and grows roughly as the loss falls. Changing the batch size requires re-tuning the learning rate, otherwise a scaling fit compares unfair runs."
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
    "scaling-optima": {
      "title": "Compute Optima, μP Roles & the WSD Contract",
      "level": "Scaling",
      "summary": "Lecture 11 connects three separate contracts: Compute optima are fitted with an offset and uncertainty, μP scales parameters by role, and WSD defines when a Checkpoint is actually complete.",
      "mental": "Treat the fit, parameterization, and schedule as three tables. The fit table contains C, N_opt, D_opt, and L_opt with offset E. Maximum Update Parametrization (μP) assigns an initialization and Adam learning-rate scaling to each matrix role. Warmup-Stable-Decay (WSD) instead marks training phases; a Stable Checkpoint is a shared starting point and becomes a final comparison only after its defined Decay.",
      "details": [
        "Compute-optimal predictions can be modeled as N_opt=A_N·C^a, D_opt=A_D·C^b, and L_opt=E+A_L·C^(−γ). Fit log N_opt and log D_opt against log C; fit log(L_opt−E) for Loss. If E is unknown, use a constrained fit or a sensitivity analysis. a+b≈1 is only a consistency check when D was derived from the same C≈6ND relationship, not for independent or confounded fits.",
        "In the specific Lecture 11 μP protocol, let r=M/M₀ be the ratio to base width. Embeddings retain initialization variance and Adam learning rate with factor 1. Hidden matrices use variance 1/r, hence standard deviation 1/√r, and Adam learning rate 1/r. Readout matrices use variance 1/r², hence standard deviation 1/r, and learning rate 1/r. This role table is protocol-specific rather than a universal μP definition for arbitrary architectures or Optimizers.",
        "WSD consists of Warmup, Stable, and Decay. A Checkpoint from Stable can seed several defined Decay lengths and thereby save shared work. Before Decay, however, it is not a fair final endpoint against a fully completed schedule. Reports must include Token count, Compute, exact Decay length, Optimizer assumptions, and the limitation that the covered μP theory primarily explains width rather than depth transfer."
      ],
      "pitfalls": [
        "Ignoring the irreducible offset E before taking logarithms; this forces a curved Loss relationship into a line and distorts the extrapolation.",
        "Applying one global μP rule to every matrix or calling a Stable Checkpoint final while the Decay defined for that comparison has not run."
      ],
      "checks": [
        "Which initialization and Adam factors apply at r=4 to Embedding, Hidden, and Readout roles in the lecture protocol?",
        "When is a+b≈1 a useful check, and why is a Stable Checkpoint not automatically final?"
      ],
      "answers": [
        "Embedding keeps variance, standard deviation, and learning rate at factor one. Hidden uses variance 1/4, standard deviation 1/2, and Adam learning rate 1/4. Readout uses variance 1/16, standard deviation 1/4, and Adam learning rate 1/4.",
        "The exponent sum checks the shared Compute relationship only when D consistently comes from C/(6N). A Stable Checkpoint still uses the plateau learning rate; only its specified Decay produces the completed comparison point for that schedule."
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
        "A validation set may guide development or threshold selection, but it then becomes a development metric rather than independent final evidence. That use alone is not train leakage. Verbatim, near-duplicate, or semantically equivalent overlap with the training corpus is data contamination; a defensible generalization claim additionally requires a test set that remained untouched until the final evaluation."
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
    "filtering-mechanics": {
      "title": "Filtering Models: KenLM, fastText & DSIR",
      "level": "Data",
      "summary": "KenLM, fastText, and Data Selection via Importance Resampling (DSIR) answer three different questions: how likely a text is under a target corpus, how likely a target label is, and how strongly a text is overrepresented in the target relative to the raw corpus.",
      "mental": "Imagine a huge raw corpus R and a smaller collection T that demonstrates the style or domain you want. KenLM asks, ‘How familiar does x sound under T?’ fastText asks, ‘How confidently does x belong to class T?’ DSIR asks, ‘How much more typical is x for T than for R?’ The third question divides by raw-corpus probability, so it can upweight rare, target-specific examples over sentences that are common everywhere.",
      "details": [
        "An n-gram Language Model decomposes a text into local predictions. For an n-gram, it counts how often the next word w followed a context h and estimates p(w|h)=count(h,w)/count(h). With pure Maximum Likelihood Estimation, an unseen n-gram receives probability zero and would make the probability of the entire text zero. Kneser-Ney Smoothing therefore discounts probability mass from observed continuations and redistributes it through shorter contexts; KenLM implements such smoothed n-gram models efficiently. Length-normalized Perplexity makes documents of different lengths comparable: lower means only ‘more similar to the distribution of the selected target corpus,’ not automatically more truthful or objectively better.",
        "fastText is not a Transformer in this setting. It maps words and Character- or Word-n-Grams into hash buckets, looks up their learned embeddings, and averages them into a document vector h. A Linear Layer computes one Logit per class, and Softmax may produce p(Target|x). The Hashing Trick keeps the parameter count fixed even though the possible n-gram inventory is enormous; different n-grams can, however, collide in the same bucket and then unintentionally share a parameter. The model is fast but largely loses order and complex context. Its score measures agreement with the training labels, such as language or curated quality, rather than a universal property of the text.",
        "DSIR models both a target distribution p_T and a raw or proposal distribution p_R on the same feature representation. Every raw document receives the Importance Weight w(x)=p_T(x)/p_R(x); the weights are then normalized across candidates, and documents are selected proportionally. For example, A has p_T=0.30 and p_R=0.60, so w=0.5. B has p_T=0.20 and p_R=0.10, so w=2. Although B is less likely under the target alone, it is four times more target-specific relative to the raw corpus. Resampling also preserves diversity better than blindly taking the top k ratios.",
        "The three methods operationalize the objective differently: a generative target model ranks by p_T(x) or Perplexity, a discriminative classifier ranks by p(T|x), and density-ratio selection ranks by p_T(x)/p_R(x). A score is not yet an action policy: a threshold can make a hard keep/drop decision, stochastic keeping can retain each example with a score-dependent probability, and Importance Resampling samples in proportion to normalized ratios. Those rules produce different datasets and diversity even from identical scores. For DSIR, target and raw models need the same feature space and adequate proposal support; a tiny p_R can otherwise create extreme, high-variance weights. Smoothing, Log-Space arithmetic, Weight Clipping, and manual samples near the extremes are practical safeguards. Neither an attractive score nor a large ratio replaces downstream evaluation under the same token and training budget.",
        "Language Identification is a typical fastText use case, but short texts, closely related languages, dialects, Low-Resource Languages, and Code-Switching often produce uncertain or systematically biased scores. A threshold is therefore a policy for finite training compute: it determines which languages and variants the model will see often enough to learn. Audit Confusion Matrices and retention separately by language, length, and domain, allow an Unknown or Review zone, and do not automatically treat every document with a low maximum score as worthless."
      ],
      "pitfalls": [
        "Reconstructing KenLM Perplexity with the wrong logarithm base: its Python score API returns a sum of base-10 Log-Probabilities, so PPL=10^(−score/N); exp(mean NLL) assumes Natural Logs.",
        "Equating the highest p_T score with the highest DSIR Weight: the ratio may specifically favor a target characteristic that is rare in the raw corpus.",
        "Reading fastText scores as objective quality or perfectly calibrated probability: labels, reference data, hash collisions, and the threshold define the behavior.",
        "Using a ratio without checking proposal support: when p_R is nearly zero, the Weight becomes unstable and a few documents may dominate selection."
      ],
      "checks": [
        "What different question do KenLM, fastText, and DSIR answer?",
        "Why can a document with smaller p_T(x) receive a larger DSIR Weight than a document with larger p_T(x)?",
        "Which groups of texts would you audit separately for a Language-ID filter, and why?"
      ],
      "answers": [
        "KenLM is a generative target model that evaluates how likely a token sequence is under the target distribution; Perplexity is its length-normalized representation. fastText is discriminative and predicts a label such as target, language, or quality from hashed n-gram features. DSIR directly compares target and raw through p_T/p_R and estimates how underrepresented an example is relative to the available raw corpus.",
        "DSIR considers not just the numerator p_T but also the denominator p_R. For A, 0.30/0.60 gives w=0.5; for B, 0.20/0.10 gives w=2. B has the lower target score but is much more characteristic of the target relative to the raw corpus. After normalization, B is therefore resampled more often without being selected deterministically every time.",
        "I would separately examine at least short texts, Low-Resource Languages, closely related languages, dialects, Code-Switching, different domains, and different writing systems. These are precisely the cases where training support is often weak or a short excerpt contains too little evidence. Each group needs manual labels, a Confusion Matrix, score distributions, and retained token volume at several thresholds."
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
    "dataset-lineage": {
      "title": "Corpus Lineage: Real Training Datasets",
      "level": "Data",
      "summary": "The well-known training corpora form a family tree: from BooksCorpus and WebText via C4, The Pile, and MassiveText to RefinedWeb, Dolma, DCLM, and Nemotron-CC, each dataset responds to a weakness of its predecessor and thereby exposes one design decision about provenance, extraction, filtering, and mixing.",
      "mental": "Read dataset history as a workshop series in which the same question is answered again and again: how do we recognize, without reading everything by hand, that a text is good enough? WebText answers with human linking, C4 with handwritten rules, CCNet with the perplexity of a reference language model, The Pile with curated selection, DCLM with a trained classifier, and Nemotron-CC with additional rewriting. Once you can name a corpus's answer strategy, you can predict its strengths and biases.",
      "details": [
        "Early curated era: BERT trained on English Wikipedia plus BooksCorpus, a collection of self-published novels that was later withdrawn over consent and rights concerns—an early provenance warning sign. GPT-2 built WebText from web pages linked on Reddit with at least three karma: not the text itself but its endorsement by humans served as the quality filter. Both approaches scale only so far, yet they establish the basic pattern of defining quality through a provenance signal rather than content analysis.",
        "Web scale: Common Crawl provides raw snapshots of the web in two forms—WARC files (Web ARChive, raw HTTP responses) and WET files (Web Extracted Text, already-extracted text). Extraction itself is lossy and therefore a modeling decision. CCNet filters Common Crawl with paragraph deduplication, language identification, and a KenLM n-gram language model trained on Wikipedia: low perplexity serves as the quality proxy. C4 from the T5 project shows the rule-based variant: lines without terminal punctuation, very short pages, blocklisted words, lorem-ipsum, and Javascript lines are removed—cheap and transparent, but crude.",
        "Mixture era: GPT-3 mixed filtered Common Crawl, WebText2, book corpora, and Wikipedia with deliberate weights, so small high-quality sources are seen disproportionately often. The Pile bundled 22 curated sources, among them StackExchange, GitHub, scientific text, and the shadow library Books3; Gopher's MassiveText relied on strict quality and repetition rules, while LLaMA reproduced an open mixture of CCNet-filtered Common Crawl, C4, GitHub, Wikipedia, books, ArXiv, and StackExchange. Lesson: mixture weights are part of the model design—the same sources with different weights yield a noticeably different model.",
        "Filtered-web era: RefinedWeb showed that carefully extracted, strictly filtered, and fuzzily deduplicated Common Crawl alone can match curated mixtures. Dolma made such a pipeline reproducible together with an open toolkit. DCLM (DataComp for Language Models) turned curation itself into a benchmark: with a fixed data pool and a fixed training recipe, only the filtering strategy is compared; the best entry was a fastText classifier whose positive examples are instruction-like texts. Nemotron-CC combined classifier ensembles with synthetic rewriting to squeeze more high-quality tokens out of the same crawls once unique tokens become scarce.",
        "After pretraining comes more targeted data work. Long-context ability is usually added later with long documents such as books (PG-19) and mathematics (Proof-Pile), because quadratic attention makes long contexts expensive during pretraining. Task-instruction data such as Super-Natural Instructions and Flan converts existing task datasets into prompt templates. Open instruction-chat data is mostly synthetic: Alpaca distilled responses of a stronger teacher model via Self-Instruct, Vicuna used ChatGPT conversations shared by users, and WizardLM rewrote questions into progressively harder ones via Evol-Instruct. The teacher's mistakes, style, and terms of use travel into such data."
      ],
      "pitfalls": [
        "Treating web corpora as interchangeable dumps overlooks how strongly extractor, filters, deduplication, and mixture weights differ—the same crawl snapshot leads to clearly different models.",
        "Publicly accessible is not the same as public domain or licensed: Books3 came from a shadow library and became the center of several lawsuits against model developers.",
        "Every quality signal—linking, reference perplexity, or a classifier—defines quality as similarity to a reference and imports that reference's bias against languages, styles, and domains outside it."
      ],
      "checks": [
        "Which quality signal do WebText, CCNet, and DCLM each use, and which shared blind spot do all three have?",
        "Two teams start from the identical Common Crawl snapshot and obtain clearly different models. Name three pipeline decisions that explain this."
      ],
      "answers": [
        "WebText uses human linking with Reddit karma, CCNet uses the perplexity of a KenLM language model trained on Wikipedia, and DCLM uses a fastText classifier with instruction-like positive examples. All three measure similarity to a chosen reference and therefore downgrade texts unlike that reference—for example other languages, dialects, or technical formats.",
        "First, extraction: WARC raw data with your own extractor or ready-made WET files yield different text. Second, filtering decisions: language and quality models, reference corpora, and thresholds shift the distribution. Third, deduplication and mixture weights: what is repeated, and how often, changes which distribution the model actually learns."
      ]
    },
    "copyright-licensing": {
      "title": "Copyright, Licenses & Fair Use",
      "level": "Data",
      "summary": "Nearly every fixed original text on the internet is automatically protected by copyright; it becomes usable through a license or—in United States law—through the fair-use balancing test with four factors, some favoring and some opposing foundation-model training. The lecture offers a technical orientation, not legal advice.",
      "mental": "Picture copyright as an automatic fence that appears around almost every fixed original work without any registration. Two paths lead through the fence: a license, meaning a contractual promise not to sue, or fair use, which is not a fixed gate but a balancing test that a court applies case by case. For training data this means: first ask whether copying is permitted, then how to filter.",
      "details": [
        "Copyright protects original works fixed in a tangible medium, and the threshold is extremely low—an ordinary website is protected. Protection arises automatically without registration; in the United States, registration is only required before suing for infringement. Protection covers expression, not ideas: reimplementing an algorithm such as Quicksort is free, copying its concrete source code is not. Mere collections without creative selection, such as telephone directories, are not protectable, and protection expires after decades—which is why most of Project Gutenberg is in the public domain.",
        "A license is a contractual permission from the rights holder—effectively a promise not to sue. Creative Commons licenses allow free redistribution under conditions and support projects such as Wikipedia; public domain and Creative Commons are not the same thing. Model developers increasingly license training data directly, for example Google with Reddit or OpenAI with Shutterstock and StackExchange. In addition, a platform's terms of service can restrict uses that copyright alone would permit.",
        "Fair use under Section 107 of the United States copyright statute balances four factors: the purpose and character of the use (transformative and educational uses are favored), the nature of the work (factual over creative), the amount of the original taken, and the effect on the market for the original. Classic examples: writing a summary of a film, adopting an algorithm instead of its code, and Google Books snippets (Authors Guild v. Google) count as fair, parody usually as well. At the same time, plots and characters can be protected—copyright targets semantics and economics, not only verbatim copies.",
        "For foundation models the question starts before training: downloading and storing the data is already, formally, a reproduction. In favor of fair use, training is strongly transformative and extracts statistical patterns rather than concrete expression; against it stand possible verbatim memorization and the real market impact on writers, artists, and publishers. The practical consequence: document provenance, license status, and policy separately per source, license where possible, and leave the legal judgment to professionals—case law here is still evolving."
      ],
      "pitfalls": [
        "A missing copyright notice does not mean permission: protection arises automatically, so practically the entire open web is protected.",
        "Confusing publicly accessible with public domain is the Books3 mistake: a shadow library makes works retrievable, not rights-free.",
        "Transformative training is no blanket permission: fair use remains a case-by-case balancing test in which market impact plus the copying step before training count independently."
      ],
      "checks": [
        "Someone argues: the blog article carries no copyright notice, so we may freely add it to the training corpus. Which two errors does this sentence contain?",
        "Which of the four fair-use factors tend to favor use in foundation-model training, and which tend to oppose it?"
      ],
      "answers": [
        "First, copyright arises automatically once the text is fixed; a notice is not a requirement for protection. Second, even a clarified protection status is no basis for use: adoption becomes permissible only through a license or a documented fair-use assessment, and that decision belongs in the source's provenance documentation.",
        "The first factor tends to favor use, because training is considered strongly transformative and extracts patterns rather than expression. The third factor tends to oppose it, because entire works are typically copied, as does the fourth, because models can genuinely affect the market for the originals; the nature of the work is mixed, since corpora blend factual and creative sources."
      ]
    },
    "bloom-filters": {
      "title": "Bloom Filters: Cheap Membership with Uncertainty",
      "level": "Data",
      "summary": "A Bloom Filter answers set-membership queries with very little memory: ‘definitely absent’ is conclusive, while ‘possibly present’ may be a False Positive.",
      "mental": "Picture a shared field of m bit switches. Inserting an element applies k Hash Functions that choose k switches and set them to one. A later query checks the same k positions. If even one is zero, the element was certainly never inserted completely; if all are one, either that element set them or many unrelated elements happened to set the same combination.",
      "details": [
        "A standard Bloom Filter stores no elements, only a Bit Array of length m. For every one of n inserted elements, k approximately independent Hash Functions compute positions between 0 and m−1 and set those bits to one. A query with the same functions returns ‘absent’ as soon as one required bit is zero. If all k bits are one, the result is only ‘possibly present.’ With a consistent implementation and no deletion, inserted elements produce no False Negatives, but elements that were never inserted can produce False Positives.",
        "After kn approximately uniform bit settings, a particular bit remains zero with probability (1−1/m)^(kn), so it is one with probability 1−(1−1/m)^(kn). For a query about an absent element, all k tested bits must happen to be one, which gives f=[1−(1−1/m)^(kn)]^k. More memory m lowers f, while more inserts n raise it. Increasing the number of Hash Functions k helps only until roughly k*=(m/n)ln2; beyond that, every element sets too many bits and the higher occupancy worsens the False-Positive probability again.",
        "Bloom Filters are useful as a cheap preliminary Membership Gate, for example to ask whether a normalized fingerprint was probably seen before consulting a more expensive exact structure. They do not replace that structure when you need an exact decision, the original item, a count, or deletion. A normal Bloom Filter cannot safely clear bits because the same bits may belong to several elements; a Counting Bloom Filter would need a different memory contract.",
        "This data structure must be kept separate from MinHash and Locality-Sensitive Hashing (LSH). A Bloom Filter asks approximate exact membership: was this exact key probably inserted? MinHash estimates the Jaccard Similarity of two sets, while LSH probabilistically retrieves candidates with similar MinHash signatures. An empirical False-Positive Rate must also use only truly absent queries in its denominator: FPR=FP/(FP+TN)."
      ],
      "pitfalls": [
        "Treating a positive Bloom result as proof: the required bits may have been set collectively by other elements.",
        "Increasing k indefinitely: after the optimum, additional hashes overfill the Bit Array and the False-Positive probability rises again.",
        "Including inserted elements in the FPR denominator: False-Positive Rate is defined over truly negative queries.",
        "Clearing bits to delete from a normal Bloom Filter: other stored elements can then suddenly appear absent."
      ],
      "checks": [
        "Why is a negative Bloom result more conclusive than a positive one?",
        "Why can increasing the number k of Hash Functions first lower and later raise the False-Positive probability?",
        "How does a Bloom Filter differ conceptually from MinHash and LSH?"
      ],
      "answers": [
        "An inserted element sets every one of the k positions that its Hash Functions will later check. If one of them is zero, the element cannot have been inserted under the data structure's assumptions. If all are one, the cause is ambiguous: other elements may have set those bits separately, so a positive result means only possible membership.",
        "With small k, a query checks few bits and can pass by chance relatively easily. Extra hashes initially require more simultaneous matches and reduce the error. At the same time, every inserted element sets k bits; when k becomes too large, the array approaches full occupancy and almost every query finds all required ones. The approximate minimum is at (m/n)ln2.",
        "A Bloom Filter probabilistically checks whether one exact key has already occurred in a set. MinHash creates a compact signature whose match fraction estimates Jaccard Similarity between two sets. LSH groups such signatures to retrieve similar pairs as candidates. The three tools therefore answer Membership, Similarity Estimation, and Candidate Retrieval questions respectively."
      ]
    },
    "dedup": {
      "title": "Exact Dedup, MinHash & LSH",
      "level": "Data",
      "summary": "Exact Deduplication removes identical repetitions, while MinHash and Locality-Sensitive Hashing find similar documents at scale as candidates that are then verified.",
      "mental": "Exact duplicates can receive the same fingerprint and are therefore cheap to group as candidates, but a finite hash alone is not a mathematical proof of identity because collisions are possible. For nearly identical documents, MinHash creates a short similarity sketch, and Locality-Sensitive Hashing (LSH) finds similar sketches as candidates. Only a comparison of normalized contents or true similarity determines membership in a duplicate cluster.",
      "details": [
        "In Exact Deduplication, a clearly defined unit such as a document, paragraph, sentence span, or line is normalized and hashed. A fast 32-bit hash can map different contents to the same value, so an exact policy compares contents within a hash group or uses a strong digest with a documented residual risk. The unit and action policy are also part of the contract: Lecture 14 typically keeps one representative of identical items, while A4 Exact-Line-Dedup retains only lines whose corpus-wide count is exactly one. These are not the same operation.",
        "For Fuzzy Deduplication, a document is often represented as a set of word n-grams called Shingles; their Jaccard similarity is |S∩T|/|S∪T|. For a random MinHash, the probability that the minima match equals this Jaccard similarity, so the fraction of equal values in a longer signature estimates it. More Hash Functions reduce estimation noise, while a predefined, identical normalization determines the similarity that is actually being compared.",
        "LSH divides a signature of length k into b Bands with r Rows, so k=b·r, and creates a candidate pair whenever at least one Band matches completely. At fixed k, more, shorter Bands typically increase Recall and reduce the Precision of candidate retrieval. The pipeline should then compute true Jaccard Similarity, cluster confirmed pairs transitively, and deliberately select a representative; whether the boundary is J>τ or J≥τ is an explicit pipeline contract. Train–validation–test overlap remains an additional, separate Deduplication task.",
        "Substring or span Deduplication lies between line and document units: if a sequence of three sentences repeats, for example, only that section can be removed. This preserves more independent content than deleting the whole document, but it may break transitions, references, and grammar in the remaining text. Alongside Duplicate Rate, audit coherence and the exact action—remove every copy, retain one representative, or remove only the span—on concrete examples."
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
        "Perplexity is a smooth and inexpensive metric for Pretraining and Scaling experiments because every target token provides a signal. A low value on a corpus does not, however, prove factual accuracy, Instruction Following, Reasoning, or safety. Contamination can artificially lower Perplexity, and application-specific claims require additional evaluations that directly match them.",
        "Lecture 14 also uses Perplexity to rank documents with an n-gram target model: low PPL means that the document resembles the local continuation statistics of the target corpus. The logarithm base must match the API. With Natural Logs, PPL=exp(−mean log p), whereas KenLM Model.score sums base-10 Log-Probabilities, requiring 10^(−score/M) or the provided Perplexity method. A consistent conversion preserves the ranking but changes the reported numerical value substantially."
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
        "Validity suffers when test tasks appeared in Pretraining, the test set was repeatedly used for development, or the tasks are far removed from real use. Data provenance, overlap searches, an untouched test set, and possibly newer time-separated tasks reduce these risks but do not eliminate them entirely. An automated Judge is also a model with Bias and must be checked against human judgments and analyzed for errors.",
        "The benchmark landscape from Lecture 12 can be sorted by the claim under test. Knowledge benchmarks such as MMLU (Massive Multitask Language Understanding), the harder MMLU-Pro, GPQA (graduate-level expert questions), and Humanity's Last Exam probe facts and expertise, mostly as multiple choice. Instruction-following benchmarks measure open-ended compliance: IFEval through automatically checkable format constraints, AlpacaEval and WildBench through Judge Models, Chatbot Arena through pairwise human preferences as an Elo-style leaderboard. Agent benchmarks such as SWE-Bench (real GitHub issues), CyBench (security tasks), and MLEBench evaluate the model together with scaffolding, Tools, and budget; ARC-AGI (Abstraction and Reasoning Corpus) attempts knowledge-light pattern reasoning, while safety benchmarks such as HarmBench and AIR-Bench test dangerous capabilities and refusal behavior including harmless control cases. Remember two things: a score always belongs to its category and protocol, and popular benchmarks saturate or leak into training data over time, which is why frontier models regularly move on to newer, harder variants."
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
    "inference-workload": {
      "title": "Inference Workload: Prefill, Decode, Latency & Throughput",
      "level": "Serving",
      "summary": "Autoregressive inference consists of a parallel prefill and many sequential decode steps; the two phases have different bottlenecks and metrics.",
      "mental": "Processing a prompt is like reading an entire section of a book, while producing the answer is like writing one word at a time. During prefill, the GPU can process many tokens together. During decode, every new token must wait for the previous one; each step moves a large amount of model state even though little new work is added. The same model can therefore have completely different utilization in the two phases.",
      "details": [
        "During prefill, the Transformer processes all prompt tokens in parallel and creates the Key-Value Cache (KV Cache) for every layer. This phase resembles a forward pass with a large token axis and can use matrix multiplications efficiently. During decode, one new token is produced, added to the cache, and used as a prerequisite for the next step. Token dependence makes decoding fundamentally sequential along the time axis, even though batches and heads remain parallel.",
        "Time to First Token (TTFT) measures the delay until the first output token and is usually dominated by queueing plus prefill. Inter-Token Latency, or time per output token, measures the gap between later tokens and is determined by the decode path. Throughput counts processed or generated tokens per second across the whole system. Larger batches can improve throughput while worsening the wait for an individual request, so hardware, batching rules, and prompt and response lengths must always accompany the metric.",
        "Lecture 10 makes the difference measurable through Arithmetic Intensity (AI): Floating-Point Operations per byte read from High Bandwidth Memory (HBM). For a gated MLP with input width D, intermediate width F, and T_q Query positions processed now, its BF16 assumptions give AI_MLP = 6BT_qDF/(4BT_qD+4BT_qF+6DF). When B·T_q is small relative to D and F, this approaches B·T_q: prefill with T_q=S reuses weights heavily, while decode with T_q=1 does so far less.",
        "For Multi-Head Attention without materializing the score matrix, the lecture derives AI_attn = S·T_q/(S+T_q). Prefill with T_q=S gives S/2; decode gives S/(S+1), less than one operation per byte in this simplified model. A larger batch does not automatically increase this core Attention AI because every request owns a separate KV Cache. The right serving target is therefore a Service Level Objective (SLO): a defined latency limit at the desired throughput for a fully specified workload."
      ],
      "pitfalls": [
        "Reporting only total latency: TTFT and Inter-Token Latency can move in opposite directions and are dominated by different phases.",
        "Applying training-FLOP estimates directly to decode: weights are reused far less per new token and memory traffic may dominate.",
        "Comparing throughput without stating batch size, sequence lengths, and hardware: the number then describes no reproducible serving setup."
      ],
      "checks": [
        "Why is prefill typically more compute-bound than token-by-token decoding of the same model?",
        "How can a larger batch improve throughput yet worsen the latency of one request?"
      ],
      "answers": [
        "During prefill T_q=S: many prompt positions use the same MLP weights, and the lecture equations give high AI_MLP and AI_attn=S/2. During decode T_q=1: AI_MLP approaches only B and simplified MHA Attention stays below 1 FLOP/byte at S/(S+1). Large weights and previous KV state must therefore be read for comparatively little new computation, so memory bandwidth more often becomes the limit.",
        "More concurrent sequences share the cost of reading weights and fill large matrix operations more effectively, increasing total throughput. An individual request may wait longer for a batching opportunity or compete with more work; the cache also grows and may hit new memory limits."
      ]
    },
    "kv-serving": {
      "title": "KV Cache, MHA, GQA, MQA & Attention Serving",
      "level": "Serving",
      "summary": "The KV Cache avoids recomputing past Attention state, but grows with layers, batch size, and context length and often determines serving capacity.",
      "mental": "Every earlier token leaves two index cards in each layer: its Key for being found and its Value as the content to retrieve. A new Query must read the old cards but does not need to write them again. Sharing more Key-Value Heads makes the card file smaller; storing fewer or only local cards saves more memory, but changes what information the model can access.",
      "details": [
        "Without a cache, the model would recompute the Keys and Values of every previous position for every new Token. Per Layer it stores K with Shape [B,H_kv,S,d_head] and the same again for V: B Sequences, H_kv Key-Value Heads, S cached positions, and Head width d_head=D/H_q. Its size is approximately 2·L·B·S·H_kv·d_head·b_KV Bytes. It grows linearly with Context S and active Batch B, even though the Attention Scores of a complete training Forward Pass grow quadratically with Sequence length. During Decode, the full cached history is read for each new Query, making both capacity and bandwidth important.",
        "Multi-Head Attention (MHA) generally gives every Query Head its own Key and Value Head. Grouped-Query Attention (GQA) lets several Query Heads share a smaller set of Key-Value Heads; Multi-Query Attention (MQA) uses a single shared Key-Value Head. The number of Query Heads, and therefore of Query subspaces, remains unchanged. Reducing H_kv from 32 to 8 cuts the KV Cache term to approximately one quarter, while any quality change must be measured empirically.",
        "Other variants reduce stored or loaded state differently. Local Attention restricts Keys to a window, Cross-Layer Attention shares Cache state between Layers, and Multi-Head Latent Attention (MLA) stores a compressed latent representation. These are architecture choices and cannot be applied only after training like a neutral server switch. For a cost estimate, write down L, B, cached S, H_kv, d_head, and Bytes per element explicitly instead of using only the total parameter count."
      ],
      "pitfalls": [
        "Confusing the KV Cache with model parameters: it is request-dependent activation state and grows with batch size and context length.",
        "Using H_q instead of H_kv in the GQA cache formula: Queries are computed for the current step; Keys and Values are what remain cached.",
        "Treating an Attention variant as a pure inference optimization even though weight shapes and training must match that architecture."
      ],
      "checks": [
        "Derive the KV Cache shape and the factor of two in the memory formula from the Attention data flow.",
        "What changes under GQA compared with MHA, and what remains unchanged about the Query Heads?"
      ],
      "answers": [
        "Each of the L Layers stores one Key for every one of B active Sequences, S previous positions, H_kv Key-Value Heads, and d_head Head features. Values have the same Shape, giving the factor of two. Multiplying by b_KV Bytes per element yields the Cache size.",
        "GQA reduces the number of distinct Key and Value Heads to H_kv and assigns several Query Heads to each one. The H_q Query Heads and their separate Query projections or lookups remain; only the Keys and Values offered within each group are shared."
      ]
    },
    "serving-optimizations": {
      "title": "Quantization, Speculative Decoding, Continuous Batching & PagedAttention",
      "level": "Serving",
      "summary": "Serving optimizations target different costs: smaller numeric representations, fewer target-model steps, dynamic batches, or more efficient KV Cache management.",
      "mental": "Imagine the server as a kitchen. Quantization makes ingredient containers smaller, Speculative Decoding has a fast assistant propose several next steps, Continuous Batching fills newly available burners immediately, and PagedAttention organizes cache blocks like virtual-memory pages. No method fixes every bottleneck automatically; first identify which resource is limiting.",
      "details": [
        "Quantization represents weights or activations with fewer bits, reducing memory usage and transferred bytes. Actual speedup depends on suitable hardware kernels and low quantize/dequantize overhead; accuracy loss must be measured on representative tasks. Pruning removes parameters or structures, while Distillation trains a smaller model from signals produced by a larger teacher. Both alter the model itself and require more than converting a file format.",
        "Speculative Decoding uses a cheaper Draft Model to propose several tokens and checks them together with the Target Model. With a correct accept/reject and resampling rule, the resulting distribution remains exactly that of the Target Model; simply accepting all matching argmax tokens would be a different algorithm. Benefit depends on acceptance rate, Draft cost, proposed block length, and efficient parallel verification.",
        "Continuous Batching removes completed sequences from a running batch and fills free slots with new requests instead of waiting for the longest sequence in a static batch. PagedAttention stores KV blocks in non-contiguous physical pages and maps logical sequences onto them. This reduces fragmentation and expensive preallocation; Prefix Sharing and Copy-on-Write can share common prompts until a sequence modifies its own block. The scheduler must balance fairness, SLOs, cache capacity, and contention between prefill and decode."
      ],
      "pitfalls": [
        "Equating fewer bits with proportional end-to-end speedup: kernel support and the actual bottleneck decide the result.",
        "Describing Speculative Decoding as approximate sampling: with the correct correction rule, the Target distribution is exact even when the Draft Model is inaccurate.",
        "Confusing PagedAttention with a new Attention formula: it primarily manages KV Cache storage and addressing."
      ],
      "checks": [
        "Which serving optimization would you choose for KV Cache fragmentation, and which for bandwidth-limited weight reads?",
        "Why can Speculative Decoding preserve the exact Target distribution despite an inaccurate Draft Model?"
      ],
      "answers": [
        "PagedAttention with blockwise mapping addresses fragmentation and excessive cache preallocation. Weight Quantization can help bandwidth-limited weight reads because fewer bytes move per Target Model step; batching can alternatively increase reuse. Measurements of the actual cost profile must decide which option wins.",
        "The Draft Model only generates proposals. The Target Model evaluates them, and a mathematically correct accept/reject and resampling rule corrects the difference between the two distributions. Accepted and replacement tokens therefore still follow the Target distribution overall; Draft similarity changes speed, not correctness."
      ]
    },
    "alternative-sequence-models": {
      "title": "State-Space Models, Hybrids & Diffusion",
      "level": "Lecture 10",
      "summary": "State-Space Models compress the past into a fixed recurrent state; diffusion refines all positions in parallel across several sequential steps.",
      "mental": "Attention keeps a growing card file of previous Keys and Values. A State-Space Model (SSM) replaces it with a fixed-size memory h_t: each token updates the old memory together with the new input. Diffusion takes a different route: it starts with an entire noisy sequence and improves all positions together, but must repeat this improvement step several times in sequence.",
      "details": [
        "A discrete linear SSM updates h_t = Āh_{t−1}+B̄u_t and produces y_t = Ch_t+D_su_t. Here u_t is the current input, h_t is compressed state, and y_t is output. The matrices decide what to preserve, forget, and read out. Autoregressive decode therefore need not store a separate KV entry for every previous position: state size is O(1) in context length. O(1) here means independent of S, not zero memory and not independent of model width or batch size.",
        "Compression creates a trade-off. Full Attention can select one earlier position directly through its Key; fixed state must superimpose many past details into limited capacity. Classical S4 models perform strongly on some synthetic long-context tasks but can struggle with Associative Recall—retrieving which earlier value belonged to a particular key. Mamba makes the dynamics selective and input-dependent, so the input controls what is stored or forgotten.",
        "Lecture 10 therefore emphasizes hybrid architectures. Jamba combines Transformer and Mamba layers, BASED combines linear and local Attention, and MiniMax-01 combines linear and Full Attention. The important claim is not that a hybrid always wins, but that strong systems often retain some Full Attention despite cheaper recurrent or linear paths, preserving precise content-addressed access.",
        "Diffusion first samples x_K from a noise distribution and then repeatedly samples x_{k−1} from p_θ(x_{k−1}|x_k) until x_0 can be decoded into tokens. Within one denoising step, all positions may update in parallel; the K steps themselves remain sequential. Diffusion therefore trades T autoregressive single-token steps for K full-sequence refinements. Discrete tokens, unknown response length, and exact text constraints make this harder than image diffusion."
      ],
      "pitfalls": [
        "Reading O(1) state as unlimited memory: fixed size prevents context growth but may make precise retrieval harder.",
        "Treating Mamba as a fixed linear SSM: selectivity makes its state dynamics input-dependent.",
        "Confusing parallel positions in diffusion with one-pass generation: every denoising step waits for the previous one."
      ],
      "checks": [
        "Why can an SSM have context-length-independent decode state yet perform worse than Full Attention on Associative Recall?",
        "Why is diffusion text generation not instant even though all positions update in parallel within one step?"
      ],
      "answers": [
        "An SSM repeatedly folds all history into a fixed vector h_t. Stored state therefore does not grow with S, but different details must share one limited representation. Full Attention keeps separate Keys and Values and can directly select a matching earlier entry; that is exactly what helps Associative Recall.",
        "Positions within one transition x_k→x_{k−1} can be computed together. The next transition needs the completed x_{k−1}, so K denoising steps remain sequential. Each step also typically processes the entire sequence; parallel therefore means neither free nor a single model call."
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
        "Group Relative Policy Optimization (GRPO) samples G responses per Prompt, computes their Rewards r_j, and typically uses A_j=(r_j−μ)/(σ+ε), where μ is the group mean and σ is the standard deviation. Subtracting the group mean acts as a Prompt-local Baseline and preserves the Policy Gradient up to a known factor even though the same samples form the mean. Dividing by σ, in contrast, is an additional Reweighting heuristic: it equalizes group scales but no longer optimizes the exact original Expected-Reward Gradient. Important for A5: the derivation writes the population form with denominator G, but the required implementation uses PyTorch's default torch.std with Bessel's correction and denominator G−1.",
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
    "grpo-variants": {
      "title": "GRPO Variants, Sequence Ratios & GSPO",
      "level": "RL",
      "summary": "A5 distinguishes GRPO variants by their baseline, Advantage normalization, and Loss denominator; Off-Policy variants additionally distinguish exact sequence weighting from more stable Surrogates.",
      "mental": "Write every variant as three decisions: which baseline is subtracted from Reward, what scales the Advantage, and what divides the token Loss? Old Rollouts add a second axis: the product of all response-token Ratios is the exact sequence correction, while token-local Ratios and the geometric mean used by Group Sequence Policy Optimization (GSPO) are intentionally biased objectives.",
      "details": [
        "Standard GRPO uses the group mean as baseline, divides Advantages by the group standard deviation, and averages Loss per sequence. The Constant variant keeps the baseline and normalization but uses a fixed denominator. Dr. GRPO uses the mean baseline without Advantage normalization and with a fixed denominator. Rejection Fine-Tuning (RFT) uses only correct samples, no baseline, no normalization, and a fixed denominator. MaxRL uses the mean baseline, a mean normalizer, and a fixed denominator.",
        "For a complete response y, the exact sequence Importance Weight is W(y)=exp(Σ_t∈response[log π_current(y_t|prefix_t)−log π_old(y_t|prefix_t)]). The product corrects the probability of the complete trajectory sampled under the old Policy. A token-local Ratio corrects only the current action under an already old Prefix and ignores the probability of the Prefix and later Suffix; it is therefore a biased Surrogate even when its variance is lower.",
        "GSPO uses s(y)=exp((1/n_y)Σ_t log-ratio_t), the geometric mean of response-token Ratios, and applies the same scalar to every token in the response. This reduces the explosive length dependence of the sequence product but is not an exact Importance correction. Proximal Policy Optimization (PPO) additionally clips by Advantage sign: a too-large Ratio is capped for positive Advantage, while a too-small Ratio is capped for negative Advantage. Old Log-Probabilities and Response Masks must remain frozen from Rollout."
      ],
      "pitfalls": [
        "Treating all variants as mere names; baseline, normalizer, and denominator deliberately change the weighting of difficulty and response length.",
        "Calling GSPO or token-local Ratios mathematically exact sequence Importance Sampling; their improved stability is purchased with a different, biased estimator."
      ],
      "checks": [
        "Which three design axes distinguish Standard GRPO, Dr. GRPO, RFT, and MaxRL?",
        "Why is GSPO more stable than the sequence product but not an exact Off-Policy correction?"
      ],
      "answers": [
        "The variants differ in Reward baseline, Advantage normalization, and Loss denominator. Standard uses mean, standard deviation, and sequence mean; Dr. GRPO uses mean, no Advantage normalization, and a fixed denominator; RFT uses correct samples without baseline or normalization and a fixed denominator; MaxRL uses mean, a mean normalizer, and a fixed denominator.",
        "Averaging Log Ratios divides their scale by response length and dampens extreme products. Exact Importance Sampling requires the product, equivalently the sum of all response Log Ratios; dividing by n_y changes that factor and therefore the estimator."
      ]
    },
    "rlvr-systems": {
      "title": "RLVR System Cycle & the SFT→DPO Contract",
      "level": "RL",
      "summary": "Reinforcement Learning from Verifiable Rewards (RLVR) is a synchronized data and Policy cycle; the optional SFT→DPO path has a separate masking and Reference contract.",
      "mental": "Draw RLVR as a version flow: trainer weights are distributed to Rollout workers, a frozen Old Policy produces responses and Log-Probabilities, a Verifier supplies Rewards, and only then does the Current Policy update against those exact stored data. Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) are a separate path with a Chat Template, response masks, and a fixed Reference Policy.",
      "details": [
        "A complete RLVR system contains the Current Policy, frozen Old Rollout Policy, fixed Reference Policy for Kullback-Leibler control, Verifier, optional Critic, Rollout workers, and trainer. Its cycle is: synchronize weights, roll out prompts and responses, verify Rewards, freeze old_logprobs and response_mask, compute Advantages, perform Policy updates, and log Reward, length, Entropy, KL, Ratios, Clip Fraction, and gradient norms. Without an explicit Policy version, a Ratio has no meaning.",
        "R1-Zero starts the verifiable Reinforcement-Learning path without prior SFT; R1 adds, among other things, SFT initialization, language consistency, and a stage that is not fully verifiable. Kimi and Qwen recipes change data, model, stages, and infrastructure together. These system recipes are confounded case studies and do not support an isolated algorithm ranking from one final score.",
        "In SFT, the Chat Template defines the exact tokens and only response tokens contribute to Loss; Prompt, Template, and Padding positions must be masked. DPO needs response-only sequence Log-Probabilities for chosen and rejected under both Current Policy and fixed Reference Policy, totaling four values per preference pair. The Reference stays frozen during DPO; recomputing it from a changed model or training it alongside the Policy changes the objective."
      ],
      "pitfalls": [
        "Replacing Rollout old_logprobs with values recomputed after an update; this hides Policy Staleness and artificially pulls the Ratio toward one.",
        "Comparing R1, R1-Zero, Kimi, or Qwen as controlled single-algorithm Ablations even though stages, data, starting models, and systems vary together."
      ],
      "checks": [
        "Which Policy versions and artifacts must remain immutable between Rollout and update?",
        "Which four sequence Log-Probabilities does DPO require, and which token positions contribute?"
      ],
      "answers": [
        "The Old Policy, its stored per-response-token Log-Probabilities, Response Mask, sampled tokens, and Verifier Reward remain fixed for the update epoch. The Current Policy may change, while the fixed Reference separately anchors KL or DPO comparisons.",
        "DPO requires log π_current(chosen|x), log π_current(rejected|x), log π_ref(chosen|x), and log π_ref(rejected|x). Every sum covers only response tokens under the same Chat Template; Prompt, Template, and Padding tokens carry no response Loss."
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
  "conceptOrientations": {
    "pytorch-tensors": {
      "context": "After token IDs have been assembled into batches, PyTorch tensors carry them and every later activation through the model's operations.",
      "why": "Confusing shape, strides, data type, device, or shared storage can compute along the wrong axis, create unintended copies, or exhaust accelerator memory."
    },
    "pytorch-state": {
      "context": "Tensor operations become a trainable system when modules register parameters, automatic differentiation tracks derivatives, and the optimizer maintains update state.",
      "why": "Unregistered parameters are not trained, and an incomplete checkpoint makes the next step differ from an uninterrupted run."
    },
    "shapes": {
      "context": "Along the path from token batch to logits, every tensor axis has a semantic role such as batch, position, attention head, feature, or vocabulary entry.",
      "why": "An operation can be broadcast-compatible while connecting the wrong axes, producing plausible shapes with semantically incorrect results."
    },
    "matmul": {
      "context": "Matrix multiplication is the recurring operation that moves token vectors into new feature spaces throughout linear layers, attention, and feed-forward networks.",
      "why": "The shared inner axis determines which quantities are combined, so a wrong axis order mixes different information than intended."
    },
    "einsum-notation": {
      "context": "Assignment 1 requires modules that tolerate any number of leading batch axes and explicitly recommends einsum notation for that; Lecture 2 introduces the same spelling together with einops and jaxtyping.",
      "why": "Addressing axes by position instead of by name produces patterns that yield a valid shape whenever two axes share a length and still contract the wrong quantity — a mistake no shape check can surface."
    },
    "probability": {
      "context": "The model first produces unnormalized scores, from which next-token probabilities, expectations, and variability for training and evaluation are derived.",
      "why": "Confusing probability, expectation, and variance leads to incorrect interpretations of sampling results, estimation error, or optimization objectives."
    },
    "logs": {
      "context": "Between model probabilities and the loss, products of tiny probabilities are represented as sums of logarithms so they remain numerically computable.",
      "why": "Without log space, values can collapse numerically to zero, while a wrong sign turns a minimization objective into the opposite task."
    },
    "gradients": {
      "context": "After the forward pass, the backward pass propagates changes in the loss backward through every operation to the trainable parameters.",
      "why": "A broken computation graph, incorrect local derivative, or unintended gradient accumulation produces missing or incorrect parameter updates."
    },
    "resource-accounting": {
      "context": "Before a model is trained or profiled, its shapes are translated into parameter count, memory demand, floating-point operations, and expected runtime.",
      "why": "Without this accounting, a configuration can exceed available memory, miss its time budget, or lead to an incorrect explanation of a measured bottleneck."
    },
    "unicode": {
      "context": "Unicode is the first stage of the text pipeline: visible text is represented as code points and then encoded as bytes with Unicode Transformation Format 8-bit (UTF-8).",
      "why": "Treating visible characters, code points, and bytes as identical can split multibyte characters, corrupt text, and break the encode-decode round trip."
    },
    "bpe": {
      "context": "Byte-Pair Encoding (BPE) sits between UTF-8 bytes and model input: training learns frequent byte sequences, and the finished tokenizer replaces them with stable token IDs.",
      "why": "Incorrect counting, ambiguous tie-breaking, or broken special-token boundaries changes the vocabulary and makes tokenization or tests irreproducible."
    },
    "tokenizer-tradeoffs": {
      "context": "Before the training corpus is stored, tokenizer design determines how a fixed vocabulary divides text into token sequences of different lengths.",
      "why": "This choice changes context usage, compute cost, and coverage across languages, so models using different tokenizers cannot be compared naively."
    },
    "lm-objective": {
      "context": "Between batch construction and the loss, the language-model objective requires every input position to predict the next token using only earlier tokens.",
      "why": "An incorrect target shift or access to future tokens trains a different task and can produce an artificially low loss."
    },
    "embeddings": {
      "context": "At the model input, embeddings turn discrete token IDs into vectors; at the output, final states are mapped back to one score per vocabulary entry.",
      "why": "Wrong vocabulary indices, incompatible dimensions, or unintended weight tying change outputs, parameter count, and stored model state."
    },
    "parameter-initialization": {
      "context": "After every module shape is fixed and before the first forward pass, initialization places weights and normalization gains on controlled starting distributions.",
      "why": "An incorrect standard deviation or gain can make signals and gradients collapse or explode early and can break exact assignment tests."
    },
    "rmsnorm": {
      "context": "Root Mean Square Normalization (RMSNorm) rescales each token state inside a Transformer block before the next sublayer to a controlled root-mean-square magnitude.",
      "why": "A wrong reduction axis, missing epsilon, or confusion with Layer Normalization changes values and can make training numerically unstable."
    },
    "swiglu": {
      "context": "After attention, the Swish-Gated Linear Unit (SwiGLU) processes each token independently through two linear layers, a learned gate, and an output projection.",
      "why": "Incorrect intermediate widths, projection order, or gate combination changes shapes and parameter count or computes a different feed-forward function."
    },
    "rope": {
      "context": "Rotary Position Embedding (RoPE) adds position information immediately before attention by rotating adjacent feature pairs of queries and keys by position-dependent angles.",
      "why": "An incorrect angle formula or pairing convention changes positional relationships and breaks both exact tests and the intended relative attention behavior."
    },
    "attention": {
      "context": "Attention turns token states into query, key, and value vectors, compares queries with keys, and uses the weights to mix contextual value vectors.",
      "why": "Incorrect scaling, axis order, or masking makes tokens weight the wrong positions and can silently introduce future information."
    },
    "causal-mask": {
      "context": "The causal mask is applied to attention scores before softmax normalization so each position can see only itself and earlier positions.",
      "why": "With the wrong mask direction, the model sees its targets during training, achieves misleadingly good loss, and then fails during autoregressive generation."
    },
    "transformer-block": {
      "context": "A Transformer block combines normalization, attention, residual connections, and the gated feed-forward network into a repeatable state update for each layer.",
      "why": "Changing normalization or residual order alters the gradient path and architecture, making weights or tests incompatible with the specified implementation."
    },
    "transformer-ledger": {
      "context": "Before implementation and benchmarking, the architecture ledger for the first assignment (A1) decomposes every matrix and operation in the full decoder by shape, parameter count, and compute.",
      "why": "Missing a factor for layers, sequence positions, or separate linear layers produces incorrect memory budgets, runtime estimates, and architecture comparisons."
    },
    "cross-entropy": {
      "context": "After the output linear layer, cross-entropy compares each position's vocabulary logits with the actual next-token ID and reduces those comparisons to a loss.",
      "why": "A wrong target axis, reduction, mask, or shift can produce a plausible scalar while training the model on the wrong tokens."
    },
    "adamw": {
      "context": "After gradients are computed, Adaptive Moment Estimation with decoupled Weight Decay (AdamW) uses smoothed gradient moments to update each parameter.",
      "why": "Misplaced weight decay, missing bias correction, or lost optimizer state changes the update rule and prevents reproducible resumption."
    },
    "schedules": {
      "context": "As the training loop advances, the learning-rate schedule maps the global step to the optimizer's current update size.",
      "why": "A wrong global step or incorrect warmup and decay boundary can enlarge updates too early, shrink them too much, or shift them after resumption."
    },
    "clipping": {
      "context": "After the backward pass and before the optimizer step, global gradient clipping measures the joint gradient norm and rescales all gradients together when needed.",
      "why": "Without clipping, one outlier can destabilize an update, while clipping tensors separately unintentionally changes the global gradient direction."
    },
    "training-loop": {
      "context": "The training loop orchestrates loading a batch, the forward pass, loss, backward pass, clipping, optimizer step, learning-rate update, logging, and checkpointing.",
      "why": "Incorrect ordering or omitted state causes stale gradients, duplicate updates, repeated data, or irreproducible resumed runs."
    },
    "sampling": {
      "context": "After training, autoregressive sampling generates text by turning logits into a selection distribution, drawing one token, and appending it to the context.",
      "why": "Incorrect temperature, filtering, or stopping rules can destroy diversity, admit invalid tokens, or let generation continue indefinitely."
    },
    "pre-post-norm": {
      "context": "Around each Transformer sublayer, norm placement decides whether normalization happens before computation or only after adding the update to the residual stream.",
      "why": "This choice changes the gradient path; in deep models it can determine whether training stays stable or early layers learn poorly."
    },
    "architecture-stability-shapes": {
      "context": "After the standard block is established, you compare controls for logit scale with choices about width, depth, and block arrangement.",
      "why": "Identical outer tensor shapes can hide very different stability, latency, and parameter costs, so these choices must be evaluated separately."
    },
    "attention-variants": {
      "context": "After standard attention, you separate the number of query heads from the number of shared key-value heads.",
      "why": "The chosen variant determines cache memory and bytes read during generation, but it can also change model quality."
    },
    "moe": {
      "context": "A Mixture of Experts (MoE) replaces a Transformer block's dense feed-forward network with many experts while activating only a few per token.",
      "why": "This can grow model capacity faster than compute per token, although routing and communication still add cost."
    },
    "moe-routing-capacity": {
      "context": "Inside a Mixture of Experts, the router decides which experts process each token and how limited expert slots are allocated.",
      "why": "Poor routing overloads some experts, leaves other devices idle, and may drop tokens even when the model equations look correct."
    },
    "gpu-model": {
      "context": "After the model mathematics, you trace how a Graphics Processing Unit (GPU) distributes work across many threads and several memory levels.",
      "why": "Without this execution model, mathematically equivalent programs can have dramatically different runtime and memory use for reasons you cannot explain."
    },
    "roofline": {
      "context": "Once compute units and memory hierarchy are understood, the Roofline model places a kernel between bandwidth and compute limits.",
      "why": "This classification shows whether reducing memory traffic or computation can help before effort is spent on the wrong optimization."
    },
    "profiling": {
      "context": "Before optimization, benchmarking measures total runtime; profiling then breaks it into operations, kernels, communication, and memory events.",
      "why": "Without reliable measurement, you may optimize a visible but irrelevant component or compare incorrect timings caused by asynchronous execution."
    },
    "fusion-tiling": {
      "context": "When memory traffic limits a kernel, fusion and tiling keep intermediate values longer in fast memory near the compute units.",
      "why": "Reducing reads and writes can deliver large speedups, while poorly chosen tiles can increase register pressure or reduce utilization."
    },
    "triton-kernels": {
      "context": "Triton maps a tensor operator to many block programs whose grid, offsets, strides, and masks assign ownership of output regions.",
      "why": "Incorrect ownership or boundary logic causes missing, duplicate, or invalid memory accesses even when convenient test shapes happen to pass."
    },
    "flash-attention": {
      "context": "For long sequences, FlashAttention replaces the fully stored attention table with blockwise computation and running softmax statistics.",
      "why": "This preserves the exact result while reducing memory traffic and activation peaks, but incorrect rescaling or masking changes the attention output."
    },
    "kernel-contracts": {
      "context": "After basic Triton kernels and the FlashAttention forward pass, you define exact memory, boundary, and recomputation contracts for complex forward and backward kernels.",
      "why": "Missing boundary masks or incorrectly combined partial gradients cause silent numerical errors that basic runtime and shape tests do not detect."
    },
    "checkpointing": {
      "context": "When saved intermediate activations exceed training memory, activation checkpointing keeps selected boundaries and recomputes missing sections during the backward pass.",
      "why": "The technique enables larger models or batches, costs additional computation, and must reproduce the same state for random operations."
    },
    "collectives": {
      "context": "Once multiple processes train together, collectives distribute, gather, or reduce tensors within a clearly defined process group.",
      "why": "The chosen collective determines data ownership and communication volume; incompatible calls can produce wrong results or a deadlock."
    },
    "distributed-runtime": {
      "context": "After communication patterns are defined, the Distributed Data Parallel runtime coordinates processes, groups, asynchronous transfers, and gradient synchronization within a training step.",
      "why": "Different operation orders can deadlock processes, while using tensors too early can produce incomplete gradients and incorrect updates."
    },
    "ddp-zero-fsdp": {
      "context": "Using collectives, you compare replicated Distributed Data Parallel with Zero Redundancy Optimizer and Fully Sharded Data Parallel, which distribute training state.",
      "why": "The strategy determines whether the model fits in device memory and how much extra communication and temporary peak memory it requires."
    },
    "model-parallelism": {
      "context": "When a model or individual layer does not fit on one device, tensor, pipeline, or sequence parallelism splits width, depth, or token axes.",
      "why": "The chosen axis determines communication frequency, idle time, and memory ownership; a poor split can be slower despite using more devices."
    },
    "power-laws": {
      "context": "After several controlled training runs, empirical power laws summarize how loss falls with model size, data, or compute within the measured range.",
      "why": "They support run planning, but careless extrapolation beyond observed evidence can justify expensive model-size or data decisions incorrectly."
    },
    "isoflops": {
      "context": "At a fixed number of floating-point operations, you compare different allocations of the training budget between model parameters and observed tokens.",
      "why": "This reveals whether a model is too small or too large for its budget instead of simply choosing the largest possible run."
    },
    "scaling-practice": {
      "context": "Before training an expensive wide model, you tune smaller proxy models and transfer settings through consistent parameterization and learning-rate scheduling.",
      "why": "Naively keeping initialization and learning rate unchanged across widths changes signal and update scales and can make transfer fail."
    },
    "scaling-optima": {
      "context": "From measured compute optima, you build robust fits and connect them to Maximum Update Parametrization and Warmup-Stable-Decay for the target run.",
      "why": "A wrong offset, misclassified matrix role, or checkpoint taken before decay can invalidate the apparent scaling decision."
    },
    "inference-workload": {
      "context": "When serving a trained language model, prefill processes the full prompt, then decode generates the response one token at a time.",
      "why": "The two phases have different bottlenecks; treating them as one can lead to the wrong metric, batch size, or optimization."
    },
    "kv-serving": {
      "context": "During decode, the key-value cache stores earlier attention keys and values per layer so they need not be recomputed for each new token.",
      "why": "The cache accelerates generation but grows with context and batch size, potentially limiting how many requests can be served concurrently."
    },
    "serving-optimizations": {
      "context": "After measuring the inference bottleneck, quantization, speculative decoding, dynamic batching, and paged cache management target different costs.",
      "why": "No method solves every bottleneck; a poor choice can reduce quality, harm scheduling fairness, or add more overhead than it removes."
    },
    "alternative-sequence-models": {
      "context": "When quadratic attention or a growing cache becomes problematic, state-space models, hybrids, and diffusion offer alternative sequence-processing paths.",
      "why": "Each alternative trades direct access to earlier tokens for different memory, parallelism, or generation steps, so architecture choice must follow the workload."
    },
    "perplexity-eval": {
      "context": "After training, perplexity measures how surprised the model is by the actual next tokens in a fixed corpus.",
      "why": "It detects likelihood changes but is not directly comparable across tokenizers or context protocols and does not measure general usefulness."
    },
    "benchmark-validity": {
      "context": "After stating a claim about the model, a valid benchmark connects that claim to suitable tasks, invocation rules, metrics, and uncertainty.",
      "why": "Otherwise, a high score may measure prompt tricks, contamination, or an unsuitable metric rather than the claimed capability."
    },
    "data-pipeline": {
      "context": "Before tokenization and training, the data pipeline turns raw web archives into a versioned, filtered, and deduplicated corpus.",
      "why": "Each irreversible step changes the later training distribution; without provenance and decision logs, errors or bias cannot be traced back."
    },
    "filtering-mechanics": {
      "context": "Within filtering, target-corpus likelihood, class probability, and the target-to-raw density ratio provide three different ranking signals.",
      "why": "Confusing these scores can retain merely common text instead of target-typical text or mistake a learned classifier for an objective quality measure."
    },
    "quality-filtering": {
      "context": "After text extraction, transparent rules remove obvious failures, while a learned classifier scores remaining documents according to its training target.",
      "why": "An overly strict or narrowly trained filter can systematically remove useful languages, formats, and perspectives from the training corpus."
    },
    "pii-harm": {
      "context": "Before data enters the training corpus, Personally Identifiable Information (PII), harmful content, and edge cases are detected, masked, removed, or held for review.",
      "why": "Detectors make mistakes; without documented actions and subgroup review, real people may be harmed or legitimate content removed disproportionately."
    },
    "dataset-lineage": {
      "context": "Between the raw crawl and the training run there is always a concrete, named corpus; Lecture 13 walks chronologically through the real datasets behind well-known language models.",
      "why": "Knowing the names and their design lessons lets you place papers quickly, judge other pipelines, and anchor your own filtering decisions in proven precedents."
    },
    "copyright-licensing": {
      "context": "Before a document enters a training corpus, a legal question decides whether it may be copied and used at all; Lecture 13 covers copyright, licenses, and fair use for this.",
      "why": "Data decisions are simultaneously legal and reputational decisions; the basic vocabulary explains lawsuits, licensing deals, and the purpose of careful provenance documentation."
    },
    "bloom-filters": {
      "context": "Before an expensive exact lookup, a Bloom filter compactly checks whether a key is definitely new or only possibly already known.",
      "why": "It saves memory and lookups but must not make exact deletion or deduplication decisions alone because false positives are possible."
    },
    "dedup": {
      "context": "After normalization and before final mixing or data splitting, deduplication removes exact repeats and finds candidates for near-duplicate documents.",
      "why": "Missed repeats distort training weights and can leak evaluation data, while overly aggressive rules remove independent legitimate content."
    },
    "sft": {
      "context": "After pretraining, Supervised Fine-Tuning (SFT) shows the language model desired prompt-response examples using the same next-token training mechanism.",
      "why": "It shapes visible response behavior, but incorrect chat templates or loss masks train on unintended prompt and padding tokens."
    },
    "reward-models": {
      "context": "From human-ranked response pairs, a reward model learns a score that can guide later preference optimization or reinforcement learning.",
      "why": "The score inherits bias from guidelines, annotators, and data, and the policy may learn to exploit those weaknesses."
    },
    "rlhf": {
      "context": "After Supervised Fine-Tuning, Reinforcement Learning from Human Feedback (RLHF) optimizes a policy for reward-model scores while limiting deviation from a reference.",
      "why": "Without deviation control, the policy can exploit the learned reward, lose language quality, or move far beyond the preference data."
    },
    "dpo": {
      "context": "Direct Preference Optimization (DPO) trains preferred against rejected responses directly relative to a fixed reference policy, without a separate on-policy rollout cycle.",
      "why": "The method simplifies the system but still depends on correct response masks, a fixed reference, and sound preference pairs."
    },
    "rl-setup": {
      "context": "For reinforcement learning, token generation is represented as a sequence of states, token actions, and a reward usually assigned after the full response.",
      "why": "This translation defines which probability is optimized and why one final reward must be assigned across many earlier token decisions."
    },
    "policy-gradient": {
      "context": "After text generation is formulated as a decision process, the policy gradient connects sampled responses and their rewards to parameter updates.",
      "why": "This allows optimization of non-differentiable verifiers, but without a baseline or enough samples the gradient is highly noisy."
    },
    "grpo": {
      "context": "Group Relative Policy Optimization (GRPO) generates several responses per prompt and evaluates each response relative to the others in the same group.",
      "why": "The group comparison reduces task-difficulty variation without a separate value model, but identical group rewards provide no learning signal."
    },
    "off-policy": {
      "context": "When training reuses responses from an older policy, importance ratios correct the difference between the generating policy and the current policy.",
      "why": "Without correction the objective is biased, while exact sequence weights can create extreme variance, so clipping deliberately trades in some bias."
    },
    "grpo-variants": {
      "context": "After the base algorithm, you compare variants by how they center rewards, scale advantages, average across tokens, and weight older rollouts.",
      "why": "Small changes to denominators or probability ratios change which responses and response lengths the training objective actually favors."
    },
    "rlvr-systems": {
      "context": "Reinforcement Learning from Verifiable Rewards (RLVR) connects policy versions, rollout workers, verifiers, stored log probabilities, and trainers in one synchronized cycle.",
      "why": "Mixed policy versions or recomputed rollout data make probability ratios meaningless and can invalidate training even when the system appears to run."
    }
  },
  "formulas": {
    "mean-var": {
      "cat": "Basics",
      "title": "Mean, Variance & Standard Deviation",
      "read": "First calculate the mean. Then find each value's distance from the mean, square those distances, and average them.",
      "purpose": "Answers two simple questions: where is a group of numbers centered, and how widely are its values spread?",
      "dims": "xᵢ, μ, and standard deviation σ have the same units; variance has squared units.",
      "vars": [
        ["X","Random variable or group of numbers being studied"],
        ["n","Number of observed values"],
        ["xᵢ","Value number i"],
        ["Σᵢ","Add across all values i"],
        ["μ","Mean"],
        ["Var(X)","Population variance: mean squared deviation"],
        ["E","Expectation: a long-run probability-weighted mean"],
        ["σ","Standard deviation √Var; spread in the original units"]
      ],
      "intuition": "Distances with opposite signs should not cancel. Squaring makes them positive; the square root then returns spread to the original unit.",
      "pitfall": "Do not mix population and sample conventions: population variance divides by n, while a sample estimate usually divides by n−1. A5 uses PyTorch's default sample standard deviation with G−1, while the lecture derivation also shows the population form with G.",
      "example": "Values [1,3]: (1) μ=(1+3)/2=2. (2) Deviations are −1 and +1. (3) Squared deviations are 1 and 1. Population variance is (1+1)/2=1, so σ=1. As a sample, divide by 2−1: variance 2 and standard deviation √2≈1.414.",
      "check": "Why is variance never negative?",
      "answer": "Every squared deviation (x−μ)² is at least zero. Therefore, a mean or expectation of exclusively non-negative numbers cannot be negative either."
    },
    "matmul": {
      "cat": "Linear Algebra",
      "title": "Matrix Multiplication",
      "read": "Take one row from A and one column from B, multiply matching values, and add those products into one output value.",
      "purpose": "Computes many weighted sums at once; Linear Layers, Attention, and MLPs all use this operation.",
      "dims": "A has [m,k], B has [k,n], and C has [m,n]. The shared axis k must have the same length and is summed away.",
      "vars": [
        [
          "A",
          "Left matrix with m rows and k values per row"
        ],
        [
          "B",
          "Right matrix with k rows and n columns"
        ],
        [
          "C",
          "Result matrix"
        ],
        [
          "i",
          "Row index in A and C"
        ],
        [
          "j",
          "Column index in B and C"
        ],
        [
          "k",
          "Shared inner axis whose contributions are added"
        ],
        [
          "m",
          "Number of rows in A and C"
        ],
        [
          "n",
          "Number of columns in B and C"
        ],
        [
          "Cᵢⱼ",
          "Output at row i and column j"
        ],
        [
          "Σₖ",
          "Add every contribution along the k axis"
        ]
      ],
      "intuition": "Each column of B is a different mixing recipe; A applies every recipe to each of its rows.",
      "pitfall": "Do not confuse it with element-wise A⊙B, where no shared axis is summed.",
      "example": "Let A=[[1,2],[3,4]] and B=[[5],[6]]. Then C₁₁=1·5+2·6=17 and C₂₁=3·5+4·6=39. Therefore C=[[17],[39]] with Shape [2,1].",
      "check": "Which axis disappears and why?",
      "answer": "The common inner axis k disappears because contributions are summed over all k. The outer axes m and n still denote for which row and column a result is produced."
    },
    "linear-map": {
      "cat": "Linear Algebra",
      "title": "Linear Layer / Learned Projection",
      "read": "Each output feature o is its own learned weighted mixture of all input features in the same vector.",
      "purpose": "Creates new role-specific features from the same token state for Q, K, V, Attention Output, the MLP, and the LM Head.",
      "dims": "x: […,D_in], W: [D_in,D_out], b: [D_out], y: […,D_out]; every leading axis remains unchanged.",
      "vars": [
        ["xᵢ","Coordinate i of the current token state; its meaning is learned in a distributed way"],
        ["Wᵢₒ","Learned contribution of input feature i to output feature o"],
        ["bₒ","Optional learned starting value of yₒ when x=0"],
        ["yₒ","Newly mixed output feature o"]
      ],
      "intuition": "Every column of W is a mixing recipe adjusted during training; the same recipes are applied independently to all tokens.",
      "pitfall": "With a Bias, y=xW+b is mathematically an affine mapping even though PyTorch calls the component a Linear Layer. PyTorch stores nn.Linear.weight as [D_out,D_in] and computes x @ weight.T. In LLMs, Projection usually does not mean an orthogonal geometric projection and may even increase dimension.",
      "example": "Set x=[2,−1], W=[[1,0,2],[3,−1,1]], and b=[0.5,1,−2]. Then y₁=0.5+2·1+(−1)·3=−0.5, y₂=1+2·0+(−1)·(−1)=2, and y₃=−2+2·2+(−1)·1=1. Therefore y=[−0.5,2,1].",
      "check": "How is the first output feature produced in the example, and which axes would the Layer not mix for X [B,T,2]?",
      "answer": "The first output feature is y₁=2·1+(−1)·3+0.5=−0.5. For X [B,T,2], the same calculation runs separately at every [b,t]: only the final feature axis is mapped from 2 to 3; different Batch examples and Token positions are not mixed."
    },
    "chain-rule": {
      "cat": "Basics",
      "title": "Chain Rule",
      "read": "Multiply the incoming gradient ∂L/∂y by the local sensitivity ∂y/∂x to obtain ∂L/∂x.",
      "purpose": "Backpropagation uses this rule to trace backward how strongly an earlier activation or parameter influenced the Loss.",
      "dims": "∂L/∂x has the same Shape as x. For tensors, Autograd computes Vector-Jacobian Products without storing the usually enormous full Jacobian.",
      "vars": [
        [
          "∂",
          "Read as partial derivative: a local change while other inputs are held fixed"
        ],
        [
          "L",
          "Scalar Loss whose change we want to explain"
        ],
        [
          "x",
          "Earlier activation or learnable parameter"
        ],
        [
          "y",
          "Intermediate result computed from x"
        ],
        [
          "∂L/∂y",
          "Upstream gradient: the already known effect of y on the Loss"
        ],
        [
          "∂y/∂x",
          "Local derivative: the effect of x on this one operation"
        ],
        [
          "∂L/∂x",
          "Desired total effect of x on the Loss"
        ]
      ],
      "intuition": "Each factor answers one part: x changes y, and y changes L. Effects multiply along a chain; when several paths meet again at x, their contributions add.",
      "pitfall": "Autograd only computes gradients and accumulates them in .grad. The Optimizer uses them later for a parameter update; without zero_grad, contributions from several Steps would be added unintentionally.",
      "example": "x=2, y=x²=4, L=3y=12: ∂L/∂y=3 and ∂y/∂x=2x=4, so ∂L/∂x=12. With two paths L=x²+3x, the gradient is 2x+3.",
      "check": "Why is a full Jacobian unnecessary, and what happens when two paths lead from x to the Loss?",
      "answer": "For a scalar Loss, Backpropagation needs only the incoming gradient multiplied by each operation's local derivative, a Vector-Jacobian Product; it never materializes the full Jacobian. If two computation paths reach the same x, Autograd adds their gradient contributions because both changes affect the Loss."
    },
    "softmax": {
      "cat": "Probability",
      "title": "Softmax",
      "read": "Exponentiate relative score differences and divide each value by their sum; this creates positive weights that sum to one.",
      "purpose": "How are the model's raw scores converted into probabilities or Attention weights without very large numbers breaking the calculation?",
      "dims": "z and p have the same Shape. Exactly one axis is normalized: Vocabulary axis V for next-Token prediction and the offered Key-position axis T_key for Attention; every row along that axis sums to one.",
      "vars": [
        [
          "pᵢ",
          "Result on the left: probability or Attention weight of the selected category i"
        ],
        [
          "i",
          "Index of the category whose result is currently being calculated"
        ],
        [
          "zᵢ",
          "Raw model score (Logit) of category i; not yet a probability"
        ],
        [
          "j",
          "Running index used by the denominator and maximum to visit every category in the same row"
        ],
        [
          "zⱼ",
          "Raw score of the category currently identified by j"
        ],
        [
          "exp(u)",
          "Exponential function e^u; makes every finite relative score positive"
        ],
        [
          "Σⱼ",
          "Summation operator: adds the exponential values of all categories j"
        ],
        [
          "m",
          "Largest score in the same row; subtracted from every score for numerical stability"
        ],
        [
          "maxⱼ zⱼ",
          "Maximum operator: selects the largest among all scores visited by j"
        ]
      ],
      "intuition": "Differences directly control ratios: pᵢ/pⱼ=exp(zᵢ−zⱼ). A score lead of one makes a category e≈2.72 times as likely as the other; a shared offset changes nothing.",
      "pitfall": "The wrong axis still produces numbers between zero and one, but answers a different question. In Attention, every Query must distribute weight over its allowed Keys; masked scores become −∞ before Softmax.",
      "example": "For z=[2,1,0], m=2. Then exp(z−m)=[exp(0),exp(−1),exp(−2)]≈[1,0.368,0.135]. Their sum is 1.503. Division gives p≈[1/1.503,0.368/1.503,0.135/1.503]=[0.665,0.245,0.090]; the weights sum to 1.000.",
      "check": "Which axis do you normalize for model Logits [B,T,V] and Attention scores [B,H,T_q,T_k], and why does subtracting m not change the result?",
      "answer": "For LM Logits [B,T,V], normalize across V; for Attention scores [B,H,T_q,T_k], normalize across T_k so every Query gets weights over its Keys. Subtracting m multiplies numerator and denominator by the same exp(−m), which cancels and leaves the distribution unchanged."
    },
    "logsumexp": {
      "cat": "Numerics",
      "title": "Log-Sum-Exp",
      "read": "First subtract the largest score, sum the resulting safe exponential values, take the logarithm of that sum, and add the maximum back.",
      "purpose": "How can the logarithm of a sum of exponential values be computed reliably for very large model scores while keeping the result finite?",
      "dims": "The result is one scalar per normalized row and uses the same logarithmic scale as the input scores z.",
      "vars": [
        [
          "LSE(z)",
          "Result on the left: Log-Sum-Exp of the complete score vector z"
        ],
        [
          "z",
          "Complete vector of raw model scores"
        ],
        [
          "zⱼ",
          "Score at the position identified by j"
        ],
        [
          "j",
          "Running index over every score in the same row"
        ],
        [
          "m",
          "Largest value in z, namely maxⱼ zⱼ"
        ],
        [
          "Σⱼ",
          "Summation operator: adds one contribution for every index j"
        ],
        [
          "exp(u)",
          "Exponential function e^u; after subtracting m, all its arguments are at most zero"
        ],
        [
          "log(u)",
          "Natural logarithm; maps the positive sum back to the Log scale"
        ],
        [
          "+m",
          "Adds the previously removed maximum back, preserving the mathematically correct value"
        ]
      ],
      "intuition": "Without stabilization, exp(1000) would have to be represented and would overflow. After subtracting the maximum, the largest exponent is zero and every exponential value is at most one.",
      "pitfall": "The naive form log(sum(exp(z))) can produce infinity even though the mathematical result is finite. The maximum must be computed separately for each row that is actually normalized.",
      "example": "For z=[1000,999], m=1000. The relative values are [0,−1], so exp(z−m)≈[1,0.368]. Their sum is 1.368 and log(1.368)≈0.313. Thus LSE(z)=1000+0.313=1000.313 without ever computing exp(1000).",
      "check": "Which exponential arguments arise after stabilization, and why can they not overflow?",
      "answer": "After stabilization, the exponents are zⱼ−m and are all less than or equal to zero; at least one is exactly zero. Their exponential values thus lie in (0,1], avoiding overflow."
    },
    "autoregressive": {
      "cat": "Language Model",
      "title": "Autoregressive Factorization",
      "read": "For every Token, compute its probability given the earlier Tokens and multiply these conditional probabilities to obtain the probability of the complete sequence.",
      "purpose": "How can a decoder Language Model assemble the probability of an entire text from its individual predictions for the next Token?",
      "dims": "The left side is one probability value per sequence; every local prediction distributes probability over V possible next Tokens.",
      "vars": [
        [
          "p(x₁:ₜ)",
          "Left side: probability of the complete Token sequence from position 1 through T"
        ],
        [
          "x₁:ₜ",
          "Complete ordered Token sequence x₁,…,xₜ"
        ],
        [
          "T",
          "Number of Tokens in the sequence"
        ],
        [
          "t",
          "Running position index from 1 through T"
        ],
        [
          "∏ₜ",
          "Product operator: multiplies the conditional factor from every position t"
        ],
        [
          "p(xₜ | x&lt;ₜ)",
          "Probability of the actually observed Token xₜ under its preceding context"
        ],
        [
          "xₜ",
          "Token at the current position t"
        ],
        [
          "x&lt;ₜ",
          "All Tokens before position t; for the first Token this context is empty or a start symbol"
        ],
        [
          "|",
          "Conditioning bar: the predicted event is on the left and already known information is on the right"
        ],
        [
          "log p",
          "Log Probability of the same complete sequence"
        ],
        [
          "Σₜ",
          "Summation operator over all Token positions; replaces the product in Log space"
        ]
      ],
      "intuition": "Instead of learning one enormous table for all possible texts, the model repeatedly solves the same local task: what comes next after the text visible so far?",
      "pitfall": "During parallel training, inputs at position t must not contain later Tokens. A causal mask preserves this condition even though all positions are calculated together.",
      "example": "For three Tokens A,B,C, let p(A)=0.5, p(B|A)=0.4, and p(C|A,B)=0.25. Then p(A,B,C)=0.5·0.4·0.25=0.05. In Log space, log p≈−0.693−0.916−1.386=−2.995, while log(0.05)≈−2.996; the small difference is only rounding.",
      "check": "Why does the product become a sum in log space?",
      "answer": "The logarithm satisfies log(a·b)=log(a)+log(b). Therefore, the product of conditional token probabilities becomes the sum of their log-probabilities."
    },
    "next-token-batch": {
      "cat": "Training",
      "title": "Random Next-Token Batches from Token Arrays",
      "read": "Draw one valid start for each Batch example and slice m input Tokens plus m target Tokens shifted by exactly one position.",
      "purpose": "How can a long array of Token IDs produce many equally sized training examples in which every input Token is paired with exactly the following target Token, without loading the entire file into memory?",
      "dims": "x has shape [n], the B start indices have [B], and X and Y each have [B,m]. n≥m+1 is required; the exclusive random upper bound is n−m.",
      "vars": [
        ["x","Flat array of all Token IDs in the corpus"],
        ["n","Number of Token IDs in x"],
        ["B","Number of independently sampled windows in the Batch"],
        ["b","Index of one Batch example from 1 through B"],
        ["m","Context length: number of input and target Tokens in each window"],
        ["s_b","Start index sampled for Batch example b"],
        ["∈ {0,…,n−m−1}","Validity condition: s_b is an integer from the first through the last complete window start"],
        ["X_b","Input sequence of Batch example b"],
        ["Y_b","Target sequence of the same example, shifted one position to the right relative to X_b"],
        ["x[a:b]","Slice from index a inclusive through b exclusive"],
        ["+1","Shift by exactly one Token so every target is the immediate successor of its input"]
      ],
      "intuition": "One window of length m+1 contains both tensors: the first m values are the input and the final m values are the target. NumPy's np.memmap maps a raw file into virtual memory and loads only the pages actually touched by a slice.",
      "pitfall": "Using n−m+1 as the exclusive upper bound permits s=n−m and creates a short target. A wrong dtype (data type) interprets the same file bytes as different IDs, while an immediate full copy removes the memory-map advantage.",
      "example": "Let x=[10,11,12,13,14,15,16,17,18,19], so n=10, and let m=4. The exclusive random bound is n−m=6, so s_b may range from 0 through 5. For B=1 and s₁=5, X₁=x[5:9]=[15,16,17,18] and Y₁=x[6:10]=[16,17,18,19]. Both have length 4 and Y₁[:-1]=[16,17,18]=X₁[1:].",
      "check": "Why is n−m the exclusive random upper bound, which slice invariant must hold, and what must be checked when opening a token memory map?",
      "answer": "The input needs indices s through s+m−1 and the target needs s+1 through s+m. Thus s+m≤n−1, or s<n−m, making n−m the exclusive upper bound. X and Y both have shape [B,m], and every batch example b satisfies Y_b[:-1]=X_b[1:]. Before writing, require V−1≤np.iinfo(dtype).max; when opening a memory map, verify file format, exact dtype, byte order, expected length, and 0≤token ID<V without copying the entire array."
    },
    "cross-entropy": {
      "cat": "Loss",
      "title": "Cross-Entropy / Negative Log-Likelihood",
      "read": "At every valid position, take the model's probability of the correct next Token, apply the logarithm and a minus sign, and then average the results.",
      "purpose": "Which single number measures how much probability the model assigned to the Tokens that actually followed, so training can tell whether its predictions are improving?",
      "dims": "Logits z: [B,T,V], target IDs y and unreduced Loss: [B,T], reduced Loss L: scalar. M counts only unmasked target Tokens.",
      "vars": [
        [
          "L",
          "Result on the left: mean Cross-Entropy Loss over all valid target positions"
        ],
        [
          "−",
          "Negation: a high Log Probability becomes a small positive error and a very negative Log Probability becomes a large error"
        ],
        [
          "M",
          "Number of valid target Tokens; division by M turns the sum into a mean"
        ],
        [
          "i",
          "Running index over the valid evaluated Token positions"
        ],
        [
          "Σᵢ",
          "Summation operator: adds the Loss contribution from every valid position i"
        ],
        [
          "zᵢ",
          "Vector of all V raw model scores at position i"
        ],
        [
          "softmax(zᵢ)",
          "Probability distribution over the V possible next Tokens at position i"
        ],
        [
          "yᵢ",
          "Index of the Token that actually follows at position i"
        ],
        [
          "softmax(zᵢ)ᵧᵢ",
          "Selection operation: takes exactly the probability at target index yᵢ from the distribution"
        ],
        [
          "log",
          "Natural logarithm of the selected target probability"
        ]
      ],
      "intuition": "−log p is near zero when the target receives probability close to one and grows sharply when the target probability approaches zero. Confidently wrong predictions are therefore penalized especially strongly.",
      "pitfall": "Inputs and targets must be shifted by one position for Next-Token training. Padding must disappear from both sum and denominator; averaging over sequences would otherwise weight different lengths incorrectly.",
      "example": "Take M=2 valid positions. At position 1, let z₁=[0,0] and y₁ be the second category; Softmax assigns it 0.5. At position 2, let z₂=[log 3,0]≈[1.099,0] and again select the second category; it receives 1/(3+1)=0.25. Thus L=−(log 0.5+log 0.25)/2=−(−0.693−1.386)/2=1.040.",
      "check": "What Loss results from a uniform distribution over V Tokens, and how do the gradient and the Gradient-Descent Update differ for target and non-target Logits?",
      "answer": "A uniform distribution gives every Token probability 1/V, so the Loss is −log(1/V)=log(V). The Logit gradient is p−onehot(y): p_y−1 is negative for the target, so Gradient Descent raises that Logit, while positive p_j values make non-target Logits fall relative to it."
    },
    "perplexity": {
      "cat": "Evaluation",
      "title": "Perplexity",
      "read": "For every actual next Token, compute its negative natural Log-Probability, take the mean L, and then apply exp.",
      "purpose": "On average, how surprised is the model by the Tokens that actually follow in one fixed text corpus?",
      "dims": "PPL and L are values per Token, while M is a Token count. With the natural logarithm, L is reported in nats per Token and exp is the matching inverse operation.",
      "vars": [
        [
          "PPL",
          "Perplexity: the exponentiated average surprise per Token"
        ],
        [
          "M",
          "number of target Tokens that are actually evaluated"
        ],
        [
          "i",
          "running index of one evaluated target Token"
        ],
        [
          "yᵢ",
          "the Token that actually follows at position i"
        ],
        [
          "x<ᵢ",
          "all Tokens visible as context before yᵢ"
        ],
        [
          "p(yᵢ|x<ᵢ)",
          "probability the model assigns to exactly that target Token in the given context"
        ],
        [
          "L",
          "mean negative natural Log-Probability"
        ],
        [
          "log / exp",
          "the natural logarithm and its inverse operation"
        ]
      ],
      "intuition": "A likely target creates little surprise, while an unlikely target creates much more. Taking the mean makes texts of different lengths comparable; exp maps the result back to a more readable positive scale.",
      "pitfall": "Count only valid target Tokens and always take the mean before exponentiating. Values from different Tokenizers or context rules are not directly comparable. KenLM's score API uses base-10 logarithms and therefore needs the matching inverse conversion.",
      "example": "Two target Tokens receive probabilities 0.5 and 0.125. Their surprises are −log(0.5)=0.693 and −log(0.125)=2.079. The mean is L=(0.693+2.079)/2=1.386. Then PPL=exp(1.386)=4.",
      "check": "Why is PPL equal to 1 when Loss is 0?",
      "answer": "Perplexity is exp(Loss), and exp(0)=1. A loss of zero also means that probability one is assigned to each correct token, leaving effectively only one possibility."
    },
    "embedding-lookup": {
      "cat": "Transformer",
      "title": "Token Embedding Lookup",
      "read": "Every integer Token ID selects exactly one row from the learned Embedding table; the ID itself is never used as a numerical quantity.",
      "purpose": "Turns discrete Token IDs into continuous D-dimensional activations that Linear Layers, Attention, and MLPs can process.",
      "dims": "token_ids: [B,T] integers, E: [V,D] learnable parameters, X: [B,T,D] activations. B and T remain; a new feature axis D is added.",
      "vars": [
        ["B","Number of sequences in the Batch"],
        ["T","Number of Token positions per sequence"],
        ["V","Number of entries in the Vocabulary"],
        ["D","Number of learned features per Token"],
        ["b,t","A particular Batch and position index"],
        ["token_ids[b,t]","Vocabulary index at position [b,t]"],
        ["E","Learned table with Shape [V,D]"],
        ["E[id,:]","Complete D-dimensional table row for one ID; : means all features"],
        ["X[b,t,:]","Selected starting activation of this Token occurrence"]
      ],
      "intuition": "The ID is only an address. The same Token starts from the same table row, but position and context change its state in every later Transformer Block.",
      "pitfall": "A lookup is not a weighted average, and ID 101 is not automatically more similar to 102 than to 900. The LM Head uses the same matrix only with Weight Tying; otherwise it has separate learned weights.",
      "example": "Let E[0]=[0.1,0.2], E[1]=[1.0,−1.0], and E[2]=[2.0,0.5]. For token_ids=[[2,0,2]], the lookup selects exactly those rows: X=[[[2.0,0.5],[0.1,0.2],[2.0,0.5]]]. Thus [B,T]=[1,3] becomes [B,T,D]=[1,3,2].",
      "check": "Which axis is added by the lookup, and why can two occurrences of the same Token ID differ after several Transformer Blocks?",
      "answer": "The lookup replaces each scalar ID with the selected D-dimensional table row, so [B,T] becomes [B,T,D]. Equal IDs start from the same row, but receive different position signals and exchange information with different contexts through Attention; their later contextual states can therefore differ."
    },
    "embedding-params": {
      "cat": "Resources",
      "title": "Embedding Parameters",
      "read": "Multiply the number of Vocabulary entries by the number of stored features in each entry.",
      "purpose": "How many learned numbers and how much memory does the table need that translates each Token ID into a feature vector?",
      "dims": "N_embed is a pure parameter count. Memory in Bytes is then N_embed multiplied by the number of Bytes used for each stored number.",
      "vars": [
        [
          "N_embed",
          "Result on the left: total number of learnable values in the Embedding table"
        ],
        [
          "V",
          "Vocabulary size: number of different addressable Token IDs"
        ],
        [
          "D",
          "Model dimension: number of learned features in each table row"
        ],
        [
          "·",
          "Multiplication: D values are stored for every one of the V entries"
        ]
      ],
      "intuition": "The table has one row per Vocabulary entry and D columns per row. Its number of cells is therefore rows times columns.",
      "pitfall": "Weight Tying means that the output layer reuses the same matrix. Without this reuse, the Language Model's output matrix must be counted separately.",
      "example": "For V=1,000 Tokens and D=64 features, N_embed=1,000·64=64,000 parameters. At 4 Bytes per parameter, the table needs 64,000·4=256,000 Bytes, or about 250 KiB.",
      "check": "How does doubling V affect sequence and parameter costs?",
      "answer": "With fixed D, doubling V doubles the V·D embedding parameters and also the number of output logits per position. Sequences may become shorter through additional longer tokens, but neither the extent nor the occurrence of this shortening is guaranteed and depends on the learned vocabulary."
    },
    "linear-params": {
      "cat": "Resources",
      "title": "Linear Layer: Parameters & Compute Operations",
      "read": "Count one weight for every input-output feature pair and optionally one Bias per output feature; for compute, the same matrix is applied at every Batch and Token position.",
      "purpose": "How many learned values does a Linear mapping store, and approximately how many floating-point operations does its Forward Pass need for a complete Token Batch?",
      "dims": "Weight matrix W has [d_in,d_out] and optional Bias b has [d_out]. N counts stored values; FLOPs means Floating-Point Operations and counts operations across all B·T applications.",
      "vars": [
        [
          "N",
          "Result of the first equation: total number of learnable parameters"
        ],
        [
          "d_in",
          "Number of input features read for each Token"
        ],
        [
          "d_out",
          "Number of output features produced for each Token"
        ],
        [
          "d_in·d_out",
          "Number of weights in the rectangular weight matrix"
        ],
        [
          "(+ d_out)",
          "Optional addition: exactly one Bias value for each output feature"
        ],
        [
          "FLOPs",
          "Floating-Point Operations counted for the Forward Pass"
        ],
        [
          "≈",
          "Approximation sign: bookkeeping operations and Bias addition are omitted from the rough FLOP count"
        ],
        [
          "2",
          "Approximately one multiplication plus one addition for each matrix contribution"
        ],
        [
          "B",
          "Independent sequences in the Batch"
        ],
        [
          "T",
          "Token positions per sequence"
        ],
        [
          "·",
          "Multiplication of factors; the same mapping runs at B·T positions"
        ]
      ],
      "intuition": "The learned mixing recipes exist only once in W, but are executed again for every one of the B·T Tokens. Therefore B and T change compute, not parameter count.",
      "pitfall": "A Forward Pass and full training do not have the same FLOP count because the Backward Pass adds work. PyTorch stores W transposed relative to the row-vector convention used here.",
      "example": "Set d_in=4, d_out=5, B=2, and T=3, and include a Bias. Then N=4·5+5=25 parameters. The Forward Pass costs approximately 2·2·3·4·5=240 floating-point operations.",
      "check": "Why does T not appear in the parameter count even though compute grows with T?",
      "answer": "The same Linear-Layer weight matrix is reused at every one of the T Token positions and is not stored again per position. T therefore changes how often the learned mapping is executed and thus the forward-pass compute, but not the parameter count stored once."
    },
    "parameter-init": {
      "cat": "Transformer",
      "title": "A1 Parameter Initialization",
      "read": "For Linear weights, add the input and output widths, divide 2 by that sum, and take the square root. The result is std. The limits are three times that value. Embeddings and RMSNorm use the two separate rules shown beside it.",
      "purpose": "Answers the practical question: which random numbers should three different weight tables contain before the first training step?",
      "dims": "W is the Linear-Layer weight table, E is the Embedding table, and g_RMS is the RMSNorm Gain list. Their Shapes are [d_out,d_in], [V,D], and [D]; the calculation chooses starting values, not these Shapes.",
      "vars": [
        ["d_in","Number of input values read by the Linear Layer for one example"],
        ["d_out","Number of output values produced by the Linear Layer for one example"],
        ["σ","Standard deviation: the typical distance of a random starting weight from zero; this is the value passed as std"],
        ["σ²","Variance: the square of σ; A1 states this value first"],
        ["W","The Linear-Layer weight table"],
        ["E","The Embedding table; it uses std=1 regardless of Layer width"],
        ["g_RMS","The list of learnable RMSNorm scaling values; every entry starts at 1"]
      ],
      "intuition": "One output adds many weighted contributions. The more inputs and outputs a Layer has, the smaller its individual random starting weights should be so their sum is not needlessly large before training. The limits only remove rare extreme starting values.",
      "pitfall": "2/(d_in+d_out) is the variance σ², not PyTorch's std argument. Take the square root before the call. Embeddings do not use the Linear rule.",
      "example": "Small numerical case: d_in=2 and d_out=6. Substitute the numbers visibly into the variance rule: 2/(d_in+d_out)=2/(2+6)=2/8=0.25. The standard deviation passed as std is then √0.25=0.5. The limits are −3·0.5=−1.5 and +3·0.5=+1.5. Embeddings still use std=1 and limits −3 to +3; the RMSNorm Gain starts at 1.",
      "check": "Which three initialization rules does A1 require, which arguments are passed to trunc_normal_, and why is an exact empirical-variance comparison not a valid test?",
      "answer": "Linear: σ=sqrt(2/(d_in+d_out)); trunc_normal_ receives mean=0, std=σ, a=−3σ, and b=3σ. Embedding: mean=0, std=1, a=−3, and b=3. RMSNorm: the Gain starts entirely at one. Tests should verify the formula, bounds, and Module types rather than exact empirical variance after Truncation."
    },
    "rmsnorm": {
      "cat": "Transformer",
      "title": "RMSNorm",
      "read": "For each Token, compute its Root Mean Square (RMS), divide all D features by that shared scale, and multiply by a learnable Gain.",
      "purpose": "Keeps activation magnitudes controlled before Attention and the MLP without mixing Tokens or subtracting a mean as LayerNorm does.",
      "dims": "For X [B,T,D], only D is reduced and the Output remains [B,T,D]. The learnable Gain g [D] is broadcast over B and T; ε is a fixed stability constant.",
      "vars": [
        [
          "x",
          "D-dimensional activation vector of one Token"
        ],
        [
          "xⱼ",
          "Feature value at coordinate j"
        ],
        [
          "j",
          "Feature index; the formula sums over every j"
        ],
        [
          "D",
          "Number of features and the only normalization axis"
        ],
        [
          "Σⱼ",
          "Add the squared values of all D features"
        ],
        [
          "ε",
          "Small fixed constant that prevents division by zero"
        ],
        [
          "g",
          "Learnable scale with one value per feature"
        ],
        [
          "⊙",
          "Element-wise multiplication: every feature receives its own Gain"
        ],
        [
          "RMSNorm(x)",
          "Normalized Output with the same Shape as x"
        ]
      ],
      "intuition": "RMSNorm mainly changes the vector's length rather than its direction; g can then amplify or damp individual coordinates. In a Pre-Norm Block, only the Side Branch is normalized while the Residual Path remains direct.",
      "pitfall": "Do not average over Batch B or Tokens T and do not subtract the mean. With low precision, squaring and averaging are often done in FP32; ε belongs under the square root in this definition.",
      "example": "For x=[3,4], D=2, g=[1,1], and negligible ε: square → [9,16], average → 12.5, square root → 3.536. Division gives [3/3.536,4/3.536]≈[0.849,1.131]; Gain [1,1] leaves those values unchanged.",
      "check": "Which axis is reduced for X [B,T,D], what Shape does g have, and why does RMSNorm not change Sequence length?",
      "answer": "For X [B,T,D], the quadratic mean runs only over D; g has Shape [D] and is broadcast over B and T. Sequence length stays unchanged because RMSNorm scales every Token separately and neither combines nor creates positions."
    },
    "swiglu": {
      "cat": "Transformer",
      "title": "SwiGLU",
      "read": "Create two learned expanded feature views, transform one nonlinearly with SiLU, gate the other elementwise, and map the result back to D with a Down Linear Layer.",
      "purpose": "Processes each Token's features independently after Attention and can learn more complex functions than a single linear mapping through its input-dependent Gate.",
      "dims": "X [B,T,D] → W₁ and W₃ branches [B,T,F] → elementwise product [B,T,F] → W₂ Output [B,T,D]. B and T are not mixed.",
      "vars": [
        [
          "x",
          "Feature vector of one Token"
        ],
        [
          "FFN(x)",
          "Output of the Feed-Forward Network for this Token"
        ],
        [
          "W₁",
          "Learned D→F mapping for the Gate branch"
        ],
        [
          "W₃",
          "Learned D→F mapping for the content branch"
        ],
        [
          "W₂",
          "Learned F→D mapping back to the Residual Stream"
        ],
        [
          "⊙",
          "Element-wise multiplication of matching features"
        ],
        [
          "SiLU(z)",
          "Fixed function z·sigmoid(z); sigmoid produces a smooth value between 0 and 1"
        ],
        [
          "D,F",
          "Input and Output width D and expanded inner width F"
        ]
      ],
      "intuition": "W₃x creates candidate features while SiLU(W₁x) creates a smooth input-dependent Gate for the same Token. The product of two x-dependent branches is already nonlinear; SiLU is not the only source of nonlinearity but additionally shapes, suppresses, and amplifies the Gate branch.",
      "pitfall": "Only a pure composition of Linear Layers without an activation and without a multiplicative Gate collapses into one Linear Map. SwiGLU has three large weight matrices, mixes no Token positions, and applies SiLU to exactly one Up branch before the elementwise product.",
      "example": "Suppose W₁x=[1,−1] and W₃x=[4,2]. Then SiLU(W₁x)≈[0.731,−0.269], and their element-wise product is [2.924,−0.538]. If W₂ maps this vector to one output with weights [0.5,−1], the result is 0.5·2.924+(−1)·(−0.538)≈2.0.",
      "check": "What roles do the elementwise product and SiLU play, which axis is not mixed, and why must W₂ map back to D?",
      "answer": "The elementwise product of two x-dependent branches already creates a multiplicative nonlinearity; SiLU additionally shapes the Gate smoothly and can suppress or amplify features. T is not mixed. W₂ must map F back to D so the Output has the same [B,T,D] Shape as the Residual Stream."
    },
    "rope": {
      "cat": "Transformer",
      "title": "RoPE Rotation",
      "read": "For every Token position and adjacent feature pair, calculate an angle and rotate that two-dimensional pair by exactly this angle.",
      "purpose": "Adds A1-conforming position information to Query-Key comparisons so their Dot Product can depend on relative Token distance in a controlled way.",
      "dims": "Q and K remain [...,T,d], and d must be even. k counts d/2 adjacent feature pairs along the final axis; any number of leading batch-like axes and T remain unchanged.",
      "vars": [
        [
          "i",
          "Zero-based Token position"
        ],
        [
          "k",
          "One-based index of the adjacent feature pair"
        ],
        [
          "θᵢ,ₖ",
          "Rotation angle for position i and pair k, measured in radians"
        ],
        [
          "Θ",
          "Positive RoPE base controlling how much more slowly later pairs rotate"
        ],
        [
          "d",
          "Even width of one Query or Key Head"
        ],
        [
          "q₂ₖ₋₁,q₂ₖ",
          "Original values of the adjacent feature pair"
        ],
        [
          "q′₂ₖ₋₁,q′₂ₖ",
          "The same two values after rotation"
        ],
        [
          "R(θ)",
          "Fixed matrix [[cosθ,−sinθ],[sinθ,cosθ]]"
        ],
        [
          "ᵀ",
          "Transpose: the row pair is written as a column for matrix notation"
        ]
      ],
      "intuition": "A rotation changes a feature pair's direction but not its length. When Attention compares differently rotated pairs, their positional distance affects the comparison.",
      "pitfall": "A1 requires adjacent zero-based pairs [0,1],[2,3],…. Half-Split pairing is a different convention and breaks the tests. The angle is i divided by Θ^((2k−2)/d), not multiplied by it; the tables are Buffers, not Parameters.",
      "example": "Set d=4, Θ=100, and i=2. For k=1, θ=2 and the pair [1,0] becomes [cos(2),sin(2)]≈[−0.416,0.909]. For k=2, θ=0.2; the same starting pair would become [cos(0.2),sin(0.2)]≈[0.980,0.199]. Both pairs keep length 1.",
      "check": "Which angle formula and Pairing convention does A1 test, where does RoPE sit in the Attention flow, and why does the shared table belong in register_buffer(..., persistent=False)?",
      "answer": "A1 uses θ_i,k=i/Θ^((2k−2)/d) and adjacent one-based pairs (2k−1,2k), or zero-based [0,1],[2,3],…. R(θ) computes x′₀=x₀cosθ−x₁sinθ and x′₁=x₀sinθ+x₁cosθ. RoPE acts after Q/K and before QKᵀ; V remains unchanged. The fixed shared table is a non-persistent Buffer rather than a Parameter."
    },
    "attention": {
      "cat": "Transformer",
      "title": "Scaled Dot-Product Attention",
      "read": "Compare every Query with all allowed Keys, turn the comparison scores into weights summing to one, and mix the Values with those weights.",
      "purpose": "Lets each Token position selectively read information from other allowed positions according to its current content.",
      "dims": "Q [B,H,T_q,d_k], K [B,H,T_k,d_k], V [B,H,T_k,d_v] → Scores and weights [B,H,T_q,T_k] → Output [B,H,T_q,d_v]. Softmax preserves Shape and normalizes T_k.",
      "vars": [
        [
          "B",
          "Number of sequences in the Batch"
        ],
        [
          "H",
          "Number of Attention Heads"
        ],
        [
          "T_q",
          "Number of Query positions requesting information"
        ],
        [
          "T_k",
          "Number of Key and Value positions available to read"
        ],
        [
          "dₖ",
          "Feature width of one Query and Key Head"
        ],
        [
          "d_v",
          "Feature width of one Value Head"
        ],
        [
          "Q",
          "Query activations: search description of every reading position"
        ],
        [
          "K",
          "Key activations: comparison description of every offered position"
        ],
        [
          "Kᵀ",
          "K with position and feature axes exchanged so every Query is compared with every Key"
        ],
        [
          "V",
          "Value activations: content transferred from each position"
        ],
        [
          "softmax",
          "Turns each Query's scores into positive weights summing to one"
        ],
        [
          "Attention(Q,K,V)",
          "Weighted Value mixture for every Query"
        ]
      ],
      "intuition": "Q and K decide where to read; V decides what is read. Every Head learns its own feature views, so the same Token states can be encoded differently for comparison and transferable content.",
      "pitfall": "Softmax runs over T_k for each fixed Query. Masks act on Scores before Softmax; Q, K, and V are Batch activations, while only their producing Linear Layers are learned.",
      "example": "For one Head with dₖ=1, let q=1 and let the two Keys be k₁=0 and k₂=ln(3)≈1.099; ln(3) is exactly the value whose exponential is 3. The scores are [0,1.099]. Their exponential values are [1,3], and division by their sum 4 gives Softmax weights [0.25,0.75]. With v₁=[2,0] and v₂=[0,4], the Output is 0.25v₁+0.75v₂=[0.5,3].",
      "check": "What roles do Q/K play versus V, what Score Shape is produced, which axis does Softmax normalize, and why divide by √dₖ?",
      "answer": "Q and K create Compatibility Scores that determine where to read, while V supplies the content to mix. [B,H,T_q,d_k] and [B,H,T_k,d_k] produce [B,H,T_q,T_k], normalized over T_k. Dividing by √d_k keeps typical score scale stable as Head width grows."
    },
    "causal-attention": {
      "cat": "Transformer",
      "title": "Causal Attention Mask",
      "expr": "Sᵢⱼ = (qᵢ·kⱼ)/√dₖ + Mᵢⱼ,   Mᵢⱼ=0 for j≤i, otherwise −∞",
      "read": "Compute the comparison between the current Query and every Key, then add zero for allowed positions or minus infinity for future positions before Softmax.",
      "purpose": "When predicting the next Token, how does the model prevent a position from secretly reading later Tokens in the training sequence?",
      "dims": "M and S have Shape T_q×T_k in each Attention Head and are applied to every sequence and Head. Rows are Query positions and columns are Key positions.",
      "vars": [
        [
          "Sᵢⱼ",
          "Result on the left: masked Attention score from Query position i to Key position j"
        ],
        [
          "i",
          "Row index of the Query position requesting information"
        ],
        [
          "j",
          "Column index of the Key position being considered as an information source"
        ],
        [
          "qᵢ",
          "Query vector at position i"
        ],
        [
          "kⱼ",
          "Key vector at position j"
        ],
        [
          "qᵢ·kⱼ",
          "Dot Product: multiply matching features and add them to one comparison score"
        ],
        [
          "dₖ",
          "Number of features in one Query or Key vector"
        ],
        [
          "√dₖ",
          "Scale factor that compensates for the typical score size of wider vectors"
        ],
        [
          "Mᵢⱼ",
          "Additive mask value for exactly the position pair i,j"
        ],
        [
          "j≤i",
          "Allowed case: Key j is in the present or past, so Mᵢⱼ=0"
        ],
        [
          "j>i",
          "Forbidden case: Key j is in the future, so Mᵢⱼ=−∞"
        ],
        [
          "−∞",
          "Exactly zero weight after Softmax because exp(−∞)=0"
        ]
      ],
      "intuition": "Row i may only see columns up to and including i. The mask leaves allowed scores unchanged but makes every future score impossible before probabilities are formed.",
      "pitfall": "Multiplying by zero after Softmax is incorrect because the remaining weights no longer sum to one. Apply the mask to scores before Softmax.",
      "example": "Take Query position i=1, dₖ=1, q₁=2, and Keys k₀=1, k₁=3, k₂=4. The unmasked scores are [2·1,2·3,2·4]=[2,6,8]. Since j=2>i, M₁=[0,0,−∞] and S₁=[2,6,−∞]. Softmax gives approximately [0.018,0.982,0]; the future position receives exactly no weight.",
      "check": "Which triangle contains −∞?",
      "answer": "The strictly upper triangle contains −∞, meaning all entries where the column index j is greater than the row index i. These entries represent future key positions that a query must not see yet."
    },
    "residual": {
      "cat": "Transformer",
      "title": "Pre-Norm Residual Update",
      "read": "Carry x unchanged along the main path, compute a normalized learned correction in parallel, and add both elementwise.",
      "purpose": "Lets deep Transformers add information incrementally while signal and gradient can still flow directly through an Identity connection.",
      "dims": "x, F(Norm(x)), and x′ have exactly the same Shape [B,T,D]. Norm, F, and addition change neither Batch nor Sequence length; F must return to D.",
      "vars": [
        [
          "x",
          "Current activation in the Residual Stream, not a separate parameter"
        ],
        [
          "F",
          "Learned Attention or MLP Sub-Layer"
        ],
        [
          "Norm",
          "RMSNorm or LayerNorm on the Side Branch"
        ],
        [
          "x′",
          "Updated shared state passed to the next Sub-Layer"
        ]
      ],
      "intuition": "The Sub-Layer need not recreate the whole state; it learns a correction Δx. Since ∂x′/∂x contains an Identity term, a short gradient path exists even through many Blocks.",
      "pitfall": "A Pre-Norm Block adds the original x, not Norm(x). Its two updates are sequential: the MLP receives the state that Attention has already updated.",
      "example": "Set x=[1,−2] and F(Norm(x))=[0.1,0.5]. Add coordinate by coordinate: x′=[1+0.1,−2+0.5]=[1.1,−1.5]. A decoder Block performs first an Attention correction and then an MLP correction.",
      "check": "Where is the direct gradient path, why must both addends share a Shape, and which state does the second Residual update see?",
      "answer": "The direct path is the unchanged addend x, whose derivative contains the Identity regardless of F. Elementwise addition requires equal Shapes. In a serial Transformer Block, the second Residual base is already x plus the Attention correction."
    },
    "z-loss": {
      "cat": "Architecture",
      "title": "z-loss for Logit Stability",
      "read": "For each Token row, calculate Log-Sum-Exp of all scores, square it, average across Token positions, and weight the result by α_z.",
      "purpose": "Which additional penalty keeps the shared numerical level of all output or Router scores in a controlled range even when their relative differences already yield good predictions?",
      "dims": "z has Shape T×V for Vocabulary scores or T×E for Expert scores. The inner calculation gives one value per Token position; L_z is one scalar auxiliary Loss.",
      "vars": [
        ["L_z","Result on the left: scalar z-loss added to the main Loss"],
        ["α_z","Nonnegative weight that sets the strength of this auxiliary Loss"],
        ["T","Number of Token positions evaluated in this mean"],
        ["t","Running index over these Token positions"],
        ["Σ_t","Outer summation operator: adds one squared contribution for each position t"],
        ["v","Running index over all Vocabulary entries or all Router Experts in the same row"],
        ["z_tv","Raw score at Token position t for category or Expert v"],
        ["exp(z_tv)","Exponential function applied to one score"],
        ["Σ_v","Inner summation operator: adds the exponential values of the complete score row t"],
        ["log","Natural logarithm of the positive inner sum; together with Σ_v exp this forms Log-Sum-Exp"],
        ["[ … ]²","Square of Log-Sum-Exp; penalizes positive and negative displacement from zero"],
        ["1/T","Division by the number of positions; turns the outer sum into a mean"]
      ],
      "intuition": "Softmax sees only score differences. Shifting every score in one row by the same number leaves the prediction unchanged, but z-loss detects and penalizes that shared shift.",
      "pitfall": "z-loss replaces neither a numerically stable Log-Sum-Exp calculation nor an Expert load-balancing penalty. It controls shared score level, not the distribution of selected Experts.",
      "example": "Set T=2, α_z=0.1, and z_t=[0,0] for both Token rows. In each row, log(exp(0)+exp(0))=log 2≈0.693 and its square is 0.480. Therefore L_z=0.1·(1/2)·(0.480+0.480)=0.048.",
      "check": "Why can z-loss change while Cross-Entropy remains exactly the same?",
      "answer": "Softmax and Cross-Entropy depend only on differences between Logits. A shared shift z→z+a therefore leaves them unchanged, but logsumexp(z+a)=logsumexp(z)+a. z-loss measures that log-partition and consequently changes with the otherwise weakly constrained shared offset."
    },
    "logit-soft-cap": {
      "cat": "Architecture",
      "title": "Logit Soft-Capping",
      "read": "Divide the score by a positive bound c, apply the hyperbolic tangent, and multiply by c again; large magnitudes then smoothly approach ±c.",
      "purpose": "How can individual extreme Attention or output scores be constrained while small scores remain almost unchanged?",
      "dims": "Input z and output cap_c(z) have the same Shape. c is a positive number on the same scale as z.",
      "vars": [
        ["cap_c(z)","Result on the left: softly bounded version of the original score z"],
        ["z","Original unbounded score (Logit)"],
        ["c","Positive soft-cap bound that sets the approached maximum magnitude"],
        ["z/c","Dimensionless ratio of the score to the bound"],
        ["tanh(u)","Hyperbolic tangent: a smooth function between −1 and +1"],
        ["c·","Multiplication by c that restores the original score scale after tanh"],
        ["c>0","Required condition: prevents division by zero and defines a positive bound"]
      ],
      "intuition": "Near zero, tanh(z/c) is approximately z/c, so multiplication returns z. At very large magnitude, tanh approaches the sign ±1 and the result approaches ±c.",
      "pitfall": "Soft-capping is not normalization. It replaces neither separate Query-Key normalization nor numerically stable Softmax.",
      "example": "Set c=2 and z=2. Then z/c=1, tanh(1)≈0.762, and cap₂(2)=2·0.762=1.523. For z=10, tanh(5)≈0.99991 and cap₂(10)≈1.9998: the value approaches 2 without exceeding the bound.",
      "check": "What happens when |z|≪c and when |z|≫c?",
      "answer": "For |z| much smaller than c, tanh(z/c)≈z/c and cap_c(z)≈z. For |z| much larger than c, tanh approaches the sign ±1 and the result smoothly saturates at ±c."
    },
    "transformer-params": {
      "cat": "Resources",
      "title": "Rough Transformer Parameter Count",
      "read": "Square model width D, multiply by the number of Transformer Blocks L, and then by the architectural approximation factor 12.",
      "purpose": "How can the non-Embedding parameter count of a typical dense decoder Transformer be estimated quickly before every individual matrix is counted exactly?",
      "dims": "N_non-embed is a parameter count. The estimate assumes a standard Block with four D² Attention parameters and roughly eight D² Feed-Forward parameters.",
      "vars": [
        [
          "N_non-embed",
          "Result on the left: estimated parameter count excluding Token Embedding and output matrix"
        ],
        [
          "≈",
          "Approximation sign: the value applies only to the assumed standard architecture"
        ],
        [
          "12",
          "Approximation factor per Block: roughly 4 for Attention plus 8 for a Feed-Forward Network of inner width 4D"
        ],
        [
          "L",
          "Number of sequentially stacked Transformer Blocks"
        ],
        [
          "D",
          "Model dimension: width of the Residual and Token state"
        ],
        [
          "D²",
          "D times D; arises because large matrices connect an input and output width proportional to D"
        ],
        [
          "·",
          "Multiplication: the same rough matrix cost occurs in each of the L Blocks"
        ]
      ],
      "intuition": "Each additional Block adds approximately the same set of matrices, so cost grows linearly with L. Increasing width enlarges both matrix axes, so cost grows quadratically with D.",
      "pitfall": "Token Embeddings and an untied output matrix are absent. Grouped-Query Attention (GQA), exact SwiGLU Gate width, Bias values, and other architectural details change the factor 12.",
      "example": "For a tiny estimate with L=2 Blocks and D=4, D²=4²=16. Thus N_non-embed≈12·2·16=384 parameters. At the same L and D=8, the estimate is 12·2·64=1,536, four times as many.",
      "check": "Why does D² dominate?",
      "answer": "The large weight matrices of a block connect dimensions that are both proportional to D, such as D×D or D×D_ff with D_ff proportional to D. Thus, each block mainly costs a constant factor times D² parameters."
    },
    "transformer-ledger": {
      "cat": "Resources",
      "title": "Exact A1 Transformer Ledger",
      "expr": "P=2VD+L(4D²+3DF+2D)+D   ·   F_fwd=L(8TD²+4T²D+6TDF)+2TDV",
      "read": "First make a bill of materials for every matrix and Gain. Add those stored values to obtain P; then count how often the matrices run for T Tokens to obtain F_fwd.",
      "purpose": "Provides exact A1 parameter and forward-FLOP accounting with untied Embedding and LM Head, no Bias, and two FLOPs per multiply-add.",
      "dims": "P counts scalar parameters; F_fwd counts matrix-multiplication FLOPs for one sequence of length T. V, D, F, L, and T are positive integer sizes.",
      "vars": [["P","Total number of stored parameters in the stated A1 model"],["F_fwd","Matrix-multiplication FLOPs for one sequence's Forward Pass"],["V","Number of Vocabulary Tokens"],["D","Model feature width"],["F","Inner SwiGLU feature width"],["L","Number of Transformer Blocks"],["T","Number of Token positions in the sequence"],["2VD","Separate Input Embedding and separate LM Head"],["4D²+3DF+2D","Four Attention matrices, three SwiGLU matrices, and two Norm Gains per Block"],["4T²D","The two position-mixing Attention matrix multiplications"]],
      "intuition": "Parameters follow matrix Shapes; Forward work reuses those weights at every Token and additionally compares Token positions in Attention.",
      "pitfall": "Silently assuming Weight Tying, Biases, or a classic two-matrix MLP changes the architecture and therefore both formulas.",
      "example": "Small case V=10,D=2,F=4,L=1,T=3. Parameters: 2VD=40; one Block has 4D²=16, 3DF=24, and 2D=4, totaling 44; the final Norm Gain adds D=2. Thus P=40+44+2=86. Forward: 8TD²=96, 4T²D=72, and 6TDF=144 total 312 in the Block; the LM Head costs 2TDV=120. Therefore F_fwd=312+120=432 FLOPs.",
      "check": "Which matrix was probably omitted if the SwiGLU term is only 4TDF rather than 6TDF?",
      "aliases": "exact transformer accounting forward flops swiglu untied head ledger",
      "answer": "The missing term is the third SwiGLU matrix. Two D×F projections produce the gate and value branches, while the F×D output projection returns their product to the Residual Stream. Each costs 2TDF FLOPs, totaling 6TDF rather than 4TDF."
    },
    "temperature": {
      "cat": "Sampling",
      "title": "Temperature",
      "read": "First divide every raw score for the possible next Tokens by the same positive number; Softmax then turns the results into probabilities.",
      "purpose": "How can the next-Token choice become more cautious or more diverse without retraining the model?",
      "dims": "pᵢ(T) and T are dimensionless numbers; all zᵢ use the same unit or scale.",
      "vars": [
        [
          "pᵢ(T)",
          "Probability of the Token at position i after applying temperature T"
        ],
        [
          "i",
          "Index of one possible next Token; the same calculation is performed for every index"
        ],
        [
          "zᵢ",
          "Raw score emitted by the model for Token i; this raw score is called a Logit"
        ],
        [
          "T",
          "Positive temperature: below 1 it sharpens the choice, above 1 it smooths the choice"
        ],
        [
          "softmax(·)",
          "Operator that jointly turns all divided raw scores into positive probabilities whose sum is 1"
        ],
        [
          "T>0",
          "Condition that prevents division by zero or by a negative temperature"
        ]
      ],
      "intuition": "T<1 amplifies differences, T>1 smooths them.",
      "pitfall": "Do not use T=0 numerically; handle greedy separately.",
      "example": "Two Tokens have z=[2,1] and T=2. First z/T=[2/2,1/2]=[1,0.5]. Then p₁=e¹/(e¹+e⁰·⁵)≈2.718/(2.718+1.649)=0.622 and p₂=1.649/(2.718+1.649)=0.378. The probabilities sum to 1; the original 2-versus-1 choice has been smoothed.",
      "check": "Which direction increases diversity?",
      "answer": "A higher temperature T>1 smooths the distribution and typically increases sampling diversity. A lower positive temperature sharpens it and concentrates more mass on the largest logits."
    },
    "adamw": {
      "cat": "Optimization",
      "title": "AdamW Update",
      "read": "After Backward, take the current gradient gₜ, update a direction memory mₜ and a magnitude memory vₜ for every parameter coordinate, correct their zero initialization, and then perform the separate decay and adaptive gradient steps.",
      "purpose": "AdamW changes the learned model parameters at every Optimizer Step despite noisy gradients whose scales differ across coordinates. It is used in the Training Loop after Backward and optional Gradient Clipping.",
      "dims": "θ, g, m, and v each have exactly the Shape of the associated parameter, for example [D_in,D_out], and every operation is element-wise. β₁, β₂, η, λ, and ε are scalars; m and v are persistent Optimizer State rather than model activations.",
      "vars": [
        [
          "t",
          "Number of the current Optimizer update; the first update uses t=1"
        ],
        [
          "θₜ₋₁,θₜ",
          "Parameter value before and after this update"
        ],
        [
          "gₜ",
          "current gradient computed by Backpropagation and, if configured, already clipped"
        ],
        [
          "mₜ",
          "exponentially smoothed signed gradient used as direction memory"
        ],
        [
          "vₜ",
          "exponentially smoothed squared gradient used as magnitude memory"
        ],
        [
          "m̂ₜ,v̂ₜ",
          "bias-corrected moments required because m₀=v₀=0"
        ],
        [
          "β₁,β₂",
          "memory factors; larger values forget past gradients more slowly"
        ],
        [
          "η",
          "current Learning Rate supplied by the Schedule"
        ],
        [
          "λ",
          "strength of the separately applied Weight Decay"
        ],
        [
          "ε",
          "small fixed value that stabilizes the denominator"
        ]
      ],
      "intuition": "m remembers the direction supported by many Batches, while √v estimates the typical absolute gradient scale of the same coordinate. Their ratio makes coordinate steps more comparable; independently, the factor 1−ηλ moves the old parameter slightly toward zero.",
      "pitfall": "Bias Correction must use t=1 for the first update. Do not also mix Weight Decay into g; even when g=0, the separate decay can change θ. Only parameters included in the Optimizer groups are updated.",
      "example": "For θ₀=1, g₁=2, β₁=0.9, β₂=0.999, η=0.001, and λ=0.1, m₁=0.2, v₁=0.004, m̂₁=2, and v̂₁=4. Decay gives 0.9999 and the adaptive term is about 0.001, so θ₁≈0.9989.",
      "check": "Why is AdamW decay not the same term as L2 in Adam?",
      "answer": "An L2 term is added to the gradient in Adam and then scaled together with it by the adaptive moment estimators. In contrast, AdamW applies weight decay as a separate, direct shrinkage step on the parameters, so that the decay effect does not depend on the coordinate-wise Adam scaling."
    },
    "cosine-lr": {
      "cat": "Optimization",
      "title": "Warmup + Cosine Decay",
      "read": "This equation describes only the time after linear Warmup: it smoothly lowers the Learning Rate from η_max at Step T_w to η_min at Step T.",
      "purpose": "After cautious Warmup, which Learning Rate should the Optimizer use at one particular training Step?",
      "dims": "t, T_w, and T count Optimizer Steps; η(t), η_max, and η_min are Learning Rates. The equation applies for T_w≤t≤T.",
      "vars": [
        [
          "η(t)",
          "Learning Rate used at the current Optimizer Step"
        ],
        [
          "t",
          "current Optimizer Step"
        ],
        [
          "T_w",
          "last Warmup Step and start of Cosine Decay"
        ],
        [
          "T",
          "last Step of the Decay"
        ],
        [
          "η_max",
          "largest Learning Rate, reached at the end of Warmup"
        ],
        [
          "η_min",
          "smallest Learning Rate, reached at the end of Decay"
        ],
        [
          "π",
          "pi; it makes the half-cosine curve end exactly at both boundaries"
        ]
      ],
      "intuition": "Larger Steps are allowed immediately after Warmup. Toward the end of training, the Steps become progressively smaller without an abrupt jump at either end of the Decay.",
      "pitfall": "The displayed equation does not contain linear Warmup. For t<T_w, its separate rule applies. The Scheduler counts Optimizer updates, not individual Microbatches.",
      "example": "Let T_w=100, T=1000, η_max=0.001, and η_min=0.0001. At t=100 the cosine is 1 and η=0.001. At the midpoint t=550 the cosine is 0, so η=0.0001+0.5·0.0009=0.00055. At t=1000 the cosine is −1 and η=0.0001.",
      "check": "Which η applies at t=T?",
      "answer": "At the defined end of the decay t=T, η=η_min. The cosine term reaches its final value there, provided T is used as the last scheduler step and not as a count with different indexing."
    },
    "gradient-clip": {
      "cat": "Optimization",
      "title": "Global Norm Clipping",
      "read": "Conceptually join all parameter gradients into one long vector, compute its global L2 norm, and multiply every entry by the same factor only when that norm exceeds the threshold c.",
      "purpose": "Global Norm Clipping limits one unusually large Backward result before it strongly changes AdamW moments and parameters. It belongs after Backward or mixed-precision unscaling and before optimizer.step().",
      "dims": "Every gradient keeps exactly the Shape of its parameter; only its values change. ||g||₂ and c are scalars with the same units, and the multiplication factor is dimensionless and lies between zero and one.",
      "vars": [
        [
          "g",
          "collection of all gradients being clipped, conceptually concatenated into one vector"
        ],
        [
          "||g||₂",
          "global L2 norm: square root of the sum of every squared gradient entry"
        ],
        [
          "c",
          "positive maximum permitted norm"
        ],
        [
          "ε",
          "small fixed value that numerically safeguards the denominator"
        ]
      ],
      "intuition": "Clipping shortens an overly long gradient arrow without rotating it: all components preserve their relative ratios. If the norm is already below c, the factor is one and the gradients remain unchanged.",
      "pitfall": "Component-wise clamp changes direction and is a different operation. With mixed precision, unscale first; in distributed training, compute the norm over the semantically correct group. Clipping after optimizer.step() is too late.",
      "example": "If ||g||₂=10 and c=1, the shared factor is about 0.1: gradient parts [6,8] become [0.6,0.8], whose norm is one. If ||g||₂=0.4, nothing changes.",
      "check": "Why does the angle remain the same?",
      "answer": "Global clipping multiplies every gradient entry by the same positive scalar. Their ratios, and therefore the direction of the total vector, remain unchanged; only its length changes. Below c the factor is one, and above c it is approximately c/||g||₂."
    },
    "global-batch": {
      "cat": "Training",
      "title": "Global Batch Size",
      "read": "Multiply Sequences per Forward Pass and Data-Parallel Rank by the number of accumulated Forward Passes and by the number of independent Data-Parallel Ranks.",
      "purpose": "How many different Sequences contribute to exactly one shared Optimizer update?",
      "dims": "Every quantity counts Sequences or repetitions. For Tokens per Optimizer Step, multiply the result by Sequence length as an additional step.",
      "vars": [
        [
          "B_global",
          "total number of different Sequences whose gradients are combined in one Optimizer update"
        ],
        [
          "B_micro",
          "Sequences in one Forward Pass on one Data-Parallel Rank"
        ],
        [
          "G_accum",
          "number of Forward/Backward passes whose gradients are accumulated before the update"
        ],
        [
          "W",
          "only the number of Data-Parallel Ranks processing different data, not automatically the total World Size"
        ]
      ],
      "intuition": "Each Data-Parallel Rank sees different Sequences. Gradient Accumulation additionally combines several local Microbatches before all contributions produce one shared update.",
      "pitfall": "Tensor- and Pipeline-Parallel Ranks work on the same examples and must not enlarge W. World Size and Data-Parallel degree are different in mixed setups.",
      "example": "One Data-Parallel Rank processes B_micro=2 Sequences per Forward Pass. It accumulates G_accum=8 such passes: 2·8=16 Sequences per Rank. With W=16 Data-Parallel Ranks, 16·16=256 different Sequences contribute to one Optimizer update.",
      "check": "Which parallelism axis belongs in W?",
      "answer": "W includes only data-parallel ranks that process different data examples and aggregate their gradients for a joint update. Pure tensor or pipeline-parallel ranks, however, share the same examples or model and do not automatically increase the global data batch."
    },
    "training-flops": {
      "cat": "Resources",
      "title": "Training Compute",
      "read": "Multiply the model parameters counted under one fixed convention by the number of processed training Tokens, then multiply by the approximation factor six.",
      "purpose": "Approximately how many Floating-Point Operations does a planned dense Transformer training run cost?",
      "dims": "C counts Floating-Point Operations (FLOPs), N counts parameters, and D_tokens counts processed Tokens. The factor 6 is a rough dimensionless approximation.",
      "vars": [
        [
          "C",
          "approximate total number of arithmetic operations in the training run"
        ],
        [
          "6",
          "approximation: about 2 operations per parameter and Token in the Forward Pass and about 4 more in the Backward Pass"
        ],
        [
          "N",
          "model parameters counted under one explicitly stated convention"
        ],
        [
          "D_tokens",
          "total number of Token positions processed during training"
        ]
      ],
      "intuition": "The same weights are used once forward and then again to compute gradients for every training Token. Compute therefore grows approximately linearly with both parameters and Tokens.",
      "pitfall": "This is not an exact Kernel accounting. State whether N includes Embeddings, and name any additional Attention, sparsity, or hardware assumptions.",
      "example": "A toy model has N=10 million parameters and processes D_tokens=100 million Tokens. First N·D=10,000,000·100,000,000=10¹⁵. Multiplying by six gives C≈6·10¹⁵ FLOPs.",
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
      "example": "The modeled rate is 400 TFLOP/s and the hardware peak is 1000 TFLOP/s. Therefore MFU=400/1000=0.4=40%.",
      "check": "Why can a poor data pipeline lower MFU?",
      "answer": "If the data pipeline does not deliver batches in time, the GPU waits and performs no model operations during this time. The measured model FLOP/s decrease, while the theoretical hardware peak remains constant, so Model FLOPs Utilization drops."
    },
    "speedup": {
      "cat": "Systems",
      "title": "Speedup & Scaling Efficiency",
      "read": "Speedup compares runtime; efficiency additionally divides by the number of resources p.",
      "purpose": "Evaluates parallel acceleration.",
      "dims": "S and E are dimensionless; T₁ and Tₚ must use the same time unit.",
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
        ],
        [
          "S(p)",
          "Speedup: how many times faster is the run with p resources?"
        ],
        [
          "E(p)",
          "Efficiency: what fraction of the ideal p-fold speedup is achieved?"
        ]
      ],
      "intuition": "Linear speedup S(p)=p means E(p)=1, or 100% scaling efficiency.",
      "pitfall": "Do not mix up strong and weak scaling.",
      "example": "One GPU needs T₁=8 s and four GPUs need T₄=2.5 s. Therefore S(4)=8/2.5=3.2 and E(4)=3.2/4=0.8=80%.",
      "check": "Why can E decrease with p?",
      "answer": "With more resources, communication, synchronization, and scheduling overhead grow, while serial work is not accelerated. As a result, T_p usually decreases slower than 1/p, causing S(p)/p and thus efficiency to drop."
    },
    "arithmetic-intensity": {
      "cat": "GPU",
      "title": "Arithmetic Intensity",
      "expr": "AI = FLOPs / Bytes from slow memory",
      "read": "Useful compute operations per transferred byte.",
      "purpose": "Classifies whether a kernel needs more bandwidth or compute power.",
      "dims": "AI is measured in FLOPs per Byte.",
      "vars": [
        [
          "AI",
          "Arithmetic Intensity: number of compute operations per transferred Byte"
        ],
        [
          "FLOPs",
          "Floating-point operations performed by the Kernel"
        ],
        [
          "Bytes",
          "Relevant memory traffic, usually to and from High Bandwidth Memory (HBM)"
        ]
      ],
      "intuition": "Reuse data often before sending it back to slow HBM.",
      "pitfall": "The cache level being counted must be specified.",
      "example": "A Kernel performs 200 FLOPs and moves 100 Bytes from the slow memory level being counted. Therefore AI=200/100=2 FLOPs per Byte.",
      "check": "Why does fusion usually increase AI?",
      "answer": "Fusion keeps intermediate values between multiple operations on the chip and avoids writing them to and re-reading from High Bandwidth Memory. With nearly the same compute work, the transferred byte count decreases, thus increasing FLOPs per Byte."
    },
    "triton-grid-mask": {
      "cat": "GPU",
      "title": "Triton Grid, Offsets & Boundary Mask",
      "read": "Launch enough Programs for all N elements, map local lanes to global offsets, and mask every boundary access.",
      "purpose": "Core contract of a one-dimensional Triton Kernel with no missing or multiply owned elements.",
      "dims": "P, N, BLOCK_SIZE, and offsets are integers; m is a Boolean vector per Program.",
      "vars": [["N","Number of valid elements"],["BLOCK_SIZE","Number of lanes or elements covered by one Program"],["P","Number of launched Programs; rounding up guarantees complete coverage"],["p","program_id, the index of the current Program"],["r","Local lane from 0 through BLOCK_SIZE−1"],["oₚᵣ","Global offset handled by lane r in Program p"],["mₚᵣ","Boolean validity mask: true exactly when the offset is smaller than N"],["[condition]","1 or true when the condition holds, otherwise 0 or false"]],
      "intuition": "The rounded-up Program count covers every real element; the mask makes the deliberately overhanging lanes in the final tile safe.",
      "pitfall": "False masks do not remove lanes. Loads need an operation-neutral other value, and stores must be masked separately.",
      "example": "N=17 and BLOCK_SIZE=8 give P=⌈17/8⌉=3. Program p=2 owns offsets 16…23. Its mask is [true,false,false,false,false,false,false,false], because only offset 16 is smaller than 17.",
      "check": "What is lost with floor(N/BLOCK_SIZE), and how many tail lanes are created?",
      "answer": "Floor division would launch only fully filled tiles. Every index from P·BLOCK_SIZE through N−1 would have no owner; with N=17 and BLOCK_SIZE=8 this is index 16. Ceil division instead launches a third Program with seven tail lanes. Those lanes exist, but their memory accesses are masked by offsets<N."
    },
    "roofline": {
      "cat": "GPU",
      "title": "Roofline Limit",
      "read": "Calculate the compute roof and the bandwidth roof; the smaller one limits achievable performance.",
      "purpose": "Simple bottleneck model for GPU kernels.",
      "dims": "Performance and P_peak use FLOP/s, BW uses Byte/s, and AI uses FLOP/Byte. BW·AI therefore also has unit FLOP/s.",
      "vars": [
        [
          "Performance",
          "Actually achievable compute rate of the Kernel"
        ],
        [
          "P_peak",
          "Theoretical hardware compute roof"
        ],
        [
          "BW",
          "Maximum Bytes per second delivered from the memory level being considered"
        ],
        [
          "AI",
          "Arithmetic Intensity: FLOPs per transferred Byte"
        ],
        [
          "BW·AI",
          "Bandwidth roof in FLOP/s"
        ],
        [
          "min(a,b)",
          "The smaller of values a and b"
        ]
      ],
      "intuition": "A Kernel needing many Bytes per calculation is limited by data delivery. If it reuses loaded data often, the compute roof can become the bottleneck.",
      "pitfall": "A roof is not guaranteed measured performance; launch overhead and poor utilization can lower the result further.",
      "example": "Let P_peak=100 TFLOP/s, BW=1 TB/s, and AI=10 FLOP/Byte. The bandwidth roof is 1·10=10 TFLOP/s. The minimum of 100 and 10 is 10 TFLOP/s, so this Kernel is memory-bound in the Roofline model.",
      "check": "How is the Ridge Point calculated?",
      "answer": "At the Ridge Point, the compute roof and bandwidth roof are equal: P_peak=BW·AI. Therefore, AI_ridge=P_peak/BW with the unit FLOPs per Byte."
    },
    "online-softmax": {
      "cat": "GPU",
      "title": "Online Softmax Update",
      "read": "Take the larger of the previous and new maxima, convert the old exponential sum to that new scale, and add the new Block's contributions.",
      "purpose": "Enables exact block-wise softmax in FlashAttention.",
      "dims": "m, m_b, m′, ℓ, and ℓ′ are scalars per Query row; sⱼ are the scores in one new Block.",
      "vars": [
        [
          "m",
          "Largest score processed so far in this Query row"
        ],
        [
          "m_b",
          "Largest score in the new Block"
        ],
        [
          "m′",
          "New shared maximum max(m,m_b)"
        ],
        [
          "ℓ",
          "Previous exponential sum expressed relative to m"
        ],
        [
          "ℓ′",
          "Updated exponential sum expressed relative to m′"
        ],
        [
          "sⱼ",
          "New score with index j"
        ],
        [
          "j",
          "Index of one score in the new Block"
        ],
        [
          "e^x",
          "Exponential function turning a Logit difference into a positive weight contribution"
        ],
        [
          "Σⱼ",
          "Add the contributions of every score in the new Block"
        ]
      ],
      "intuition": "When a larger maximum appears, previous contributions must be converted to the new scale before old and new sums can be combined.",
      "pitfall": "The weighted Value accumulator must be rescaled by the same factor e^(m−m′); otherwise the maximum and denominator are correct but the Attention Output is not.",
      "example": "Suppose the processed scores are [1,2]. Then m=2 and ℓ=e^(1−2)+e^(2−2)=e⁻¹+1≈1.368. The new Block is [3], so m_b=3 and m′=3. Thus ℓ′=e^(2−3)·1.368+e^(3−3)≈0.368·1.368+1≈1.503. This is the same stable sum obtained from [1,2,3] at once.",
      "check": "Which two statistics suffice for normalization?",
      "answer": "Per query row, the previous maximum m and the correspondingly scaled exponential sum ℓ suffice. With these two quantities, new blocks can be included stably and correct normalization determined at the end; an output accumulator is additionally maintained for weighted values."
    },
    "flash-backward": {
      "cat": "GPU",
      "title": "FlashAttention Backward Recomputation",
      "expr": "D_row=rowsum(O⊙dO); P=exp(QKᵀ/√d−L); dS=P⊙(dOVᵀ−D_row); dQ=dSK/√d; dK=dSᵀQ/√d; dV=PᵀdO",
      "read": "Reconstruct the Attention weights used during the Forward Pass one block at a time, then calculate the derivatives from them.",
      "purpose": "How can exact gradients be calculated without retaining the complete square probability matrix in fast graphics memory, called High Bandwidth Memory (HBM)?",
      "dims": "Q,K,dQ,dK have Shape [number of Tokens,d] per Attention Head; V,O,dV,dO have Shape [number of Tokens,d_v]. L and D_row contain one number per Query row. P and dS logically have one row per Query and one column per Key but exist only blockwise.",
      "vars": [["d before a name","Marks the derivative of the training loss with respect to that quantity, such as dO for the incoming Output gradient"],["O and dO","Attention Output from the Forward Pass and its gradient arriving from the next Layer"],["rowsum(·)","Adds all entries in each Query row, producing one number per row"],["⊙","Element-wise multiplication of equally shaped arrays, not matrix multiplication"],["D_row","For each Query row, the number rowsum(O⊙dO), subtracted from every Key column of that row"],["Q and K","Query and Key matrices; QKᵀ forms one raw score for every allowed Query-Key pair"],["ᵀ","Transpose: swaps the rows and columns of the matrix immediately before it"],["d and √d","Feature width of one Attention Head and its square root used to scale scores"],["L","Logarithm of the sum of score exponentials saved during the Forward Pass, separately for every Query row"],["exp(·)","Applies the exponential function element by element"],["P","Softmax probabilities thereby reconstructed for allowed Query-Key pairs"],["V","Value matrix whose rows are weighted by P to produce Output O"],["dS","Gradient with respect to scaled Attention scores; P element-wise weights dOVᵀ−D_row"],["dQ, dK, and dV","Desired gradients with respect to Query, Key, and Value"],["−, /, and matrix products","− removes D_row per row, /√d preserves Forward scaling, and adjacent matrices are multiplied"]],
      "intuition": "Stored row statistics suffice to reconstruct P exactly tile by tile, exchanging additional Compute for avoided memory traffic.",
      "pitfall": "Forward and backward masks must be identical; masked entries stay zero and every valid dS row should sum numerically to approximately zero.",
      "example": "Small case with one Query, two Keys, and d=1: Q=[1], K=[0,ln2]ᵀ, V=[1,2]ᵀ. The scores are [0,ln2], L=ln(e⁰+eˡⁿ²)=ln3, and P=[1/3,2/3]. Output O=(1/3)·1+(2/3)·2=5/3. For dO=3, D_row=(5/3)·3=5. Thus dS=[1/3,2/3]⊙([3,6]−5)=[−2/3,2/3]. Next, dQ=(−2/3)·0+(2/3)·ln2≈0.462; dK=[−2/3,2/3]ᵀ·1; and dV=[1/3,2/3]ᵀ·3=[1,2]ᵀ. As a check, dS sums to 0.",
      "check": "Why is rowsum(dS) a useful gradient invariant?",
      "aliases": "flash attention backward recompute logsumexp drow ds dq dk dv",
      "answer": "Softmax is invariant to a common shift of all logits in one row. The derivative along that offset direction must therefore be zero, so dS sums to approximately zero over allowed Keys. A clear deviation often reveals the wrong axis, mask, scaling, or D_row."
    },
    "memory-state": {
      "cat": "Systems",
      "title": "Training State per Parameter",
      "read": "Add memory for weights, gradients, an optional calculation copy of the weights, and the two states maintained by the Adam optimizer.",
      "purpose": "How much memory does model training occupy even before the additional intermediate results of the Forward Pass?",
      "dims": "Every M term is measured in Bytes. For N parameters, each term is its Bytes per parameter multiplied by N.",
      "vars": [
        [
          "M",
          "Estimated total memory for the persistent training state listed here"
        ],
        [
          "M_param",
          "Memory for the model weights actually used, commonly 2 Bytes per parameter in bfloat16 (BF16) format"
        ],
        [
          "M_grad",
          "Memory for the gradients calculated for every trainable weight"
        ],
        [
          "M_master",
          "Optional 32-bit floating-point copy of the weights for more precise updates"
        ],
        [
          "M_m",
          "Memory for Adam's first moment, the smoothed gradient"
        ],
        [
          "M_v",
          "Memory for Adam's second moment, the smoothed squared gradient"
        ],
        [
          "≈",
          "Approximate equality because activations, temporary buffers, and Framework bookkeeping are omitted"
        ],
        [
          "N",
          "Number of model parameters by which the Bytes per parameter are multiplied"
        ]
      ],
      "intuition": "The visible model is only part of the training memory.",
      "pitfall": "Framework details change the exact byte count; activations are additional.",
      "example": "For N=1,000,000 parameters, BF16 weights use 2·N=2 MB, BF16 gradients use 2 MB, the 32-bit master copy uses 4 MB, and the two Adam moments use 4 MB each. Therefore M≈2+2+4+4+4=16 MB, equal to 16 Bytes per parameter.",
      "check": "Which parts does ZeRO-1/2/3 shard?",
      "answer": "ZeRO-1 shards optimizer states, ZeRO-2 additionally shards gradients, and ZeRO-3 additionally shards model parameters across data parallel ranks. With ZeRO-3, required parameters are temporarily gathered for computation but remain sharded outside these phases."
    },
    "kv-cache": {
      "cat": "Inference",
      "title": "KV Cache Size",
      "read": "In every Layer, count one Key and one Value vector for every active Sequence and stored Token position; then multiply by their element count and Bytes per element.",
      "purpose": "How much device memory do previously computed Attention Keys and Values occupy while the next Token is generated?",
      "dims": "K and V each have Shape [B,H_kv,S,d_head] per Layer; multiplying by L, factor 2, and b_KV Bytes per element gives M_KV in Bytes.",
      "vars": [
        [
          "M_KV",
          "total Key-Value Cache memory in Bytes"
        ],
        [
          "2",
          "two equally sized stored tensors: Keys and Values"
        ],
        [
          "L",
          "number of Transformer Layers; each keeps its own Cache"
        ],
        [
          "B",
          "number of Sequences decoded concurrently"
        ],
        [
          "S",
          "number of Token positions already stored per Sequence"
        ],
        [
          "H_kv",
          "number of Key-Value Heads; Grouped-Query Attention can use fewer of these than Query Heads"
        ],
        [
          "d_head",
          "number of Features in one Head"
        ],
        [
          "b_KV",
          "Bytes per stored numeric value, for example 2 under BF16"
        ],
        [
          "H_q",
          "number of Query Heads; it often determines d_head=D/H_q but is not itself the Cache Head count"
        ]
      ],
      "intuition": "The Cache avoids recomputation: earlier Keys and Values are written once and read again during later Decode Steps. It therefore grows linearly with Layers, active Sequences, and context length.",
      "pitfall": "The KV Cache is request-dependent activation state, not a model parameter. Under Grouped-Query Attention, use H_kv rather than H_q; Queries from earlier positions are not stored as history.",
      "example": "Toy case: L=2 Layers, B=3 Sequences, S=4 stored positions, H_kv=2 Heads, d_head=2 Features, and b_KV=2 Bytes. Keys and Values first contribute factor 2. Then M_KV=2·2·3·4·2·2·2=384 Bytes.",
      "check": "Where do factor 2 and axis S come from, why is Q not stored as history, and which quantity does GQA reduce?",
      "answer": "Factor two counts Keys and Values as equally shaped tensors. S counts every previous position whose K and V will be read again. Q is relevant only to the currently computed position and is not needed as history. GQA reduces H_kv and therefore Cache size and memory traffic."
    },
    "inference-params-gqa": {
      "cat": "Inference",
      "title": "GQA Transformer: Matrix-Parameter Breakdown",
      "read": "Count Embedding and Output Head first. Then add three MLP matrices, Query plus Output, and the narrower Key plus Value projections for every Layer.",
      "purpose": "How many dominant matrix parameters does a Transformer with a gated MLP and Grouped-Query Attention contain?",
      "dims": "Every summand is a parameter count. Norm scales, biases, and other small parameters are omitted, matching the Lecture 10 approximation.",
      "vars": [["P","total matrix parameters counted here"],["c_tie","1 when Embedding and Output Head share one weight table, otherwise 2"],["V","number of Tokens in the Vocabulary"],["D","model width, or Feature width of the main stream"],["L","number of Transformer Layers"],["F","intermediate width of the gated Multi-Layer Perceptron (MLP)"],["H_kv","number of Key-Value Heads under Grouped-Query Attention (GQA)"],["d_head","Feature width of one Attention Head"],["H_q","number of Query Heads; D=H_q·d_head"],["3DF","three D-by-F matrices in the gated MLP per Layer"],["2D²","one D-by-D matrix for Query and another for Output"],["2D·H_kv·d_head","the narrower Key and Value matrices together"]],
      "intuition": "Query and Output still use full width D. Only Key and Value become narrower when several Query Heads share the same Key-Value Heads.",
      "pitfall": "Do not immediately use the rough 12LD² rule: gated MLP, the actual F, Weight Tying, and GQA change the terms. Head count and Head width are different quantities.",
      "example": "Toy model: V=100, D=8, L=2, F=32, H_q=4, H_kv=2, d_head=2, with Weight Tying so c_tie=1. Vocabulary part: 1·100·8=800. Per Layer: 3·8·32=768, 2·8²=128, and 2·8·2·2=64; total 960. Two Layers give 1,920. Overall P=800+1,920=2,720 parameters.",
      "check": "Why do fewer KV Heads change Attention parameters but not the Q or Output terms?",
      "answer": "The Query projection maps D to H_q·d_head=D and therefore stays D×D; the Output projection maps the concatenated H_q Heads back to D and also stays D×D. Only K and V map to H_kv·d_head, so their two terms shrink with H_kv."
    },
    "mlp-arithmetic-intensity": {
      "cat": "Inference",
      "title": "Gated-MLP Arithmetic Intensity",
      "read": "Divide the arithmetic operations of the Feed-Forward Block by the approximate Bytes read from and written to fast graphics memory.",
      "purpose": "How much arithmetic work is performed per transferred Byte, and why does processing many Tokens in parallel reuse the same weights better than producing one Token?",
      "dims": "AI_MLP is measured in floating-point operations per Byte. Byte terms assume 2-Byte bfloat16 (BF16) numbers and traffic to High Bandwidth Memory (HBM).",
      "vars": [["AI_MLP","Arithmetic Intensity of the Multi-Layer Perceptron (MLP): arithmetic operations divided by transferred Bytes"],["B","Number of Sequences processed together as one Batch"],["T_q","Number of Token positions processed together now; subscript q recalls Query positions"],["D","Width of the Block's Input and Output"],["F","Wider inner Feature count of the gated Feed-Forward Block"],["6BT_qDF","Numerator: three matrix multiplications with approximately 2BT_qDF operations each"],["4BT_qD","Bytes for reading and writing D-wide Inputs and Outputs in this simplified model"],["4BT_qF","Bytes for two F-wide intermediate arrays"],["6DF","Bytes for three D-by-F weight matrices at 2 Bytes per weight"],["/ and +","The fraction divides total operations by total Bytes; plus signs add the three kinds of data traffic"]],
      "intuition": "When B·T_q is small relative to D and F, reading the three weight matrices dominates and AI approaches B·T_q.",
      "pitfall": "Treating the equation as a complete hardware model; nonlinearities, caches, and extra reads are simplified.",
      "example": "Insert B=1, T_q=2, D=4, and F=8. Arithmetic work: 6·1·2·4·8=384 operations. Data: 4·1·2·4 + 4·1·2·8 + 6·4·8 = 32+64+192=288 Bytes. Therefore AI_MLP=384/288≈1.33 operations per Byte.",
      "check": "Which term lets AI grow during prefill without changing parameter count?",
      "answer": "T_q increases the number of token rows sent through the same three MLP weight matrices. During prefill T_q=S, so computation per weight read grows even though the matrices and parameter count remain unchanged."
    },
    "attention-arithmetic-intensity": {
      "cat": "Inference",
      "title": "Attention Arithmetic Intensity",
      "read": "Compare operations for matching Queries with Keys and weighting Values with the associated data traffic in the simplified Multi-Head Attention (MHA) model.",
      "purpose": "How much arithmetic work per Byte results from processing many Tokens together compared with producing exactly one new Token?",
      "dims": "AI_attn is measured in floating-point operations per Byte, assuming 2-Byte numbers and no complete score matrix stored in graphics memory.",
      "vars": [["AI_attn","Arithmetic Intensity of Attention: arithmetic operations per transferred Byte; attn abbreviates Attention"],["S","Number of available Key-Value positions, or length of the context being considered"],["T_q","Number of Query positions calculated together in the current call; q stands for Query"],["S·T_q","Arithmetic work grows with every pair of a Query position and a Key position"],["S+T_q","Simplified data traffic for S stored positions and T_q current Queries"],["⇒","Means that the two substituted special cases on the right follow from the general equation"],["Prefill: T_q=S","When the whole context is first processed in parallel, there are as many Queries as context positions; this gives S²/(2S)=S/2"],["Decode: T_q=1","When exactly one new Token is produced, there is one Query; this gives S/(S+1)"],["· and /","· multiplies quantities; the fraction divides modeled arithmetic work by modeled data traffic"]],
      "intuition": "Prefill compares many Queries with many Keys; decode reads the entire cache for one new Query.",
      "pitfall": "Multiplying B into the equation: each request has different Keys and Values, so batch does not automatically improve core-Attention reuse.",
      "example": "Insert S=8. For prefill, T_q=8: AI_attn=8·8/(8+8)=64/16=4 operations per Byte. For decode, T_q=1: AI_attn=8·1/(8+1)=8/9≈0.889 operations per Byte.",
      "check": "Why does decode stay just below 1 for very large S instead of growing with S?",
      "answer": "For decode T_q=1, so AI=S/(S+1). Numerator and denominator grow almost equally with S; their ratio approaches one from below rather than continuing to grow proportionally to S."
    },
    "decode-bandwidth": {
      "cat": "Inference",
      "title": "Bandwidth Limit for Decode",
      "read": "First estimate the minimum Bytes read from weights and Cache. Divide that data volume by memory bandwidth, then spread the B Tokens produced per Step over this ideal time.",
      "purpose": "What best-case Decode latency and Token rate are allowed by moving the unavoidable data alone?",
      "dims": "M_step and M_KV are Bytes, BW_HBM is Bytes per second, t_ideal is seconds per Decode Step, and throughput_ideal is Tokens per second.",
      "vars": [["M_step","minimum number of Bytes read from fast device memory per Decode Step"],["P","number of model parameters"],["b_w","Bytes per stored weight"],["M_KV","Cache Bytes read in this simplified Step"],["BW_HBM","High Bandwidth Memory (HBM) bandwidth in Bytes per second"],["t_ideal","ideal lower bound on one Decode Step's duration"],["B","number of active Sequences and therefore new Tokens produced per Step"],["throughput_ideal","ideal upper bound on generated Tokens per second"]],
      "intuition": "Even a computation that took zero time would still need to move weights and Cache data first. Any real extra work can only increase time and reduce throughput.",
      "pitfall": "This is a hardware lower bound, not measured latency and not Time to First Token. Compute, Runtime, communication, Cache reuse, and queueing are absent or idealized.",
      "example": "Let P=2.5 billion weights and b_w=2 Bytes, so P·b_w=5.00 GB. With M_KV=0.38 GB, M_step=5.38 GB. At BW_HBM=3.35 TB/s, t_ideal=5.38/3,350 s≈0.0016 s=1.6 ms. With B=16 active Sequences, throughput_ideal≈16/0.0016=10,000 Tokens/s.",
      "check": "Why is t_ideal a lower bound but throughput_ideal an upper bound?",
      "answer": "Dividing by ideal bandwidth accounts only for unavoidable transfer and omits every additional cost, so real latency can only be larger. Since throughput is B/t, any larger real time yields a smaller token rate, making the ideal value an upper bound."
    },
    "ssm-recurrence": {
      "cat": "Inference",
      "title": "State-Space Recurrence",
      "read": "Summarize the previous Sequence in a fixed state, update it with the current Input, and calculate the current Output from it.",
      "purpose": "How can a Sequence model carry earlier information forward without retaining one separate entry for every previous position?",
      "dims": "u_t, h_t, and y_t may have different Feature widths. Ā maps state to state, B̄ maps Input to state, C maps state to Output, and D_s maps Input directly to Output.",
      "vars": [["t","Index of the current time step or Token position"],["u_t","Input vector at step t"],["h_{t−1}","Stored state from the immediately preceding step t−1"],["h_t","New state after combining old information with the current Input"],["Ā","Discretized state matrix controlling how much of h_{t−1} continues"],["B̄","Discretized Input matrix mapping u_t into state space"],["bar over A and B","Marks the matrix versions used for discrete Sequence steps here"],["y_t","Output vector at step t"],["C","Output matrix translating new state h_t into y_t"],["D_s","Direct-path matrix carrying part of u_t to the Output without passing through state"],["adjacent symbols","Āh, B̄u, Ch, and D_su each mean matrix times vector"],["+","Adds two contributions with the same destination width"]],
      "intuition": "The whole past acts only through h_{t−1}, so decode state does not grow with context S.",
      "pitfall": "Confusing O(1) in S with unlimited memory: fixed state can compress or forget details.",
      "example": "One-dimensional case: h₀=2, u₁=3, Ā=0.5, and B̄=1. Then h₁=0.5·2+1·3=1+3=4. With C=2 and D_s=0.1, y₁=2·4+0.1·3=8+0.3=8.3.",
      "check": "Which information path replaces direct access to individual earlier KV entries?",
      "answer": "The path runs through fixed state h_{t−1}: earlier inputs changed it through repeated updates, and C reads out the information that remains. Unlike Full Attention, there is no separately addressable KV entry for every earlier position."
    },
    "diffusion-generation": {
      "cat": "Inference",
      "title": "Diffusion Generation Loop",
      "read": "First draw a completely noisy Sequence, then replace it through several dependent steps with progressively less noisy Sequence states.",
      "purpose": "How can a model generate a whole Sequence by starting with noise and removing that noise one step at a time?",
      "dims": "Every x_k represents the complete Sequence at noise level k; k decreases from K to 0.",
      "vars": [["K","Fixed number of denoising steps"],["k","Current step index, taking the values K,K−1,…,1 in sequence"],["x_K","Starting state of the full Sequence drawn from the noise distribution"],["p_noise","Fixed probability distribution from which the initial noise is drawn"],["~","Means ‘is randomly drawn from the distribution on the right,’ not ‘equals’"],["x_k","Current Sequence state at noise level k"],["x_{k−1}","Next, slightly less noisy state"],["p_θ","Learned conditional distribution used for the next denoising step"],["θ","All learned parameters of this model"],["|","Means ‘conditioned on’: the distribution for x_{k−1} receives x_k as its Input"],["k=K,…,1","Runs transitions in descending order; every step needs the preceding result"],["x₀","Final state after the last denoising step"],["decode(x₀)","Turns the numerical final state into readable Tokens"],["· between statements","Separates successive phases here; it is not multiplication"]],
      "intuition": "Positions are parallel within a step; the K state transitions remain sequential.",
      "pitfall": "Confusing parallel token positions with one-pass generation.",
      "example": "One-dimensional toy example with K=3: p_noise returns x₃=8. For illustration, suppose p_θ certainly selects half the current value at every step. Then x₂=8/2=4, x₁=4/2=2, and x₀=2/2=1. In the example, decode(1) returns Token ID 1. Although positions may be parallel, three dependent transitions were required.",
      "check": "What is parallel and what remains sequential?",
      "answer": "All sequence positions can be computed in parallel within one transition x_k→x_{k−1}. Transitions over k remain sequential because step k−1 needs the complete result of the previous step as input."
    },
    "moe-output": {
      "cat": "Architecture",
      "title": "MoE Output",
      "read": "Run only the selected Experts for this Token, multiply their Outputs by the Router weights, and add the weighted Outputs.",
      "purpose": "Increases stored model capacity without running every Feed-Forward Expert for every Token.",
      "dims": "x, every E_e(x), and y(x) have the same model width D; g_e(x) is one scalar weight for Token x and Expert e.",
      "vars": [
        [
          "x",
          "State vector of one Token"
        ],
        [
          "e",
          "Index of one Expert"
        ],
        [
          "Eₑ(x)",
          "Output produced by Expert e for Token x"
        ],
        [
          "TopK(x)",
          "Small set of Experts selected by the Router for x"
        ],
        [
          "gₑ(x)",
          "Router weight of selected Expert e for x"
        ],
        [
          "Σ",
          "Add the weighted Outputs of all selected Experts"
        ],
        [
          "y(x)",
          "Combined MoE Output for this Token"
        ]
      ],
      "intuition": "The Router decides which specialists work and how strongly each proposal contributes to the result.",
      "pitfall": "Router weighting and capacity or load-balancing rules are part of the system; Top-k alone is not the complete contract.",
      "example": "For a scalar toy Output, Expert 1 returns E₁(x)=2 and Expert 2 returns E₂(x)=8. The Router selects both with g₁=0.75 and g₂=0.25. Therefore y(x)=0.75·2+0.25·8=1.5+2=3.5.",
      "check": "What scales with total vs. active experts?",
      "answer": "The number of stored parameters and model capacity grow mainly with the total number of experts. Compute work per token and the immediately used expert activations scale primarily with TopK, i.e., the number of actually active experts; communication and load balancing add additional system costs."
    },
    "moe-capacity": {
      "cat": "Architecture",
      "title": "MoE Expert Capacity",
      "read": "Spread all Token-to-Expert assignments evenly across the Experts, multiply by the desired reserve, and round up to whole slots.",
      "purpose": "Defines an explicit slot budget for every Expert and routing group.",
      "dims": "T, k, E, and C_expert are counts; c_f is dimensionless.",
      "vars": [["C_expert","Maximum number of reserved Token slots per Expert in this routing group"],["T","Number of Tokens in the routing group"],["k","Number of Experts selected per Token"],["E","Total number of Experts"],["c_f","Capacity Factor: reserve multiplier above the uniform average load"],["⌈·⌉","Round upward to the next whole number"]],
      "intuition": "T·k assignments are ideally spread uniformly across E Experts; reserve capacity absorbs load variation.",
      "pitfall": "Do not silently discard overflow or confuse it with parameter capacity; the concrete overflow rule belongs to the semantics.",
      "example": "T=12 Tokens each select k=2 Experts, creating 24 assignments. With E=4 Experts, the uniform average is 24/4=6 per Expert. For c_f=1, C_expert=⌈1·12·2/4⌉=⌈6⌉=6 slots.",
      "check": "With eight assignments and capacity six, how many enter overflow?",
      "answer": "With capacity six and eight incoming assignments, two are in overflow. The implementation must explicitly define whether it drops them, reroutes them, or processes them with a variable-capacity sparse operation."
    },
    "moe-balance": {
      "cat": "Architecture",
      "title": "MoE Auxiliary Balance Loss",
      "read": "For every Expert, multiply its actual assignment fraction by its average Router probability, add those products, and weight the sum.",
      "purpose": "Provides gradient pressure against persistently over- or under-utilized Experts.",
      "dims": "f_i and P_i are fractions or probabilities; L_bal is a scalar auxiliary loss.",
      "vars": [["L_bal","Additional scalar load-balancing Loss"],["i","Index of one Expert"],["f_i","Fraction of Tokens hard-routed to Expert i"],["P_i","Mean soft Router probability for Expert i"],["E","Total number of Experts"],["α_bal","Weight of this auxiliary Loss relative to the Language-Model Loss"],["Σ_i","Add the contribution from every Expert"]],
      "intuition": "When the same Expert receives both many hard assignments and consistently high Router probability, its product f_iP_i and therefore the auxiliary Loss increase.",
      "pitfall": "The displayed equation is the Top-1 variant; do not confuse it with Router z-loss or a guarantee of perfect uniformity.",
      "example": "Two Experts have f=[0.75,0.25] and P=[0.60,0.40], with α_bal=0.01. The sum is 0.75·0.60+0.25·0.40=0.55. Thus L_bal=0.01·2·0.55=0.011. Uniform f=P=[0.5,0.5] would give 0.010.",
      "check": "What trade-off does an excessively large α_bal create?",
      "answer": "An excessively large α_bal can make the Router optimize primarily for even utilization although uneven specialization might improve the Language-Model loss. The coefficient trades systems utilization against routing quality and the primary objective."
    },
    "ring-allreduce": {
      "cat": "Parallelism",
      "title": "Ring All-Reduce Volume",
      "expr": "Bytes per Rank ≈ 2·(W−1)/W · M",
      "read": "Conceptually split the tensor into W equally sized chunks. Every Rank moves W−1 chunks during Reduce-Scatter and another W−1 during All-Gather.",
      "purpose": "Approximately how many Bytes must each participating process transfer during a Ring All-Reduce?",
      "dims": "M and the result are Byte counts per Rank; W is a process count within exactly the Process Group used for this operation.",
      "vars": [
        [
          "Bytes per Rank",
          "approximate amount of data sent or moved by one Rank"
        ],
        [
          "W",
          "number of Ranks in this specific All-Reduce Process Group"
        ],
        [
          "M",
          "size of the complete tensor being reduced, in Bytes"
        ],
        [
          "2",
          "two Ring phases: Reduce-Scatter first, then All-Gather"
        ],
        [
          "(W−1)/W",
          "fraction of M moved by one Rank in one phase through W−1 equally sized chunks"
        ]
      ],
      "intuition": "With more Ranks, each chunk becomes smaller. Per-Rank volume therefore approaches two tensor sizes instead of growing linearly with Rank count.",
      "pitfall": "The approximation omits startup latency, concrete network topology, and simultaneous send/receive details. W is the group size of this Collective, not automatically the whole job's World Size.",
      "example": "Four Ranks reduce a tensor with M=100 MB. One chunk is 100/4=25 MB. In each phase, every Rank moves W−1=3 chunks, or 75 MB. Two phases give 2·75=150 MB per Rank.",
      "check": "Why doesn't it grow linearly with W?",
      "answer": "The tensor is split into W chunks, and each rank moves only W−1 chunks of size M/W in each of the two ring phases. The total volume 2(W−1)M/W therefore approaches the constant value 2M for large W, rather than growing linearly with W."
    },
    "distributed-critical-path": {
      "cat": "Parallelism",
      "title": "Distributed Critical Path",
      "expr": "W_total=d·t·p   ·   B_global=B_micro·accum·d   ·   T_step≈T_compute+max(0,T_comm−T_overlap)",
      "read": "Multiply every Parallelism degree for process count, but only the Data-Parallel degree for different examples. Then add only the communication time that did not genuinely run concurrently.",
      "purpose": "How many processes and different examples participate, and which communication portion actually lengthens the Optimizer Step?",
      "dims": "d, t, p, and accum are dimensionless counts; B_global and B_micro count examples; every T quantity must use the same time unit.",
      "vars": [["W_total","total number of participating Ranks"],["d","Data-Parallel degree: number of groups processing different examples"],["t","Tensor-Parallel degree: number of Ranks sharing one Layer computation"],["p","Pipeline-Parallel degree: number of Stages processing the same examples in sequence"],["B_global","different examples per shared Optimizer update"],["B_micro","examples per Forward Pass and Data-Parallel group"],["accum","number of accumulated Microbatches before the update"],["T_step","estimated total duration of one training Step"],["T_compute","compute duration without uncovered communication"],["T_comm","total communication duration being modeled"],["T_overlap","part of T_comm that genuinely runs alongside independent Compute"],["max(0,…)","prevents reported overlap from making the Step artificially shorter than T_compute"]],
      "intuition": "Tensor- and Pipeline-Parallel Ranks share one example and therefore do not enlarge the data Batch. Asynchronous communication saves only the time that elapses alongside independent Compute before its first dependency.",
      "pitfall": "Do not substitute W_total for Data-Parallel degree. An async handle does not prove overlap; the Timeline, dependencies, and completed wait determine how much was hidden.",
      "example": "Let d=4, t=2, p=2, B_micro=2, and accum=4. Then W_total=4·2·2=16 Ranks, but B_global=2·4·4=32 examples. If Compute takes 100 ms, communication 40 ms, and 25 ms genuinely overlap, T_step≈100+max(0,40−25)=115 ms.",
      "check": "When does communication disappear entirely from the modeled critical path?",
      "aliases": "distributed world size global batch overlap critical path ddp process group",
      "answer": "When T_overlap is at least T_comm, max(0,T_comm−T_overlap)=0 and communication does not lengthen the modeled step. This requires genuine concurrency and a dependency that occurs only after communication completes; merely launching an async operation does not prove such overlap."
    },
    "pipeline-efficiency": {
      "cat": "Parallelism",
      "title": "Pipeline Bubble (Simplified 1F1B Model)",
      "read": "Compare the m useful Microbatch times with those times plus approximately p−1 extra times needed to fill and drain the Pipeline.",
      "purpose": "What fraction of simplified Pipeline time performs useful Microbatch work rather than paying the fixed Bubble?",
      "dims": "E is a ratio between 0 and 1; m and p are positive integer counts.",
      "vars": [
        [
          "E",
          "simplified Pipeline efficiency: useful time divided by total time"
        ],
        [
          "m",
          "number of Microbatches moving through the Pipeline in sequence"
        ],
        [
          "p",
          "number of Pipeline Stages"
        ],
        [
          "p−1",
          "simplified fill-and-drain overhead in Stage-time units"
        ],
        [
          "1F1B",
          "One Forward, One Backward: a Schedule that interleaves Forward and Backward work from different Microbatches after filling"
        ]
      ],
      "intuition": "The Bubble costs approximately a fixed number of Stage times. More Microbatches spread that fixed overhead across more useful work.",
      "pitfall": "The equation assumes equally fast Stages and a simplified Schedule. Communication, unequal Layer costs, and other Schedules change actual efficiency.",
      "example": "With m=8 Microbatches and p=4 Stages, approximately p−1=3 additional Bubble times occur. Total time is 8+3=11 units. Eight are useful, so E≈8/11=0.727≈73%.",
      "check": "What is the cost of very large m?",
      "answer": "Very large m reduces the relative pipeline bubble but generates more scheduling and communication operations. With a fixed global batch, individual microbatches become smaller and may underutilize matrix multiplications; with fixed microbatch size, batch size and latency increase instead."
    },
    "scaling-law": {
      "cat": "Scaling",
      "title": "Chinchilla-style Loss Model",
      "read": "Add a remaining baseline Loss, a contribution that falls with larger model size, and a contribution that falls with more training data.",
      "purpose": "How can one empirical curve describe whether model size or data volume limits the observed training Loss?",
      "dims": "L and E use the same Loss scale, usually nats per Token. N counts parameters and D counts Tokens. The units of A and B depend on the units chosen for N and D.",
      "vars": [
        [
          "L(N,D)",
          "Loss predicted by the Fit for model size N and data volume D"
        ],
        [
          "E",
          "remaining limit under this model when both bottlenecks become very large"
        ],
        [
          "N",
          "number of model parameters in one fixed unit"
        ],
        [
          "D",
          "number of training Tokens in one fixed unit"
        ],
        [
          "A",
          "fitted size of the parameter-limited Loss contribution"
        ],
        [
          "B",
          "fitted size of the data-limited Loss contribution"
        ],
        [
          "α",
          "positive exponent controlling how quickly the parameter contribution falls with N"
        ],
        [
          "β",
          "positive exponent controlling how quickly the data contribution falls with D"
        ]
      ],
      "intuition": "More parameters or more data shrinks only its corresponding extra term. Because both terms fall as powers, each additional doubling typically brings a smaller absolute gain.",
      "pitfall": "A, B, α, β, and E are estimated from comparable completed Runs; they are not laws of nature. Units, architecture, data, and training recipe must not change silently.",
      "example": "Pure numeric toy case in normalized units: E=1.5, A=0.8, B=0.6, α=β=1, N=2, and D=3. The parameter contribution is 0.8/2=0.4 and the data contribution is 0.6/3=0.2, so L=1.5+0.4+0.2=2.1. Doubling only N to 4 lowers L to 1.5+0.2+0.2=1.9.",
      "check": "What happens for N,D→∞?",
      "answer": "For positive exponents, A/N^α and B/D^β vanish as N and D approach infinity. The modeled loss limit is therefore the irreducible term E."
    },
    "isoflops": {
      "cat": "Scaling",
      "title": "IsoFLOPs Condition",
      "read": "Divide fixed training budget C by six and by the chosen parameter count N; the result is the approximately affordable Token count D.",
      "purpose": "How many training Tokens may a model of one chosen size see when every compared Run receives the same Compute budget?",
      "dims": "C is a count of Floating-Point Operations, N a parameter count, and D a Token count. Factor 6 comes from the same rough dense training-Compute approximation.",
      "vars": [
        [
          "D",
          "approximately affordable number of training Tokens for this Run"
        ],
        [
          "C",
          "fixed Compute budget in Floating-Point Operations (FLOPs)"
        ],
        [
          "6",
          "approximation factor for Forward and Backward per parameter and Token"
        ],
        [
          "N",
          "chosen number of model parameters"
        ]
      ],
      "intuition": "Under the same budget, a small model can process many Tokens. A larger model costs more per Token and must therefore train on fewer Tokens.",
      "pitfall": "Every Run must use the same FLOP convention. The equation is a planning approximation for dense Transformers, not an exact measure of runtime or hardware utilization.",
      "example": "Let C=600 billion FLOPs and N=10 million parameters. Then D=600,000,000,000/(6·10,000,000)=10,000 Tokens. Doubling N to 20 million at the same C leaves D=5,000 Tokens.",
      "check": "Why does a loss minimum typically arise along the profile?",
      "answer": "At very small N, the model is capacity-limited despite many affordable tokens; at very large N, too few training tokens remain due to D=C/(6N). Between these extremes, a compute-optimal compromise with minimal loss typically emerges."
    },
    "scaling-optimal-fit": {
      "cat": "Scaling",
      "title": "Compute-Optimal Power-Law Fit",
      "read": "Fit a line through valid IsoFLOPs minima in log space and transform the prediction back.",
      "purpose": "Extrapolates compute-optimal model size across multiple compute tiers.",
      "dims": "C and N must be positive in fixed documented units; a is dimensionless, while b depends on those units.",
      "vars": [["C","Training compute"],["N_opt","interior Loss minimum of a compute tier"],["a","slope or Scaling exponent"],["b","intercept in the chosen units"]],
      "intuition": "A multiplicative relationship N_opt∝Cᵃ becomes linear after taking logarithms.",
      "pitfall": "Fitting boundary minima or incomplete runs as true optima; the line may look precise while remaining systematically wrong.",
      "example": "C=[1,4,16] and N_opt=[10,20,40] million ⇒ a=0.5, b=log(10), so N_opt=10√C million.",
      "check": "Why should one tier be removed from the fit and then predicted?",
      "answer": "Leave-one-tier-out tests genuine interpolation or extrapolation: the fit does not see the removed minimum and must predict it from the remaining tiers. A small training error on the same fit points only demonstrates adaptation; it detects neither sensitive exponents nor systematic errors at new compute budgets."
    },
    "compute-optimal-predictions": {
      "cat": "Scaling",
      "title": "Compute-Optimal N, D & Loss Predictions",
      "expr": "N_opt=A_NCᵃ   ·   D_opt=A_DCᵇ   ·   L_opt=E+A_LC^(−γ)",
      "read": "Insert a new Compute budget C into three previously fitted power trends: one for model size, one for Token count, and one for Loss remaining above E.",
      "purpose": "Which model size, data volume, and Loss are predicted to be Compute-optimal at a new training budget?",
      "dims": "N and D are counts, C is Compute in one fixed unit, L and E share a Loss scale, and the exponents are dimensionless.",
      "vars": [["N_opt","predicted Compute-optimal parameter count"],["D_opt","predicted Compute-optimal number of training Tokens"],["L_opt","predicted Loss of the Compute-optimal configuration"],["C","new training-Compute budget in the same unit used during fitting"],["A_N","prefactor for N_opt fitted from measurements"],["A_D","prefactor for D_opt fitted from measurements"],["A_L","prefactor for the still-scalable Loss contribution"],["a","positive exponent for growth of optimal model size"],["b","positive exponent for growth of optimal Token count"],["γ","positive exponent for decline of Loss above E"],["E","fitted or assumed limiting Loss"]],
      "intuition": "With a larger budget, optimal model size and data volume may grow while the still-improvable Loss contribution falls. All three trends must come from the same reliable Compute tiers.",
      "pitfall": "Do not set E to zero without evidence. a+b≈1 is a useful consistency check only when D was derived from the same C≈6ND relationship.",
      "example": "Toy Fit with normalized C=4: A_N=10 million and a=0.5 give N_opt=10·√4=20 million. A_D=100 million and b=0.5 give D_opt=100·√4=200 million. With E=1.5, A_L=0.4, and γ=0.5, L_opt=1.5+0.4/√4=1.7.",
      "check": "Why does an unknown offset E require a sensitivity analysis?",
      "aliases": "n opt d opt l opt offset scaling predictions exponent sum",
      "answer": "Different plausible values of E change the positive residual L_opt−E and therefore its logarithms, the fitted slope γ, and the extrapolated Loss curve. Because E and γ can be strongly coupled, E must be constrained or varied across a reported sensitivity range."
    },
    "mup-transfer": {
      "cat": "Scaling",
      "title": "Lecture 11 μP Role Scaling",
      "expr": "r=M/M₀: Emb var×1, lr×1   ·   Hidden var×1/r, lr×1/r   ·   Readout var×1/r², lr×1/r",
      "read": "In the Maximum Update Parametrization (μP) protocol covered here, first find the ratio of target width to base width. Then give each matrix role its separate variance and Adam Learning-Rate scaling.",
      "purpose": "When moving to a wider model, how must starting spread and Adam Learning Rate change for each matrix role?",
      "dims": "r is dimensionless; variance factors multiply base variance and learning-rate factors multiply the base Adam learning rate. Standard deviation is the square root of the variance factor.",
      "vars": [["M₀","width of the small base model on which Hyperparameters were chosen"],["M","width of the target model"],["r","width ratio M/M₀"],["Emb","Embedding matrix at model input"],["Hidden","matrices inside the wide hidden computation"],["Readout","output matrix from hidden state to Logits"],["var","multiplication factor for initialization variance"],["std","multiplication factor for standard deviation; the square root of var"],["lr","multiplication factor for Adam Learning Rate"]],
      "intuition": "The three matrix roles collect and distribute width-dependent contributions differently. One global scaling rule cannot keep all their activations and updates comparable at once.",
      "pitfall": "This role table belongs to the specific Lecture-11 μP protocol and does not automatically cover other Optimizers, depth scaling, or differently defined parameter roles. Do not confuse variance with standard deviation.",
      "example": "The base model has M₀=128 and the target model M=512, so r=512/128=4. Embedding stays at var×1 and lr×1. Hidden uses var×1/4, therefore std×1/2, and lr×1/4. Readout uses var×1/16, therefore std×1/4, and lr×1/4.",
      "check": "Why is the Readout standard-deviation factor 1/r rather than 1/r²?",
      "aliases": "mup maximum update parametrization width transfer initialization adam learning rate wsd",
      "answer": "The formula specifies Readout variance with factor 1/r². Standard deviation is the square root of variance, so sqrt(1/r²)=1/r for positive width ratio r. Using 1/r² as the standard deviation would incorrectly scale variance by 1/r⁴."
    },
    "ngram-filter": {
      "cat": "Data",
      "title": "n-gram Maximum Likelihood & Backoff",
      "read": "An n-gram is a contiguous Sequence of n Tokens. Count how often next Token w followed previous context h, then divide by all observed continuations of that context.",
      "purpose": "How can simple counts estimate which Token is likely to come next after a short context?",
      "dims": "p(w|h) is a dimensionless number between 0 and 1; all count values are non-negative integer counts.",
      "vars": [
        ["p(w|h)", "Estimated conditional probability that w appears next when context h is known"],
        ["w", "Next Token whose probability is being calculated"],
        ["h", "History consisting of the previous n−1 Tokens"],
        ["|", "Means ‘conditioned on’: h is given and w is predicted"],
        ["count(·)", "Counting operator returning how often the enclosed pattern occurs in the training corpus"],
        ["count(h,w)", "Number of cases in which exactly w immediately follows h"],
        ["count(h)", "Number of all observed occurrences of h with any continuation"],
        ["/", "Divides matching continuations by all continuations of the context"]
      ],
      "intuition": "Local counts become conditional Next-Token probabilities; their product, or equivalently the sum of their Log-Probabilities, scores the complete text.",
      "pitfall": "Pure Maximum Likelihood gives unseen n-grams probability zero. Kneser-Ney discounts observed counts and backs off to shorter contexts whose continuation statistics remain informative.",
      "example": "In the corpus, h=‘the cat’ occurs count(h)=10 times. It is followed by w=‘sits’ exactly count(h,w)=3 times. Substitution gives p(‘sits’|‘the cat’)=3/10=0.3, or 30 percent.",
      "check": "Why does a practical n-gram model need Smoothing or Backoff?",
      "answer": "Without Smoothing, one unseen n-gram receives probability zero, making the likelihood of the entire document zero regardless of every other prediction. Backoff and Kneser-Ney redistribute probability mass so unseen continuations remain possible while informative lower-order context still influences the estimate."
    },
    "fasttext-filter": {
      "cat": "Data",
      "title": "fastText Bag-of-n-Grams Classifier",
      "read": "Split text into short contiguous Token or Character Sequences, map them to fixed storage buckets, average their numerical vectors, and calculate class probabilities.",
      "purpose": "How can a very large text collection be classified quickly by language, quality, or topic without storing every possible Character Sequence separately?",
      "dims": "E has Shape [B,H], h Shape [H], U Shape [K,H], and p Shape [K]: B storage buckets, H numbers per vector, and K possible classes.",
      "vars": [
        ["x", "Document being classified"],
        ["h(x)", "Average Feature vector calculated from the Document"],
        ["L", "Number of n-grams extracted from x"],
        ["i", "Current index from 1 through L"],
        ["gᵢ", "n-gram with index i, a short contiguous Word or Character Sequence"],
        ["hash(gᵢ)", "Deterministic integer calculated from gᵢ"],
        ["mod B", "Remainder after division by B, turning the hash number into a valid index from 0 to B−1"],
        ["B", "Fixed number of available hash storage buckets"],
        ["E[j]", "Learned numerical vector in storage bucket j"],
        ["Σᵢ and 1/L", "Σ adds the L selected vectors; 1/L divides their sum by their count to form the average"],
        ["y", "One possible Output class, such as a language"],
        ["p(y|x)", "Probability of class y conditioned on the given Document x"],
        ["|", "Means ‘conditioned on’"],
        ["U", "Learned matrix mapping h to one raw score per class"],
        ["b", "Learned added value for each class"],
        ["softmax(·)", "Jointly converts all class scores into positive probabilities whose sum is 1"],
        ["H", "Number of values in each Feature vector"],
        ["K", "Number of possible classes"]
      ],
      "intuition": "The average is fast and mostly order-insensitive; the classifier learns which hashed local patterns distinguish the labels.",
      "pitfall": "Hash collisions force unrelated features to share parameters, and the output score inherits both the bias and the label definition of the training data.",
      "example": "Set L=2 and B=3. For g₁ let hash(g₁)=3, so 3 mod 3=0; for g₂ let hash(g₂)=5, so 5 mod 3=2. With E[0]=[2,0] and E[2]=[0,2], h(x)=([2,0]+[0,2])/2=[1,1]. Set U=[[1,0],[0,2]] and b=[0,0]. Then Uh+b=[1,2] and softmax([1,2])≈[0.269,0.731]. Result: class 2 receives the higher probability, 73.1 percent.",
      "check": "Why does memory remain bounded despite the enormous number of possible n-grams?",
      "answer": "The Hashing Trick maps every possible n-gram into one of a fixed number B of buckets, so the embedding table has only B rows. New n-grams reuse these rows rather than extending the vocabulary, at the cost of deliberate collisions and shared parameters."
    },
    "importance-resampling": {
      "cat": "Data",
      "title": "DSIR Importance Resampling",
      "read": "Divide target density by raw density and normalize those ratios into resampling probabilities.",
      "purpose": "Data Selection via Importance Resampling (DSIR) shifts a raw corpus toward a target distribution without merely sorting by target likelihood.",
      "dims": "w and w̃ are dimensionless; the normalized weights sum to one across candidates.",
      "vars": [
        ["p_T", "Estimated target density on the shared features"],
        ["p_R", "Estimated raw or proposal density"],
        ["w(x)", "Unnormalized Importance Weight"],
        ["w̃ᵢ", "Normalized selection probability"]
      ],
      "intuition": "A target-like pattern receives especially high weight when it is relatively rare in the raw corpus.",
      "pitfall": "Missing or tiny raw support creates undefined or extreme weights, so Smoothing and Log-Space arithmetic are needed. Taking top k by w is not probabilistic resampling.",
      "example": "A: .30/.60=.5; B: .20/.10=2, so B has four times the ratio despite lower p_T.",
      "check": "Why can DSIR select B more often even when p_T(B)&lt;p_T(A)?",
      "answer": "DSIR compares target density with raw density rather than using target density alone. For B, .20/.10=2, while for A, .30/.60=.5, so B's density ratio is four times A's. B is therefore more target-specific relative to the proposal corpus and receives a larger normalized resampling probability."
    },
    "bloom-filter": {
      "cat": "Data",
      "title": "Bloom Filter: False-Positive Rate (FPR) & Optimal k",
      "read": "First estimate the fraction of bits that are one after all insertions. Then raise that fraction to k: an absent query is falsely positive only when all k tested bits happen to be one.",
      "purpose": "Answers the planning question: how much memory and how many Hash Functions does a Bloom Filter need for a given number of inserted keys?",
      "dims": "m, n, and k are positive counts; f and FPR are ratios between zero and one.",
      "vars": [
        ["m","Number of bits in the Bit Array"],
        ["n","Number of inserted elements"],
        ["k","Number of Hash Functions per insertion and query"],
        ["kn","Total bit positions set, approximately, including repeated positions"],
        ["f","Theoretical probability of a False Positive"],
        ["FPR","False-Positive Rate: fraction of actually negative queries reported as positive"],
        ["e","Euler's number, approximately 2.718; base of the exponential function"],
        ["ln","Natural logarithm"],
        ["≈","Approximation rather than exact equality"],
        ["k*","Real-valued optimum; compare nearby integer k values in practice"],
        ["FP, TN","False Positives and True Negatives in measured FPR=FP/(FP+TN)"]
      ],
      "intuition": "More hashes initially make a positive query harder, but every insertion also sets more bits. Too many hashes fill the array and worsen the rate again.",
      "pitfall": "A positive result means only ‘possibly present’; only a negative result is conclusive. The formula assumes approximately uniform, independent hashes, so real FPR must be measured with keys that were never inserted.",
      "example": "Miniature picture: in an 8-bit array, one key sets bits 2 and 6 through two hashes. A different query checks bit 2 and still-zero bit 5, so it is definitely absent. Numerical case: m=100 and n=10 give k*=(100/10)·ln2≈6.93, so test k=7. The approximation gives f≈(1−e^(−0.7))^7≈0.0082, or about 0.82% False Positives among negative queries.",
      "check": "What does a positive query result mean compared with a negative result?",
      "answer": "A negative result means at least one required bit is zero, so the queried key was definitely not inserted under the standard no-deletion contract. A positive result means only that every bit is one; other inserts may have set them collectively, producing a possible False Positive."
    },
    "logistic": {
      "cat": "Data",
      "title": "Logistic Probability",
      "read": "First calculate a weighted raw score from the Document Features, then turn it into a number between 0 and 1.",
      "purpose": "How do several measurable Features become a probability that a Document belongs to a chosen class?",
      "dims": "x and w are equally long vectors; wᵀx+b is a scalar and p(y=1|x) is a dimensionless probability between 0 and 1.",
      "vars": [
        [
          "p(y=1|x)",
          "Estimated probability of the positive class when Features x are given"
        ],
        [
          "y=1",
          "Definition that class 1 is treated as the positive target class"
        ],
        [
          "|",
          "Means ‘conditioned on’: x is known"
        ],
        [
          "x",
          "Vector of measured Document Features"
        ],
        [
          "w",
          "Vector of learned weights with exactly the same length as x"
        ],
        [
          "wᵀx",
          "Dot product: multiply matching entries of w and x and add all products; ᵀ denotes the transposed notation used for this product"
        ],
        [
          "b",
          "Learned constant added value, also called Bias"
        ],
        [
          "σ(·)",
          "Sigmoid function mapping any real raw score into the range from 0 to 1"
        ],
        [
          "e",
          "Euler's number, approximately 2.718, used as the base of the exponential function"
        ],
        [
          "−(wᵀx+b)",
          "Negative sign applied to the complete raw score in the exponent"
        ],
        [
          "1/(1+…)",
          "Explicit calculation form of the Sigmoid function"
        ]
      ],
      "intuition": "Large positive scores mean high class probability.",
      "pitfall": "Calibration and threshold are separate questions.",
      "example": "Set x=[2,1], w=[1,−1], and b=0. The raw score is wᵀx+b=1·2+(−1)·1+0=1. Therefore p(y=1|x)=1/(1+e⁻¹)≈1/(1+0.368)=0.731. The model reports 73.1 percent for class 1.",
      "check": "What does a stricter threshold change in Precision/Recall?",
      "answer": "A stricter, i.e., higher threshold classifies fewer examples as positive. Recall cannot increase and usually decreases, while precision often increases because weaker positive scores are excluded; however, a precision increase is not guaranteed without assumptions about score quality."
    },
    "precision-recall": {
      "cat": "Evaluation",
      "title": "Precision & Recall",
      "read": "Precision divides correct positive reports by all positive reports. Recall divides those same correct reports by all cases that are actually positive.",
      "purpose": "How reliable are a filter's positive reports, and what fraction of all truly relevant cases does it find?",
      "dims": "Precision and Recall are ratios between 0 and 1, or 0 and 100 percent; TP, FP, and FN are case counts.",
      "vars": [
        [
          "positive class",
          "the event explicitly defined as positive, such as ‘personally identifiable information is present’"
        ],
        [
          "Precision",
          "fraction of correct cases among all positive reports"
        ],
        [
          "Recall",
          "fraction of detected cases among all actually positive cases"
        ],
        [
          "TP",
          "True Positives: cases that are actually positive and correctly detected"
        ],
        [
          "FP",
          "False Positives: actually negative cases incorrectly reported as positive"
        ],
        [
          "FN",
          "False Negatives: actually positive cases that were missed"
        ]
      ],
      "intuition": "Precision examines the quality of the returned list; Recall examines its completeness. Both use TP, but their denominators answer different questions.",
      "pitfall": "Define the positive class before calculating. In a data filter, either ‘remove’ or ‘keep’ may be positive; without that choice, the meaning of every error reverses.",
      "example": "Define ‘PII is present’ as positive; PII means Personally Identifiable Information. Among 10 PII documents, the filter detects 8 and misses 2: TP=8 and FN=2. It also flags 2 clean documents incorrectly: FP=2. Precision=8/(8+2)=0.8 and Recall=8/(8+2)=0.8.",
      "check": "Which error is riskier for PII?",
      "answer": "If \"positive\" means personally identifiable information (PII) is detected and removed, a False Negative is more critical for security: the PII remains undetected in the dataset. A False Positive removes non-problematic data, primarily harming data quantity or quality."
    },
    "jaccard": {
      "cat": "Data",
      "title": "Jaccard Similarity",
      "read": "Count how many distinct elements the two sets share, then divide by the number of all distinct elements across both sets.",
      "purpose": "Measures how similar two documents are as sets of Shingles before deciding whether they are near-duplicates.",
      "dims": "J is a ratio from zero to one: zero means no shared elements and one means the same non-empty set.",
      "vars": [
        ["J(A,B)","Jaccard Similarity of sets A and B"],
        ["A, B","Two sets, such as the Word Bigrams of two documents"],
        ["n-gram","Sequence of n consecutive elements; an n=2 case is a Bigram"],
        ["Shingle","An n-gram used as one set element for comparison"],
        ["A∩B","Intersection: elements present in both A and B"],
        ["A∪B","Union: all distinct elements present in A or B"],
        ["|S|","Number of elements in set S"]
      ],
      "intuition": "The numerator counts shared content; the denominator prevents one match from looking overly important for large sets.",
      "pitfall": "Sets ignore how often a Shingle occurs. Normalization, capitalization, and Shingle size therefore change A and B before the formula runs. Two empty sets need an explicit implementation convention.",
      "example": "Document A gives the Bigrams {‘red fox’, ‘fox runs’}; document B gives {‘red fox’, ‘fox sleeps’}. They share one Bigram and have three distinct Bigrams in total, so J=1/3≈0.333.",
      "check": "When is J exactly 1?",
      "answer": "For sets with a non-empty union, J is exactly one if A and B contain the same elements, i.e., A=B. The special case of two empty sets requires an explicit convention because the formula yields 0/0."
    },
    "minhash": {
      "cat": "Data",
      "title": "MinHash Property",
      "read": "Order all possible Shingles with the same random Hash order. Compare the smallest Shingle in A with the smallest in B. Across many independent orders, the fraction of matching minima approximates Jaccard Similarity.",
      "purpose": "Estimates Jaccard Similarity without comparing the complete Shingle sets for every document pair.",
      "dims": "Both sides are probabilities or ratios between zero and one.",
      "vars": [
        ["P[... ]","Probability of the event inside the brackets"],
        ["A, B","Two Shingle sets"],
        ["h_min(A)","Element of A with the smallest value under one shared random Hash order"],
        ["h_min(B)","Corresponding minimum of B under that same order"],
        ["J(A,B)","Exact Jaccard Similarity of A and B"]
      ],
      "intuition": "The smallest element of the union produces matching minima exactly when it belongs to the intersection.",
      "pitfall": "One MinHash component gives only yes or no and is very noisy. A useful signature needs many approximately independent Hash orders, and both sets must use the same order for each component.",
      "example": "Let A={a,b} and B={b,c}. Under order b<a<c, both minima are b: a match. Under a<b<c, the minima are a and b: no match. Every order gives one such 0/1 component. If 80 of 100 independent components match, the signature estimates J≈80/100=0.8.",
      "check": "Why do we need independent hash orders?",
      "answer": "Independent hash orders provide approximately independent Bernoulli observations for whether the minima match. Their mean estimates Jaccard with decreasing variance; strongly correlated hash orders would contribute little additional information."
    },
    "lsh": {
      "cat": "Data",
      "title": "Locality-Sensitive Hashing (LSH): Candidate Probability",
      "read": "A band matches only when all r rows match. A document pair becomes a candidate as soon as at least one of the b bands matches completely.",
      "purpose": "Reduces expensive exact document comparisons by first retrieving similar MinHash signatures as candidates.",
      "dims": "s and P are ratios between zero and one; b and r are positive integers.",
      "vars": [
        ["P(candidate|s)","Probability of retrieval as a candidate pair at similarity s"],
        ["candidate","Pair that still requires exact verification"],
        ["s","Estimated Jaccard Similarity, or match probability of one signature row"],
        ["r","Rows per band; all r rows must match"],
        ["b","Number of bands; one matching band is enough"],
        ["sʳ","Probability that one specific band matches completely"],
        ["1−sʳ","Probability that this band does not match completely"],
        ["k=b·r","Total signature length split into b bands of r rows"]
      ],
      "intuition": "Within a band the rule is AND; across bands it is OR. Larger r makes each band stricter, while larger b creates more chances for at least one match.",
      "pitfall": "LSH produces candidates, not final duplicate decisions. Verify candidates with true Jaccard Similarity, and specify whether the threshold contract uses > or ≥.",
      "example": "Take s=0.8, r=2, and b=3. (1) One band matches with 0.8²=0.64. (2) It fails with 1−0.64=0.36. (3) All three bands fail with 0.36³≈0.047. (4) At least one band therefore matches with 1−0.047≈0.953, or about 95.3% candidate probability.",
      "check": "What does a larger r do?",
      "answer": "A larger r requires more matching signature rows within each band, making the candidate condition stricter. For 0<s<1, s^r decreases, thus reducing the candidate probability, which usually lowers recall and the number of candidates, but reduces false positives."
    },
    "accuracy-se": {
      "cat": "Evaluation",
      "title": "Accuracy & Standard Error",
      "read": "First calculate the fraction of correct answers. Then estimate how much that fraction could fluctuate from sampling a new, similarly sized set of independent tasks.",
      "purpose": "Is a small difference between two Benchmark Accuracies larger than their rough sampling uncertainty?",
      "dims": "Acc and SE are ratios or percentage points; k and n are case counts. The approximation assumes binary, approximately independent tasks.",
      "vars": [
        [
          "Acc",
          "Accuracy: observed fraction of correct answers"
        ],
        [
          "k",
          "number of correctly answered tasks"
        ],
        [
          "n",
          "total number of evaluated tasks"
        ],
        [
          "SE",
          "Standard Error of the estimated hit rate"
        ],
        [
          "1−Acc",
          "observed fraction of incorrect answers"
        ]
      ],
      "intuition": "Accuracy from finitely many tasks is one sample and would change somewhat on a new task set. More independent tasks make this random fluctuation smaller.",
      "pitfall": "SE is not a guarantee and does not include shared topic dependencies, Prompt changes, or Sampling variance. With very small n or extreme hit rates, this simple approximation is especially rough.",
      "example": "Out of n=100 tasks, k=50 are correct, so Acc=50/100=0.5. For Standard Error: Acc·(1−Acc)=0.5·0.5=0.25; 0.25/100=0.0025; its square root is SE=0.05, or about 5 percentage points.",
      "check": "How does quadrupling n affect the SE?",
      "answer": "If n is quadrupled, √n grows by a factor of two. The standard error, which is approximately proportional to 1/√n, therefore halves."
    },
    "sft-loss": {
      "cat": "Alignment",
      "title": "Supervised Fine-Tuning (SFT): Loss with Response Mask",
      "read": "Keep only the Log Probabilities of the desired response Tokens, negate them, add them, and divide by the number of those response Tokens.",
      "purpose": "Trains a pretrained Language Model to imitate desired responses without accidentally treating Prompt or Padding positions as response targets.",
      "dims": "The Loss is dimensionless. Mask mₜ is zero or one; numerator and denominator use the same positions.",
      "vars": [
        ["L_SFT","Mean SFT Loss over marked response Tokens"],
        ["x","Prompt used as context"],
        ["y","Desired response"],
        ["t","Position in the tokenized sequence"],
        ["yₜ","Correct response Token at position t"],
        ["y&lt;ₜ","Response Tokens before position t"],
        ["mₜ","Response Mask: one for a response Token to learn, otherwise zero"],
        ["πθ","Language Model as a probability distribution with parameters θ"],
        ["log πθ(...)","Log Probability of the correct Token; a less likely Token has a more negative value"],
        ["Σₜ mₜ","Number of unmasked response Tokens and therefore the averaging denominator"]
      ],
      "intuition": "The Prompt describes the task, but the Mask decides which target positions the model should imitate. The minus sign turns high target probability into low Loss.",
      "pitfall": "The Mask and shifted targets must refer to the same positions. In response-only SFT, Prompt, Template, and Padding Tokens belong in neither the sum nor the denominator.",
      "example": "Toy sequence with Mask [0,0,1,1]: only two response Tokens count. The model assigns them probabilities 0.5 and 0.25. (1) Negative Logs: −log0.5≈0.693 and −log0.25≈1.386. (2) Sum: 2.079. (3) Divide by two response Tokens: L_SFT≈1.040. The two masked Prompt positions contribute exactly zero.",
      "check": "When might one intentionally train on prompt tokens?",
      "answer": "Prompt tokens can be intentionally trained when the goal is not just response imitation, but to model the full conversation format or an entire text sequence. It must then be clearly documented that user and template content are also part of the learning objective."
    },
    "bradley-terry": {
      "cat": "Alignment",
      "title": "Bradley-Terry Preference Model",
      "read": "Subtract the rejected response's score from the preferred response's score. The Sigmoid function turns that difference into a probability between zero and one.",
      "purpose": "Lets a Reward Model learn which of two responses to the same Prompt is preferred.",
      "dims": "Reward scores are individual real numbers; P is a probability between zero and one.",
      "vars": [
        ["P(...)","Model-predicted preference probability"],
        ["x","Prompt shared by both responses"],
        ["y⁺","Preferred response"],
        ["y⁻","Rejected response"],
        ["≻","Is preferred over"],
        ["r(x,y)","Scalar output of the Reward Model for Prompt x and response y"],
        ["σ(z)","Sigmoid function 1/(1+e^(−z)); maps zero to 0.5"]
      ],
      "intuition": "The distance between the two scores matters, not their absolute height. A larger positive gap makes the observed preference more likely.",
      "pitfall": "Both responses must belong to the same Prompt. A Reward score is not a calibrated grade; the pair identifies only relative order.",
      "example": "For the same Prompt, y⁺ receives score 2 and y⁻ receives score 1. (1) Difference: 2−1=1. (2) Sigmoid: σ(1)=1/(1+e^(−1))≈0.731. The model therefore predicts about 73.1% probability for the observed preference. Equal scores would give difference zero and probability 0.5.",
      "check": "What happens when the same constant is added to both rewards?",
      "answer": "The common constant cancels out completely in (r⁺+c)−(r⁻+c). Therefore, reward difference, sigmoid probability, and Bradley-Terry loss remain unchanged."
    },
    "kl": {
      "cat": "Alignment",
      "title": "Kullback-Leibler (KL) Divergence",
      "read": "For every possible outcome, compare how much probability p and q assign to it. Weight the Log of their ratio by p(x), then add across all outcomes.",
      "purpose": "Measures, in one direction, how far a trained distribution p has moved from a reference distribution q.",
      "dims": "KL is dimensionless and non-negative. With the natural Logarithm, its unit is a Nat.",
      "vars": [
        ["D_KL(p||q)","Directed KL Divergence from p relative to q"],
        ["x","One possible outcome, such as a Token"],
        ["Σₓ","Add the contribution of every possible outcome x"],
        ["p(x)","Probability of x under the first distribution"],
        ["q(x)","Probability of the same x under the reference"],
        ["p(x)/q(x)","Probability ratio for x"],
        ["log","Natural Logarithm; log1=0"],
        ["Nat","Unit produced by the natural Logarithm"]
      ],
      "intuition": "A difference costs especially much when p often produces an outcome that q considers unlikely. Weighting by p also explains the direction.",
      "pitfall": "KL is not symmetric: D_KL(p||q) generally differs from D_KL(q||p). If p(x)>0 but q(x)=0, the contribution is infinite.",
      "example": "Two outcomes: p=(0.75,0.25) and q=(0.5,0.5). (1) First contribution: 0.75·log(0.75/0.5)=0.75·log1.5≈0.304. (2) Second: 0.25·log(0.25/0.5)=0.25·log0.5≈−0.173. (3) Sum: D_KL≈0.131 Nats.",
      "check": "Why can KL become infinite?",
      "answer": "KL(p||q) becomes infinite if there is an event with p(x)>0 but q(x)=0. Then the sum contains the positively weighted term log(p(x)/0)=+∞."
    },
    "rlhf-objective": {
      "cat": "Alignment",
      "title": "Reinforcement Learning from Human Feedback (RLHF): KL-Regularized Objective",
      "read": "Start with the average Reward of generated responses. Subtract a penalty that grows with deviation from a fixed Reference Policy.",
      "purpose": "Balances two goals: generate preferred responses more often and avoid moving the model uncontrollably far from its starting behavior.",
      "dims": "J, Reward, and β·KL must share a scale. KL is dimensionless; β converts it into the Reward scale.",
      "vars": [
        ["J(π)","Total objective value to maximize for the trained Policy"],
        ["E","Expectation: average across Prompts and sampled responses"],
        ["x","Prompt"],
        ["y","Response generated by the Policy"],
        ["π","Trained Policy that generates y and is updated"],
        ["π_ref","Fixed Reference Policy for the deviation comparison"],
        ["r(x,y)","Reward of complete response y to Prompt x"],
        ["D_KL(π||π_ref)","Directed deviation of the trained Policy from the Reference"],
        ["β","Weight of the KL penalty"]
      ],
      "intuition": "Reward pulls the Policy toward preferred responses; the Reference acts like an elastic band. β determines how strong that band is.",
      "pitfall": "β is not a universal value. Reward scaling, Token aggregation, and KL estimation change its effective strength. Too small makes Reward Hacking easier; too large prevents useful change.",
      "example": "Suppose mean Reward is 4, measured KL deviation is 0.5, and β=2. (1) KL penalty: 2·0.5=1. (2) Objective: J=4−1=3. With the same Reward but β=4, the penalty becomes 2 and J falls to 2, so the Policy is judged more conservatively.",
      "check": "Which risk increases with too small β?",
      "answer": "With too small β, the binding to the reference policy is weak, allowing the policy to aggressively exploit the reward proxy. This increases risks such as reward hacking, loss of language quality, mode collapse, and strong distributional drift."
    },
    "dpo": {
      "cat": "Alignment",
      "title": "Direct Preference Optimization (DPO): Loss",
      "read": "For each response, first measure how much the trained Policy raised or lowered it relative to the Reference. Then subtract the rejected response's change from the preferred response's change.",
      "purpose": "Trains directly on preferred and rejected response pairs without new On-Policy Rollouts or a separate Reward Model during DPO training.",
      "dims": "All four sequence Log Probabilities, the DPO Logit, and the Loss are dimensionless.",
      "vars": [
        ["L_DPO","DPO Loss to minimize"],
        ["x","Prompt shared by the pair"],
        ["y⁺","Preferred response"],
        ["y⁻","Rejected response"],
        ["πθ","Trained Policy with changeable parameters θ"],
        ["π_ref","Fixed Reference Policy"],
        ["log π(y|x)","Sum of Log Probabilities over the same response Tokens under one Policy"],
        ["β","Scale of the preference margin"],
        ["σ","Sigmoid function that turns the margin into a probability"],
        ["−log","Turns high probability of the observed preference into low Loss"]
      ],
      "intuition": "DPO does not ask only whether y⁺ is likely. It asks whether the trained Policy improved y⁺ relative to the base model more than it improved y⁻.",
      "pitfall": "All four values need the same Chat Template, response boundary, and Mask. Prompt, Padding, or inconsistent Template Tokens distort the margin; the Reference remains frozen.",
      "example": "Four Log Probabilities: Current chosen −1.0; Reference chosen −1.5; Current rejected −2.0; Reference rejected −1.8. (1) Chosen change: −1.0−(−1.5)=+0.5. (2) Rejected change: −2.0−(−1.8)=−0.2. (3) Margin: 0.5−(−0.2)=0.7. With β=1, σ(0.7)≈0.668 and L_DPO=−log0.668≈0.403.",
      "check": "Why are πθ log-probs alone not enough for this form?",
      "answer": "The reference log-probabilities measure how strongly the trained policy reorders the preferred against the rejected answer relative to the base model. Without them, exactly this KL-related comparison basis is missing; what would remain is a different pairwise policy objective, not the specified DPO loss."
    },
    "expected-reward": {
      "cat": "RL",
      "title": "Expected Reward: Mean Outcome",
      "read": "Draw Prompts from the task distribution, let the current Policy generate responses, score them, and take the long-run average of those Rewards.",
      "purpose": "States the basic objective of Reinforcement Learning from Verifiable Rewards (RLVR): the current Policy should produce successful responses more often on average.",
      "dims": "J has the same units as Reward; with binary Reward zero or one, J is a ratio from zero to one.",
      "vars": [
        ["J(θ)","Expected Reward of the model with parameters θ"],
        ["θ","All trainable model parameters"],
        ["E","Expectation: average across very many possible samples"],
        ["x","Sampled Prompt"],
        ["ρ","Distribution from which Prompts x are drawn"],
        ["y","Complete response sampled from the Policy"],
        ["πθ(.|x)","Current Policy's probability distribution over responses to x"],
        ["R(x,y)","Reward for response y to Prompt x"]
      ],
      "intuition": "The model creates its own training responses. When the Policy changes, the response distribution being averaged changes as well.",
      "pitfall": "The mean of one small Rollout Batch is only an estimate. A frozen response dataset is not automatically a sample from the new Policy after updates.",
      "example": "Four Rollouts receive binary Verifier Rewards [1,0,1,1]. (1) Sum: 3. (2) Divide by four Rollouts: 3/4=0.75. The estimated Expected Reward for this toy Batch is therefore 0.75, or a 75% success rate.",
      "check": "Over which two random sources is averaging done?",
      "answer": "Averaging is first over prompts x from the prompt distribution ρ and then over answers y sampled from the policy πθ(.|x). The random token decisions of an answer are contained in the random variable y."
    },
    "policy-gradient": {
      "cat": "RL",
      "title": "Policy Gradient",
      "read": "For each sampled response, the gradient of its Log Probability points toward parameter changes that would make that response more likely. Reward weights that direction, and the result is averaged across samples.",
      "purpose": "Produces a learning signal even when a discrete Verifier is not itself differentiable.",
      "dims": "∇θJ is not one scalar: it contains one gradient entry with the same shape as every parameter in θ.",
      "vars": [
        ["J","Expected Reward that we want to increase"],
        ["θ","Trainable model parameters"],
        ["∇θ","Gradient with respect to θ: direction of strongest local change"],
        ["E","Expectation or average across sampled Prompts and responses"],
        ["x","Prompt"],
        ["y","Sampled response"],
        ["R(x,y)","Observed Reward of that response"],
        ["πθ(y|x)","Probability of response y under the current Policy"],
        ["log","Natural Logarithm; turns a product of Token probabilities into a sum"],
        ["∇θ logπ","Gradient of Log Probability, also called the Score Function"]
      ],
      "intuition": "Reward is not differentiated. It is a weight for a differentiable quantity: the Log Probability of the response that was actually sampled.",
      "pitfall": "One Rollout gives a noisy gradient. In practice, Advantage often replaces raw Reward; its Baseline must not accidentally change the expected gradient.",
      "example": "A toy model has only two responses. Let θ=P(A)=0.25, R(A)=1, and R(B)=0. Then J(θ)=θ and directly dJ/dθ=1. With the Log trick, A contributes R·d logθ/dθ=1·(1/0.25)=4, but A is drawn with probability 0.25, so its expected contribution is 0.25·4=1. B has Reward zero and contributes zero. Both calculations give gradient one.",
      "check": "Where is ∇π=π∇logπ used?",
      "answer": "Start with ∇J=Σ p(x)∇πθ(y|x)R(x,y) and replace ∇πθ with πθ∇logπθ. The resulting factor πθ turns the sum back into an expectation over responses sampled from the policy."
    },
    "advantage": {
      "cat": "RL",
      "title": "Advantage & Baseline",
      "read": "Subtract the comparison value expected for this Prompt from the observed Reward of the response.",
      "purpose": "Says not only whether a response received Reward, but whether it was better or worse than expected for that particular Prompt.",
      "dims": "Reward R, Baseline b, and Advantage A share the same units.",
      "vars": [
        ["A(x,y)","Relative Advantage of response y for Prompt x"],
        ["x","Prompt"],
        ["y","Sampled response"],
        ["R(x,y)","Observed Reward of this response"],
        ["b(x)","Baseline: expected comparison value for the Prompt, independent of the sampled response"]
      ],
      "intuition": "A high absolute Reward can still be relatively poor when an easy task was expected to score even higher. Centering usually reduces noise across tasks of different difficulty.",
      "pitfall": "For the simple unbiasedness argument, the Baseline must not depend on the sampled response. It is treated as a fixed weight in the Policy Gradient rather than differentiated through the same Loss.",
      "example": "For Prompt x, let Baseline b(x)=10. Response y₁ receives R=9: A=9−10=−1, so it is worse than expected. Response y₂ receives R=12: A=12−10=+2, so it is better than expected. The zero point is the Baseline, not Reward zero.",
      "check": "Why does subtracting b not change the expected gradient?",
      "answer": "Since b(x) does not depend on the sampled response, E_y[b(x)∇logπθ(y|x)] = b(x)∇Σ_yπθ(y|x) = b(x)∇1 = 0. Thus, subtraction does not change the expected gradient but can reduce its variance."
    },
    "grpo-advantage": {
      "cat": "RL",
      "title": "Group Relative Policy Optimization (GRPO): Group Normalization",
      "read": "Generate several responses to the same Prompt. Subtract their group mean from each Reward, then divide the gap by the chosen group standard deviation.",
      "purpose": "Compares responses within the same task difficulty and replaces a separate learned Value Model with the local group.",
      "dims": "R, mean, and standard deviation share the Reward unit; after division, A is dimensionless.",
      "vars": [
        ["G","Number of responses in the same Prompt group"],
        ["i","Index of one response from one through G"],
        ["Rᵢ","Reward of response i"],
        ["R₁:G","List of all G Rewards in the group"],
        ["mean(R₁:G)","Arithmetic mean of the group Rewards"],
        ["std(R₁:G)","Chosen standard deviation of the group Rewards"],
        ["Aᵢ","Normalized group-relative Advantage of response i"],
        ["ε","Small positive number preventing division by zero"]
      ],
      "intuition": "The mean sets the local zero point. Standard deviation sets the scale: the same Reward gap counts more in a tightly clustered group than in a widely spread group.",
      "pitfall": "The convention is part of the algorithm. A5 implementation requires PyTorch's default torch.std with Bessel correction and denominator G−1; the lecture derivation also shows the population form with denominator G. Identical Rewards give every response a zero numerator and no relative signal.",
      "example": "A5 case with Rewards [1,0,0,1] and G=4: (1) Mean μ=0.5. (2) Sum of squared gaps: 4·0.5²=1. (3) Sample variance with G−1 is 1/3, so sample std≈0.577. (4) Reward one gives A=(1−0.5)/0.577≈+0.866; Reward zero gives A≈−0.866. Population std 0.5 would instead give ±1.",
      "check": "What happens with [1,1,1]?",
      "answer": "For rewards [1,1,1], the group mean is one and each centered advantage is zero, so there is no relative learning signal. The standard deviation is also zero and must be safeguarded by ε or a defined special case during normalization."
    },
    "grpo-variants": {
      "cat": "RL",
      "title": "GRPO Variants: Baseline, Normalization & Denominator",
      "expr": "A=(R−b)/(c+ε)   ·   loss=−Σ mask·A·logπ / Z",
      "read": "Ask three questions for every variant: which comparison value b is subtracted, what scale c divides the gap, and what denominator Z divides the Token contribution sum?",
      "purpose": "Makes visible which responses, Prompt groups, and response lengths different GRPO variants weight more or less strongly.",
      "dims": "R, b, and c share the Reward unit. A is dimensionless after division; Z is a Token count or a defined constant.",
      "vars": [["R","Reward of one response"],["b","Baseline: group mean or zero"],["c","Advantage normalizer: group std, another mean normalizer, or one"],["ε","Small protection term preventing division by zero"],["A","Response weight computed from Reward, Baseline, and normalizer"],["mask","Zero for Prompt/Padding and one for valid response Tokens"],["logπ","Log Probability of the stored response Token under the trained Policy"],["Σ","Add the valid Token contributions"],["Z","Loss denominator: sequence length, global Token count, or fixed constant"],["loss","Negative Advantage-weighted Log-Probability Loss to minimize"]],
      "intuition": "Baseline determines the comparison, c determines the weight of Prompt groups with different spread, and Z determines the total weight of different response lengths.",
      "pitfall": "A variant comparison is interpretable only with identical Rollouts, Masks, Sampling, Batch, Token, and update budgets. Rejection Fine-Tuning (RFT) also selects only accepted samples; the name alone does not specify the algebra.",
      "example": "Toy response: R=1, b=0.5, c=0.5, and ε≈0, so A=1. Two valid Tokens have logπ −0.2 and −0.4. (1) Masked sum: 1·(−0.2−0.4)=−0.6. (2) With sequence denominator Z=2, Loss is −(−0.6)/2=0.3. (3) With fixed Z=4, it is 0.15. A response with twice as many similar Token terms would be averaged again by a sequence mean, while an unchanged fixed denominator leaves the extra terms in its total weight.",
      "check": "Which design axis does a fixed denominator change relative to a sequence mean?",
      "aliases": "dr grpo rft maxrl constant denominator advantage normalization variants",
      "answer": "A sequence mean sets Z to the number of valid response tokens and therefore gives each response a similar outer weight regardless of length. A fixed denominator leaves the number of contributing tokens in the total weight, so longer responses exert more influence when token contributions are otherwise equal."
    },
    "gspo-ratio": {
      "cat": "RL",
      "title": "Sequence Importance & Group Sequence Policy Optimization (GSPO)",
      "expr": "W(y)=exp(Σ_t∈resp Δlogπ_t)   ·   s_GSPO(y)=exp((1/n_y)Σ_t∈resp Δlogπ_t)",
      "read": "For every response Token, calculate the difference between Current and Old Log Probability. Add all differences for exact sequence weight; GSPO averages them before exponentiating.",
      "purpose": "Compares exact but length-sensitive Off-Policy correction of a complete response with a more stable GSPO Surrogate.",
      "dims": "W and s_GSPO are positive dimensionless factors. n_y is a Token count; Δlogπ is the Logarithm of a probability ratio.",
      "vars": [["y","Complete sampled response"],["resp","Set of unmasked response-Token positions"],["t","One response-Token position"],["π_current","Current Policy during the update"],["π_old","Policy that generated the Rollout"],["Δlogπ_t","logπ_current−logπ_old for stored Token t"],["Σ","Add across all valid response Tokens"],["exp","Exponential function; turns summed Log Ratios back into a product of Ratios"],["n_y","Number of valid response Tokens"],["W(y)","Exact Importance Weight of the complete response"],["s_GSPO(y)","Geometric mean of Token Ratios used as one response factor"]],
      "intuition": "A product grows or shrinks with every extra Token. Averaging Log Ratios becomes a geometric mean after exp, damping this length effect while deliberately changing the estimator.",
      "pitfall": "GSPO and Token-local Ratios are not exact sequence corrections. Stored old_logprobs, Tokens, and Response Mask must not be recomputed after the Rollout.",
      "example": "Two response Tokens have Current/Old Ratios two and one. Their Log differences are log2 and log1=0. (1) Exact: W=exp(log2+0)=2. (2) GSPO: s=exp((log2+0)/2)=√2≈1.414. GSPO therefore uses 1.414 instead of two as the shared response factor, reducing length dependence.",
      "check": "When are W and s_GSPO both one despite their different definitions?",
      "aliases": "gspo sequence importance weight geometric mean old logprobs response mask",
      "answer": "Both factors are one when the sum of response Log Ratios is zero. This holds in particular when Current and Old Policy agree on every stored token, but it can also occur when positive and negative Log Ratios cancel exactly across the response."
    },
    "importance-ratio": {
      "cat": "RL",
      "title": "Importance Ratio: Current versus Old Policy",
      "read": "Divide today's probability of the stored Token action by exactly the probability with which the Rollout Policy generated it.",
      "purpose": "Measures how representative an old sampled action remains for the Current Policy.",
      "dims": "ρ is a positive dimensionless factor: one means unchanged probability, above one means an increase, and below one a decrease.",
      "vars": [
        ["ρₜ(θ)","Importance Ratio for Token position t under Current parameters θ"],
        ["θ","Current model parameters"],
        ["sₜ","State before Token t: Prompt plus preceding Tokens"],
        ["aₜ","Token sampled at the time"],
        ["π_old(aₜ|sₜ)","Probability during the original Rollout"],
        ["πθ(aₜ|sₜ)","Probability of the same Token under the Current Policy"],
        ["logπθ−logπ_old","Difference between the two Log Probabilities"],
        ["exp","Exponential function that turns the Log difference back into a ratio"]
      ],
      "intuition": "If the Current Policy would generate the stored Token more often, its factor exceeds one; if less often, the factor is below one.",
      "pitfall": "The denominator must come from exactly the Policy version that sampled the Token. Recomputed old_logprobs destroy the correction; large Ratios create high variance.",
      "example": "The Old Policy gave the stored Token probability 0.20 and the Current Policy gives 0.30. (1) Directly: ρ=0.30/0.20=1.5. (2) In Log space: log0.30−log0.20≈0.405; exp(0.405)≈1.5. The sample is therefore weighted by factor 1.5.",
      "check": "Why must old log probabilities be stored?",
      "answer": "The importance ratio needs the denominator probability under exactly the policy that generated the sample. After an update, that probability cannot be reconstructed from the new policy; recomputing the supposedly ‘old’ log probabilities with the new policy would produce an incorrect ratio, potentially exactly 1."
    },
    "ppo-clip": {
      "cat": "RL",
      "title": "Proximal Policy Optimization (PPO): Clipped Surrogate",
      "read": "Calculate the free Ratio contribution and the same contribution with Ratio limited to 1−ε through 1+ε. Choose the more pessimistic value and negate it for a Loss that is minimized.",
      "purpose": "Limits the incentive for very large Policy changes when old Rollouts are reused.",
      "dims": "ρ and ε are dimensionless; A and L use the Reward or Advantage scale.",
      "vars": [
        ["L","PPO Surrogate Loss to minimize"],
        ["ρ","Importance Ratio between Current and Old Policy"],
        ["A","Advantage of the stored action or response"],
        ["ε","Half-width of the allowed Ratio interval around one"],
        ["clip(ρ,1−ε,1+ε)","Limits ρ to the lower or upper boundary"],
        ["min(u,v)","Chooses the smaller of the two Objective contributions"],
        ["−","Turns the maximized Surrogate into a minimized Loss"]
      ],
      "intuition": "PPO does not keep rewarding an already greatly increased probability for a good action. The opposite Ratio side matters for bad actions, so the sign of A is essential.",
      "pitfall": "Clipping is not exact Importance correction; it deliberately trades Bias for stability. Do not clip ρ without regard to sign and remove the min comparison.",
      "example": "Positive case: A=2, ρ=1.4, and ε=0.2. (1) Free contribution: ρA=1.4·2=2.8. (2) Clipped ρ is 1.2, so contribution is 1.2·2=2.4. (3) min chooses 2.4; Loss is −2.4. Increasing ρ beyond 1.2 no longer improves this term.",
      "check": "What happens with negative A and very small ρ?",
      "answer": "For A<0 and ρ<1−ε, the minimum selects the clipped term (1−ε)A because the negative sign reverses magnitude. Further decreasing the probability of this bad action is thus not additionally rewarded and provides no further gradient incentive in this region."
    }
  },
  "formulaRefs": {
    "matmul": "A1 p. 17–18",
    "parameter_init": "A1 p. 17 (§3.3.1)",
    "rmsnorm": "A1 p. 19–20 · L3 p. 14",
    "swiglu": "A1 p. 21–22 · L3 p. 18, 21–23",
    "rope": "A1 p. 22–23 · L3 p. 30–34",
    "softmax": "A1 p. 23–24 · L6 p. 33–34",
    "attention": "A1 p. 24",
    "causal_attention": "A1 p. 24–26",
    "residual": "A1 p. 42–43",
    "cross_entropy": "A1 p. 28–29",
    "perplexity": "L12 p. 6 · L14 p. 2–3",
    "next_token_batch": "A1 p. 34–35 (§5.1)",
    "adamw": "A1 p. 31–32",
    "cosine_lr": "A1 p. 33–34",
    "gradient_clip": "A1 p. 33–34",
    "training_flops": "L2 p. 2, 9–11 · A3 p. 2",
    "online_softmax": "A2 p. 24–25 · L5 p. 46–50",
    "flash_backward": "A2 p. 28–29 · L5 p. 46–50",
    "triton_grid_mask": "L6 p. 19–20 · A2 p. 17–20",
    "roofline": "L5 p. 20 · L6 p. 3",
    "mfu": "L2 p. 10",
    "ring_allreduce": "A2 p. 40",
    "distributed_critical_path": "L8 p. 4–11 · A2 p. 40–44",
    "kv_cache": "L10 p. 6–7 · L3 p. 55–58",
    "inference_params_gqa": "L10 p. 6–7",
    "mlp_arithmetic_intensity": "L10 p. 5",
    "attention_arithmetic_intensity": "L10 p. 6",
    "decode_bandwidth": "L10 p. 7",
    "ssm_recurrence": "L10 p. 11–12",
    "diffusion_generation": "L10 p. 12",
    "z_loss": "L3 p. 54–55 · L4 p. 35–36",
    "logit_soft_cap": "L3 p. 57",
    "moe_capacity": "L4 p. 34",
    "moe_balance": "L4 p. 28–29",
    "pipeline_efficiency": "L7 p. 31",
    "transformer_params": "A3 p. 8",
    "transformer_ledger": "A1 p. 27–28 · L2 p. 8–12",
    "isoflops": "A3 p. 2",
    "scaling_optimal_fit": "L9 p. 14–18 · L11 p. 4–9 · A3",
    "compute_optimal_predictions": "L11 p. 17–36 · A3",
    "mup_transfer": "L11 p. 42–45 · A3",
    "ngram_filter": "L14 p. 2–3",
    "fasttext_filter": "L14 p. 3–4",
    "importance_resampling": "L14 p. 4–5",
    "bloom_filter": "L14 p. 10–11",
    "jaccard": "A4 p. 10–11 · L14 p. 12",
    "minhash": "A4 p. 10 · L14 p. 12",
    "lsh": "A4 p. 11 · L14 p. 13–14",
    "expected_reward": "A5 p. 7, 9",
    "policy_gradient": "A5 p. 9–10",
    "advantage": "A5 p. 10 · L17 p. 2–3",
    "grpo_advantage": "A5 p. 11–13 · L16 p. 30–36",
    "importance_ratio": "A5 p. 32–34",
    "grpo_variants": "A5 p. 16–31 · L16 p. 30–36",
    "gspo_ratio": "A5 p. 32–35 · L16 p. 30–36",
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
      "missions": [
        {
          "id": "text-tokenizer",
          "title": "Text Representation & Tokenizer",
          "scope": "unicode1 · unicode2 · train_bpe · train_bpe_tinystories · train_bpe_expts_owt · tokenizer · tokenizer_experiments",
          "derive": "Draw the complete round-trip chain str → UTF-8 bytes → token IDs → bytes → str. Then simulate two BPE merges by hand, including the tie-break rule and a Special-Token boundary.",
          "evidence": "You can explain an adversarial Unicode case, determine non-overlapping merges, prove reversibility, and identify the runtime and streaming state.",
          "failure": "First lead: Check whether characters, bytes, merge ranks, or pre-tokenization boundaries are being confused; compare the smallest possible corpus step by step.",
          "concepts": ["python-engineering", "unicode", "bpe", "tokenizer-tradeoffs"],
          "labs": ["bpe", "bpe-encode"]
        },
        {
          "id": "tensor-primitives",
          "title": "Tensor Primitives",
          "scope": "linear · embedding · rmsnorm · positionwise_feedforward · rope · softmax",
          "derive": "For each primitive, record the input axes, parameter Shape, initialization rule, reduction axis, output Shape, and one hand-computable case. Derive σ and the ±3σ bounds for one Linear Layer, then compute two A1 RoPE angles with adjacent pairs—without assembling the full model yet.",
          "evidence": "You can distinguish the exact Linear, Embedding, and RMSNorm initialization rules, justify arbitrary leading batch axes and Broadcasting, and test RoPE against its angle formula, adjacent Pairing, and shared non-persistent Buffer.",
          "failure": "First lead: If Shapes look correct, inspect std versus variance, A1 Pairing versus Half-Split, reduction axes, Parameter/Buffer registration, and unintended Broadcasting separately.",
          "concepts": ["pytorch-tensors", "pytorch-state", "shapes", "einsum-notation", "parameter-initialization", "rmsnorm", "swiglu", "rope"],
          "labs": ["pytorch-debugger", "shapes", "einsum-pattern", "rope-rotation", "norm-and-ffn"]
        },
        {
          "id": "attention-lm",
          "title": "Attention, Block & Complete LM",
          "scope": "scaled_dot_product_attention · multihead_self_attention · transformer_block · transformer_lm · transformer_accounting",
          "derive": "Maintain a Shape Ledger from token_ids [B,T] to logits [B,T,V], marking exactly where positions are mixed, features are mixed, Heads are separated, and future positions are excluded.",
          "evidence": "You can derive non-square Query/Key lengths, mask Broadcasting, the QKV Head split, Residual paths, and parameter and FLOP terms without trial and error.",
          "failure": "First lead: Test causal invariance—a change to a future token must not alter earlier logits—and then isolate the first failing Block.",
          "concepts": ["attention", "causal-mask", "transformer-block", "resource-accounting", "transformer-ledger", "einsum-notation"],
          "labs": ["attention", "shapes", "resources", "transformer-ledger", "einsum-pattern"]
        },
        {
          "id": "optimization",
          "title": "Loss, AdamW & Schedule",
          "scope": "cross_entropy · learning_rate_tuning · adamw · adamw_accounting · learning_rate_schedule · gradient_clipping",
          "derive": "Work through a scalar two-step optimization example by hand, including moments, Bias Correction, decoupled Weight Decay, and the Schedule boundaries.",
          "evidence": "You can test Loss reduction, global Gradient Clipping, Optimizer state, and Step indexing at boundary values and state the expected update direction.",
          "failure": "First lead: Log the Loss value, gradient, clipped gradient, adaptive Adam term, Decay term, and current Learning Rate separately.",
          "concepts": ["cross-entropy", "adamw", "schedules", "clipping"],
          "labs": ["optimizer", "loss-and-clip"]
        },
        {
          "id": "training-state",
          "title": "Data, Training Loop & Checkpoint",
          "scope": "data_loading · checkpointing · training_together · experiment_log",
          "derive": "For a token array of length n and context m, derive the exclusive start-index range, X/Y slices, and their overlap invariant. Then draw the training step as a state machine and list the model, optimizer, scheduler, data, and random-number-generator (RNG) state required for an exact resume test.",
          "evidence": "You can verify dtype and vocabulary bounds for an np.memmap, form random [B,m] inputs and one-position-shifted targets without an off-by-one error, overfit a tiny batch, and reproduce the next loss and parameter state after save/reload.",
          "failure": "First lead: For bad batches, first check file format, dtype, n≥m+1, exclusive bound n−m, and Y_b[:-1]=X_b[1:] for every batch example b. For resume divergence, compare the next batch, update step, RNG, and optimizer moments—not just weights.",
          "concepts": ["token-array-loading", "pytorch-state", "training-loop", "sampling"],
          "labs": ["pytorch-debugger", "optimizer", "resources"]
        },
        {
          "id": "generation-experiments",
          "title": "Generation, Ablations & Main Run",
          "scope": "decoding · learning_rate · batch_size_experiment · generate · layer_norm_ablation · pre_norm_ablation · no_pos_emb · swiglu_ablation · main_experiment · leaderboard",
          "derive": "Before running anything, specify the hypothesis, control variable, budget, metric, and stopping criterion for Sampling, Learning Rate, Batch size, and every Ablation.",
          "evidence": "You can explain EOS, Temperature, and Top-p using toy logits, compare fair runs under documented compute, and infer more from learning curves than only the best final value.",
          "failure": "First lead: If a comparison is ambiguous, first check for unequal tokens, seeds, evaluation protocols, Checkpoints, or multiple variables changed at once.",
          "concepts": ["sampling", "training-loop", "benchmark-validity"],
          "labs": ["attention", "evaluation"]
        }
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
      "missions": [
        {
          "id": "benchmark-profile",
          "title": "Benchmarking, Profiling & Mixed Precision",
          "scope": "benchmarking_script · nsys_profile · mixed_precision_accumulation · benchmarking_mixed_precision · memory_profiling",
          "derive": "Before measuring, design a protocol that specifies Warmup, synchronization boundaries, repetitions, quantiles, input shapes, and dtype. Then draw when memory is allocated, reserved, and released.",
          "evidence": "You can distinguish CPU dispatch time from GPU execution time, read a Profiler trace, and explain why changing dtype need not change Peak memory or runtime proportionally.",
          "failure": "First lead: For implausible timings, check synchronization and Warmup; for memory discrepancies, measure allocated and reserved memory, live tensors, and Autograd Saved Tensors separately.",
          "concepts": ["pytorch-tensors", "gpu-model", "profiling", "roofline"],
          "labs": ["roofline", "resources"]
        },
        {
          "id": "compile-checkpoint",
          "title": "Compilation & Activation Checkpointing",
          "scope": "gradient_checkpointing · pytorch_attention · torch_compile",
          "derive": "Mark which activations the Backward Pass needs in the computation graph, which may be discarded, and which Forward region is recomputed during Backward.",
          "evidence": "You can quantify and profile the memory-versus-recomputation trade-off, treat compilation Warmup separately, and verify correctness using both outputs and gradients.",
          "failure": "First lead: If Peak memory does not fall, look for the dominant tensor outside the checkpointed region or a reference that still keeps it alive.",
          "concepts": ["checkpointing", "profiling", "pytorch-state"],
          "labs": ["resources"]
        },
        {
          "id": "flash",
          "title": "Triton & FlashAttention",
          "scope": "flash_forward · flash_backward · flash_benchmarking",
          "derive": "Derive Block-wise Online Softmax for two Key tiles: the running maximum, rescaled exponential sum, and rescaled Value accumulator. Record shapes and boundary masks.",
          "evidence": "You can explain how exact Attention is computed without materializing the full T×T matrix in High Bandwidth Memory (HBM), test non-square and boundary shapes, and isolate Forward and gradient errors.",
          "failure": "First lead: Check tile indices, Strides, boundary masks, causal masks, and the rescaling of maxima and sums before tuning performance parameters.",
          "concepts": ["fusion-tiling", "triton-kernels", "kernel-contracts", "flash-attention", "profiling", "pytorch-tensors"],
          "labs": ["triton-tile", "kernel-contracts", "online-softmax-kata", "attention", "roofline"]
        },
        {
          "id": "collectives-ddp",
          "title": "Collectives, DDP & Overlap",
          "scope": "distributed_communication_single_node · naive_ddp · naive_ddp_benchmarking · minimal_ddp_flat_benchmarking · ddp_overlap_individual_parameters · ddp_overlap_individual_parameters_benchmarking · alternate_ring_all_reduce",
          "derive": "For two and four Ranks, draw a Timeline containing Forward, Backward, gradient-ready events, Collective start, handle wait, and Optimizer Step.",
          "evidence": "You can name the Rank, Process Group, World Size, tensor bytes, and critical path and prove that Overlap creates neither a race condition nor a premature Step.",
          "failure": "First lead: For hangs, compare the Collective order on every Rank; for incorrect gradients, check that every asynchronous handle finishes before the parameter update.",
          "concepts": ["distributed-runtime", "collectives", "ddp-zero-fsdp", "model-parallelism"],
          "labs": ["distributed-runtime", "parallelism"]
        },
        {
          "id": "sharding-fsdp",
          "title": "Optimizer Sharding & FSDP",
          "scope": "optimizer_state_sharding · optimizer_state_sharding_accounting · fsdp · fsdp_accounting",
          "derive": "Build an ownership table for parameters, gradients, and Optimizer state before Forward, during All-Gather, after Forward, during Backward, and after Reduce-Scatter.",
          "evidence": "You can distinguish persistent memory from transient Peak memory per Rank and justify every communication operation from the state missing locally.",
          "failure": "First lead: If the accounting looks too favorable, it usually omits a temporary full-parameter gather, Bucket, Prefetch, or unsharded state.",
          "concepts": ["ddp-zero-fsdp", "collectives", "resource-accounting"],
          "labs": ["parallelism", "resources", "comm-crossover"]
        },
        {
          "id": "parallel-accounting",
          "title": "Parallelism Accounting & Final Comparison",
          "scope": "data_parallel_calcs · fsdp_calcs · tp_calcs · fsdp_tp_calcs · leaderboard",
          "derive": "For a manageable model, calculate the persistent state, transient Peak, communication bytes, message count, and critical path for each strategy, with units.",
          "evidence": "You can distinguish Data, Tensor, and hybrid groups, calculate the global Batch size correctly, and explain measured deviations from the theoretical prediction.",
          "failure": "First lead: For factor errors, first check which World Size belongs to each Process Group and whether bytes per element, send-plus-receive volume, or a training phase was counted twice.",
          "concepts": ["model-parallelism", "collectives", "roofline"],
          "labs": ["parallelism", "roofline", "comm-crossover"]
        }
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
      "missions": [
        {
          "id": "synthetic-isoflops",
          "title": "Understand Synthetic IsoFLOPs",
          "scope": "chinchilla_isoflops",
          "derive": "Derive the admissible N–D curve from C≈6ND and predict, for several fixed compute tiers, why Loss can rise at both extremes.",
          "evidence": "You can group Runs by compute, distinguish an interior minimum from a boundary minimum, and explain the Lower-Envelope method without a template.",
          "failure": "First lead: If the best point lies on the boundary, do not fit and hope—expand the search range until measurements exist on both sides.",
          "concepts": ["power-laws", "isoflops", "resource-accounting"],
          "labs": ["scaling", "scaling-fit", "resources"]
        },
        {
          "id": "budget-design",
          "title": "Budget Ledger & Run Design",
          "scope": "scaling_laws",
          "derive": "Before the first Run, create a table containing a valid architecture, N, D_tokens=C/(6N), estimated runtime, compute tier, tuning rule, and remaining budget.",
          "evidence": "Every planned Run is API-compatible, has one explicit hypothesis, adds a missing side of a minimum, and is accounted for in the total budget.",
          "failure": "First lead: If a Run merely adds more points near known strong Runs, ask whether it separates a decision or only consumes budget.",
          "concepts": ["scaling-practice", "isoflops", "resource-accounting"],
          "labs": ["scaling"]
        },
        {
          "id": "fit-validate",
          "title": "Fit, Residuals & Uncertainty",
          "scope": "scaling_laws",
          "derive": "Express the Fit variables in Log space, decide in advance which points form the compute-optimal Envelope, and plan Leave-One-Tier-Out as a genuine prediction task.",
          "evidence": "You can inspect residuals, boundary points, the Fit form, and hyperparameter confounders and report a sensitivity range rather than false single-number precision.",
          "failure": "First lead: A high R² does not replace extrapolation checks; vary the data selection and Fit form and predict omitted tiers.",
          "concepts": ["power-laws", "scaling-practice", "benchmark-validity"],
          "labs": ["scaling-fit", "evaluation"]
        },
        {
          "id": "target-decision",
          "title": "Target Configuration & Robust Decision",
          "scope": "scaling_laws",
          "derive": "Translate the continuous Fit prediction into valid discrete hyperparameters, then recalculate compute, tokens, runtime, and the deviation from the fitted curve.",
          "evidence": "The final configuration satisfies every constraint, has a justified uncertainty range, and remains a similar decision under plausible Fit variants.",
          "failure": "First lead: If rounding or constraint clipping moves the point substantially, treat the discrete configuration as a new candidate and recalculate it fully instead of quoting the continuous prediction.",
          "concepts": ["scaling-optima", "scaling-practice", "isoflops"],
          "labs": ["scaling", "scaling-fit", "scaling-transfer"]
        }
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
        "Target likelihood, class probability, and density ratio are three different filtering objectives.",
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
      "missions": [
        {
          "id": "web-extraction",
          "title": "Inspect Raw Web Data & Extract Text",
          "scope": "look_at_cc · extract_text",
          "derive": "Draw WARC/WET or HTTP → bytes → Encoding → HTML → main content → normalized text, marking possible information loss at every edge.",
          "evidence": "You can apply a manual document Rubric, identify Boilerplate and Encoding errors, and preserve the raw ID and provenance through text extraction.",
          "failure": "First lead: For broken text, inspect response bytes, Content-Type/Encoding, and HTML structure first; do not make a later quality filter compensate for extraction errors.",
          "concepts": ["python-engineering", "data-pipeline", "quality-filtering"],
          "labs": ["data-pipeline"]
        },
        {
          "id": "safety-filters",
          "title": "Language, PII, Harm & Gopher Rules",
          "scope": "language_identification · mask_pii · harmful_content · gopher_quality_filters",
          "derive": "For each filter, define the positive event, error costs, transformation versus rejection, ordering, and one adversarial retained and rejected example. Audit Language Identification separately for short texts, closely related and Low-Resource Languages, dialects, and Code-Switching.",
          "evidence": "You can explain False Positives in code or quotations, False Negatives for PII, and context-dependent harm and Language-ID cases, and log a Reason Code at every stage.",
          "failure": "First lead: If only the retention rate is known, the decisive evidence is missing—sample retained and rejected documents for every reason and group.",
          "concepts": ["pii-harm", "quality-filtering", "filtering-mechanics", "data-pipeline"],
          "labs": ["filtering-mechanics", "data-pipeline"]
        },
        {
          "id": "quality-classifier",
          "title": "Calibrate the Quality Classifier",
          "scope": "quality_classifier",
          "derive": "Create a small labeled Audit set and predict how the threshold changes Precision, Recall, the data mixture, and the eventual training set size. Keep p(Target|x) separate from target likelihood and density ratio.",
          "evidence": "You can report a Confusion Matrix and boundary cases by domain and language, roughly explain fastText features, and justify a threshold from error costs rather than the highest aggregate score.",
          "failure": "First lead: A good average score can conceal minority domains; break errors down by source, language, length, and distance from the threshold.",
          "concepts": ["filtering-mechanics", "quality-filtering", "benchmark-validity"],
          "labs": ["filtering-mechanics", "data-pipeline", "evaluation"]
        },
        {
          "id": "dedup",
          "title": "Exact & Near Deduplication",
          "scope": "exact_deduplication · minhash_deduplication",
          "derive": "First separate the contracts: A4 Exact-Line-Dedup retains only lines that occur exactly once across the corpus, whereas Near-Document-Dedup keeps one representative per verified transitive cluster. Then simulate normalization, Shingles, Jaccard, a MinHash signature, LSH candidates, Verification, and clustering on four toy documents.",
          "evidence": "You can distinguish Exact-Line counts from representative Deduplication, guard against hash collisions, separate Retrieval from the decision, and deterministically retain exactly the intended representative in each Near-Duplicate cluster.",
          "failure": "First lead: First check whether the contract asks for unique lines or one group representative. An LSH collision is only a candidate; for incorrect clusters, inspect true similarity, normalization, and transitive components separately.",
          "concepts": ["bloom-filters", "dedup", "data-pipeline"],
          "labs": ["bloom-filter", "dedup-pipeline", "data-pipeline"]
        },
        {
          "id": "pipeline-audit",
          "title": "End-to-End Filtering Pipeline",
          "scope": "filter_data · inspect_filtered_data",
          "derive": "Before the full Run, plan stage counts, runtime, parallel I/O, deterministic IDs, Reason Codes, and samples; extrapolate cost and rejection volume from a small sample.",
          "evidence": "The Run is deterministic, every decision is traceable, and retained and rejected data are audited by stage and group; no stage destroys the evidence needed for later diagnosis.",
          "failure": "First lead: If only the final corpus remains, Lineage and counterexamples are missing—preserve intermediate metadata and representative rejected samples.",
          "concepts": ["python-engineering", "data-pipeline", "pii-harm", "dedup"],
          "labs": ["data-pipeline"]
        },
        {
          "id": "tokenize-train",
          "title": "Tokenize & Measure Data Quality",
          "scope": "tokenize_data · train_model",
          "derive": "Before comparing variants, define the binary format, token dtype, document terminator, split boundaries, token budget, and controlled training and evaluation conditions.",
          "evidence": "You can verify a round trip and sample from the serialized corpus, rule out verbatim, near-duplicate, and semantically equivalent train–validation overlap, and compare data variants at equal model, token, and training budgets. If validation guided filter development, you label it a development metric and reserve an untouched test set for the final comparison.",
          "failure": "First lead: Better Loss may come from more tokens, different Tokenization, train–evaluation contamination, or repeated adaptation to validation; control these causes separately before making a claim about data quality.",
          "concepts": ["tokenizer-tradeoffs", "training-loop", "benchmark-validity"],
          "labs": ["data-pipeline", "evaluation"]
        }
      ],
      "done": [
        "Primitive tests and Audit sets",
        "Deterministic pipeline",
        "Reason Codes and stage counts",
        "LSH candidates verified and clusters are transitive",
        "Retained/rejected documents explained manually",
        "No train–evaluation contamination; adapted validation is labeled as development data",
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
      "missions": [
        {
          "id": "prompting",
          "title": "Prompting Baseline & Grader Audit",
          "scope": "prompting_baselines",
          "derive": "Define Prompt variants, generation settings, the output Parser, the invalid-format rule, and metrics before the first comparison.",
          "evidence": "You can separate errors in the model response, Parser, and Verifier and manually audit examples of correct, incorrect, and unparseable outputs.",
          "failure": "First lead: If scores are unexpectedly low, inspect raw output and the Parser first; a format deviation is not automatically a failure of Reasoning.",
          "concepts": ["benchmark-validity", "sampling"],
          "labs": ["evaluation", "answer-parsing"]
        },
        {
          "id": "pg-math",
          "title": "Policy-Gradient Derivation & Variance",
          "scope": "baseline_calcs",
          "derive": "Derive the Log-Derivative Trick and the expected zero contribution of a Prompt-dependent, action-independent Baseline on a binary toy problem.",
          "evidence": "You can calculate the expectation and variance of different Baselines by hand and explain the sign and intended Log-Probability change for every outcome.",
          "failure": "First lead: If a Baseline changes the expected gradient, check whether it depends on the sampled response or whether Stop-Gradient is missing.",
          "concepts": ["probability", "policy-gradient", "rl-setup"],
          "labs": ["grpo"]
        },
        {
          "id": "tensor-plumbing",
          "title": "Prompt/Response Tensor Plumbing",
          "scope": "tokenize_prompt_and_output · get_response_log_probs · compute_rollout_rewards",
          "derive": "For B Prompts and G responses, draw token_ids, shifted logits and targets, Padding, response_mask, per-token Log-Probabilities, Entropy, sequence Reward, and group assignments, including all shapes.",
          "evidence": "With B=1, G=2, and a few tokens, you can verify every Gather, mask, and reduction value by hand and show that Prompt and Padding tokens receive no response Loss.",
          "failure": "First lead: For incorrect Loss values, inspect the Shift, mask sum and denominator, Prompt length, and B×G assignment before the Optimizer.",
          "concepts": ["pytorch-tensors", "cross-entropy", "sampling", "rl-setup"],
          "labs": ["policy-loss-tracer", "shapes"]
        },
        {
          "id": "on-policy-grpo",
          "title": "On-Policy GRPO Core",
          "scope": "compute_group_normalized_rewards_grpo · compute_policy_gradient_loss_on_policy · aggregate_loss_across_microbatch_sequence · grpo_train_step_standard_on_policy · grpo_experiments_standard_on_policy · grpo_learning_rate · grpo_prompt_ablation",
          "derive": "Work through one Prompt group completely: Rewards → mean/standard deviation → Advantages → masked token Log-Probabilities → aggregation → Loss sign → expected Log-Probability change.",
          "evidence": "You can verify identical Rewards, variable response lengths, the Microbatch denominator, and the gradient direction for correct and incorrect responses with a tiny test.",
          "failure": "First lead: If Reward does not increase, check before tuning hyperparameters whether positive Advantages affect the Loss in a way that raises their Log-Probabilities.",
          "concepts": ["grpo", "policy-gradient", "pytorch-state"],
          "labs": ["policy-loss-tracer", "grpo"]
        },
        {
          "id": "variants",
          "title": "Dr. GRPO, RFT & Difficulty Reweighting",
          "scope": "think_about_length_normalization · compute_group_normalized_rewards_drgrpo · aggregate_loss_across_microbatch_constant · think_about_rft · derive_difficulty_reweightings · think_about_advantage_normalization · compute_group_normalized_rewards_maxrl · grpo_train_step_variants_on_policy · grpo_experiments_variants_on_policy",
          "derive": "For each variant, write down only the denominator or weighting factor changed relative to the Baseline and predict which Prompts, sequence lengths, or Reward groups gain influence.",
          "evidence": "You can compare variants numerically on identical Rollouts and then interpret Reward, length, Entropy, and held-out accuracy together across Multi-Seed Runs.",
          "failure": "First lead: If the variants seem unfair, check whether Sampling, Batch, tokens, or update count changed in addition to the intended objective weighting.",
          "concepts": ["grpo", "grpo-variants", "benchmark-validity"],
          "labs": ["grpo", "rlvr-system-transfer", "evaluation"]
        },
        {
          "id": "off-policy",
          "title": "Off-Policy Ratios, PPO & GSPO",
          "scope": "derive_surrogate_objectives · compute_policy_gradient_loss_off_policy · think_about_importance_reweighting · compute_policy_gradient_loss_off_policy_gspo · grpo_train_step_off_policy · grpo_experiments_off_policy · try_your_own",
          "derive": "Label the Behavior, Old, Current, and Reference Policies and calculate token- and sequence-level Importance Ratios in Log space for positive and negative Advantages, including Clipping cases.",
          "evidence": "You can explain which variant is exact and which is a Surrogate, how staleness changes Bias and variance, and why stored old Log-Probabilities must remain immutable.",
          "failure": "First lead: Ratios near one after many updates often indicate recomputed old_logprobs; extreme Ratios indicate Policy drift, mask or Shift errors, or products over long sequences.",
          "concepts": ["off-policy", "grpo-variants", "rlvr-systems", "policy-gradient", "rlhf"],
          "labs": ["grpo", "rlvr-system-transfer"]
        },
        {
          "id": "supplement",
          "title": "Optional Supplement Path: SFT, Safety & DPO",
          "scope": "mmlu_baseline · gsm8k_baseline · alpaca_eval_baseline · sst_baseline · look_at_sft · data_loading · sft_script · sft · mmlu_sft · gsm8k_sft · alpaca_eval_sft · sst_sft · red_teaming · look_at_hh · dpo_loss · dpo_training",
          "derive": "Draw the SFT and DPO data flows separately: Chat Template and response mask for SFT, and chosen/rejected Policy and Reference Log-Probabilities for DPO.",
          "evidence": "You can evaluate before and after SFT with the same protocol, audit Preference pairs, and explain the DPO gradient direction for one toy pair.",
          "failure": "First lead: For SFT, inspect masks and the Template first; for DPO, inspect the chosen/rejected assignment and Policy-versus-Reference Log-Probabilities first.",
          "concepts": ["sft", "reward-models", "dpo", "benchmark-validity"],
          "labs": ["dpo-loss", "evaluation", "answer-parsing"]
        }
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
      "mental": "Token IDs are initially just integers. A learned Embedding table replaces every ID with a D-dimensional vector; the resulting activation tensor is conventionally called X. A Linear Layer then mixes the D feature values of each token through a learned matrix to produce new features. It uses the same matrix at every position and therefore does not mix different tokens until Attention does so.",
      "formula": "X = E_vocab[token_ids]  →  Q = XW_Q, K = XW_K, V = XW_V  →  d_head = D/H  →  S_raw = QKᵀ/√d_head  →  L = S_raw + M  →  A = softmax(L)  →  Y = Concat(AV)W_O",
      "symbols": [["B","Batch size: how many sequences are processed together."],["T","Number of token positions in each sequence."],["D","Model dimension: features per token in the Residual Stream."],["H","Number of parallel Attention Heads."],["d_head","Features per Head; in this lab Query, Key, and Value all use d_head = D/H."],["1/√d_head","QK Dot-Product scaling: the Dot Product sums d_head contributions, and division keeps Score variance and Softmax sharpness controlled as Heads become wider."],["V_vocab","Number of entries in the Embedding table; do not confuse it with the Value tensor V."],["X","Activations after the Embedding; not a weight matrix."],["W_Q, W_K, W_V","Learned feature mixers from D to H·d_head. They have no Batch or Token axis."],["Q, K, V","Activations with different roles: seeking, offering information for matching, and contributing content."],["W_O","Learned matrix from H·d_head back to D; it mixes the previously separate Head results."],["S_raw, L, A","Raw Dot-Product scores, masked logits, and the weights produced from them by Softmax."]],
      "observe": "Change only T first. Before moving it, predict where T appears in each Shape and why it occurs twice in the score matrix.",
      "misconception": "H does not create H full copies of model dimension D. D is split across H Heads with d_head = D/H features each. Projection here means a learned feature mixer, not a mixing of Token positions and usually not an orthogonal geometric projection.",
      "transferQuestion": "Which shapes change when only the sequence length doubles, and which parameter counts stay the same?",
      "transferAnswer": "If only T doubles, activations like B×T×D as well as Q, K, and V with B×H×T×d_head become twice as long along the sequence axis. In contrast, attention scores with B×H×T×T contain four times as many elements because both position axes grow. Parameter counts like V_vocab×D for the Embedding or D×D_out for weight matrices remain unchanged, as trainable matrices do not depend on the length of a specific input sequence."
    },
    "einsum-pattern": {
      "title": "Einsum Pattern Workshop",
      "time": "12 min",
      "desc": "Write the axis pattern for the three A1 core operations, see the resolved shape immediately, and expose patterns that contract the wrong axis despite a valid shape.",
      "mental": "An einsum pattern is a contract about axis names, not axis positions. Read it in three steps: which names appear in both inputs? Which names are missing to the right of the arrow? Exactly the names that are shared and missing on the right get contracted, that is multiplied and summed. Everything else stays — and three dots pass through any number of leading axes unchanged.",
      "formula": "einsum(x, W, \"... d_in, d_out d_in -> ... d_out\")  ·  einsum(Q, K, \"... query d_k, ... key d_k -> ... query key\")  ·  einsum(A, V, \"... query key, ... key d_v -> ... query d_v\")",
      "symbols": [["...","Ellipsis: any number of leading axes passed through unchanged. A1 requires exactly this tolerance from every module."],["shared name","A name in both inputs couples their positions elementwise."],["missing on the right","A name that does not appear in the output is summed over all its values and disappears."],["d_in, d_out","Input and output width of a Linear Layer; only d_in is contracted."],["query, key","The two position axes of Attention. They often have equal length and are therefore indistinguishable from the shape."],["d_k, d_v","Feature width per Head for Keys and Values respectively; d_k is contracted in the scores, d_v survives the Value mixing."]],
      "observe": "Pick an operation, change the leading axes, and observe that the pattern does not change at all. Then switch to a wrong pattern and read only the resolved shape first: in two of the three operations it stays valid.",
      "misconception": "A matching output shape does not prove a correct pattern. As soon as two axes happen to have the same length — Query and Key at equal sequence length, or d_in and d_out in a square layer — the wrong pattern also produces a plausible shape and silently contracts the wrong axis.",
      "transferQuestion": "Why does a swapped Query-Key pattern not raise a shape error on square scores, and which test would reliably expose it?",
      "transferAnswer": "In self-attention, the Query and Key axes have the same length T. The swapped pattern therefore also produces [..., T, T]; the shape simply cannot show the difference. What you get, however, is the transposed score matrix, so Softmax normalizes over the Queries instead of the Keys and a causal mask hits the wrong triangle. A test with different Query and Key lengths exposes it reliably — cross-attention, or a KV-cache step with T_query=1 and T_key=8: there the wrong pattern fails on the shape immediately. In addition, a reference comparison against torch.nn.functional.scaled_dot_product_attention on the same input reveals the bug even for square scores."
    },
    "pytorch-debugger": {
      "title": "PyTorch Contract Debugger",
      "time": "16 min",
      "desc": "Diagnose five small, assignment-isomorphic bugs involving registration, device placement, strides, gradients, and Loss reduction.",
      "mental": "When PyTorch code fails, do not change lines at random. First name the broken contract: is state registered, are tensors on compatible devices and dtypes, does the memory layout permit the requested View, was gradient state reset correctly, and is the Loss truly the intended scalar? Then write the smallest test that distinguishes that hypothesis from alternatives.",
      "formula": "module state = parameters ∪ buffers ∪ registered submodules  ·  grad ← grad + ∂L/∂θ  ·  view requires compatible strides  ·  training loss.shape = []",
      "symbols": [["nn.Parameter","Trainable tensor registered when assigned as a module attribute."],["Buffer","Registered state not trained by gradient, but moved across devices and included in state_dict."],["stride","Storage step along each tensor axis; determines whether a new View is possible without copying."],[".grad","Gradient accumulated at a leaf parameter; backward does not clear it automatically."],["state_dict","Serializable registered parameters and buffers of a module."],["loss.shape=[]","Zero-dimensional scalar from which backward can start without an explicit upstream gradient."]],
      "observe": "For each case, read only the code and symptom first. Then choose the cause and the smallest discriminating test. Open the shared derivation only after your own attempt.",
      "misconception": "A plausible Forward value proves neither that parameters will be optimized or saved nor that the code remains correct on another device, after transpose, or during the second training step.",
      "transferQuestion": "Why is one successful Forward Pass insufficient evidence that a PyTorch module is trainable and correct?",
      "transferAnswer": "A Forward Pass checks only one concrete value path with the current shapes, devices, and state. It can produce correct numbers even though submodules are unregistered, buffers remain behind during a device move, a later non-contiguous View fails, or gradients accumulate unintentionally on the second step. A robust test contract additionally checks registration and state_dict, device and dtype, boundary shapes and strides, a scalar Loss, gradients or updates, and Save/Reload behavior."
    },
    "bpe": {
      "title": "Byte-Level BPE Merge Game",
      "time": "12 min",
      "desc": "Compare UTF-8 bytes with Unicode characters; test round trips, pretoken boundaries, special tokens, deterministic ties, and non-overlapping merges.",
      "mental": "In its assignment-aligned mode, Byte-Pair Encoding (BPE) starts with the 256 possible byte values, counts adjacent token pairs, and replaces the most frequent pair with a new token. Pretokenization determines which text segments merges cannot cross, while protected special tokens remain atomic. Because the original bytes remain recoverable through every merge, the complete text must be reconstructed exactly at every step.",
      "formula": "p* = argmax_p count(p)  →  corpus = replace_non_overlapping(corpus, p*)  →  vocabulary = vocabulary ∪ {merge(p*)}",
      "symbols": [["p","An adjacent symbol pair."],["count(p)","The frequency of that pair across the complete mini-corpus."],["p*","The most frequent pair selected for the next merge."],["V","Vocabulary: all currently available symbols and merge results."]],
      "observe": "Before each merge, identify the pair that is most frequent across the corpus and predict how many tokens its non-overlapping replacement will remove.",
      "misconception": "The most frequent word is not merged. Each step selects exactly one adjacent pair and replaces all of its non-overlapping occurrences.",
      "transferQuestion": "How does a larger vocabulary affect sequence length, embedding cost, and low-resource languages?",
      "transferAnswer": "A larger Byte-Pair Encoding vocabulary usually contains longer learned subwords and can therefore represent the same text with fewer tokens. However, the embedding matrix grows proportionally to V×D; without weight tying, an output matrix also growing with V is added. Rare or data-scarce languages only benefit if their patterns occur frequently enough in the merge data; otherwise, they remain highly fragmented despite the larger overall vocabulary."
    },
    "bpe-encode": {
      "title": "Encoding & encode_iterable",
      "time": "14 min",
      "desc": "Apply a fully trained mini tokenizer to new text: compare four encoding strategies token by token and find the streaming variant that produces the same IDs as reading the whole file at once.",
      "mental": "Training and applying are two different algorithms. During training, frequency decides which pair gets merged next. During encoding, frequency decides nothing at all: the learned merge list is worked through in exactly the order it was created \u2013 rank by rank, each rank at every occurrence inside a pretoken, before the next rank is even checked. That is why a longer entry can sit in the vocabulary and still never be used at a given position. Every pretoken is encoded on its own, special tokens stay indivisible, and encode_iterable has to preserve both properties across chunk boundaries.",
      "formula": "encode(w): t \u2190 [characters of w];  for r = 1\u2026R: replace every non-overlapping occurrence of merges[r] in t  \u00b7  IDs = [vocab\u207b\u00b9(x) for x in t]",
      "symbols": [["merges[r]","The merge rule created r-th during training. Its rank r, not its frequency in the new text, sets the order during encoding."],["R","Number of learned merges. Encoding walks the list exactly once from rank 1 to R; a newly created token can never produce a pair of lower rank."],["Pretoken","Text chunk within which merging is allowed. No token ever forms across its boundary, which is why every pretoken can be encoded independently."],["vocab\u207b\u00b9","Inverse of the vocabulary: from token string to ID. The test compares the ID sequence, not the intermediate representation."],["Special Token","Reserved string such as <|endoftext|> that is cut out before pretokenization and emitted as one indivisible ID."],["encode_iterable","Generator that reads a file piece by piece. It has to return the same ID sequence as encode over the full text, with bounded memory."],["Peak","Largest piece of text held in memory at one time. This is exactly the number encode_iterable is supposed to keep small."]],
      "observe": "In \u201eapply merges\u201c mode, start with the first input case and read all four strategies: they agree and expose nothing. Then switch to the second case and compare only the first pretoken. In streaming mode, raise the block size step by step and watch two different failure modes: first the text falls apart into too many tokens, later the token count is right and the ID sequence still is not.",
      "misconception": "Encoding is not \u201etake the longest matching vocabulary entry at every position\u201c. Nor is it \u201emerge the pair that is most frequent in this text first\u201c. Both rules coincidentally produce the same result for many inputs and diverge exactly where two learned tokens overlap \u2013 there, the creation rank alone decides.",
      "transferQuestion": "Why does chunking a file into fixed blocks produce a wrong ID sequence even when it happens to yield exactly as many tokens as reading the whole file?",
      "transferAnswer": "Because the token count is only a sum, and errors inside it can cancel out. A fixed block cuts the text at a position the tokenizer would never have been allowed to split: in the middle of a pretoken, or in the middle of a special token. At that seam two short token sequences appear instead of one long one \u2013 and a few characters later, inside the same block, a token grows together that would have sat at a different boundary in the full text. Both deviations can balance out exactly in length while completely different IDs sit at several positions. That is precisely why the A1 test does not check the token count but compares the ID sequence element by element, and why encode_iterable may only chunk at boundaries where the tokenizer would never merge anyway \u2013 in practice at the document boundaries marked by the special token. That keeps memory bounded to a single document and still keeps the ID sequence exact."
    },
    "attention": {
      "title": "Attention Matrix",
      "desc": "Change temperature, query, and causal mask; explain the weight shift.",
      "mental": "A Query describes what a token position is looking for, Keys describe what positions offer, and Values carry the information that is eventually mixed. Each Query therefore forms its own distribution over all allowed Keys.",
      "formula": "S_raw,ij = q_i·k_j/√d_head  →  L_ij = (S_raw,ij + M_ij)/τ  →  A_i = softmax(L[i,:] over j)  →  z_i = Σ_j A_ijv_j",
      "symbols": [["i, j","Query position i and Key/Value position j."],["q, k, v","Query, Key, and Value vectors in one Attention Head."],["d_head, 1/√d_head","Head width and Score scaling: the Dot Product sums d_head contributions, while division stabilizes Score variance and Softmax sharpness as width grows."],["S_raw, L","Raw Dot-Product scores and the logits passed into Softmax after mask and temperature."],["M","Causal mask; forbidden future positions receive −∞."],["τ","Temperature: values below 1 sharpen differences."],["A_ij","Attention weight from Query i to position j; each allowed row sums to 1."]],
      "observe": "Change the Query, temperature, and mask one at a time. Explain whether raw scores, allowed positions, or only the Softmax distribution changed.",
      "misconception": "Softmax does not run over Query rows. For every Query i, it normalizes across Key columns j; Values determine the content afterward, not the scores.",
      "transferQuestion": "Construct a score vector for which temperature has almost no effect. Why?",
      "transferAnswer": "An example is the score vector [2, 2, 2] over three allowed key positions. By dividing by any positive temperature, all three values remain equal, so Softmax always yields [1/3, 1/3, 1/3]. Temperature only modifies differences between scores; with identical scores, there are no differences to amplify or dampen."
    },
    "rope-rotation": {
      "title": "RoPE: Pairing, Angles & Position Index",
      "desc": "Rotate the same Query vector across four input cases and find out which cases leave a wrong RoPE implementation numerically invisible \u2014 and why the Attention Scores never give it away.",
      "mental": "RoPE rotates pairs of neighbouring feature coordinates by an angle that depends on the token position. A1 fixes three decisions exactly, and none of them is a matter of taste: which two coordinates form a pair (neighbouring ones, 2k\u22121 and 2k, not the second half of the vector), how the angle follows from position and pair index (\u03b8 = i/\u0398^((2k\u22122)/d) with k starting at one), and that the angle comes from the token_positions you were handed rather than from the running axis index. Each of the three can be decided wrongly without the output looking broken \u2014 the vector keeps its length, the model trains, and the Attention Scores still depend only on the distance between two positions.",
      "formula": "\u03b8_(i,k) = i / \u0398^((2k\u22122)/d) for k = 1\u2026d/2  \u00b7  (q'_(2k\u22121), q'_(2k)) = (q_(2k\u22121)\u00b7cos \u03b8_(i,k) \u2212 q_(2k)\u00b7sin \u03b8_(i,k),  q_(2k\u22121)\u00b7sin \u03b8_(i,k) + q_(2k)\u00b7cos \u03b8_(i,k))  \u00b7  \u0398 = 10000",
      "symbols": [["i","Token position taken from token_positions \u2014 not the index along the sequence axis. The two agree only when the positions happen to start at 0 and run without gaps."],["k = 1\u2026d/2","Pair index. A1 counts from one, which is why the exponent reads 2k\u22122 and not 2k; the first pair gets exponent zero and therefore \u03b8 = i."],["d, d_k","Width of a Query or Key vector. It splits into d/2 pairs that are rotated independently."],["\u0398 = 10000","Base of the frequency ladder. A large \u0398 makes the later pairs very slow, so they stay distinguishable even across long distances."],["\u03b8_(i,k)","Rotation angle of the k-th pair at position i, in radians. For d = 4 that yields exactly two angles: \u03b8_(i,1) = i and \u03b8_(i,2) = i/100."],["(2k\u22121, 2k)","The neighbouring coordinate pair rotated together. Read zero-based, those are indices 0/1, 2/3, 4/5 and so on."],["Half-Split","The widespread alternative that pairs coordinate j with j + d/2. It is a valid rotation scheme and common in other codebases \u2014 but it produces different numbers than the A1 reference."],["q'","The rotated vector. Its length is identical to that of q, because a rotation never changes a norm \u2014 which is exactly why a wrong variant looks unremarkable."]],
      "observe": "Start with the single token at position 0 and step through all five variants: not one of them deviates. Then switch to d_k = 2 \u2014 now sign and exponent errors show up, but the Half-Split mix-up still does not. The case with positions 0, 1, 2 adds Half-Split, and only the cache slice with positions 5, 6, 7 exposes the variant that ignores token_positions. Read the score line on every switch as well: it stays distance-dependent in all five variants.",
      "misconception": "\u201eThe output looks plausible and the norm is right\u201c proves nothing at all for RoPE, because every rotation preserves the norm. \u201eAttention depends only on the distance\u201c proves nothing either: all four wrong variants in this lab still satisfy that property and would work as position schemes in their own right. That is precisely why a RoPE error shows up neither on inspection nor in the learning curve \u2014 only comparing the numbers against the A1 reference exposes it.",
      "transferQuestion": "The cache slice with positions 5, 6, 7 gives the variant that ignores token_positions exactly the same Attention Score as the correct implementation, yet a different tensor. How can both hold at once \u2014 and what follows for a self-built test?",
      "transferAnswer": "Both hold because an Attention Score and a tensor measure two different things. The score q'(i)\u00b7k'(j) depends only on the difference j\u2212i for any scheme of the form \u03b8 = i\u00b7c_k, since the two rotations compose into a single rotation by (j\u2212i)\u00b7c_k. The variant that ignores token_positions computes with axis indices 0, 1, 2 instead of 5, 6, 7 \u2014 but the distances are exactly one in either case, so the same score comes out. The rotated tensor itself is still a different one, because it depends on the absolute position: at position 5 the angle is 5 radians, at index 0 it is zero. That tensor is what test_rope compares against the A1 reference, and only it exposes the error. Three things follow for a self-built test: it must not hang on the score or the norm but compare number by number against an independently computed reference; it needs at least four coordinates, otherwise neighbouring pairing and Half-Split coincide; and it has to shift token_positions, otherwise the handed-in position and the axis index are indistinguishable. In practice this means little during training and a lot during decoding: as long as you train contiguously from zero, even the wrong variant runs unremarkably, and only the KV cache, packed sequences, or a cropped window bring the error to light \u2014 and then as silently wrong model behaviour, not as a crash."
    },
    "norm-and-ffn": {
      "title": "RMSNorm & SwiGLU: Axis, ε and Gate",
      "desc": "Work through both primitives across nine input cases and find out which self-built tests wave a wrong implementation through — the zero test lets all four SwiGLU errors pass, and a single token with gain one lets two of the four RMSNorm errors pass.",
      "mental": "Both primitives are a handful of lines and therefore look harmless — which is precisely the problem. RMSNorm fixes three things exactly, and every one of them can be got wrong plausibly: the reduction runs over the feature axis D only and separately per token vector, ε sits inside the square root, and the learnable gain belongs in the result. SwiGLU fixes three more: SiLU acts on the W₁ branch and not on the W₃ branch, SiLU is z·σ(z) and not σ(z), and the W₃ branch is multiplied in element-wise rather than dropped. None of these six decisions changes a shape. A program that gets all six wrong runs, trains and learns — it is simply a different model than the one the tests expect.",
      "formula": "RMSNorm(a_i) = a_i / RMS(a) · g_i with RMS(a) = √( (1/d_model)·Σⱼ aⱼ² + ε )  ·  FFN(x) = W₂( SiLU(W₁x) ⊙ W₃x ) with SiLU(z) = z·σ(z)  ·  d_ff = 8/3·d_model, rounded to a multiple of 64",
      "symbols": [["a, x","The state of a single token. Both operations are position-wise: no token sees another, which is Attention's job alone."],["d_model, D","Width of the residual stream and at the same time the only axis RMSNorm reduces over. For X [B,T,D] the output shape stays [B,T,D]."],["ε = 1e−5","Stability constant. It sits under the square root and is added to the mean of squares — not to the denominator afterwards."],["g [D]","Learnable gain, one value per feature, broadcast across B and T. A1 initializes it to all ones, which is why a forgotten gain has no effect in a freshly built module."],["W₁, W₃ [d_ff × d_model]","The two up branches. W₁ feeds the gate, W₃ supplies the candidate features. Both have the same shape, so swapping them is not detectable from dimensions."],["W₂ [d_model × d_ff]","The way back to D so the residual addition fits again. All three matrices are bias-free in A1."],["SiLU(z) = z·σ(z)","Also called Swish. The factor z in front of the sigmoid is the entire difference to the GLU of equation (6): σ alone lies between 0 and 1 and can only attenuate."],["d_ff","Inner width, in A1 roughly 8/3·d_model and rounded to a multiple of 64. The handout works it out itself: d_model = 1600 gives 4288."]],
      "observe": "Start with RMSNorm on the single token and step through all five variants — two of the four errors stay entirely invisible. Switch to the large activations and then to the ones in the range of ε: the same ε error is once below display precision and once a factor of 2.7. The case with mean zero hides exactly the LayerNorm reflex, and only the case with a trained gain separates all four. Then switch to SwiGLU and begin with the zero test: all four wrong variants produce the same numbers there as the correct one. The all-ones vector exposes exactly one of them, x = [2, 2] one more, and only x = [3, −1] all four.",
      "misconception": "„The shapes are right and the loss goes down“ proves nothing for either primitive. All nine variants in this lab produce exactly the same shapes, and eight of them are usable as an architecture: a model with swapped SwiGLU branches, or without the gain, still learns and its learning curve looks normal. A self-built test proves just as little as long as it does not choose the case so that the wrong variant can touch a different number at all — at x = 0 not one of them does.",
      "transferQuestion": "A classmate reports their RMSNorm is tested: one token vector, freshly built module, output matches their hand calculation to six decimals. Which two of this lab's four errors can that test not rule out in principle, and what does the test case have to look like so that it can?",
      "transferAnswer": "That test rules out only two of the four errors: the placement of ε and the LayerNorm reflex, because both change the numbers of a single token vector whose mean is not zero. It does not rule out the other two, and for a structural reason. With only one row, the mean over the whole tensor is arithmetically the same as the mean over the feature axis — the question of which axis is reduced is never even posed with a single row. And a freshly built module has, per A1, the gain set to all ones, so multiplying by g is the identity; whether it appears in the code cannot be read off any number. Both errors cost later, and for real: the wrong axis couples a token's scale to its accidental batch neighbourhood, so the same token is normalized differently at batch size one than during training, and a missing gain removes one parameter per feature from the model without anything crashing. A test case only rules both out when it satisfies two conditions at once: at least two token vectors with different squared lengths, so that reduction over D differs from reduction over everything, and a gain whose entries are neither one nor equal to each other. That combination is exactly what test_rmsnorm sets up with loaded reference weights — the reason the official test catches it and your own hand calculation does not. The same logic carries over to the SwiGLU side: there it is the zero vector that keeps every distinction from becoming a question in the first place."
    },
    "comm-crossover": {
      "title": "Compute versus communication: DP, FSDP, TP & 2D",
      "desc": "Put the per-device compute time of a single FFN layer against the time of its ring collectives and read off the device count at which each strategy becomes communication-bound — exactly the four calculation problems of section 8 of the A2 handout.",
      "mental": "Every parallelism strategy answers the same question: how much compute time is left per device, and how long does the collective take that fetches the missing state? The two quantities depend on the device count differently. Compute time falls as 1/N, because each device gets less work. The time of a ring collective does not fall — the factor (N−1)/N approaches one, so the volume per device approaches a fixed value. That is exactly why every strategy has a limit beyond which extra devices buy nothing. Which quantity appears in that limit is decided solely by what gets sent: data parallel and FSDP move weights or gradients, that is 3·D·D_FF elements, and compute proportionally to B·D·D_FF — in the ratio, D·D_FF cancels completely and the batch is what remains. Tensor parallel moves activations, that is B·D elements; the same cancellation removes B·D here and leaves the FFN width standing. Everything else follows from these two cancellations, right down to how to split N optimally across two axes.",
      "formula": "T_comp = FLOPs/(N·C)  ·  ring all-gather and ring reduce-scatter: t = (N−1)/N · S/W  ·  ring all-reduce: t = 2·(N−1)/N · S/W  ·  compute-bound as long as T_comm < T_comp  ·  N_DP < 1 + B·W/C  ·  N_TP,fwd < 1 + (3/2)·D_FF·W/C",
      "symbols": [["B","Rows of the input tensor x [B, D] for exactly one FFN layer, that is tokens per step before any partitioning. Data parallel and FSDP split this axis across the devices, tensor parallel does not — there every device sees all B rows."],["D, D_FF","Residual width and inner FFN width. W₁ and W₂ have shape [D, D_FF], W₃ has shape [D_FF, D]; together that is 3·D·D_FF elements, and exactly those are what a weight or gradient collective moves."],["N","Number of devices in precisely the process group of this collective — under 2D therefore N_TP or N_FSDP, not their product. The subscript says which axis is meant."],["C","Compute throughput of a single device in FLOP/s. A matmul (A,B)(B,C) costs 2·A·B·C FLOPs; elementwise work such as SiLU and the gate product is ignored, as in the handout."],["W","Egress bandwidth of a single device in bytes/s, that is how fast one device can send — not the aggregated bandwidth of the network. In a ring every device sends and receives at the same time; the send side is what gets counted."],["S","Size of the tensor a collective moves, in bytes. At FP16 that is two bytes per element; which tensor is meant is stated with its shape in every row."],["(N−1)/N","The ring factor. A ring all-gather passes one chunk of size S/N onward in each of N−1 steps, and a ring all-reduce does that twice — first as reduce-scatter, then as all-gather. For large N the factor approaches one and the volume per device approaches S or 2·S respectively."],["T_comm < T_comp","The condition for being compute-bound. Communication and computation overlap in the best case; only the part that sticks out beyond the compute time then lengthens the step."]],
      "observe": "Start with the NVLink case in the forward pass and step through the strategies: data parallel sends nothing at all there, FSDP fetches the weights, tensor parallel the activations. Then switch to the backward pass and raise N until the verdict box flips — compare that number with the limit row below it. Next jump to the cluster case: only W changes, by a factor of eighteen, and every limit falls in the same proportion. The small-batch case moves the DP and FSDP limit only, the wide-FFN case moves the TP limit only — the other one stays unchanged down to the digit. Finally switch to 2D mode and look for splits of a fixed N that tip over and splits that hold: 32 devices as 32×1 and as 4×8 are two entirely different calculations.",
      "misconception": "„More GPUs, more throughput“ holds only as long as compute time stays above communication time, and compute time is the quantity that shrinks. Conversely, this lab's numbers are not a capacity statement about real clusters: what is computed is a single FFN layer, without attention, without overlap between layers, without startup latency, and without topology. Real training hides a large part of this communication behind the computation of other layers and therefore scales further. What the model case does give exactly is the ratio: which quantity determines each limit, and by what factor the limit shifts when batch, width, or bandwidth change.",
      "transferQuestion": "The data parallel limit reads N < 1 + B·W/C and contains neither D nor D_FF — although both the FLOPs computed and the bytes sent depend on both. Why do they cancel, and which quantity appears in the tensor parallel limit for exactly the same reason?",
      "transferAnswer": "They cancel because they sit in the numerator and the denominator of the same fraction. In the backward pass, data parallel computes 12·B·D·D_FF/N FLOPs per device, so T_comp = 12·B·D·D_FF/(N·C). What gets sent is an all-reduce over the three gradient matrices, together 3·D·D_FF elements at two bytes, so S = 6·D·D_FF bytes and T_comm = 2·(N−1)/N · 6·D·D_FF/W. Form T_comm/T_comp and N, the twelve, and above all the shared product D·D_FF disappear completely; what remains is (N−1)·C/(B·W). That is the whole reason: model width sets computational work and send volume in the same proportion, so it cannot shift the limit. The batch appears only in the numerator of the computation and not in the volume, because a gradient always has the same size no matter how many rows it was averaged over — which is why exactly that is what remains, and the condition reads N < 1 + B·W/C. With tensor parallel the same cancellation runs with the roles swapped. What gets sent there is not a weight gradient but the activation y or dx with B·D elements, so S = 2·B·D bytes; computation is still proportional to B·D·D_FF. In the ratio, B·D now disappears and D_FF remains: N < 1 + (3/2)·D_FF·W/C in the forward pass and N < 1 + 3·D_FF·W/C in the backward pass, because the backward pass computes twice as much and still needs only a single all-reduce. In practice this is the justification for the usual split: tensor parallel scales with model width and is therefore used inside a node with high bandwidth, while data parallel and FSDP scale with the batch and carry across slower links between nodes. And because the two conditions contain different quantities, they are independent of each other — under 2D the two limits multiply instead of obstructing one another."
    },
    "optimizer": {
      "title": "Learning Rate & AdamW",
      "desc": "Examine Warmup/Cosine and a scalar AdamW update path.",
      "mental": "The gradient g locally predicts the direction in which the Loss grows under a small parameter change, so minimization moves along −g. For every parameter, Adam stores a smoothed signed gradient m as directional information and a smoothed squared gradient v as its typical scale. Dividing m̂ by √v̂+ε normalizes coordinates using their gradient history. AdamW additionally shrinks θ separately through 1−ηλ.",
      "formula": "θ_t = (1 − η_tλ)θ_{t−1} − η_t m̂_t/(√v̂_t + ε)",
      "symbols": [["θ","Trainable parameter before the update."],["g_t=∂L/∂θ","Current gradient; positive g makes Gradient Descent move θ in the negative direction."],["η_t","Learning Rate at the actual Optimizer Step t, not every Microbatch."],["m_t, v_t","Smoothed gradient and squared gradient persisted across Steps."],["m̂_t, v̂_t","Bias-corrected moments; the correction compensates for their zero initialization."],["λ","Decoupled Weight-Decay strength; shrinks θ even when g=0."],["ε","Small constant for numerical stability in the denominator."]],
      "observe": "Change only the step, warmup, gradient, or Weight Decay at a time. Separate the effect of the schedule from the adaptive gradient step and the Decay term.",
      "misconception": "The simplified first step does not describe later AdamW steps, whose moments contain training history. Weight Decay is also decoupled from the adaptive gradient term.",
      "transferQuestion": "What must be saved alongside the optimizer so the learning-rate schedule resumes correctly?",
      "transferAnswer": "Alongside the model and optimizer, at least the global optimizer step or the full scheduler state must be saved. The warmup or cosine schedule calculates the current learning rate from exactly this progress and cannot reliably derive it from the AdamW moments. With gradient accumulation, the actual parameter update step counts, not the number of microbatches read."
    },
    "loss-and-clip": {
      "title": "Loss Stability & Global Clipping",
      "time": "14 min",
      "desc": "Work through the four cross-entropy variants and the four clipping variants in simulated float32 arithmetic, and find the inputs where a wrong variant still looks plausible.",
      "mental": "For cross-entropy, A1 demands three things at once: subtract the largest logit, cancel log against exp, and average over arbitrary batch axes. Each of these three demands fends off a different mistake, and none of them shows up on harmless logits. For clipping, the same idea applies one level up: the ℓ2 norm is formed over all parameters jointly, not per tensor — only then does clipping change exclusively the length of the total gradient and never its direction.",
      "formula": "ℓ = log Σ_j exp(o_j − m) − (o_t − m)   with m = max_j o_j   ·   L = mean(ℓ)   ·   g ← g · min(1, M/(‖g‖₂ + ε))   with ‖g‖₂ over all parameters, ε = 10⁻⁶",
      "symbols": [["o","Logit vector of one position; o_t is the logit of the actual next token."],["m = max_j o_j","Largest logit of the row. It is subtracted because Softmax is invariant to a shared shift — mathematically the loss does not change."],["log Σ exp(·)","Log-sum-exp: the cancelled form of the denominator. It replaces \"first form the probability, then take the logarithm\"."],["ℓ, L","Loss of a single position and the reduction over all batch axes. A1 requires the mean, not the sum."],["float32","Precision used by the tests: exp overflows to infinity above roughly 88 and underflows to exactly zero below roughly −104."],["‖g‖₂","Joint ℓ2 norm of all gradients, as if they were concatenated into a single long vector."],["M","Maximum permitted total norm. If ‖g‖₂ stays below it, the gradient is left unchanged."],["ε = 10⁻⁶","Stabilization in the denominator. It makes the resulting norm land just under M instead of exactly on M."],["cos(g, g′)","Angle measure between the original and the clipped total gradient. Correct global clipping keeps it at exactly 1."]],
      "observe": "For cross-entropy, start with the harmless case and read all four variants: they agree. Only then switch the scenario. For clipping, set M to 10 first and then to a value above 13: the first wrong variant gives itself away only below the gradient norm, the second only above. The third does not give itself away at all with this gradient — read there why ε still has to sit in the denominator.",
      "misconception": "A loss that is right on small test logits proves nothing about numerical stability. The two A1 demands fend off different mistakes: subtracting the maximum prevents the overflow of large logits, cancelling log against exp prevents the underflow of very small target probabilities. An implementation can satisfy the first and still return infinity on the second.",
      "transferQuestion": "Why does \"stable softmax, then the logarithm\" return infinity for a very confident wrong call, while the log-sum-exp form computes the same case as a finite number?",
      "transferAnswer": "Both paths subtract the largest logit, so neither of them overflows. The difference lies in what is formed as an intermediate float32 number. \"Stable softmax, then the logarithm\" explicitly builds the target probability: for a logit 120 below the maximum that is exp(−120) ≈ 7.7·10⁻⁵³, far below the smallest representable float32 number of roughly 1.4·10⁻⁴⁵. It therefore becomes exactly zero, and log(0) is minus infinity, so the loss is +infinity and every gradient behind it is destroyed. The log-sum-exp form never builds that probability. It computes log Σ_j exp(o_j − m) − (o_t − m), where the +120 survives as a summand of the second term and the sum always contains the 1 of the maximum position. The result is log(2) + 120 ≈ 120.69 — a large but perfectly usable number."
    },
    "resources": {
      "title": "Parameter, Memory & Compute Calculator",
      "desc": "Estimate model size, mixed training state, naively materialized Attention scores, and training time.",
      "mental": "Parameters, persistent training state, activations, and compute are separate budgets. Back-of-the-envelope calculations check orders of magnitude; they do not replace measuring the concrete model and Framework.",
      "formula": "N ≈ 12L·D_model² + V_vocab·D_model  ·  mixed training state ≈ 16N bytes  ·  C_train ≈ 6N·D_tokens  ·  t_ideal≈C_train/P_eff  ·  naive full scores = B·H·L·T²",
      "symbols": [["L","Number of Transformer Layers."],["D_model","Model Dimension or width."],["V_vocab","Vocabulary size."],["12","Approximate factor per dense Block: Q/K/V/O contribute about 4D² and a standard 4D MLP about 8D²; GQA and SwiGLU change it."],["N","Number of trainable parameters; the displayed formula assumes Weight Tying."],["D_tokens","Total number of training Tokens, not the Model Dimension."],["16N Bytes","Concrete assumption: BF16 Weight 2 + BF16 gradient 2 + FP32 master Weight 4 + two FP32 Adam moments 8 Bytes per parameter."],["P_eff","Assumed sustained effective throughput; the lab uses 400 TFLOP/s, not a guaranteed Hardware Peak."],["B, H, T","Batch size, Heads, and Context length; the Score display normalizes to B=H=1 and the real total must be multiplied by both."]],
      "observe": "Double L, D_model, V, and T one at a time. Check which terms respond linearly, quadratically, or not at all.",
      "misconception": "16N bytes is neither just AdamW Optimizer state nor total GPU memory. It describes one mixed-precision assumption; activations, temporary buffers, and communication are additional.",
      "transferQuestion": "Which assumption behind this approximation breaks for Mixture of Experts or very long contexts?",
      "transferAnswer": "The approximation essentially assumes a dense transformer where total parameters and active parameters per token largely coincide. With Mixture of Experts, only a few experts are activated per token, so total parameters, active compute work, routing, and communication must be calculated separately. For very long contexts, the quadratic T×T attention terms and their activations become so significant that the rough calculation 6ND or a purely parameter-based memory estimate is no longer sufficient."
    },
    "triton-tile": {
      "title": "Triton Grid, Tile & Mask Kata",
      "desc": "Map Programs to tiles, derive offsets, and protect boundary lanes at both load and store.",
      "mental": "A Triton Program usually processes not one array element but a fixed block of parallel lanes. program_id selects the block; arange creates the lane indices inside it. Because array length is rarely a multiple of block size, some lanes of the last Program point beyond the valid end and their memory accesses must be masked.",
      "formula": "grid = ceil_div(N, BLOCK_SIZE)  ·  offsets = program_id·BLOCK_SIZE + arange(0,BLOCK_SIZE)  ·  mask = offsets < N",
      "symbols": [["N","Number of valid elements in the vector."],["BLOCK_SIZE","Parallel lanes per Triton Program; commonly a power of two."],["grid","Number of launched Programs."],["program_id","Index of the currently inspected Program."],["offsets","Global element indices of its lanes."],["mask","Boolean vector: true only for valid offsets."]],
      "observe": "Start with N=17 and BLOCK_SIZE=8. Predict how many Programs launch and which lanes of program_id=2 are valid. Then change exactly one quantity.",
      "misconception": "program_id is not an element index. One Program owns BLOCK_SIZE lanes. ceil_div deliberately launches a partially empty boundary Program; the mask predicates its invalid memory accesses but does not make those lanes cease to exist.",
      "transferQuestion": "Why must the same boundary condition be used at store even if a masked load returns zero for invalid lanes?",
      "transferAnswer": "A masked load only prevents reading invalid addresses and returns a replacement value for those lanes. The lanes still exist in the Program and can compute a result from that value. Without the same condition at store, they would then write beyond y[0:N] and corrupt unrelated memory. Correctness therefore requires every potentially out-of-bounds memory access—load and store—to be protected by offsets < N."
    },
    "online-softmax-kata": {
      "title": "Online Softmax: Tile Accumulator",
      "desc": "Carry a running maximum, exponential sum, and weighted Value accumulator across two tiles and compare the result with direct Softmax.",
      "mental": "Softmax appears to need the complete score row because every numerator uses the same global denominator. Online Softmax instead stores only a running maximum, an exponential sum scaled to that maximum, and—within Attention—a weighted Value sum for each Query row. If a later tile contains a larger maximum, every earlier contribution is converted to exactly the same new scale.",
      "formula": "m′=max(m,max(s_tile))  ·  α=e^(m−m′)  ·  ℓ′=αℓ+Σ_j e^(s_j−m′)  ·  O′=αO+Σ_j e^(s_j−m′)v_j  ·  output=O′/ℓ′",
      "symbols": [["s_j","Attention score of one Key position for the current Query."],["m, m′","Previous and updated row maximum."],["α","Rescaling factor applied to every already accumulated contribution."],["ℓ, ℓ′","Sum of exponentials scaled to the respective maximum."],["v_j","A scalar Value in this teaching example; in practice a vector with d_v features."],["O, O′","Unnormalized weighted Value sum; in practice one vector per Query row."]],
      "observe": "First calculate tile 1 with scores [0,1]. Then set the second-tile score to 2 and predict m′, α, ℓ′, and the largest Softmax probability before opening the quick check.",
      "misconception": "Updating only ℓ is insufficient for Attention. When the maximum increases, both the old exponential sum and the old weighted Value accumulator must be rescaled by the same factor α; otherwise contributions expressed on different numerical scales are mixed.",
      "transferQuestion": "Why is the online result mathematically exact even though the complete score row is never stored at once?",
      "transferAnswer": "After every tile, m, ℓ, and O represent exactly the same global sums as direct Softmax over all scores seen so far, only relative to the current maximum m. If the maximum increases, α=e^(m_old−m_new) multiplies all earlier exponential contributions by precisely the factor that changes their reference from m_old to m_new. New contributions are already added relative to m_new. After the final tile, O/ℓ is therefore the same weighted Value sum as direct stable Softmax; the quadratic score matrix never has to be stored in High Bandwidth Memory."
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
      "symbols": [["P, G, O","Bytes for Parameters, gradients, and Optimizer State."],["W","World Size: number of participating Ranks."],["DDP","Distributed Data Parallel: a full model copy on every Rank."],["ZeRO","Zero Redundancy Optimizer: progressively distributes redundant training state."],["FSDP","Fully Sharded Data Parallel: Parameters, gradients, and Optimizer State are distributed."],["All-Reduce","Combines corresponding Tensor values from every Rank and returns the complete reduced result to every Rank."],["Reduce-Scatter","Combines values like All-Reduce but leaves a different 1/W shard on every Rank."],["All-Gather","Exchanges distinct shards so every Rank temporarily receives the complete Tensor."]],
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
    "scaling-fit": {
      "title": "Lower Envelope, Log Fit & Holdout",
      "desc": "Select the supported interior minimum for each compute tier, exclude boundary minima, and validate the Power-Law fit on a held-out tier.",
      "mental": "A Scaling-Law fit must not use all runs. First find the lowest fully trained Loss within every fixed compute budget. Only when smaller and larger model sizes both have higher Loss is that point a supported interior optimum. Only these Lower-Envelope points are fitted in log space.",
      "formula": "per tier: N_opt = argmin_N Loss(C,N)  ·  log N_opt = a·log C+b  ·  N_pred = exp(b)·Cᵃ",
      "symbols": [["C","Compute tier; shown here in didactic EFLOP units."],["N","Model parameters; shown here in millions."],["N_opt","Model size with the smallest supported Loss within a tier."],["a, b","Slope and intercept of the Log-Log fit."],["Lower Envelope","Sequence of the best valid runs across compute tiers."],["Leave-one-tier-out","Remove one tier, fit without it, and then predict it."]],
      "observe": "First select only the smallest Loss values. Then separately check whether measured points exist on both sides. Start the fit only after classifying the boundary minimum correctly.",
      "misconception": "The lowest observed run is not automatically compute-optimal. At a search boundary, all you know is the direction in which the curve is still falling; the true minimum may lie outside the tested range.",
      "transferQuestion": "Why must a lowest Loss at the boundary be excluded from the Power-Law fit even though it is the best completed run in its tier?",
      "transferAnswer": "A boundary minimum provides only an inequality: the optimum may lie farther outside the tested N range. Fitting its observed N as an exact N_opt value pulls the slope in an unknown direction and understates uncertainty. The run remains useful evidence for the next search direction, but becomes a valid Lower-Envelope point only after measurements on both sides."
    },
    "filtering-mechanics": {
      "title": "KenLM vs fastText vs DSIR",
      "desc": "Apply three filtering objectives to the same toy documents and separate target likelihood, class probability, and density ratio.",
      "mental": "The three methods inspect the same documents but optimize different scores. A target Language Model prefers high target likelihood, or equivalently low Perplexity. A discriminative classifier prefers high p(Target|x). DSIR prefers a high ratio p_T(x)/p_R(x) and uses it for probabilistic resampling so the selected data better resemble the target distribution.",
      "formula": "KenLM ranking ∝ p_T(x) or 1/PPL(x)  ·  fastText ranking = p(T|x)  ·  DSIR w(x)=p_T(x)/p_R(x), w̃_i=w_i/Σ_jw_j",
      "symbols": [["x","One raw document."],["T, R","Target corpus and raw corpus."],["p_T(x)","Estimated density under the target model."],["p_R(x)","Estimated density under the raw or proposal model."],["p(T|x)","Discriminative probability of the target label."],["w̃_i","Normalized DSIR Resampling Weight; all w̃ values sum to one."]],
      "observe": "Change only the method and predict which document will win before revealing the result. Explain the ranking from the method's particular question, not with a generic word such as quality.",
      "misconception": "DSIR is neither p_T alone nor a deterministic top-k method. A large ratio means target-specific relative to the raw corpus; resampling treats that ratio as a probability and can preserve diversity.",
      "transferQuestion": "Why does document B with p_T=0.20 receive a larger DSIR Weight than document A with p_T=0.30?",
      "transferAnswer": "A has the larger p_T, but DSIR divides by raw density: w_A=0.30/0.60=0.5 and w_B=0.20/0.10=2. B is therefore represented four times more strongly in the target relative to its occurrence in the raw corpus. With only these two candidates, the normalized Resampling Weights would be 0.2 and 0.8; they are selection probabilities, not a guarantee that B is chosen in every individual sample."
    },
    "bloom-filter": {
      "title": "Bloom Filter Simulator",
      "desc": "Vary the bit budget, number of inserts, and number of Hash Functions; observe Bit-Array occupancy, False-Positive probability, and the optimal k.",
      "mental": "Every inserted element sets k positions in one shared Bit Array. A negative query finds at least one zero bit and is definitely absent. A positive query finds k ones, but other elements may have set them. Memory m, inserts n, and the number of hashes k jointly determine this uncertainty.",
      "formula": "P(bit=0)=(1−1/m)^(kn)≈e^(−kn/m)  ·  FPR=[1−P(bit=0)]^k  ·  k*=(m/n)ln2",
      "symbols": [["m","Number of bits in the Bloom Filter."],["n","Number of inserted elements."],["k","Hash Functions, or tested bit positions, per element."],["FPR","False-Positive Rate across queries about truly absent items."],["k*","Real-valued optimum; compare nearby integer values in practice."]],
      "observe": "Change only m, n, or k at a time. Explain why FPR can be U-shaped as a function of k and why approximately 50 percent Bit-Array occupancy at the optimum does not mean a 50 percent FPR.",
      "misconception": "More Hash Functions are not monotonically better. They make the query stricter but also fill the Bit Array faster; beyond k*, the extra occupancy dominates.",
      "transferQuestion": "Why does a negative Bloom result mean ‘definitely absent,’ while a positive result means only ‘possibly present’?",
      "transferAnswer": "An inserted element sets every one of the k bits that its query later checks. If even one tested bit is zero, the element cannot have been inserted under the standard contract. If all k bits are one, the cause is ambiguous: other inserted elements may collectively have set those same positions. That ambiguity is the possible False Positive; without deletion or implementation errors, inserted elements do not produce False Negatives."
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
    "dedup-pipeline": {
      "title": "Near-Dedup Step by Step",
      "desc": "Trace four documents from normalization and word bigrams through MinHash and LSH to exact verification and transitive clustering.",
      "mental": "Near-Deduplication consists of two separate tasks. MinHash and Locality-Sensitive Hashing (LSH) are a cheap retrieval stage: they find pairs that may be similar. Only an exact similarity rule decides which candidates are truly connected. Connected edges then form entire duplicate clusters—even when not every document pair in a cluster is directly similar enough.",
      "formula": "S(d)=word_bigrams(normalize(d))  ·  J(A,B)=|S_A∩S_B|/|S_A∪S_B|  ·  LSH collision ⇒ candidate  ·  J>τ ⇒ edge  ·  clusters=connected_components(edges)",
      "symbols": [["S(d)","Set of normalized contiguous word bigrams for a document."],["J","Exact Jaccard Similarity between two shingle sets."],["MinHash","Short signature whose match rate estimates Jaccard."],["LSH","Locality-Sensitive Hashing: bandwise signature collisions for candidate retrieval."],["τ","Exact verification threshold; the transfer case uses strict J>0.5."],["Connected Component","Maximal document set connected transitively through accepted edges."]],
      "observe": "Work through all seven steps in order. Before opening a step, predict what information is lost and why the next step remains necessary.",
      "misconception": "An LSH collision is not yet a duplicate, and a missing direct edge does not automatically imply different clusters. Retrieval may return false positives; exact verification removes them, then connected components add transitivity.",
      "transferQuestion": "Why are A and C in the same cluster at τ=0.5 even though their direct Jaccard is below threshold—and why does D remain separate despite an LSH collision?",
      "transferAnswer": "At τ=0.5 the exactly verified edges are A–B and B–C. Connected components use reachability, so the path A→B→C joins all three documents even though A–C itself is not an accepted edge. A–D does collide in one LSH band, but exact Jaccard is only 2/6≈0.333 and fails J>0.5. LSH therefore supplies candidates for expensive verification, not final duplicate decisions."
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
    "answer-parsing": {
      "title": "From model text to score: format, parser & reward",
      "time": "16 min",
      "desc": "Send the same six rollouts through three graders and the same eight benchmark answers through four parser rules. What you read off is how much of a score belongs to the model and how much to the single line that takes the text apart — exactly the counting task of prompting_baselines and the parser functions of mmlu_baseline and gsm8k_baseline.",
      "mental": "A benchmark score never comes straight out of the model; it comes out of a chain: prompt → generated text → parser → comparison against the gold answer → mean. Every link of that chain can produce a zero, and none of them crashes while doing so. That is why A5 separates two rewards that are easy to throw into one. The format reward asks only: is the answer where the parser looks for it? The answer reward asks next: is it right? Anyone who only looks at the total score cannot tell those two causes apart — a model that can do the arithmetic but never closes its tags looks exactly like one that computes the wrong number. That separation is also why the handout only logs the format reward instead of rewarding it: it is a diagnostic, not a goal.",
      "formula": "format reward ∈ {0,1}  ·  answer reward ∈ {0,1}  ·  total = answer reward (no partial credit)  ·  accuracy_all = k/n  ·  accuracy_parsed = k/n_parsed  ·  SE = √(p(1−p)/n)  ·  95 % interval ≈ p ± 1.96·SE",
      "symbols": [["n, k","Number of evaluated examples and how many of them were correct. Under GRPO, n is additionally the group size G of the rollouts for a single question — exactly the case in mode A."],["format reward","1 if the answer sits where the grader looks for it: between <answer> tags for the r1_zero prompt, inside \\boxed{} for the question_only prompt. It does not judge the content."],["answer reward","1 if the parsed text matches the gold answer after normalization. Without format there is no parsed text and therefore no answer reward — which is why exactly the handout's three categories arise and never a fourth."],["total reward","In A5 without partial credit, so equal to the answer reward. The format reward is only logged."],["category 1, 2, 3","Format 1 and answer 1 · format 1 and answer 0 · format 0. The handout has you count exactly these three and then read, in categories 2 and 3, how many answers were correct in substance."],["gold answer","The reference value. In GSM8K it sits behind #### in the rationale and has to be split off first; in MMLU it is the letter."],["normalization","Before comparing, this lab removes whitespace, $ and thousands separators and then compares numerically, otherwise character by character. „72 clips“ is therefore not equal to „72“ — precisely the place where a real math grader would do more."],["n_parsed","Number of examples for which the parser returned anything at all. Accuracy_parsed averages over those only and thereby silently drops the hard cases."],["SE","Standard error of a proportion. It says how much p̂ fluctuates from the finite sample alone; it says nothing about parser or prompt errors, because those do not shrink with larger n."]],
      "observe": "Start in mode A with the question_only prompt and step through the graders: r1_zero_reward_fn returns a flat 0 %, although four of the six rollouts are correct when you read them. Then switch the prompt to r1_zero and leave the grader on question_only — 0 % again. The diagonal is the whole point: the wrong grader does not crash, it just returns zero everywhere. Next compare r1_zero and r1_zero_three_shot under their own grader: the score doubles from 33 % to 67 %, while the row „correct when read“ rises only from 4 to 5. Read off there which part of the jump is arithmetic and which part is format compliance. In mode B, set MMLU to „first letter“ and to „sentence pattern, else option text“: both report the same four numbers and still treat two examples in exactly opposite ways.",
      "misconception": "A low score says nothing about the model until the parser has been checked. Conversely, a high accuracy_parsed is no mark of quality: the stricter a rule parses, the more hard cases drop out beforehand and the better the rest looks — in this lab the rule with the worst overall accuracy reaches the second-best parsed value. And the standard error measures the sample only. A parser bug is not noise; it does not disappear when you evaluate more examples, it merely gets measured more precisely.",
      "transferQuestion": "Few-shot lifts the measured score in this lab from 33 % to 67 %, while the number of answers that are correct when read rises only from 4 to 5. What exactly improved, and with which single number from the ledger would you show that to someone claiming the model suddenly computes better because of three examples?",
      "transferAnswer": "What improved is almost entirely format compliance, not arithmetic. The number that shows it sits right in the ledger: „correct when read“ goes from 4 to 5, while the scored count jumps from 2 to 4 rollouts. Of the two additionally scored answers, exactly one is new in substance; the other was already correct before and simply was not counted. You can read that off the categories: under r1_zero one rollout sits in category 3 because the model keeps talking after </think> and never opens the answer tags — the answer 72 is in the text but never gets parsed. Under r1_zero_three_shot no rollout falls into category 3 any more; the three worked examples in front show the model how an answer ends, and that is what it copies. What few-shot does not fix is the rollout with „<answer> 72 clips </answer>“: perfect format, right number, and still answer reward 0, because normalization does not map „72 clips“ onto 72. That one stays in category 2. From this follows the defensible wording for a report: „Few-shot lifts format compliance from 5/6 to 6/6 and the scored result from 33 % to 67 %; of the two rollouts gained, one was already correct in substance beforehand.“ Reporting the score alone implicitly claims twice the improvement the model delivered. And that is exactly why prompting_baselines asks you to read at least ten examples from categories 2 and 3 instead of only counting the three categories: the number alone does not say whether a zero came from the model or from the parser."
    },
    "inference-budget": {
      "title": "Inference Memory & Latency Budget",
      "desc": "Derive KV Cache and weight memory from shapes and separate prefill, decode, and batch trade-offs.",
      "mental": "Inference has two dominant memory blocks: model weights and a request-dependent Key-Value Cache. Grouped-Query Attention changes both because fewer Key-Value Heads mean not only a smaller cache but also smaller K and V projection matrices. In memory-bandwidth-limited decode, bytes read divided by High Bandwidth Memory (HBM) bandwidth gives an ideal latency lower bound—not a guaranteed runtime.",
      "formula": "d_head=D/H_q · F=4D · P=c_tie·VD+L(3DF+2D²+2D·H_kv·d_head) · M_KV=2·L·B·S·H_kv·d_head·b_KV · M_step=P·b_w+M_KV · t_decode,ideal=M_step/BW_HBM · throughput_ideal=B/t",
      "symbols": [["L","Number of Transformer Layers; each maintains its own KV Cache."],["B","Concurrently active Sequences."],["S","Already cached Key/Value positions per Sequence; grows by one per Decode Step."],["D, F","Model Dimension and the displayed gated-MLP width F=4D."],["H_q, H_kv, d_head","Query Heads, Key-Value Heads, and the unambiguous Head width d_head=D/H_q."],["G=H_q/H_kv","Query Heads sharing each Key-Value Head."],["P, M_KV, M_step","Total parameters, request-dependent KV Cache, and ideal bytes read per Decode Step M_step=P·b_w+M_KV."],["c_tie","1 with Weight Tying, otherwise 2 for separate Input Embedding and LM Head."],["V","Vocabulary size, fixed at 50,000 in the lab."],["b_w, b_KV","Bytes per Weight or Cache element."],["BW_HBM","Ideally usable HBM bandwidth; real Kernels achieve less."],["t_decode","Idealized lower bound for one Decode Step, not Time to First Token."]],
      "observe": "Change only S, B, H_kv, weight tying, precision, or bandwidth at a time. Predict first whether parameters, weight memory, KV Cache, ideal decode latency, or throughput will respond. Then compare prefill and decode through their arithmetic intensity.",
      "misconception": "Fewer Key-Value Heads do not change only the cache: the K and V projection weights also shrink. The bandwidth calculation is only an ideal lower bound for latency and upper bound for throughput; compute, scheduling, and runtime overhead are additional.",
      "transferQuestion": "A server performs well for short prompts but runs out of memory with long contexts and large batches. Which two independent levers would you calculate first, and why?",
      "transferAnswer": "First I would calculate the request-dependent Cache term 2·L·B·S·H_kv·d_head·b_KV: reducing H_kv through GQA or MQA and storing KV elements in fewer Bytes directly affects the part that grows with B and S. Independently, I would derive Weight memory P·b_w from the exact architecture breakdown and examine suitable Weight Quantization. Both levers require quality and Kernel measurements; a smaller Cache cannot fix an oversized Weight model, and smaller Weights cannot prevent a Cache explosion at long Context."
    },
    "dpo-loss": {
      "title": "DPO Loss: Reference Anchor, Length & logsigmoid",
      "time": "16 min",
      "desc": "Work the DPO loss from Equation (3) through four preference pairs in simulated float32 arithmetic and find the pairs on which a wrong implementation returns a bit-identical result to the correct one.",
      "mental": "Equation (3) of the A5 supplement needs four sequence log-probabilities: one each for the preferred and the rejected response, under the trained policy and under the frozen reference. From these comes first a policy-to-reference margin per response, then their difference, and from that the DPO logit h scaled by β. Three decisions are easy to miss here, and each one changes the objective: the sequence values are summed and not averaged per token, both reference terms have to stay in, and −log σ(h) is evaluated as softplus(−h) so that σ(h) never becomes a float32 number of its own. None of these three decisions shows up on an arbitrarily chosen preference pair.",
      "formula": "h = β·[(log πθ(y_w|x) − log π_ref(y_w|x)) − (log πθ(y_l|x) − log π_ref(y_l|x))]  ·  ℓ_DPO = −log σ(h) = softplus(−h) = log(1 + e^(−h))  ·  log πθ(y|x) = Σ_t log πθ(y_t | x, y_(<t))  ·  β = 0.1",
      "symbols": [["y_w, y_l","Preferred and rejected response to the same prompt x. Their order is the only information a preference pair carries at all."],["log πθ(y|x)","Sum of the response's token log-probabilities under the trained policy—explicitly the sum, not its mean."],["log π_ref(y|x)","The same sum under the frozen reference. It is the anchor against which the policy's deviation is measured."],["h","The DPO logit: the difference of the two policy-to-reference margins, scaled by β. Positive h means the policy has raised the preferred response relative to the reference more than the rejected one."],["β = 0.1","Weight of the reference regularization; this is exactly the value the supplement names for DPO training. β scales h and thus the steepness, never the direction of the preference."],["σ(h)","Logistic function. In the correct implementation it never becomes a number of its own."],["softplus(−h)","The reduced form of −log σ(h). For h < 0 it is evaluated as −h + log(1 + e^h) so that e^(−h) cannot overflow."],["float32","The precision the tests run at: e^x overflows to infinity above x ≈ 88.7 and underflows to exactly zero below x ≈ −104."],["log 2 ≈ 0.693147","The loss at h = 0. This value marks a policy that treats both responses exactly alike relative to the reference."]],
      "observe": "Start with the pair of differing response lengths and read all five variants: only \"form σ(h) first\" agrees with the reference there. Then switch to the pair where the reference scores both responses equally—only there does the variant without the reference terms become bit-identical. On the pair without a preference margin, swapping and token averaging both disappear at once. And only the long, highly confident pair exposes \"form σ(h) first\" with +∞.",
      "misconception": "A DPO loss that returns the expected value on one test pair proves none of the three requirements. Each of this lab's four wrong variants is bit-identical to the correct implementation on at least one pair—and the variant without the reference terms, which changes the objective most severely, is invisible precisely when the test pair was built with a neutral reference.",
      "transferQuestion": "Why does \"form σ(h) first, then take the logarithm\" return +∞ at a DPO logit of h = −119, while the same formula written as softplus(−h) gives a harmless number close to 119?",
      "transferAnswer": "Both routes compute the same function, but only one of them forms σ(h) as a float32 number of its own. σ(−119) = 1/(1 + e^119) first requires e^119 ≈ 4.8·10⁵¹. The largest representable float32 number is about 3.4·10³⁸, so this intermediate value overflows to plus infinity. 1/(1 + ∞) is exactly zero, and −log(0) is plus infinity—the loss is useless and so is its gradient, even though the mathematically correct result of about 119.0 is entirely harmless. For negative h, softplus(−h) uses the branch −h + log(1 + e^h): the large contribution 119 appears directly as a summand and is preserved exactly, and the second term only needs e^(−119) ≈ 1.6·10⁻⁵². That value does underflow to zero, but log(1 + 0) = 0 is exactly the limit the term approaches mathematically—the error stays below the float32 resolution of 119. This is the same mechanism as the cross-entropy loss in A1: never form a probability as an intermediate value that you then want to take the logarithm of; cancel log and exp against each other instead. In PyTorch that means concretely: torch.nn.functional.logsigmoid instead of torch.log(torch.sigmoid(...)). The difference is invisible on all three harmless preference pairs in this lab because |h| stays at 0.1 or below there—it appears only once long responses and a very confident policy pull the sequence sums far apart, and that happens routinely in training."
    },
    "policy-loss-tracer": {
      "title": "Shift → Mask → Policy Loss",
      "time": "14 min",
      "desc": "Trace two padded prompt-response sequences to a masked Policy-Gradient Loss and compare sequence with token aggregation.",
      "mental": "At position t, a causal Language Model always predicts the next token t+1. Inputs and target labels are therefore shifted against each other. Only then does an equally aligned response_mask identify which target tokens truly belong to the response. From the Vocabulary distribution, Gather selects the Log-Probability of the observed label; the factor −A turns a positive Advantage into pressure to increase that probability.",
      "formula": "input_ids=tokens[:,:−1]  ·  labels=tokens[:,1:]  ·  ℓ_it=−A_i log p_θ(labels_it | input prefix)  ·  L_seq=(1/B)Σ_i [Σ_t mask_it·ℓ_it / Σ_t mask_it]",
      "symbols": [["B","Number of prompt-response rows in the Rollout Batch."],["t","Position on the sequence axis remaining after the Shift."],["input_ids","Tokens from which the model computes the distribution for the following token."],["labels","Target tokens shifted one position to the left."],["response_mask","Zero for Prompt and Padding labels, one for real response labels."],["log p_θ","Log-Probability of the observed label token under the current Policy."],["A_i","Advantage of complete response i; positive means relatively better, negative relatively worse."]],
      "observe": "First write full tokens, input_ids, and labels beneath one another. Then mark only real response tokens on the label row. Only after that calculate −A·log p and both reduction variants.",
      "misconception": "The mask does not remain attached unchanged to the original input positions. It must align with the shifted labels. Gather also selects not the largest Logit, but the Log-Probability of the specified target token.",
      "transferQuestion": "Why do the sequence mean and global token mean produce different Losses here even though they use the same three response tokens?",
      "transferAnswer": "With sequence means, each response is first divided by its own number of valid tokens. The short and long response therefore receive equal outer weight in the Batch: (0.30−0.60)/2=−0.15. A global token mean instead adds all three valid tokens and only then divides: (0.20+0.40−0.60)/3=0. Longer responses contribute more summands there. The tokens are the same, but the reduction rule defines a different weighting of sequences."
    },
    "grpo": {
      "title": "GRPO Advantage & Aggregation Simulator",
      "time": "16 min",
      "desc": "Vary group rewards, response lengths, standard-deviation normalization, and loss aggregation; trace the actual weight of every token and response.",
      "mental": "Group Relative Policy Optimization (GRPO) compares several responses to the same prompt. The Advantage states whether one response performed better or worse than its siblings. The subsequent token and sequence aggregation then determines how strongly that Advantage affects each response token and the complete sequence.",
      "formula": "μ = (1/G)Σ_i R_i  ·  σ_A5 = √[(1/(G−1))Σ_i(R_i−μ)²]  →  A_i = (R_i−μ)/(σ+ε)  →  L ∝ −Σ_i Σ_t mask_it·c_it·log π(y_it|x,y_i,<t)",
      "symbols": [["G","Number of responses in one prompt group."],["R_i","Reward for response i."],["μ, σ","Mean and standard deviation of the group rewards."],["A_i","Group-relative Advantage of response i."],["n_i","Number of unmasked response tokens in sequence i."],["c_it","Weight of token t determined by the aggregation rule."],["ε","Small constant that prevents division by zero."]],
      "observe": "First change only one reward, then only one response length, and finally the aggregation rule. Distinguish the Advantage, weight per token, and total response weight; they are not the same quantity.",
      "misconception": "A positive Reward can have a negative Advantage when it falls below the group mean. Equal rewards provide no signal. Sequence means, a global token mean, and a fixed denominator also reweight long responses differently.",
      "transferQuestion": "How does standard-deviation normalization change the weighting of easier and harder prompt groups?",
      "transferAnswer": "In Group Relative Policy Optimization, a reward difference within each prompt group is divided by its standard deviation. The same absolute distance thus receives greater weight in a group with small spread and lesser weight in a group with large spread, so prompt groups are reweighted according to their reward spread. If all answers in a group have the same reward, the centered numerator is zero and the group provides no relative learning signal despite the stabilization term."
    },
    "transformer-ledger": {
      "title": "A1 Transformer Accounting Gate",
      "desc": "Compute the complete parameter and forward-FLOP contract of a fixed A1 toy architecture without approximation factors.",
      "mental": "Exact architecture accounting is a bill of materials. Count matrices and gains with their Shapes first, then repeat each matrix across T tokens, and finally add the two position-quadratic Attention products.",
      "formula": "P=2VD+L(4D²+3DF+2D)+D  ·  F_block=8TD²+4T²D+6TDF  ·  F_fwd=L·F_block+2TDV",
      "symbols": [["V,D,F,L,T","Vocabulary, Model Dimension, SwiGLU width, blocks, and Sequence Length."],["4D²","Q, K, V, and Output projections."],["3DF","SwiGLU gate, value, and output projections."],["4T²D","QKᵀ and PV together."]],
      "observe": "Use V=1000, D=64, F=192, L=3, and T=32. Assign every number to one architecture component before summing.",
      "misconception": "The rough 12LD² formula is not a substitute here. A1 specifies a concrete SwiGLU width, untied Vocabulary matrices, and norm gains.",
      "transferQuestion": "Which terms react linearly or quadratically when only T doubles?",
      "transferAnswer": "When T doubles, projection, SwiGLU, and LM-Head terms double because they process each additional token row once. The 4T²D term from QKᵀ and PV quadruples because both Query and Key position axes grow. Parameter counts remain completely unchanged."
    },
    "kernel-contracts": {
      "title": "2D Triton & Flash Backward Gate",
      "desc": "Check a 2D grid, boundary masks, partial buffer, and the central FlashAttention-backward invariant.",
      "mental": "A 2D kernel has two independent boundary axes. A reduction across multiple programs requires explicit intermediate state or atomics. Flash backward instead reconstructs the same masked probabilities blockwise from saved row statistics.",
      "formula": "grid=(ceil(R/BR),ceil(D/BD))  ·  partial_dw:[ceil(R/BR),D]  ·  dS=P⊙(dOVᵀ−rowsum(O⊙dO))",
      "symbols": [["R,D","Rows and feature width."],["BR,BD","Tile sizes of the two grid axes."],["partial_dw","Disjoint partial reduction for each row tile."],["dS","Gradient of the scaled Attention scores."]],
      "observe": "Use R=37, D=70, BR=16, and BD=32. Derive both grid axes, the partial Shape, and the dS row sum.",
      "misconception": "A program barrier does not synchronize other programs, and the Forward and backward masks must not differ.",
      "transferQuestion": "Why does dw need a second reduction step while dX does not?",
      "transferAnswer": "dX_rd=g_r·w_d belongs to exactly one Output element and can be produced per tile without competing writers. In dw_d=Σ_r X_rd·g_r, every row tile contributes to the same feature d. Without atomics, each row tile therefore writes a partial value that is reduced across the tile axis afterward."
    },
    "distributed-runtime": {
      "title": "Distributed Runtime Gate",
      "desc": "Separate total World Size, data Batch Size, Collective ordering, async lifetime, and overlap.",
      "mental": "Process Groups define who participates in each Collective. The parallelism product counts processes, but only the Data-Parallel degree counts independent examples. An asynchronously launched Collective is complete only after wait or a proven dependency.",
      "formula": "W_total=d·t·p  ·  B_global=B_micro·accum·d  ·  T_step≈T_compute+max(0,T_comm−T_overlap)",
      "symbols": [["d,t,p","Data-, Tensor-, and Pipeline-Parallel degrees."],["accum","Microbatches per update."],["async handle","Evidence of launch, not completion."],["T_overlap","Communication actually concurrent with Compute."]],
      "observe": "Set d=4, t=4, p=2, B_micro=2, and accumulation=4. Then justify the last safe wait boundary before the Optimizer Step.",
      "misconception": "Total World Size and Data-Parallel World Size are not interchangeable, and async_op=true does not automatically make a later tensor access safe.",
      "transferQuestion": "How can a smaller DDP bucket enable earlier overlap while amortizing latency less effectively?",
      "transferAnswer": "A smaller bucket can launch as soon as its few gradients are ready and thus overlap more Backward Compute. At the same time, more Collective calls move fewer bytes each, so the fixed latency term is paid more often and becomes relatively larger. The best size must be measured."
    },
    "scaling-transfer": {
      "title": "μP, WSD & Scaling Fit Gate",
      "desc": "Check offset fitting, Lecture 11 μP roles, and the finality boundary of a WSD Checkpoint.",
      "mental": "Fit, parameterization, and schedule answer different questions. An offset belongs before the Loss logarithm, μP scales by matrix role, and Warmup-Stable-Decay (WSD) is completed only by a defined Decay.",
      "formula": "N_opt=A_NCᵃ  ·  D_opt=A_DCᵇ  ·  L_opt=E+A_LC^(−γ)  ·  r=4: Hidden std×1/2, Readout std×1/4",
      "symbols": [["E","Loss offset before taking log(L−E)."],["a,b","Compute exponents for Model and data."],["r","Width ratio M/M₀."],["WSD","Warmup, Stable, and Decay."]],
      "observe": "Derive every initialization and Adam factor for Embedding, Hidden, and Readout at r=4. Then decide which Checkpoints are final and comparable.",
      "misconception": "μP is not one global learning-rate factor, and a Stable Checkpoint before its defined Decay is not a completed WSD endpoint.",
      "transferQuestion": "Why can a poorly chosen E change the extrapolated Loss slope?",
      "transferAnswer": "The fit uses log(L_opt−E), not log L_opt. Changing E strongly shifts small residual distances and therefore changes the Log-space slope γ. Because coupled E and γ values can produce similarly plausible fits, the extrapolation needs constrained offsets or sensitivity intervals."
    },
    "moe-routing": {
      "title": "MoE Routing & Capacity Gate",
      "desc": "Separate Top-k normalization, Expert Capacity, overflow, Auxiliary Loss, and device utilization.",
      "mental": "Sparse routing is both a probability and a systems contract. Top-k chooses active Experts, Capacity limits assignments, overflow needs a policy, and the Balance Loss combines hard dispatch frequency with differentiable Router probability.",
      "formula": "capacity=ceil(c·T·k/E)  ·  L_balance=αEΣ_e f_eP_e",
      "symbols": [["T,k,E","Tokens, selected Experts per token, and Expert count."],["c","Capacity Factor."],["f_e","Hard dispatch fraction."],["P_e","Mean Router probability."]],
      "observe": "Use T=8, k=2, E=4, and c=1.0. Compute Capacity, overflow when Expert 0 receives six assignments, and Auxiliary Loss under uniform routing.",
      "misconception": "The Balance Loss is not zero for uniform routing, although its gradient can promote balance. Expert Load and device load are not always identical.",
      "transferQuestion": "Why can perfect Expert balance still produce a slow All-to-All step?",
      "transferAnswer": "Perfect Expert balance counts assignments per Expert but does not automatically balance bytes, topology, or Expert-to-device placement. Several equally loaded Experts may share one device, token destinations may be uneven across links, and a slow Rank or unfavorable All-to-All route can still determine the straggler."
    },
    "rlvr-system-transfer": {
      "title": "A5 Variants & RLVR System Gate",
      "desc": "Correctly map GRPO variants, sequence Ratios, GSPO, Policy versions, and the SFT→DPO data flow.",
      "mental": "An A5 experiment is interpretable only when its algebraic variant contract and system versions agree. Rollout data belong to the Old Policy; DPO additionally uses a fixed Reference and four response-only sequence Log-Probabilities.",
      "formula": "variant=(baseline,normalizer,denominator)  ·  W=exp(ΣΔlogπ)  ·  s_GSPO=exp(mean Δlogπ)",
      "symbols": [["Old","Policy that generated the Rollout."],["Current","Policy being updated."],["Reference","Fixed KL or DPO comparison Policy."],["response-only","Prompt, Template, and Padding are masked from sequence sums."]],
      "observe": "Map Standard GRPO, Dr. GRPO, RFT, and MaxRL to their three design axes. Then identify which artifacts remain frozen between Rollout and update.",
      "misconception": "GSPO is not the exact sequence Importance Weight; R1, R1-Zero, Kimi, and Qwen are not controlled single-algorithm Ablations.",
      "transferQuestion": "Which four response-only Log-Probabilities does DPO require, and why does the Reference stay fixed?",
      "transferAnswer": "DPO requires log π_current(chosen|x), log π_current(rejected|x), log π_ref(chosen|x), and log π_ref(rejected|x), each summed only across real response tokens. The fixed Reference defines the unchanged starting baseline; training it would let the comparison point move with the Policy and alter the stated DPO objective."
    }
  },
  "diagnostic": {
    "0": {
      "q": "What is the safe path from Python text to byte-level tokenizer IDs and back?",
      "opts": [
        "str.encode → process bytes → assemble bytes → decode",
        "Immediately decode each individual byte",
        "Treat Unicode code points directly as UTF-8 bytes"
      ],
      "why": "Text and bytes are different representations; decode only after a complete valid byte sequence has been assembled."
    },
    "1": {
      "q": "X has shape (B,T,D), W has shape (D,4D). What is the output shape of X@W?",
      "opts": [
        "(B,T,4D)",
        "(B,4T,D)",
        "(D,T,4B)"
      ],
      "why": "Linear acts on the last axis; B and T remain."
    },
    "2": {
      "q": "Why is max(z) subtracted in stable Softmax?",
      "opts": [
        "The distribution remains unchanged, overflow risk decreases",
        "To make the sum less than 1",
        "For an unbiased gradient"
      ],
      "why": "Softmax is invariant to common logit shifts."
    },
    "3": {
      "q": "At a graph branch, x influences the loss via two paths. What happens during backward pass?",
      "opts": [
        "The path gradients add up",
        "Only the shorter path counts",
        "The gradients are multiplied"
      ],
      "why": "The derivative of a sum is the sum of the contributions."
    },
    "4": {
      "q": "Which statement about backward() is correct?",
      "opts": [
        "It accumulates gradients; the optimizer updates parameters",
        "It updates parameters directly",
        "It automatically clears old gradients"
      ],
      "why": "Autograd and Optimizer are separate; gradients accumulate by default."
    },
    "5": {
      "q": "What does a complete checkpoint-resume test prove?",
      "opts": [
        "The next batch and update match an uninterrupted run",
        "The model state_dict loads without an error",
        "The checkpoint file is smaller than the model"
      ],
      "why": "Exact resume requires optimizer state, schedule, RNG states, data position, and progress in addition to loadable weights."
    },
    "6": {
      "q": "Over which axis does Attention-Softmax normalize?",
      "opts": [
        "Over Key positions per Query",
        "Over Query positions per Key",
        "Over the batch axis"
      ],
      "why": "Each Query builds a distribution over allowed Keys."
    },
    "7": {
      "q": "Which branch mixes sequence positions?",
      "opts": [
        "Attention",
        "position-wise MLP",
        "RMSNorm"
      ],
      "why": "MLP and Norm work position-wise; Attention exchanges information."
    },
    "8": {
      "q": "A GPU timer measures only very short time without synchronization. Likely why?",
      "opts": [
        "GPU work was started asynchronously only",
        "The kernel is always memory-bound",
        "BF16 rounds the time"
      ],
      "why": "CPU dispatch ends before GPU work is completed."
    },
    "9": {
      "q": "What does Activation Checkpointing primarily reduce?",
      "opts": [
        "stored activations against recomputation",
        "optimizer state against communication",
        "parameters against smaller vocabulary"
      ],
      "why": "It trades activation memory for additional forward passes."
    },
    "10": {
      "q": "With C≈6ND and fixed C: N doubles. What holds for D?",
      "opts": [
        "D halves",
        "D doubles",
        "D remains the same"
      ],
      "why": "D=C/(6N)."
    },
    "11": {
      "q": "What does an LSH collision mean?",
      "opts": [
        "Candidate pair that still needs verification",
        "Proof of identical documents",
        "Proof of same language"
      ],
      "why": "Locality-Sensitive Hashing (LSH) is retrieval, not final decision."
    },
    "12": {
      "q": "When is Perplexity directly comparable?",
      "opts": [
        "With the same tokenizer and evaluation setup",
        "Always between any LMs",
        "Only with the same parameter count"
      ],
      "why": "Tokenization and context handling define the unit."
    },
    "13": {
      "q": "Which state grows linearly with batch size and cached context during autoregressive serving?",
      "opts": [
        "Key-Value Cache",
        "Model parameters",
        "Vocabulary size"
      ],
      "why": "The KV Cache stores earlier Keys and Values for every layer, sequence, and position."
    },
    "14": {
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
        "q": "Why does GQA help especially during autoregressive decoding?",
        "opts": [
            "Fewer Key-Value Heads reduce cache size and memory traffic",
            "Queries no longer have to be computed",
            "Softmax is removed completely"
        ],
        "why": "Grouped-Query Attention (GQA) preserves the Query Heads while sharing a smaller number of cached Keys and Values."
    },
    "10": {
        "q": "Which component does DPO not need during training?",
        "opts": [
            "new on-policy rollouts",
            "reference log-probs",
            "preference pairs"
        ],
        "why": "DPO optimizes offline on pairs."
    },
    "11": {
        "q": "Why use a baseline in policy gradient?",
        "opts": [
            "Reduce variance",
            "Make reward differentiable",
            "Normalize policy"
        ],
        "why": "A suitable action-independent baseline preserves the expected gradient."
    },
    "12": {
        "q": "What is the trade-off of PPO clipping?",
        "opts": [
            "Stability against bias",
            "Memory against accuracy",
            "Tokens against parameters"
        ],
        "why": "Clipping cuts high-variance ratios, but changes the estimator."
    },
    "13": {
        "q": "Why can view(-1) fail after transpose?",
        "opts": [
            "The new strides are incompatible with the requested view",
            "transpose changes the data type",
            "view works only on a GPU"
        ],
        "why": "transpose may change only shape and strides; view must not silently copy a required memory reordering."
    },
    "14": {
        "q": "What happens to Linear Layers stored in a regular Python list?",
        "opts": [
            "The parent module does not register their parameters automatically",
            "They are deleted during the Forward Pass",
            "They always share the same weights"
        ],
        "why": "Use ModuleList, ModuleDict, or attributes so parameter iteration, device transfer, and state_dict can see the submodules."
    },
    "15": {
        "q": "What does backward() on a new Forward graph do if zero_grad() has not run since the previous backward()?",
        "opts": [
            "Gradients are added by default",
            "The first gradient is replaced",
            "The optimizer performs a Step automatically"
        ],
        "why": "PyTorch accumulates into .grad; a second Backward Pass through the same already-freed graph would instead fail without retain_graph=True."
    },
    "16": {
        "q": "Why does stable Softmax subtract max(z) first?",
        "opts": [
            "It prevents overflow without changing the probabilities",
            "It makes every logit positive",
            "It removes the Softmax denominator"
        ],
        "why": "Softmax is invariant to a shared shift; afterward every exponent is at most zero."
    },
    "17": {
        "q": "Which score distinguishes DSIR from a pure target-likelihood filter?",
        "opts": [
            "The density ratio p_T(x)/p_R(x)",
            "Only p_T(x)",
            "Only document length"
        ],
        "why": "Data Selection via Importance Resampling (DSIR) measures target specificity relative to frequency in the raw corpus."
    },
    "18": {
        "q": "What does a negative Bloom-Filter result mean when the structure is used correctly without deletion?",
        "opts": [
            "The element is definitely absent",
            "The element is possibly present",
            "Every hash bit is one"
        ],
        "why": "An inserted element would have set all k tested bits, so one zero bit rules out Membership."
    }
},
  "glossary": {
    "g0": {
        "def": "Automatic differentiation of a Computation Graph.",
        "cat": "Foundations",
        "detail": "Autograd is PyTorch's automatic-differentiation system; Backpropagation is the reverse algorithm it executes. During the Forward Pass, a dynamic Computation Graph records which tensors produced each output and saves only values needed by local derivatives. `loss.backward()` starts at the scalar Loss with gradient 1 and traverses the Graph backward. At each edge, the incoming upstream gradient is combined with the local derivative as a Vector-Jacobian Product; contributions add when several paths meet. A parameter W therefore receives `W.grad` with the same Shape as W. Autograd computes these gradients but does not change parameters—the Optimizer does that afterward. PyTorch accumulates leaf gradients, so they must be reset before the next independent Step. Saved activations cost memory; Activation Checkpointing discards selected ones and recomputes them during Backward."
    },
    "g1": {
        "def": "Byte-Pair Encoding: repeatedly merging frequent token pairs.",
        "cat": "Tokenization",
        "detail": "Byte-Pair Encoding (BPE) has two distinct phases. During Tokenizer training, every Pretoken starts as bytes or other small symbols. The algorithm counts adjacent pairs, selects the most frequent pair with a deterministic tie-break, replaces non-overlapping occurrences, and stores the new Merge with its rank. This ordered Merge list is the Tokenizer's learned state; no gradients or neural weights are involved. During later encoding, text is pretokenized identically, split into bytes, and only these fixed learned rules are applied. The result is a variable-length sequence of integer token IDs, which becomes vectors only through an Embedding. More Merges enlarge the vocabulary and often shorten sequences, but not equally across languages. Special Tokens are hard boundaries, and `decode(encode(text)) == text` remains the central round-trip contract."
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
        "detail": "Distributed Data Parallel (DDP) stores a complete copy of the model Parameters and Optimizer State on every Rank. Each Rank processes a different local Batch [b,T] and first computes local gradients with the same Shapes as the Parameters. As soon as a Gradient Bucket is ready, All-Reduce combines corresponding values across Ranks and returns the same averaged gradient to every Rank; all copies then perform the same Optimizer Step and remain synchronized. The global data Batch is approximately World Size × local Batch × Gradient-Accumulation Steps. DDP therefore changes execution, not the model function or per-Rank model size: it increases throughput but saves no persistent Parameter or Optimizer memory per device. A Distributed Sampler must provide different data, and every Rank must invoke Collectives in a compatible order."
    },
    "g7": {
        "def": "Direct Preference Optimization: directly optimizing preference pairs relative to a Reference.",
        "cat": "Alignment",
        "detail": "Direct Preference Optimization (DPO) uses a Prompt x, a preferred response y⁺, and a rejected response y⁻. The trainable Policy sums the Log Probabilities of the Response Tokens in each answer to obtain a Sequence score; a frozen Reference Policy computes the same two scores. The key quantity is Δ=[log πθ(y⁺|x)−log πref(y⁺|x)]−[log πθ(y⁻|x)−log πref(y⁻|x)]: Δ is positive when the new Policy has increased the preferred answer more, relative to the Reference, than the rejected one. The Loss −log σ(βΔ) otherwise pushes the preferred Sequence up and/or the rejected Sequence down. Only πθ is learned; the Reference, Sigmoid, and labels are fixed. β scales sensitivity and provides soft regularization rather than a hard distance constraint. DPO needs neither new On-Policy Rollouts nor a separate Reward Model during this training, but remains sensitive to mislabeled pairs, Response Masks, and length or format Bias."
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
        "detail": "Fully Sharded Data Parallel (FSDP) leaves the logical model unchanged but physically stores Parameters, gradients, and Optimizer State only as different shards across Ranks. Before computing a wrapped Layer, All-Gather temporarily reconstructs the complete required Parameters; Forward and Backward therefore use the same mathematical Tensor Shapes as without Sharding. During Backward, Reduce-Scatter combines local gradients and leaves each Rank only its 1/W shard, which the local Optimizer updates. This reduces persistent training state per Rank by roughly the World-Size factor, but costs Layer-by-Layer communication and can create much larger temporary Peaks during All-Gather, Prefetching, or overlap between Layers. Activation memory is not automatically sharded and remains a separate budget."
    },
    "g11": {
        "def": "Grouped-Query Attention: several Query Heads share Key-Value groups.",
        "cat": "Architecture",
        "detail": "Grouped-Query Attention (GQA) keeps H_q separate Query Heads but produces only H_kv separate Key and Value Heads, with 1 < H_kv < H_q. From X [B,T,D], it creates Q [B,H_q,T,d_head] and K,V [B,H_kv,T,d_head]. With group factor G=H_q/H_kv, every G Query Heads use the same K/V group; the Queries themselves, their Q Projection, and their later Attention Outputs are not shared. During the Score product, the corresponding K group is logically mapped to its Query group, so Scores still have Shape [B,H_q,T_query,T_key] and Concat plus W_O returns [B,T,D]. GQA reduces learned K/V Projection parameters and the KV Cache by roughly H_kv/H_q relative to Multi-Head Attention. It especially saves Decode bandwidth while preserving more K/V representations than Multi-Query Attention. H_q must divide cleanly by H_kv, and this mapping is an architecture choice rather than a cache-only switch after training."
    },
    "g12": {
        "def": "Group Relative Policy Optimization: group-relative Advantages without a Value Model.",
        "cat": "RL",
        "detail": "Group Relative Policy Optimization (GRPO) generates a group of G responses for the same Prompt and evaluates each with a fixed grader or Reward R_i. The group mean μ and standard deviation σ typically produce A_i=(R_i−μ)/(σ+ε): a positive Advantage means better than the comparison group and creates pressure through Token Log Probabilities to increase that response, while a negative Advantage reverses the direction. A_i [G] is broadcast over the Response-Token axis, while Prompt and Padding positions stay masked. An Importance Ratio ρ_i,t=πθ/π_old often compares the current Policy with the data-generating Policy, and Clipping limits how strongly one sample can drive the update; an additional Reference term may penalize drift. The Policy is learned, not the Reward. GRPO avoids a separate Value Model but requires multiple Rollouts per Prompt. When σ is nearly zero, equal Rewards provide practically no relative signal and require numerically stable handling."
    },
    "g13": {
        "def": "High Bandwidth Memory: large external GPU memory.",
        "cat": "GPU",
        "detail": "High Bandwidth Memory (HBM) is stacked dynamic memory with a very wide interface that serves as the large external memory of modern accelerators. Despite its high bandwidth, HBM is farther from the compute units than Registers or shared on-chip memory and often bottlenecks data-intensive Kernels. Tiling, Kernel Fusion, and methods such as FlashAttention therefore accelerate computation mainly by avoiding unnecessary HBM transfers."
    },
    "g14": {
        "def": "A parallel Attention subspace; in Multi-Head Attention it has its own Query, Key, and Value slices, while Grouped-Query or Multi-Query Attention shares Key/Value slices.",
        "cat": "Transformer",
        "detail": "An Attention Head is one complete small Attention computation in its own learned feature space. From X [B,T,D], Linear Layers first produce Q, K, and V and rearrange them to [B,H,T,d_head]. Within a Head, every Query position compares its Query vector with all allowed Key vectors, producing Scores [B,H,T_query,T_key]. A Mask and Softmax turn those Scores into weights, whose weighted sum of the Values yields [B,H,T_query,d_v]. The Head results are then concatenated to [B,T,H·d_v] and W_O mixes them back to [B,T,D]. The Q/K/V/O matrices are learned; reshaping, masking, and Softmax have no trainable parameters. Different Heads can thus learn different comparison and content spaces. At fixed D, however, increasing H makes d_head=D/H smaller and does not automatically increase total width. GQA or MQA additionally shares Key and Value representations across several Query Heads."
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
        "detail": "The Key-Value Cache (KV-Cache) is request-specific activation state, not part of the learned model parameters. During Prefill, every Attention Layer computes K after its Projection and RoPE, when RoPE is used, and V only after its Projection; both are stored approximately as [B,H_kv,S,d_head]. At the next Decode Step, only one new Query, Key, and Value are computed. The new Key and Value are appended along S, while the current Query [B,H_q,1,d_head] reads the entire allowed history. Old Q vectors and Attention weights are not cached because a new Query does not need them again. This avoids recomputing old K/V Projections. Memory still grows approximately as 2·L·B·S·H_kv·d_head·bytes, and Decode repeatedly reads much of that history. Inference can therefore become memory-bandwidth-bound despite less compute; GQA and MQA primarily reduce H_kv."
    },
    "g20": {
        "def": "An unnormalized score before Softmax.",
        "cat": "Probability",
        "detail": "A Logit is a relative evidence score before probability normalization. For every token state h [B,T,D], the LM Head uses a learned matrix and optional Bias to compute z=hW+b [B,T,V]; one entry z[b,t,v] scores vocabulary candidate v as the next token at position t. The number by itself is not a probability and has no fixed zero point or unit—only differences from the other V Logits at that position affect Softmax. Softmax has no trainable parameters and turns each V-row into positive probabilities summing to one. Cross-Entropy training raises the target token's Logit relative to competitors; Decoding uses the same Logits for argmax or Sampling. Temperature divides them before Softmax to change sharpness, while adding the same constant to every Logit leaves all probabilities unchanged."
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
        "detail": "A Transformer MLP independently processes the already contextualized state of every token. A simple flow is X [B,T,D] → Up Projection → U [B,T,F] → activation or Gate → G [B,T,F] → Down Projection → Y [B,T,D]. The Linear-Layer matrices are learned; functions such as SiLU and element-wise Gate multiplication are fixed. The expanded width F creates many candidate features, and the nonlinearity makes their effect depend on the current token state. It is essential: several Linear Layers without an activation between them collapse into one Linear mapping. The MLP mixes only the feature axis within each token, while Attention exchanges information along the token axis. Because the same large matrices run at every position, MLPs often contain much of a model's parameters and FLOPs. The Output returns to D so it can be added to the Residual Stream."
    },
    "g25": {
        "def": "Mixture of Experts: sparse selection of a few experts per token.",
        "cat": "Architecture",
        "detail": "A Mixture of Experts (MoE) replaces the dense Transformer MLP with E separate Expert MLPs. For each Token state x [B,T,D], a learned Router Linear Layer computes E Router Logits [B,T,E]. Top-k selects k Expert IDs, Softmax or a related normalization supplies Gate weights, and Dispatch sends each Token only to those Experts. Every selected Expert transforms D→F→D; a weighted Combine then returns one Output [B,T,D], preserving the Residual contract. Router and Expert weights are learned, while Top-k selection and data movement are fixed operations. All E Experts are stored but only k execute per Token, so parameter capacity grows much faster than active FLOPs. Each Expert has a finite Token Capacity; overflow must be dropped, rerouted, or buffered. Auxiliary Load Balancing compares hard routing fractions with soft Router probabilities to prevent collapse onto a few Experts. Across GPUs, Dispatch and Combine often require All-to-All communication, making balanced routing both a model-quality and a systems problem."
    },
    "g26": {
        "def": "Multi-Query Attention: every Query Head shares one Key-Value pair.",
        "cat": "Architecture",
        "detail": "Multi-Query Attention (MQA) is the extreme form of shared Key-Value Heads: H_q separate Query Heads produce Q [B,H_q,T,d_head], while exactly one Key Head and one Value Head produce K,V [B,1,T,d_head]. Every Query Head retains its own Query features and compares them with the same K; during the Score product, the single K/V activation is logically broadcast across H_q, producing Scores [B,H_q,T_query,T_key] and separate Head Outputs. The shared pieces are the K/V Projections and cached K/V activations—not Queries, Attention weights, or the Output Linear Layer. Compared with Multi-Head Attention, the KV Cache becomes roughly H_q times smaller and requires substantially less Decode bandwidth. In return, all Query Heads must use the same offered K/V representation, which may reduce quality. Grouped-Query Attention is the intermediate design with 1 < H_kv < H_q."
    },
    "g27": {
        "def": "NVIDIA Collective Communications Library for GPU communication.",
        "cat": "Parallelism",
        "detail": "The NVIDIA Collective Communications Library (NCCL) provides optimized Collective Communication operations such as All-Reduce, All-Gather, and Reduce-Scatter across multiple GPUs. Distributed Data Parallel uses All-Reduce, for example, to synchronize gradients among model replicas. Performance depends strongly on network topology, message size, and overlap with computation; NCCL is the communication layer, not the Parallelism algorithm itself."
    },
    "g28": {
        "def": "Negative Log-Likelihood: the negative logarithm of the target probability.",
        "cat": "Loss",
        "detail": "For Logits z [B,T,V] and target IDs y [B,T], the Negative Log-Likelihood (NLL) at each position is ℓ=−log p_y=logsumexp(z)−z_y. Log-Softmax stably maps every V-Logit vector to Log Probabilities, and a Gather selects only the entry of the actual Next Token. The Loss owns no learned Parameters. Without reduction, ℓ remains [B,T]; Prompt, Padding, and other invalid positions are masked before summing or averaging over M valid Tokens. The Logit gradient is p−onehot(y), which raises the target Logit relative to competitors. With One-Hot targets, this NLL is exactly the standard Cross-Entropy. Targets must be shifted by one Token relative to Inputs, and Perplexity is exp(mean Token NLL) only comparable under the same Tokenizer and corpus."
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
        "detail": "Proximal Policy Optimization (PPO) learns from actions or Tokens generated by an older Policy π_old. For every sample, the Importance Ratio ρ_t=πθ(a_t|s_t)/π_old(a_t|s_t) measures how much more likely the current Policy makes that exact observed action. Advantage A_t is the observed outcome minus a Baseline: A_t>0 means better than expected and should make the action more likely; A_t<0 should make it less likely. The clipped Surrogate Objective uses min(ρ_tA_t, clip(ρ_t,1−ε,1+ε)A_t). For positive Advantage, the upper boundary limits excessive increases; for negative Advantage, the lower boundary limits excessive decreases. The Policy and usually a Value Model are learned, while π_old remains fixed during the update epoch. Clipping makes large Ratio changes unattractive but does not guarantee a hard bound on the whole Policy distance. PPO therefore needs fresh Rollouts, correct Response Masks, and monitoring such as KL Divergence, Entropy, and Reward."
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
        "detail": "The Residual Stream is the running activation tensor X [B,T,D] that begins at the Embedding and passes through every Transformer Block. A Pre-Norm Block typically computes X_1 = X + Attention(RMSNorm(X)) and then X_2 = X_1 + MLP(RMSNorm(X_1)). Attention and the MLP therefore produce corrections rather than replacing the main state. The additions and direct identity path have no learned parameters; the functions in the side branches are learned. Because every branch must return exactly [B,T,D], the Shape remains stable through all L Blocks. Conceptually, the Stream is shared working memory in which token identity, position, and context information accumulate. Mathematically, the X addend also creates a direct signal and gradient path with local derivative one, so deep models do not have to reconstruct every piece of information through every side branch."
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
        "detail": "RMSNorm controls the magnitude of each token vector without mixing tokens. For x ∈ R^D, it computes r=sqrt((1/D)Σ_i x_i²+ε) and then y_i=g_i·x_i/r. For X [B,T,D], the mean and division operate only along the final D axis; B, T, and the full Shape [B,T,D] remain unchanged. The Gain g [D] is learned and lets every feature regain its own scale after shared normalization. Computing r and the small fixed ε have no trainable parameters; standard RMSNorm also has no Bias and performs no mean centering. Pre-Norm Transformers place RMSNorm immediately before Attention and the MLP so those sublayers see inputs with a more controlled scale. It does not make features independent or create context—it only rescales the existing state vector."
    },
    "g41": {
        "def": "An upper bound from Compute Peak and bandwidth×Arithmetic Intensity.",
        "cat": "GPU",
        "detail": "The Roofline model bounds attainable compute performance by the smaller of maximum compute rate and memory bandwidth times Arithmetic Intensity. Below the Ridge Point, a Kernel is typically memory-bound; above it, compute-bound. The model helps choose among data reuse, Fusion, and compute optimization, but it describes only a theoretical upper bound, not guaranteed runtime."
    },
    "g42": {
        "def": "Rotary Position Embedding: position-dependent rotation of Q and K.",
        "cat": "Transformer",
        "detail": "Rotary Position Embedding (RoPE) is applied after the Q and K Projections and before QKᵀ. It groups adjacent features on the final Head axis into two-dimensional pairs and rotates pair k at token position p by angle p·ω_k. In standard RoPE, the frequencies and sine/cosine values are fixed rather than learned through Backpropagation; the Q/K Projections learn how to use the rotated coordinates. Q and K keep Shape [B,H,T,d_head], V is not rotated, and d_head is normally even for pairing. The key identity is R_iᵀR_j=R_(j−i): a dot product between two rotated vectors therefore retains a rotation determined by their relative offset. Attention can use that distance in its Compatibility Scores. Angles being mathematically defined beyond the training context still does not guarantee reliable very-long-context extrapolation."
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
        "detail": "For X [B,T,D], the Swish-Gated Linear Unit (SwiGLU) computes two separate learned D→F Linear Layers: a Gate branch and a content branch, both [B,T,F]. The fixed nonlinearity SiLU(z)=z·sigmoid(z) acts on the Gate branch, and the two branches are then multiplied elementwise. A third learned F→D Linear Layer returns [B,T,D] for Residual addition. The Gate is input-dependent and decides for every Token and feature which candidate features pass. Without a nonlinearity, stacked Linear Layers would collapse into one linear mapping. SwiGLU mixes only features inside each Token, never the T axis; position information must already be present through Attention. Because it has three large matrices, F is often near 8D/3 instead of 4D for a fair Parameter and FLOP comparison with a standard MLP."
    },
    "g46": {
        "def": "Sharding individual Layer or matrix axes across devices.",
        "cat": "Parallelism",
        "detail": "Tensor Parallelism shards one large Linear-Layer calculation X[...,D_in]·W[D_in,D_out] across several Ranks. With Output or Column Sharding, each Rank owns different columns of W and produces a different slice of the D_out features; if the next operator needs the complete Output, All-Gather reconstructs those slices. With Input or Row Sharding, each Rank owns different D_in rows and computes only a partial sum; All-Reduce or Reduce-Scatter combines the contributions. The Weight shards are learned, and activations may remain sharded between Layers. This lets a single Layer span devices, but Collectives occur inside many Transformer Blocks and need fast interconnects. Unlike DDP, no Rank owns a full model copy, and shard axes must be divisible by the Tensor-Parallel World Size."
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
        "detail": "Weight Tying gives one learned matrix E [V,D] two operational roles. At the Input, Token IDs [B,T] look up rows E[id] and produce Embeddings [B,T,D]. At the Output, the LM Head computes z=hEᵀ from Hidden States h [B,T,D] and produces Logits [B,T,V]; an optional Output Bias may remain separate. During Backward, both paths write into the same Parameters, so a row simultaneously learns how its Token is represented and how it is scored as the next Token. Compared with separate matrices, this saves about V·D Parameters but not the D→V matrix multiplication, Logits, or Softmax cost. Weight Tying requires compatible Model Dimensions and couples two roles that some architectures deliberately learn separately."
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
        "def": "A learned feature mixer: each output feature combines all input features with its own weights, and the same rule is applied separately to every token.",
        "cat": "Foundations",
        "detail": "What happens? x is the current feature vector of one token. A feature x_i is initially just one coordinate of that vector; its meaning is usually distributed and is not labeled by humans. For every output feature o, the Layer computes y_o=b_o+Σ_i x_iW_i,o: it multiplies each input feature by its own learned weight, adds every contribution, and optionally adds a Bias. One column of W is therefore a mixing recipe for exactly one new feature; b_o is its starting value if every x_i is zero. Backpropagation changes W and b so that these mixtures reduce the training Loss. With X [B,T,D_in] and W [D_in,D_out], the result is Y [B,T,D_out]; B and T remain unchanged because the same matrix processes every token independently. This does not make a later token state context-free: earlier Attention Layers may already have mixed information from other positions into X; the Linear Layer simply does not mix those positions directly. Why and where? Attention uses separate matrices for Q—what information a token seeks—K—what it offers for matching—and V—the content it can contribute. W_O then mixes the Head results; MLP Layers expand, gate, and contract features, while the LM Head produces one Logit per vocabulary token. These roles emerge end-to-end from the Loss. PyTorch stores nn.Linear.weight as [D_out,D_in] and computes x @ weight.T + bias; our xW+b notation names the same matrix transposed. Strictly speaking, adding a Bias makes the operation affine even though the component is called a Linear Layer. In LLM literature, Projection is merely shorthand for this learned mapping: it need not be orthogonal or satisfy P²=P, and it may even increase dimension."
    },
    "g55": {
        "def": "A learned lookup that turns a discrete token ID into a continuous feature vector.",
        "cat": "Transformer",
        "detail": "A token ID is only an integer index and has no numerical semantic ordering: ID 101 is not automatically more similar to 102 than to 900. The learned Embedding table E [V,D] therefore stores one row of D features for each of V vocabulary entries. Token IDs [B,T] select rows from E and produce X [B,T,D]; the ID values are not multiplied, and different tokens are not mixed during the lookup. The lookup rule is fixed, while the table values are learned through Backpropagation: rows used in a Batch receive gradients from every position where they occur. Embeddings make discrete symbols usable by continuous Transformer operations. Initially, the same token has the same starting vector; position and context arise later through the positional mechanism and Attention. With Weight Tying, Eᵀ is also used by the LM Head to score the final state against all V token candidates."
    },
    "g56": {
        "def": "Turns relative Logits along one chosen axis into positive probabilities summing to one.",
        "cat": "Probability",
        "detail": "Softmax turns one row of relative Logits z into a probability distribution. First subtract m=max(z) for numerical stability, then compute exp(z_i−m), and finally divide by their sum. Exponentiation makes every value positive and amplifies score differences; division makes the chosen axis sum exactly to one. Softmax has no learned parameters. Only Logit differences matter, so shifting every Logit by the same constant changes nothing. The axis is crucial: the LM Head normalizes each [V] row over vocabulary tokens, while Attention normalizes [T_key] for every fixed Query. A causal Mask must set forbidden Logits to negative infinity before Softmax. Temperature divides the Logits first and controls sharpness without adding new information."
    },
    "g57": {
        "def": "The next-token Loss measuring the negative log-probability of the correct target token.",
        "cat": "Loss",
        "detail": "Next-token training provides Logits z [B,T,V] and one target ID y [B,T] for every evaluated position. At one position, Cross-Entropy does not merely choose the largest Logit; it stably computes ℓ=logsumexp(z)−z_y=−log p(y). If the target Logit is high relative to all competitors, the Loss is small; a confidently wrong distribution is punished strongly. The Loss has no trainable parameters of its own. Its gradient raises the target Logit and lowers competing Logits according to their Softmax probabilities, thereby training the LM Head and all preceding Layers. Before reduction, the Loss has Shape [B,T]. Padding, Prompt segments, or other invalid targets are masked, then the valid tokens are averaged to one scalar. For next-token prediction, Logits and targets must be shifted into the correct positional alignment."
    },
    "g58": {
        "def": "The reverse pass through a Computation Graph that uses the Chain Rule to compute parameter gradients.",
        "cat": "Foundations",
        "detail": "Backpropagation is the algorithm that computes gradients of every participating parameter from one scalar Loss. The Forward Pass creates intermediate values and a Computation Graph. The Backward Pass starts at the Loss with derivative 1 and visits operations in reverse order. Each operation receives an upstream gradient, combines it with its local derivative through the Chain Rule, and passes gradients to its inputs. When a parameter is reused at many token positions or on several paths, those contributions add into one gradient tensor with the same Shape as the parameter. Backpropagation therefore predicts locally how a small parameter change would affect the Loss; it does not change the parameter yet. Autograd automates this calculation, and the Optimizer subsequently chooses the concrete update from the gradients. With overly large Steps, the local linear approximation becomes unreliable."
    },
    "g59": {
        "def": "Three learned Attention representations of token states: seeking, offering for matching, and contributing content.",
        "cat": "Transformer",
        "detail": "Q, K, and V are activations that commonly share Shape [B,H,T,d_head] but have different jobs. From the same token state X [B,T,D], three separately learned Linear Layers first create Query, Key, and Value features. A Query describes, in a learned feature space, what information the current position seeks. A Key describes what makes its position a suitable match. Their dot product produces a Compatibility Score. The corresponding Value contains the features that actually flow into the new state when its Attention weight is high. These meanings are not human-labeled fields; they emerge jointly from the training Loss. Q, K, and V are therefore not model parameters—W_Q, W_K, and W_V are the learned matrices that produce them. RoPE changes Q and K before matching, a Mask limits allowed Keys, and Decoding caches earlier K and V rather than old Q vectors."
    },
    "g60": {
        "def": "Weights information from other allowed token positions for the current Query and mixes their Values.",
        "cat": "Transformer",
        "detail": "Attention is the step in which one token position selectively reads information from other allowed positions. For Q [B,H,T_q,d_k], K [B,H,T_k,d_k], and V [B,H,T_k,d_v], QKᵀ compares every Query i with every Key j and produces Scores [B,H,T_q,T_k]. Dividing by sqrt(d_k) controls their typical scale. A Mask sets forbidden positions to negative infinity before Softmax; Softmax normalizes over T_key for every Query. The resulting weights sum to one per Query and form a weighted sum of the Values, producing Output [B,H,T_q,d_v]. This Attention calculation adds no new trainable parameters by itself; the learned Q/K/V and Output Projections shape its comparison and content spaces. Self-Attention uses states from the same sequence, while Cross-Attention obtains K and V from another source. In a causal Language Model, Query i may read only Keys from the past and present."
    },
    "g61": {
        "def": "Prevents a Query from reading future Token positions during Next-Token training.",
        "cat": "Transformer",
        "detail": "A Causal Mask encodes which Key positions every Query may see in an autoregressive Language Model. For T Query and Key positions, M [T,T] is commonly zero when j≤i and negative infinity when j>i: row i can read the present and past but no future columns. M is broadcast over Batch and Heads onto Scores [B,H,T,T] and added before Softmax. This makes exp(−∞)=0 while the remaining allowed weights still normalize to one. Masking after Softmax would be wrong because forbidden positions would already have consumed normalization mass. Boolean Masks use different True polarities across APIs, so their contract must be checked. A fully masked row may produce NaN; every evaluated Query needs at least one valid Key."
    },
    "g62": {
        "def": "Applies operations to compatible Tensor Shapes by logically repeating axes of length one.",
        "cat": "Tensors",
        "detail": "Broadcasting permits elementwise operations on differently shaped Tensors when their axes, compared from right to left, are either equal or one of them has length one. With X [B,T,D] and g [D], g is treated logically as [1,1,D] and reused at every Batch and Token position; it is not stored B·T times as new Parameters. The result has combined Shape [B,T,D]. Broadcasting never mixes or reduces values; it only reuses the same indexed values along compatible axes. Accidentally compatible Shapes are dangerous: a Tensor [T,1] can act along an unintended axis without raising an error. Axis meaning, unsqueeze location, and resulting Shape should therefore be checked explicitly, especially for Masks and Loss weights."
    },
    "g63": {
        "def": "An Optimizer with smoothed gradient moments and Weight Decay decoupled from the adaptive gradient step.",
        "cat": "Optimization",
        "detail": "AdamW stores two persistent Tensors for every learnable Parameter: m_t, a smoothed signed gradient, and v_t, a smoothed squared gradient. Bias Correction produces m̂_t and v̂_t because both memories start at zero and would otherwise be systematically too small early on. The adaptive term m̂_t/(sqrt(v̂_t)+ε) normalizes every coordinate using its gradient history, and the Learning Rate η scales it into an actual Step. Weight Decay is decoupled and separately shrinks θ by factor 1−ηλ even when the current gradient is zero. Backpropagation computes only g; AdamW then updates m, v, and θ. Correct resume therefore requires model Parameters, Optimizer State, global Step, and Scheduler state."
    },
    "g64": {
        "def": "A registered learnable Tensor versus registered Module state that the Optimizer does not learn.",
        "cat": "PyTorch",
        "detail": "An nn.Parameter is a registered Tensor of a PyTorch Module that normally receives gradients. When stored as an nn.Module attribute, inside ParameterList, or in a registered Submodule, it appears in parameters() and state_dict(), moves with .to(device), and can be passed to the Optimizer. A Buffer registered with register_buffer is likewise saved and moved but normally receives no Optimizer update; fixed RoPE frequencies and running statistics are examples. An ordinary Tensor stored as an arbitrary attribute can be missed during device transfer and Checkpointing. Likewise, a plain Python list does not register its contained Layers; ModuleList does. Registration defines ownership and lifecycle, not the mathematical Forward operation."
    },
    "g65": {
        "def": "Stride gives memory steps between indices; contiguous means dense storage order compatible with the Shape.",
        "cat": "Tensors",
        "detail": "A Tensor's Shape says how many indices each axis has, while its Strides say how many memory elements are skipped when one index along that axis increases. transpose or permute can therefore create a new view with changed Shape and Strides without copying data. The result is often non-contiguous, meaning it is not stored in the dense standard order for its new axes. view may only create Shapes compatible with existing Strides and can otherwise fail. reshape may make a copy when needed, while contiguous() explicitly materializes a matching dense copy. This matters during Head splitting and concatenation: an operation may look mathematically plausible but group values incorrectly because of axis order or introduce an unexpected copy."
    },
    "g66": {
        "def": "A memory-efficient probabilistic set-membership structure that permits False Positives.",
        "cat": "Data",
        "detail": "A Bloom Filter represents approximate Set Membership using a Bit Array with m positions. Inserting an item applies k Hash Functions and sets every selected bit to one; querying applies the same functions. One zero bit proves that the key is absent under the standard no-deletion contract. If every tested bit is one, the key may be present, but unrelated inserts may have set the same combination, creating a False Positive. The modeled error rate is approximately (1−e^(−kn/m))^k, with a useful hash count near (m/n)ln2. A normal Bloom Filter stores neither the original items nor counts and cannot delete safely. It answers a different question from MinHash and Locality-Sensitive Hashing (LSH), which estimate similarity and retrieve Near-Duplicate candidates."
    },
    "g67": {
        "def": "Data Selection via Importance Resampling: selection using a target-to-raw density ratio.",
        "cat": "Data",
        "detail": "Data Selection via Importance Resampling (DSIR) draws from a large raw corpus R so the selected sample better resembles a smaller target distribution T. Target and raw densities p_T and p_R are estimated on the same feature representation, often hashed n-grams. The Importance Weight w(x)=p_T(x)/p_R(x) becomes large when a pattern is characteristic of the target yet underrepresented in the raw corpus. Normalized weights define resampling probabilities rather than a deterministic top-k ranking. A tiny denominator creates extreme, unstable weights, so practical systems need Smoothing, adequate proposal support, numerically stable Log-Space arithmetic, and audits of the selected distribution. The representation and its hash collisions limit which differences DSIR can detect."
    },
    "g68": {
        "def": "A fast Bag-of-n-Grams classifier using hashed embeddings and a Linear Head.",
        "cat": "Data",
        "detail": "In Lecture 14, fastText is a fast discriminative text classifier rather than a Transformer. It hashes words and Character- or Word-n-Grams into a fixed number B of buckets, looks up learned bucket embeddings, and averages them into a document vector. A Linear Layer plus Softmax then predicts labels such as language or an operationalized quality class. Because storage scales with the number of buckets instead of every possible n-gram string, the method is efficient and handles unseen strings, but collisions deliberately force unrelated features to share parameters. Averaging captures little word order or long-range context. Its score inherits the definitions and biases of the labeled data and is not an objective quality seal."
    },
    "g69": {
        "def": "An efficient toolkit for smoothed n-gram Language Models.",
        "cat": "Data",
        "detail": "KenLM is a toolkit optimized for fast, memory-efficient inference with smoothed n-gram Language Models. Such models count local token continuations and use methods such as Modified Kneser-Ney Smoothing so one unseen n-gram does not immediately receive probability zero. A KenLM trained on a target corpus can rank documents by length-normalized Perplexity: lower means that their local token sequences look more familiar under that particular target distribution, not that the text is universally better. The Python `Model.score` interface returns a sum of base-10 Log-Probabilities, so its Perplexity conversion is 10^(−score/N); exp(mean NLL) assumes Natural Logs. Tokenization, sentence boundaries, and the training corpus must remain fixed for a meaningful comparison."
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
        "meaning": "Vocabulary size: number of possible Token IDs and Output Logits",
        "context": "Tokenizer / Embedding",
        "dimension": "Scalar; determines E [V,D] and Logits [B,T,V]"
    },
    "s3": {
        "meaning": "Value activations: content that Attention mixes after Q/K weighting",
        "context": "Attention",
        "dimension": "Tensor [B,H,T_k,dᵥ], produced from X by learned W_V; not itself a parameter"
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
        "meaning": "Currently computed Input or activation data",
        "context": "Tensors",
        "dimension": "Often [B,T,D]; depends on Batch and context and is not a learned parameter"
    },
    "s9": {
        "meaning": "Query and Key create Compatibility Scores; Value supplies the content mixed afterward",
        "context": "Attention",
        "dimension": "Usually [B,H,T,d_head]; activations from X, produced by learned W_Q/W_K/W_V"
    },
    "s10": {
        "meaning": "Learned weight matrices of the Attention Linear Layers",
        "context": "Attention",
        "dimension": "W_Q/W_K/W_V usually D×(H·d_head), W_O (H·d_v)×D; do not confuse with Q/K/V activations"
    },
    "s11": {
        "meaning": "Score matrix before Softmax: S[b,h,i,j] compares Query position i with Key position j",
        "context": "Attention",
        "dimension": "[B,H,T_q,T_k]; real-valued Compatibility Scores, not probabilities yet"
    },
    "s12": {
        "meaning": "Attention weights after Masking and Softmax; each Query row distributes mass over Keys",
        "context": "Attention",
        "dimension": "[B,H,T_q,T_k]; normalized across T_k with row sum 1; A·V creates the Head Output"
    },
    "s13": {
        "meaning": "Mask defining allowed and forbidden Query-Key pairs",
        "context": "Attention",
        "dimension": "Additive [T_q,T_k] with 0=allowed and −∞=forbidden, broadcast over B/H; check Boolean polarity in the API"
    },
    "s14": {
        "meaning": "Learned model parameters changed by the Optimizer",
        "context": "Optimization",
        "dimension": "Nested Tensor Shapes; distinct from activations and Optimizer moments"
    },
    "s15": {
        "meaning": "Rotation angle",
        "context": "RoPE",
        "dimension": "Context-dependent, not model parameter"
    },
    "s16": {
        "meaning": "Scalar training Loss after explicit masking and reduction; defines the behavior the Optimizer should improve",
        "context": "Training",
        "dimension": "Zero-dimensional Tensor; backward() starts from this scalar and computes gradients for every reachable Parameter"
    },
    "s17": {
        "meaning": "Log-Sum-Exp of Attention Logit row L[i,:], stably summarizing its Softmax denominator",
        "context": "FlashAttention",
        "dimension": "One scalar per Query row: LSE_i=m_i+log ℓ_i; do not confuse it with Loss ℒ or the complete Logit row"
    },
    "s18": {
        "meaning": "Numerical stabilization against division by zero; it still changes the exact computation",
        "context": "Norm / Optimizer",
        "dimension": "Small positive scalar; appropriate scale depends on operation and Dtype"
    },
    "s19": {
        "meaning": "Clip width",
        "context": "PPO",
        "dimension": "Different context than stability ε"
    },
    "s20": {
        "meaning": "Temperature divides Logits before Softmax; smaller sharpens and larger flattens",
        "context": "Decoding",
        "dimension": "Positive scalar; do not substitute T=0, handle Greedy Decoding separately"
    },
    "s21": {
        "meaning": "Learning Rate: scales an update direction into an actual parameter displacement",
        "context": "Optimization",
        "dimension": "Positive scalar; too large may destabilize and too small can effectively stop learning"
    },
    "s22": {
        "meaning": "Gradient: local prediction of how a small change in every parameter changes the Loss",
        "context": "Optimization",
        "dimension": "Same Shape as θ; Gradient Descent moves in direction −g"
    },
    "s23": {
        "meaning": "Adam state: smoothed signed gradient and smoothed squared gradient",
        "context": "Optimization",
        "dimension": "Each has the same Shape as θ; persisted across Steps, not learned by Backpropagation"
    },
    "s24": {
        "meaning": "Adam moment smoothing factors; larger values mean longer memory",
        "context": "Optimization",
        "dimension": "[0,1); Bias Correction compensates for m and v starting at zero"
    },
    "s25": {
        "meaning": "Decoupled Weight-Decay coefficient that shrinks θ separately",
        "context": "Optimization",
        "dimension": "Scalar; AdamW includes factor (1−ηλ) even when the current gradient is zero"
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
        "meaning": "Estimated density of document x under the target distribution and the raw distribution",
        "context": "Data Filtering",
        "dimension": "Dimensionless model scores on the same feature representation; their ratio is a DSIR Importance Weight"
    },
    "s31": {
        "meaning": "Unnormalized density ratio and candidate-normalized Resampling Weight",
        "context": "Data Filtering",
        "dimension": "w=p_T/p_R; w̃ᵢ=wᵢ/Σⱼwⱼ and Σᵢw̃ᵢ=1"
    },
    "s32": {
        "meaning": "Number of bits, inserted elements, and Hash Functions in a Bloom Filter",
        "context": "Data",
        "dimension": "Positive counts; do not confuse with model parameter count N or MinHash signature length"
    },
    "s33": {
        "meaning": "Theoretical False-Positive probability and empirical False-Positive Rate",
        "context": "Data",
        "dimension": "Theory f≈(1−e^(−kn/m))^k; measurement FP/(FP+TN) only across truly negative queries"
    },
    "s34": {
        "meaning": "Floating-point operation",
        "context": "Systems",
        "dimension": "Work; FLOP/s is rate"
    },
    "s35": {
        "meaning": "Memory or network bandwidth",
        "context": "Systems",
        "dimension": "Bytes/s"
    },
    "s36": {
        "meaning": "World size, i.e., number of ranks",
        "context": "Parallelism",
        "dimension": "Positive integer"
    },
    "s37": {
        "meaning": "Arithmetic intensity",
        "context": "GPU",
        "dimension": "FLOPs/Byte"
    },
    "s38": {
        "meaning": "Reward",
        "context": "Reinforcement Learning",
        "dimension": "Scalar"
    },
    "s39": {
        "meaning": "Prompt distribution",
        "context": "Reinforcement Learning",
        "dimension": "Probability distribution"
    },
    "s40": {
        "meaning": "Trainable Language Model as Policy: maps every Prompt and previous Tokens to a Next-Token distribution",
        "context": "Reinforcement Learning",
        "dimension": "πθ(y|x)=∏_t πθ(y_t|x,y_<t); Advantage-weighted Losses change its Log Probabilities"
    },
    "s41": {
        "meaning": "Reference/rollout policy",
        "context": "Alignment / RL",
        "dimension": "Fixed or old policy"
    },
    "s42": {
        "meaning": "Prompt/state",
        "context": "Reinforcement Learning",
        "dimension": "Token sequence"
    },
    "s43": {
        "meaning": "Response/action",
        "context": "Reinforcement Learning",
        "dimension": "Sequence or token"
    },
    "s44": {
        "meaning": "Advantage: outcome or Reward minus a comparison Baseline; measures better or worse than expected",
        "context": "Reinforcement Learning",
        "dimension": "Scalar per response or Token; A>0 raises its Log Probability through Gradient Descent, A<0 lowers it, and A=0 gives no Policy signal"
    },
    "s45": {
        "meaning": "Generations per prompt",
        "context": "GRPO",
        "dimension": "Integer"
    },
    "s46": {
        "meaning": "Importance Ratio πθ(a_t|s_t)/π_old(a_t|s_t), measuring the probability change of the same sampled action",
        "context": "Off-policy RL",
        "dimension": "Positive scalar; >1 means more likely under the new Policy, <1 less likely, and Clipping limits its influence"
    },
    "s47": {
        "meaning": "Group mean/standard deviation",
        "context": "GRPO",
        "dimension": "Per prompt group"
    },
    "s48": {
        "meaning": "Preferred/rejected response",
        "context": "DPO / Reward Model",
        "dimension": "Sequences"
    },
    "s49": {
        "meaning": "Jaccard similarity",
        "context": "LSH",
        "dimension": "0 to 1"
    },
    "s50": {
        "meaning": "Bands / rows per band",
        "context": "LSH",
        "dimension": "Integers; signature length k=br"
    },
    "s51": {
        "meaning": "True/False positives/negatives",
        "context": "Evaluation",
        "dimension": "Counts"
    },
    "s52": {
        "meaning": "Number of Transformer Layers; each owns separate parameters and its own KV Cache",
        "context": "Architecture / Inference",
        "dimension": "Positive integer; do not confuse with Loss ℒ"
    },
    "s53": {
        "meaning": "Cached context length so far; increases by one for every new Token during Decoding",
        "context": "Inference / KV Cache",
        "dimension": "Tokens per Sequence and length axis of K/V; do not confuse with the Score matrix"
    },
    "s54": {
        "meaning": "Number of Query Heads",
        "context": "GQA / Inference",
        "dimension": "Positive integer; D=H_q·d_head"
    },
    "s55": {
        "meaning": "Number of Key-Value Heads; multiple Query Heads may share one K/V pair",
        "context": "GQA / Inference",
        "dimension": "Divides H_q; equals H_q for MHA and is smaller for GQA"
    },
    "s56": {
        "meaning": "Feature width of one Attention Head",
        "context": "GQA / Inference",
        "dimension": "d_head=D/H_q; do not confuse with H as the number of Heads"
    },
    "s57": {
        "meaning": "MLP intermediate width",
        "context": "Architecture / Inference",
        "dimension": "Features; F=4D in the Lecture 10 lab"
    },
    "s58": {
        "meaning": "Bytes per Weight or KV element",
        "context": "Inference",
        "dimension": "Bytes/element, e.g. 2 for BF16"
    },
    "s59": {
        "meaning": "Peak hardware compute rate",
        "context": "Roofline",
        "dimension": "FLOP/s"
    },
    "s60": {
        "meaning": "Running maximum and exponential sum",
        "context": "Online Softmax / FlashAttention",
        "dimension": "Scalars per Query row"
    },
    "s61": {
        "meaning": "Query positions processed together now",
        "context": "Inference Arithmetic Intensity",
        "dimension": "1 during decode; usually S during prefill"
    },
    "s62": {
        "meaning": "Factor for Embedding and LM Head",
        "context": "Inference parameters",
        "dimension": "1 with Weight Tying, otherwise 2"
    },
    "s63": {
        "meaning": "Unnormalized weighted Value accumulator",
        "context": "Online Softmax / FlashAttention",
        "dimension": "Vector with d_v features per Query row"
    },
    "s64": {
        "meaning": "Rescaling factor when a new maximum appears",
        "context": "Online Softmax / FlashAttention",
        "dimension": "Positive scalar e^(m_old−m_new) per Query row"
    },
    "s65": {
        "meaning": "Total stored Expert MLPs, increasing model capacity and Parameter memory",
        "context": "Mixture of Experts",
        "dimension": "Positive integer; do not confuse it with expectation or with active compute"
    },
    "s66": {
        "meaning": "Experts actually executed per Token after Top-k routing",
        "context": "Mixture of Experts",
        "dimension": "Positive integer 1≤k≤E; controls active compute and routing traffic"
    },
    "s67": {
        "meaning": "Capacity Factor and derived Token slots per Expert, controlling how much routing load one Expert can accept",
        "context": "Mixture of Experts",
        "dimension": "c_f is dimensionless; C_expert is approximately ceil(c_f·B·T·k/E); overflow must be dropped, rerouted, or buffered"
    },
    "s68": {
        "meaning": "Hard fraction of Tokens routed to Expert i and its mean soft Router probability",
        "context": "MoE balance loss",
        "dimension": "Both lie in [0,1]; their Auxiliary term discourages collapse onto a few Experts but does not replace Capacity handling"
    },
    "s69": {
        "meaning": "Coefficients weighting z-loss and Balance Loss relative to the Language-Model Loss",
        "context": "Architecture / MoE",
        "dimension": "Non-negative scalars; too small is ineffective, while too large can dominate the main learning objective"
    },
    "s70": {
        "meaning": "Soft-cap bound in c·tanh(z/c): leaves small Logits nearly unchanged and smoothly saturates large magnitudes toward ±c",
        "context": "Logit stability",
        "dimension": "Positive scalar on the same scale as the Logit; bounds smoothly instead of hard clipping"
    },
    "s71": {
        "meaning": "Strength of the deviation penalty or preference scaling; in RLHF β weights the KL divergence, while in DPO β scales the chosen-versus-rejected log ratio",
        "context": "Alignment",
        "dimension": "Positive dimensionless scalar; do not confuse it with the Adam factors β₁ and β₂"
    }
},
  "ui": {
    "question_only · nur die Frage, danach „Please put your final answer within \\boxed{}“": "question_only · the question alone, followed by „Please put your final answer within \\boxed{}“",
    "Der Prompt verlangt nur eine geboxte Zahl und gibt dem Basismodell sonst keine Struktur vor. Es ist genau die Baseline, gegen die die beiden r1_zero-Prompts antreten sollen.": "The prompt asks only for a boxed number and gives the base model no other structure. It is exactly the baseline the two r1_zero prompts are meant to run against.",
    "r1_zero · Zero-Shot mit <think> … </think> <answer> … </answer>": "r1_zero · zero-shot with <think> … </think> <answer> … </answer>",
    "Derselbe Prompt wie bei DeepSeek R1-Zero. Er schreibt die Tags vor, damit sich die Antwort abtrennen lässt und die Generierung bei </answer> stoppen kann – gezeigt wird jeweils die Fortsetzung ab dem bereits vorgegebenen <think>.": "The same prompt as DeepSeek R1-Zero uses. It prescribes the tags so the answer can be split off and generation can stop at </answer> — what is shown each time is the continuation after the already supplied <think>.",
    "r1_zero_three_shot · dieselben Tags, drei gelöste Beispiele davor": "r1_zero_three_shot · the same tags, three worked examples in front",
    "Identischer Prompt wie r1_zero, aber mit drei vollständig durchgerechneten Beispielen davor. Der Vergleich mit der Zeile darüber zeigt, was Few-Shot am Verhalten des Modells ändert – und was nicht.": "The identical prompt to r1_zero, but with three fully worked examples in front. Comparing it with the row above shows what few-shot changes about the model's behaviour — and what it does not.",
    "r1_zero_reward_fn · Tags erforderlich, Antwort aus <answer>": "r1_zero_reward_fn · tags required, answer taken from <answer>",
    "Format 1 ⇔ die Antwort endet mit </think> … <answer> … </answer>; geparst wird der Inhalt der Answer-Tags.": "Format 1 ⇔ the answer ends with </think> … <answer> … </answer>; what gets parsed is the content of the answer tags.",
    "question_only_reward_fn · \\boxed{} erforderlich": "question_only_reward_fn · \\boxed{} required",
    "Format 1 ⇔ irgendwo steht \\boxed{…}; geparst wird der erste geboxte Inhalt.": "Format 1 ⇔ \\boxed{…} appears somewhere; what gets parsed is the first boxed content.",
    "naiver Grader · letzte Zahl im Text, kein Formatanspruch": "naive grader · last number in the text, no format requirement",
    "naiver Grader": "naive grader",
    "Format ist immer 1; geparst wird die letzte Zahl im Text, unabhängig davon, wo sie steht.": "Format is always 1; what gets parsed is the last number in the text, wherever it happens to sit.",
    "MMLU · Antwortbuchstabe A–D": "MMLU · answer letter A–D",
    "Der Prompt verlangt genau einen Satz der Form „The correct answer is _“ mit dem Buchstaben in der Lücke.": "The prompt asks for exactly one sentence of the form „The correct answer is _“ with the letter in the blank.",
    "Satzmuster · erster Treffer von „The correct answer is X“": "Sentence pattern · first match of „The correct answer is X“",
    "erster allein stehender Buchstabe A–D im Text": "first standalone letter A–D in the text",
    "letzter allein stehender Buchstabe A–D im Text": "last standalone letter A–D in the text",
    "Satzmuster, sonst Abgleich mit den vier Optionstexten": "Sentence pattern, else match against the four option texts",
    "GSM8K · Zahl aus dem Fließtext": "GSM8K · number from running text",
    "Das Supplement schreibt vor: die letzte Zahl im Output ist die Vorhersage. Die drei anderen Regeln sind die, die man beim Schreiben dieser einen Zeile leicht stattdessen tippt.": "The supplement prescribes it: the last number in the output is the prediction. The other three rules are the ones you easily type instead while writing that single line.",
    "letzte Zahl im Text, mit Vorzeichen, Komma und Dezimalpunkt": "last number in the text, with sign, comma, and decimal point",
    "erste Zahl im Text": "first number in the text",
    "letzter reiner Ziffernblock · /\\d+/": "last pure block of digits · /\\d+/",
    "erste Zahl nach „answer is“": "first number after „answer is“",
    "Was wird ausgewertet": "What gets evaluated",
    "Auswertungsmodus": "Evaluation mode",
    "Grader · sechs Rollouts einer GSM8K-Frage": "Grader · six rollouts of one GSM8K question",
    "Parserregel · acht Benchmark-Antworten": "Parser rule · eight benchmark answers",
    "Parserregel": "Parser rule",
    "Konstruierte Antworten, keine gemessenen Läufe: jede zeigt genau einen im Handout benannten Fall. Die Grader und Regeln dagegen laufen wirklich über den Text – dieselbe Art regulärer Ausdrücke, die du in run_parse_mmlu_response und run_parse_gsm8k_response schreibst. Sage vor jedem Wechsel voraus, welche Zeilen kippen.": "Constructed answers, not measured runs: each one shows exactly one case named in the handout. The graders and rules, by contrast, really do run over the text — the same kind of regular expressions you write in run_parse_mmlu_response and run_parse_gsm8k_response. Before every switch, predict which rows will flip.",
    "Feste Zählungen aus dem Ledger, kein Ermessen.": "Fixed counts from the ledger, no judgement calls.",
    "1. Der question_only-Prompt, bewertet mit r1_zero_reward_fn, ergibt 0 %. Wie viele der sechs Rollouts sind beim Lesen inhaltlich richtig?": "1. The question_only prompt, scored with r1_zero_reward_fn, gives 0 %. How many of the six rollouts are correct in substance when you read them?",
    "Vier – der Score misst hier ausschließlich, dass keine Answer-Tags im Text stehen": "Four — the score here measures only that no answer tags appear in the text",
    "Keiner – ein Grader kann nur null liefern, wenn auch das Modell nichts Richtiges produziert hat": "None — a grader can only return zero if the model produced nothing correct either",
    "Einer – der Grader zählt den geboxten Treffer korrekt und verwirft nur die übrigen": "One — the grader counts the boxed hit correctly and discards only the rest",
    "2. Few-Shot hebt den Score unter r1_zero_reward_fn von 33 % auf 67 %. Wie viele Rollouts kommen inhaltlich neu dazu?": "2. Few-shot lifts the score under r1_zero_reward_fn from 33 % to 67 %. How many rollouts are newly correct in substance?",
    "Einer – der zweite zusätzlich gewertete Rollout war schon vorher richtig und scheiterte nur am Format": "One — the second additionally scored rollout was already correct before and failed only on format",
    "Zwei – gewerteter Score und inhaltliche Korrektheit steigen im selben Maß": "Two — the scored result and substantive correctness rise by the same amount",
    "Keiner – Few-Shot verändert ausschließlich die Formattreue": "None — few-shot changes format compliance only",
    "3. Bei MMLU parst die Regel „Satzmuster“ nur 5 von 8 Antworten und erreicht darauf 80 %. Was folgt daraus für den Vergleich mit einer Regel, die alle 8 parst?": "3. On MMLU the „sentence pattern“ rule parses only 5 of 8 answers and reaches 80 % on those. What follows for a comparison with a rule that parses all 8?",
    "Nichts – die drei nicht geparsten Fälle zählen als falsch, also sind 50 % über alle die vergleichbare Zahl": "Nothing — the three unparsed cases count as wrong, so 50 % over all examples is the comparable number",
    "Die strengere Regel ist besser, weil sie auf den Fällen, die sie parst, seltener danebenliegt": "The stricter rule is better, because it is wrong less often on the cases it does parse",
    "Beide sind gleichwertig, solange die Zahl der geparsten Fälle im Bericht steht": "Both are equivalent as long as the number of parsed cases appears in the report",
    "Interaktive Auswertung von Grader und Parser": "Interactive evaluation of grader and parser",
    "Format-Reward": "format reward",
    "Answer-Reward": "answer reward",
    "geparst als": "parsed as",
    "Goldantwort": "gold answer",
    "Treffer des Parsers": "parser hits",
    "Parse-Fehler": "parse failure",
    "beim Lesen richtig": "correct when read",
    "beim Lesen falsch": "wrong when read",
    "Kategorie 1 · Format 1, Answer 1": "Category 1 · format 1, answer 1",
    "Kategorie 2 · Format 1, Answer 0": "Category 2 · format 1, answer 0",
    "Kategorie 3 · Format 0": "Category 3 · format 0",
    "Die sechs Rollouts einzeln": "The six rollouts one by one",
    "Dieselbe GSM8K-Frage, sechs Stichproben bei Temperatur 1,0. Goldantwort": "The same GSM8K question, six samples at temperature 1.0. Gold answer",
    "Antwortvergleich: Leerzeichen, $ und Tausendertrennzeichen werden entfernt, danach numerisch verglichen, sonst zeichengenau.": "Answer comparison: whitespace, $ and thousands separators are removed, then the comparison is numeric, otherwise character by character.",
    "Die drei Kategorien des Handouts": "The handout's three categories",
    "Format-Rate": "Format rate",
    "gewerteter Score = Kategorie 1 / n": "scored result = category 1 / n",
    "richtig, aber nicht gewertet": "correct but not scored",
    "Der Score misst hier nicht nur das Modell.": "The score here does not measure the model alone.",
    "So viele Rollouts enthalten die richtige Antwort im Text und bekommen trotzdem Answer-Reward 0:": "This many rollouts contain the right answer in their text and still receive answer reward 0:",
    "Genau diese Fälle verlangt prompting_baselines aus Kategorie 2 und 3 nachzulesen.": "These are exactly the cases prompting_baselines asks you to read out of categories 2 and 3.",
    "Grader und Prompt passen zusammen.": "Grader and prompt match.",
    "Jede beim Lesen richtige Antwort wird auch gewertet; die verbleibende Lücke zum vollen Score liegt am Modell.": "Every answer that is correct when read is also scored; the remaining gap to a full score is the model's.",
    "Alle drei Prompts gegen alle drei Grader": "All three prompts against all three graders",
    "Reihenfolge je Zeile:": "Order within each row:",
    "Warum die Diagonale entscheidet": "Why the diagonal is what decides",
    "Jeder Grader sucht die Antwort an genau einer Stelle: r1_zero_reward_fn zwischen den Answer-Tags, question_only_reward_fn in \\boxed{}. Sucht er dort, wo der Prompt nichts verlangt hat, findet er nie etwas – Format 0, damit Answer 0, damit Score 0, und zwar für jedes einzelne Beispiel, ohne Fehlermeldung. Das sind die beiden Nullen in der Tabelle, und sie sagen nichts über das Modell aus. Erst innerhalb der passenden Paarung wird der Vergleich zwischen den Prompts sinnvoll: dort steigt der Score von 33 % auf 67 %, während die Zeile „beim Lesen richtig“ nur von 4 auf 5 geht. Die Hälfte des Sprungs ist Formattreue, nicht Rechenfähigkeit. Und der naive Grader, der nur die letzte Zahl nimmt, ist beim question_only-Prompt am nächsten an der Wahrheit und beim r1_zero-Prompt schlechter als der passende Grader – kein Parser ist für sich besser, er passt oder passt nicht zu dem, was der Prompt verlangt hat.": "Every grader looks for the answer in exactly one place: r1_zero_reward_fn between the answer tags, question_only_reward_fn inside \\boxed{}. If it looks where the prompt asked for nothing, it never finds anything — format 0, therefore answer 0, therefore score 0, for every single example, without an error message. Those are the two zeros in the table, and they say nothing about the model. Only within a matching pairing does the comparison between prompts become meaningful: there the score rises from 33 % to 67 %, while the row „correct when read“ moves only from 4 to 5. Half of the jump is format compliance, not arithmetic ability. And the naive grader that just takes the last number is closest to the truth for the question_only prompt and worse than the matching grader for the r1_zero prompt — no parser is better in itself, it either fits what the prompt asked for or it does not.",
    "Die acht Antworten einzeln": "The eight answers one by one",
    "Was diese Regel als Score meldet": "What this rule reports as a score",
    "Accuracy über alle · nicht Geparstes zählt falsch": "Accuracy over all · anything unparsed counts as wrong",
    "Accuracy nur über Geparstes": "Accuracy over parsed only",
    "Accuracy über alle": "Accuracy over all",
    "auf die Accuracy über alle": "on the accuracy over all",
    "95-%-Intervall ≈ p ± 1,96·SE": "95 % interval ≈ p ± 1.96·SE",
    "Alle Regeln auf denselben acht Antworten": "All rules on the same eight answers",
    "Warum die geparste Accuracy die unehrlichere Zahl ist": "Why the parsed-only accuracy is the less honest number",
    "Ein Parse-Fehler ist kein fehlendes Beispiel, sondern ein Beispiel, für das die Vorhersage leer bleibt – und eine leere Vorhersage ist falsch. Wer nur über die geparsten Fälle mittelt, entfernt genau die Antworten, an denen die Regel gescheitert ist, aus dem Nenner. Deshalb steigt die geparste Accuracy immer dann, wenn eine Regel strenger wird, und sie ist am höchsten für die Regel, die am wenigsten liefert. Im GSM8K-Fall ist das mit Händen zu greifen: die Regel, die nur nach einer Zahl hinter „answer is“ sucht, meldet 50 % auf zwei geparsten Antworten und 12,5 % über alle acht. Der Standardfehler hilft dagegen nicht. Er beschreibt allein, wie stark ein Anteil bei endlichem n zufällig schwankt; ein Parserfehler ist keine Zufallsschwankung, sondern ein systematischer Versatz, der mit größerem n nur genauer gemessen wird. Und selbst gleiche Zahlen sind nicht dasselbe Ergebnis: bei MMLU liefern „erster Buchstabe“ und „Satzmuster, sonst Optionstext“ dieselben vier Kennzahlen und behandeln trotzdem zwei Beispiele genau umgekehrt. Das ist der Grund für die Lecture-Regel, immer die Einzelvorhersagen anzusehen und nicht nur den Mittelwert.": "A parse failure is not a missing example, it is an example whose prediction stays empty — and an empty prediction is wrong. Averaging over the parsed cases only removes from the denominator exactly the answers the rule failed on. That is why parsed-only accuracy rises whenever a rule gets stricter, and it is highest for the rule that delivers least. In the GSM8K case you can grab it with your hands: the rule that only looks for a number after „answer is“ reports 50 % on two parsed answers and 12.5 % over all eight. The standard error does not help against this. It describes only how much a proportion fluctuates by chance at finite n; a parser bug is not a chance fluctuation but a systematic offset that larger n merely measures more precisely. And even identical numbers are not the same result: on MMLU, „first letter“ and „sentence pattern, else option text“ report the same four figures and still treat two examples in exactly opposite ways. That is the reason for the lecture's rule to always look at the individual predictions and not only at the mean.",
    "Alle drei Antworten trennen dieselben zwei Dinge: was das Modell produziert hat und was die Auswertungskette davon durchgelassen hat. Ein Score von 0 % kann vollständig an einem Grader liegen, der an der falschen Stelle sucht – vier der sechs Rollouts sind dort inhaltlich richtig. Ein verdoppelter Score kann zur Hälfte Formattreue sein – von den zwei zusätzlich gewerteten Rollouts ist einer schon vorher richtig gewesen. Und eine hohe Accuracy über nur geparste Fälle ist kein Qualitätsmerkmal, sondern die Folge davon, dass die schwierigen Antworten vorher aus dem Nenner gefallen sind; vergleichbar ist allein die Accuracy über alle Beispiele, in der ein Parse-Fehler als falsch zählt. Genau deshalb verlangt das Handout, Parse-Fehler zu zählen und Beispiele aus jeder Kategorie zu lesen, bevor man einen Benchmarkwert berichtet.": "All three answers separate the same two things: what the model produced and what the evaluation chain let through. A score of 0 % can be entirely down to a grader looking in the wrong place — four of the six rollouts there are correct in substance. A doubled score can be half format compliance — of the two additionally scored rollouts, one was already correct before. And a high accuracy over parsed cases only is no mark of quality but the consequence of the hard answers having dropped out of the denominator first; the only comparable figure is accuracy over all examples, in which a parse failure counts as wrong. That is exactly why the handout asks you to count parse failures and read examples from every category before reporting a benchmark number.",
    "Alle drei Zahlen stehen im Ledger, keine muss geschätzt werden. Für die erste lies die Zeile „beim Lesen richtig“ beim question_only-Prompt. Für die zweite vergleiche dieselbe Zeile zwischen r1_zero und r1_zero_three_shot mit der Zeile darüber. Für die dritte rechne nach, was 5 geparste Antworten mit 80 % über alle acht Beispiele ergeben.": "All three numbers are in the ledger; none has to be estimated. For the first, read the row „correct when read“ for the question_only prompt. For the second, compare that same row between r1_zero and r1_zero_three_shot with the row above it. For the third, work out what 5 parsed answers at 80 % give over all eight examples.",
    "überlappt: max der beiden": "overlapped: max of the two",
    "seriell: Summe der beiden": "serial: sum of the two",
    "TP-Achse": "TP axis",
    "FSDP-Achse": "FSDP axis",
    "Fall und Strategie": "Case and strategy",
    "Was wird gerechnet": "What is being computed",
    "Eine Strategie · DP, FSDP oder TP": "One strategy · DP, FSDP, or TP",
    "Zwei Achsen kombiniert · FSDP × TP": "Two axes combined · FSDP × TP",
    "Modell und Verbindung": "Model and interconnect",
    "Geräte N": "Devices N",
    "Teilen sich die Achsen die Leitung?": "Do the axes share the link?",
    "Nein · beide Collectives überlappen": "No · both collectives overlap",
    "Ja · die Zeiten addieren sich": "Yes · the times add up",
    "Gerechnet wird ein einziger FFN-Layer nach Abschnitt 8 des A2-Handouts: x [B, D], W₁ und W₂ [D, D_FF], W₃ [D_FF, D], alles in FP16 mit zwei Byte pro Element. Eine Matmul (A,B)(B,C) kostet 2·A·B·C FLOPs. Sage vor jedem Wechsel voraus, ob sich die Schranke überhaupt bewegt – zwei der vier Fälle unterscheiden sich in genau einer Zahl.": "What is computed is a single FFN layer following section 8 of the A2 handout: x [B, D], W₁ and W₂ [D, D_FF], W₃ [D_FF, D], all in FP16 at two bytes per element. A matmul (A,B)(B,C) costs 2·A·B·C FLOPs. Before every switch, predict whether the limit moves at all — two of the four cases differ in exactly one number.",
    "Feste Fälle ohne Regler. Kürze den Bruch T_comm/T_comp zuerst selbst.": "Fixed cases, no sliders. Cancel the fraction T_comm/T_comp yourself first.",
    "1. Warum steht in der Data-Parallel-Schranke N < 1 + B·W/C weder D noch D_FF, obwohl beide Seiten davon abhängen?": "1. Why does the data parallel limit N < 1 + B·W/C contain neither D nor D_FF, although both sides depend on them?",
    "Weil Rechenzeit und gesendete Gradientenbytes beide proportional zu D·D_FF sind und sich das Produkt im Verhältnis vollständig herauskürzt": "Because compute time and the gradient bytes sent are both proportional to D·D_FF, so the product cancels completely in the ratio",
    "Weil ein All-Reduce nur skalare Summen überträgt und die Gewichtsdimensionen deshalb gar nicht eingehen": "Because an all-reduce transfers only scalar sums, so the weight dimensions never enter at all",
    "Weil D und D_FF gegenüber dem Batch in der Praxis vernachlässigbar klein sind": "Because in practice D and D_FF are negligibly small next to the batch",
    "2. FSDP sendet zusätzlich im Forward Pass. Warum ist seine Schranke trotzdem dieselbe wie die von Data Parallel?": "2. FSDP additionally sends in the forward pass. Why is its limit the same as the data parallel one anyway?",
    "Weil der Forward halb so viel rechnet wie der Backward und dort auch nur halb so viel gesendet wird – das Verhältnis ist in beiden Pässen (N−1)·C/(B·W)": "Because the forward pass computes half as much as the backward pass and also sends only half as much there — the ratio is (N−1)·C/(B·W) in both passes",
    "Weil der All-Gather im Forward vollständig hinter der Rechnung verschwindet und deshalb nicht zählt": "Because the forward all-gather disappears entirely behind the computation and therefore does not count",
    "Weil FSDP ausschließlich Speicher spart und die Kommunikationskosten unverändert lässt": "Because FSDP saves memory only and leaves the communication cost unchanged",
    "3. Bei 2D teilen sich beide Achsen dieselbe Leitung, die Zeiten addieren sich. Welcher Anteil der überlappten Gerätezahl bleibt?": "3. Under 2D both axes share the same link, so the times add up. What fraction of the overlapped device count remains?",
    "Ungefähr ein Viertel, weil das gemeinsame Budget optimal hälftig aufgeteilt wird und beide Faktoren dadurch halbiert werden": "Roughly a quarter, because the shared budget is optimally split in half and both factors are halved as a result",
    "Ungefähr die Hälfte, weil zwei Zeiten addiert statt maximiert werden": "Roughly a half, because two times are added instead of maximized",
    "Unverändert, weil beide Zeiten ohnehin von derselben Rechenzeit begrenzt werden": "Unchanged, because both times are bounded by the same compute time anyway",
    "Interaktive Rechnung zur Kommunikationsschranke": "Interactive calculation of the communication limit",
    "Modell und Hardware": "Model and hardware",
    "kein Collective in diesem Pass": "no collective in this pass",
    "keine Schranke – Data Parallel kommuniziert im Forward Pass gar nicht": "no limit — data parallel does not communicate at all in the forward pass",
    "höchstens": "at most",
    "Geräte": "devices",
    "keine Kommunikationsschranke in diesem Pass": "no communication limit in this pass",
    "Rechenzeit pro Gerät": "Compute time per device",
    "Kommunikationszeit pro Gerät": "Communication time per device",
    "Compute-bound.": "Compute-bound.",
    "Die Kommunikation passt in diesem Pass unter die Rechenzeit; ein weiteres Gerät bringt hier noch Durchsatz.": "In this pass the communication fits under the compute time; one more device still buys throughput here.",
    "Kommunikationsgebunden.": "Communication-bound.",
    "Die Rechenzeit ist unter die Kommunikationszeit gefallen. Weitere Geräte halbieren nur noch die Rechnung, während das Collective annähernd gleich teuer bleibt.": "Compute time has fallen below communication time. Further devices only halve the computation, while the collective stays roughly as expensive.",
    "Die Schranke selbst": "The limit itself",
    "geschlossene Form": "closed form",
    "eingesetzt": "with the numbers substituted",
    "Alle drei Strategien im selben Fall": "All three strategies in the same case",
    "Warum genau diese Größen in den Schranken stehen": "Why exactly these quantities appear in the limits",
    "Die Rechenzeit pro Gerät sinkt mit 1/N, die Zeit eines Ring-Collectives dagegen nicht: der Faktor (N−1)/N läuft gegen eins. Deshalb existiert für jede Strategie eine feste Schranke. Welche Größe darin steht, entscheidet allein, was gesendet wird. Data Parallel und FSDP bewegen Gewichte oder deren Gradienten, also 3·D·D_FF Elemente, und rechnen proportional zu B·D·D_FF – im Verhältnis kürzt sich D·D_FF vollständig heraus und nur der Batch B bleibt stehen. Tensor Parallel bewegt stattdessen Aktivierungen, also B·D Elemente; dieselbe Kürzung entfernt hier B·D und lässt D_FF stehen. Das ist der ganze Grund, warum ein größerer Batch nur die DP-Schranke hebt und eine breitere FFN nur die TP-Schranke.": "Compute time per device falls as 1/N, but the time of a ring collective does not: the factor (N−1)/N approaches one. That is why every strategy has a fixed limit. Which quantity appears in it is decided solely by what gets sent. Data parallel and FSDP move weights or their gradients, that is 3·D·D_FF elements, and compute proportionally to B·D·D_FF — in the ratio, D·D_FF cancels completely and only the batch B is left standing. Tensor parallel moves activations instead, that is B·D elements; here the same cancellation removes B·D and leaves D_FF. That is the entire reason a larger batch raises the DP limit only, and a wider FFN the TP limit only.",
    "2D-Parallelismus": "2D parallelism",
    "Nur der Forward Pass, genau wie im Handout. Jedes Gerät trägt einen TP-Rang und einen FSDP-Rang; die Gewichte sind entlang beider Achsen geteilt.": "The forward pass only, exactly as in the handout. Every device carries a TP rank and an FSDP rank; the weights are sharded along both axes.",
    "Die beiden Achsen kosten Verschiedenes": "The two axes cost different things",
    "des TP-Shards von": "of the TP shard of",
    "Diese Aufteilung von N auf die beiden Achsen bleibt unter der Rechenzeit.": "This split of N across the two axes stays under the compute time.",
    "Eine der beiden Achsen ist zu groß gewählt. Verschiebe Geräte auf die andere Achse, statt N zu senken – oft liegt genau daneben eine gültige Aufteilung mit demselben N.": "One of the two axes is chosen too large. Move devices to the other axis instead of lowering N — a valid split with the same N is often right next door.",
    "Wie weit trägt 2D insgesamt?": "How far does 2D carry in total?",
    "TP-Achse allein": "TP axis alone",
    "FSDP-Achse allein": "FSDP axis alone",
    "überlappt: beide Bedingungen sind unabhängig": "overlapped: the two conditions are independent",
    "seriell: ein gemeinsames Budget, optimal aufgeteilt": "serial: one shared budget, optimally split",
    "des überlappten Werts": "of the overlapped value",
    "Warum das Produkt – und warum ein Viertel davon": "Why the product — and why a quarter of it",
    "Überlappen die beiden Achsen, muss jede für sich unter der Rechenzeit bleiben. Beide Bedingungen enthalten dieselbe Rechenzeit im Nenner, und in beiden kürzen sich die Faktoren der jeweils anderen Achse heraus – deshalb sind sie voneinander unabhängig und die erreichbare Gerätezahl ist einfach das Produkt der beiden einzelnen Schranken. Teilen sich die Achsen dagegen dieselbe Leitung, addieren sich ihre Zeiten zu einem gemeinsamen Budget von einer Rechenzeit. Ein Produkt zweier Faktoren wird unter einer Summenbedingung maximal, wenn beide Summanden gleich groß sind – jede Achse bekommt also die Hälfte des Budgets und kommt nur halb so weit. Zwei halbierte Faktoren ergeben ein Viertel des Produkts; genau dieses Verhältnis steht in der Zeile darüber.": "If the two axes overlap, each must stay under the compute time on its own. Both conditions carry the same compute time in the denominator, and in both the factors of the respective other axis cancel out — which is why they are independent of each other and the reachable device count is simply the product of the two individual limits. If instead the axes share the same link, their times add up into one shared budget of a single compute time. A product of two factors is maximal under a sum constraint when both summands are equal — so each axis receives half the budget and gets only half as far. Two halved factors give a quarter of the product; that is exactly the ratio shown in the row above.",
    "Alle drei Antworten hängen an derselben Kürzung. In jedem Verhältnis aus Kommunikations- und Rechenzeit steht oben, was gesendet wird, und unten, was gerechnet wird; beide enthalten gemeinsame Faktoren, und was übrig bleibt, ist die Schranke. Bei DP und FSDP verschwindet D·D_FF und der Batch bleibt, bei TP verschwindet B·D und die FFN-Breite bleibt. Dass FSDP im Forward zusätzlich sendet, verschiebt nichts, weil dort auch nur halb so viel gerechnet wird wie im Backward – das Verhältnis ist in beiden Pässen (N−1)·C/(B·W). Und weil die beiden Verhältnisse von TP und FSDP jeweils die Faktoren der anderen Achse verlieren, sind ihre Bedingungen unabhängig: überlappt multiplizieren sich die Schranken, seriell teilen sich beide ein Budget, halbieren sich damit einzeln und ergeben zusammen ein Viertel.": "All three answers hang on the same cancellation. In every ratio of communication time to compute time, the numerator is what gets sent and the denominator is what gets computed; both contain shared factors, and what remains is the limit. For DP and FSDP, D·D_FF disappears and the batch remains; for TP, B·D disappears and the FFN width remains. That FSDP additionally sends in the forward pass shifts nothing, because only half as much is computed there as in the backward pass — the ratio is (N−1)·C/(B·W) in both passes. And because the two ratios of TP and FSDP each lose the factors of the other axis, their conditions are independent: overlapped, the limits multiply; serial, both share one budget, are each halved, and together give a quarter.",
    "Schreibe für jede Frage den Bruch T_comm/T_comp einmal vollständig hin und kürze ihn, bevor du wählst. Für die dritte Frage: unter einer Summenbedingung wird ein Produkt maximal, wenn beide Summanden gleich groß sind.": "For each question, write the fraction T_comm/T_comp out in full once and cancel it before choosing. For the third question: under a sum constraint, a product is maximal when both summands are equal.",
    "Ein Node · NVLink 450 GB/s · B = 65536": "One node · NVLink 450 GB/s · B = 65536",
    "Acht Geräte in einem Gehäuse, verbunden über schnelle NVLink-Pfade. Das ist die Umgebung, in der Tensor Parallelism überhaupt erst infrage kommt. Vergleiche hier zuerst, wie weit DP und TP jeweils tragen.": "Eight devices in one chassis, connected by fast NVLink paths. This is the environment in which tensor parallelism becomes an option at all. Start here by comparing how far DP and TP each carry.",
    "Zwischen Nodes · 25 GB/s · B = 65536": "Between nodes · 25 GB/s · B = 65536",
    "Dasselbe Modell und derselbe Batch, aber die Geräte hängen an gewöhnlichem Netzwerk statt an NVLink – achtzehnmal weniger Egress. Nur W ändert sich gegenüber dem ersten Fall; sage vorher, um welchen Faktor jede Schranke fällt.": "The same model and the same batch, but the devices sit on ordinary networking instead of NVLink — eighteen times less egress. Only W changes compared with the first case; predict by what factor each limit falls.",
    "NVLink · kleiner Batch B = 8192": "NVLink · small batch B = 8192",
    "Dieselbe schnelle Verbindung, aber nur ein Achtel der Zeilen pro Schritt – etwa weil die kritische Batchgröße erreicht ist und ein größerer Batch nichts mehr bringt. Beobachte, welche der drei Schranken sich dadurch überhaupt bewegt.": "The same fast interconnect, but only an eighth of the rows per step — because the critical batch size has been reached, say, and a larger batch buys nothing. Watch which of the three limits moves at all as a result.",
    "NVLink · sehr breite FFN D_FF = 65536": "NVLink · very wide FFN D_FF = 65536",
    "Viermal breitere innere Schicht bei gleichem D, gleichem Batch und gleicher Verbindung. Auch hier bewegt sich genau eine der drei Schranken – die andere bleibt auf die Ziffer gleich.": "A four times wider inner layer at the same D, the same batch, and the same interconnect. Here too exactly one of the three limits moves — the other stays identical down to the digit.",
    "Data Parallel · Batchachse geteilt, Modell repliziert": "Data parallel · batch axis sharded, model replicated",
    "FSDP · Batchachse und Gewichte geteilt": "FSDP · batch axis and weights sharded",
    "Tensor Parallel · Gewichte geteilt, Batch repliziert": "Tensor parallel · weights sharded, batch replicated",
    "Ausgabe": "Output",
    "RMSNorm · adapters.run_rmsnorm": "RMSNorm · adapters.run_rmsnorm",
    "SwiGLU · adapters.run_swiglu": "SwiGLU · adapters.run_swiglu",
    "Interaktiver RMSNorm- und SwiGLU-Rechner": "Interactive RMSNorm and SwiGLU calculator",
    "Alle Gewichte sind fest, damit jede Zahlenänderung allein von der gewählten Variante kommt. Sage vor jedem Wechsel voraus, ob sich überhaupt eine Ziffer ändert. Jede der acht falschen Varianten ist auf mindestens einem Eingabefall bis auf sechs Nachkommastellen identisch mit der korrekten.": "All weights are fixed, so every change in the numbers comes from the chosen variant alone. Before each switch, predict whether a single digit changes at all. Each of the eight wrong variants is identical to the correct one to six decimals on at least one input case.",
    "1. Du prüfst RMSNorm mit einem einzigen Token und dem frisch initialisierten Gain. Welche zwei Fehler kann dieser Test grundsätzlich nicht sehen?": "1. You check RMSNorm with a single token and the freshly initialized gain. Which two errors can that test not see in principle?",
    "Die Reduktion über den ganzen Tensor statt über D, und den vergessenen Gain": "The reduction over the whole tensor instead of over D, and the forgotten gain",
    "Die Platzierung von ε und das Abziehen des Mittelwerts": "The placement of ε and the subtraction of the mean",
    "Keinen – ein einzelner Token prüft alle vier Verträge": "None — a single token checks all four contracts",
    "2. Warum liefern beim SwiGLU-Nulltest alle fünf Varianten dieselbe Ausgabe?": "2. Why do all five variants produce the same output in the SwiGLU zero test?",
    "Weil beide Zweige null sind und SiLU, σ·z und ReLU bei null alle exakt null zurückgeben": "Because both branches are zero and SiLU, σ·z and ReLU all return exactly zero at zero",
    "Weil ohne Bias jede lineare Abbildung die Null auf die Null wirft und das Gate deshalb nie ausgewertet wird": "Because without a bias every linear map sends zero to zero, so the gate is never evaluated",
    "Weil bei x = 0 die inneren Shapes zusammenfallen": "Because the inner shapes coincide at x = 0",
    "3. Wann entscheidet die Platzierung von ε das Ergebnis?": "3. When does the placement of ε decide the result?",
    "Sobald der quadratische Mittelwert in die Größenordnung von ε kommt; darüber liegt der Unterschied unter der Anzeigegenauigkeit": "As soon as the mean of squares approaches the order of magnitude of ε; above that the difference stays below display precision",
    "Immer, weil ε in jeden Nenner mit demselben absoluten Gewicht eingeht": "Always, because ε enters every denominator with the same absolute weight",
    "Nie, weil ε mit 1e−5 in jedem Fall vernachlässigbar ist": "Never, because at 1e−5 ε is negligible in every case",
    "Ein Token · D = 4 · Gain = 1": "One token · D = 4 · gain = 1",
    "Der Fall, den man beim Nachrechnen von Hand zuerst nimmt: ein einziger Tokenvektor, der Gain steht auf der Initialisierung, also überall eins. Zähle beim Durchschalten mit, wie viele der vier falschen Varianten dieser Test überhaupt sehen kann.": "The case you reach for first when checking by hand: a single token vector, the gain still at its initialization, so one everywhere. As you step through, count how many of the four wrong variants this test can see at all.",
    "Ein Token · Aktivierungen weit über eins": "One token · activations far above one",
    "Derselbe Aufbau, nur mit großen Aktivierungen. Der quadratische Mittelwert liegt hier bei 125000 und damit zehn Zehnerpotenzen über ε. Achte darauf, was mit dem ε-Fehler passiert, sobald ε gegenüber dem Mittelwert verschwindet.": "The same setup, only with large activations. The mean of squares is 125000 here, ten orders of magnitude above ε. Watch what happens to the ε error once ε vanishes against the mean.",
    "Ein Token · Aktivierungen im Bereich von ε": "One token · activations in the range of ε",
    "Jetzt liegt der quadratische Mittelwert bei 1,5625e−6, also unter ε = 1e−5. Genau hier entscheidet die Platzierung von ε nicht die sechste Nachkommastelle, sondern den Faktor der ganzen Ausgabe.": "Now the mean of squares is 1.5625e−6, below ε = 1e−5. This is exactly where the placement of ε decides not the sixth decimal but the factor of the entire output.",
    "Zwei Tokens mit Mittelwert null · verschiedene Skalen": "Two tokens with mean zero · different scales",
    "Beide Zeilen haben exakt den Mittelwert null, aber verschiedene quadratische Mittel (2,5 und 5). Der Mittelwert null ist keine Schikane: nach einer vorgeschalteten Normalisierung oder bei symmetrisch initialisierten Gewichten liegt man oft nahe daran.": "Both rows have exactly mean zero but different means of squares (2.5 and 5). Mean zero is not a contrived trap: after an upstream normalization, or with symmetrically initialized weights, you often end up close to it.",
    "Zwei Tokens · trainierter Gain ≠ 1 · Skalen 1 und 10": "Two tokens · trained gain ≠ 1 · scales 1 and 10",
    "Der Fall, den test_rmsnorm herstellt: geladene Referenzgewichte statt der Initialisierung, mehrere Tokens und unterschiedliche Zeilenskalen. Dieser eine Fall entlarvt alle vier falschen Varianten gleichzeitig.": "The case test_rmsnorm sets up: loaded reference weights instead of the initialization, several tokens, and different row scales. This single case exposes all four wrong variants at once.",
    "korrekt · Mittel über D, ε unter der Wurzel, Gain": "correct · mean over D, ε under the root, gain",
    "Mittelwert über die letzte Achse D, je Token getrennt": "mean over the last axis D, separately per token",
    "ε innerhalb der Wurzel": "ε inside the square root",
    "× g": "× g",
    "kein g": "no g",
    "Genau Gleichung (4) des A1-Handouts: RMS(a) = √( (1/d_model)·Σ a_i² + ε ), pro Tokenvektor über die Featureachse gebildet, danach elementweise mit dem lernbaren Gain multipliziert. Für X [B,T,D] bleibt die Shape [B,T,D], und kein Token beeinflusst die Skala eines anderen.": "Exactly equation (4) of the A1 handout: RMS(a) = √( (1/d_model)·Σ a_i² + ε ), formed per token vector over the feature axis, then multiplied element-wise by the learnable gain. For X [B,T,D] the shape stays [B,T,D], and no token influences another token's scale.",
    "ε außerhalb der Wurzel · x / (√mean + ε)": "ε outside the root · x / (√mean + ε)",
    "ε außerhalb der Wurzel addiert": "ε added outside the square root",
    "ε soll die Wurzel selbst vor der Null schützen und steht deshalb unter ihr. Wer es danach addiert, verschiebt den Nenner um einen absoluten Betrag statt um einen Beitrag zum Mittelwert. Solange der quadratische Mittelwert weit über ε liegt, ist der Unterschied kleiner als jede Anzeigegenauigkeit – bei Aktivierungen im Bereich von ε ändert dieselbe Zeile das Ergebnis dagegen um ein Vielfaches. Das ist der unangenehmste Fehlertyp: nicht falsch genug, um beim Testen aufzufallen, aber falsch genug, um genau dann zu greifen, wenn eine Aktivierung klein wird.": "ε is there to protect the square root itself from zero, which is why it sits underneath it. Adding it afterwards shifts the denominator by an absolute amount instead of by a contribution to the mean. As long as the mean of squares lies far above ε, the difference is smaller than any display precision — but with activations in the range of ε the same line changes the result by a multiple. That is the nastiest kind of error: not wrong enough to be noticed while testing, yet wrong enough to bite precisely when an activation becomes small.",
    "LayerNorm-Reflex · erst den Mittelwert abziehen": "LayerNorm reflex · subtract the mean first",
    "Mittelwert über D, aber vorher wird der Mittelwert abgezogen": "mean over D, but the mean is subtracted first",
    "Das ist LayerNorm, nicht RMSNorm – der eine Unterschied, den beide Verfahren überhaupt haben. RMSNorm zentriert bewusst nicht, spart damit eine Reduktion und einen Bias, und genau dieses Weglassen ist der Grund, warum das Handout es statt LayerNorm verlangt. Unsichtbar bleibt der Fehler exakt dann, wenn der Tokenvektor ohnehin schon den Mittelwert null hat: dann ändert das Abziehen nichts.": "That is LayerNorm, not RMSNorm — the one difference the two methods have at all. RMSNorm deliberately does not centre, which saves a reduction and a bias, and that omission is exactly why the handout asks for it instead of LayerNorm. The error stays invisible precisely when the token vector already has mean zero: then subtracting changes nothing.",
    "Reduktion über den ganzen Tensor statt über D": "reduction over the whole tensor instead of over D",
    "Mittelwert über alle Elemente des Tensors": "mean over every element of the tensor",
    "Das ist der Effekt von x.pow(2).mean() ohne dim=−1: reduziert wird über alles, was da ist. Damit hängt die Skala eines Tokens plötzlich von allen anderen Tokens im Batch ab – dasselbe Token liefert bei anderer Nachbarschaft eine andere Ausgabe, und im Inferenzfall mit Batchgröße eins rechnet das Modell anders als im Training. Unsichtbar ist der Fehler, solange es nur einen einzigen Tokenvektor gibt oder alle Tokens zufällig dieselbe quadratische Länge haben.": "This is the effect of x.pow(2).mean() without dim=−1: everything present gets reduced. A token's scale then suddenly depends on every other token in the batch — the same token produces a different output in different company, and at inference with batch size one the model computes differently than during training. The error is invisible as long as there is only a single token vector, or all tokens happen to have the same squared length.",
    "Gain vergessen · nur normalisieren": "gain forgotten · normalize only",
    "Der lernbare Gain g [D] fehlt in der Rückgabe. Das ist der Fehler, den ein eigener Test fast nie sieht, denn A1 initialisiert g mit lauter Einsen – ein frisch gebautes Modul verhält sich identisch zur korrekten Implementierung. Erst wenn geladene Referenzgewichte einen Gain ≠ 1 mitbringen, wie es test_rmsnorm tut, tritt die Abweichung auf. Im Training fällt der Fehler auch dann nicht auf: das Modul lernt einfach ohne diesen Parameter weiter.": "The learnable gain g [D] is missing from the return value. This is the error a self-built test almost never sees, because A1 initializes g to all ones — a freshly built module behaves identically to the correct implementation. The deviation only appears once loaded reference weights bring a gain ≠ 1, as test_rmsnorm does. Even then it goes unnoticed during training: the module simply keeps learning without that parameter.",
    "x = [1, 1] · beide Zweige werden zu lauter Einsen": "x = [1, 1] · both branches become all ones",
    "Der Einservektor, den man als Erstes eintippt. Er bringt beide Zweige auf denselben Wert – und weil SiLU(1) = 1·σ(1) = σ(1) gilt, fällt auch der Unterschied zwischen SiLU und dem bloßen Sigmoid weg. Sage voraus, wie viele der vier Fehler dieser Test sehen kann.": "The all-ones vector, the first thing you type. It puts both branches at the same value — and since SiLU(1) = 1·σ(1) = σ(1), the difference between SiLU and the bare sigmoid disappears as well. Predict how many of the four errors this test can see.",
    "x = [0, 0] · der Nulltest": "x = [0, 0] · the zero test",
    "Der zweite Reflex: „ich teste erst mal mit Nullen“. Beide Zweige sind null, und jede der fünf Varianten multipliziert etwas mit null oder wertet eine bei null verschwindende Funktion aus.": "The second reflex: „let me test with zeros first“. Both branches are zero, and every one of the five variants either multiplies something by zero or evaluates a function that vanishes at zero.",
    "x = [2, 2] · gleiche Einträge, Werte über eins": "x = [2, 2] · equal entries, values above one",
    "Immer noch x₁ = x₂, also liefern W₁x und W₃x weiterhin denselben Vektor – aber die Werte liegen jetzt nicht mehr bei eins. Beobachte, welcher Fehler dadurch sichtbar wird und welcher weiterhin nicht.": "Still x₁ = x₂, so W₁x and W₃x continue to give the same vector — but the values are no longer at one. Watch which error becomes visible through that, and which one still does not.",
    "x = [3, −1] · verschiedene Einträge, gemischte Vorzeichen": "x = [3, −1] · different entries, mixed signs",
    "Erst hier unterscheiden sich W₁x und W₃x, und erst hier gibt es negative Werte im Gate. Das ist der kleinste Fall, der alle vier Verwechslungen gleichzeitig auffliegen lässt – und ungefähr das, was test_swiglu mit zufälligen Referenzgewichten tut.": "Only here do W₁x and W₃x differ, and only here are there negative values in the gate. This is the smallest case that blows all four mix-ups at once — and roughly what test_swiglu does with random reference weights.",
    "korrekt · W₂( SiLU(W₁x) ⊙ W₃x )": "correct · W₂( SiLU(W₁x) ⊙ W₃x )",
    "SiLU auf dem W₁-Zweig": "SiLU on the W₁ branch",
    "SiLU auf dem W₃-Zweig": "SiLU on the W₃ branch",
    "σ auf dem W₁-Zweig": "σ on the W₁ branch",
    "ReLU auf dem W₁-Zweig": "ReLU on the W₁ branch",
    "SiLU(z) = z·σ(z)": "SiLU(z) = z·σ(z)",
    "σ(z), also ohne den Faktor z": "σ(z), that is without the factor z",
    "ReLU(z) = max(0, z)": "ReLU(z) = max(0, z)",
    "elementweises Produkt mit W₃x": "element-wise product with W₃x",
    "elementweises Produkt mit W₁x": "element-wise product with W₁x",
    "kein Produkt, der W₃-Zweig fehlt ganz": "no product, the W₃ branch is missing entirely",
    "Genau Gleichung (7) des A1-Handouts. Der W₁-Zweig läuft durch SiLU und wird zum Gate, der W₃-Zweig bleibt roh und liefert die Kandidatenfeatures, das elementweise Produkt verbindet beide, und W₂ bildet auf D zurück. Alle drei Matrizen sind bias-frei, und keine Operation mischt Tokenpositionen.": "Exactly equation (7) of the A1 handout. The W₁ branch runs through SiLU and becomes the gate, the W₃ branch stays raw and supplies the candidate features, the element-wise product joins the two, and W₂ maps back to D. All three matrices are bias-free, and no operation mixes token positions.",
    "Zweige vertauscht · SiLU auf W₃ statt auf W₁": "branches swapped · SiLU on W₃ instead of W₁",
    "Beide Zweige haben dieselbe Shape [B,T,F], deshalb läuft die Verwechslung fehlerfrei durch – kein Shape-Check der Welt merkt sie. Als Architektur wäre sie sogar brauchbar: das Modell lernt einfach W₁ und W₃ in vertauschten Rollen. Nur stimmen die Zahlen nicht mehr mit einer Referenz überein, die feste Gewichte in die vorgeschriebenen Rollen lädt. Unsichtbar bleibt der Fehler immer dann, wenn W₁x und W₃x zufällig denselben Vektor ergeben.": "Both branches have the same shape [B,T,F], so the mix-up runs through without error — no shape check in the world notices it. As an architecture it would even be usable: the model simply learns W₁ and W₃ in swapped roles. The numbers just no longer match a reference that loads fixed weights into the prescribed roles. The error stays invisible whenever W₁x and W₃x happen to give the same vector.",
    "σ statt SiLU · das ist Gleichung (6), nicht (7)": "σ instead of SiLU · that is equation (6), not (7)",
    "Das ist die ursprüngliche GLU aus Gleichung (6) des Handouts, nicht die SwiGLU aus Gleichung (7). Der Unterschied ist genau der Faktor z vor dem Sigmoid: σ liegt immer zwischen 0 und 1 und kann nur dämpfen, während SiLU auch verstärken und das Vorzeichen behalten kann. Beide Formeln stehen im Handout direkt untereinander, was die Verwechslung so naheliegend macht. Unsichtbar ist der Unterschied genau dort, wo z = 1 ist, denn dann gilt SiLU(1) = 1·σ(1) = σ(1).": "This is the original GLU from equation (6) of the handout, not the SwiGLU from equation (7). The difference is exactly the factor z in front of the sigmoid: σ always lies between 0 and 1 and can only attenuate, whereas SiLU can also amplify and keep the sign. Both formulas sit directly beneath one another in the handout, which is what makes the mix-up so natural. The difference is invisible exactly where z = 1, because there SiLU(1) = 1·σ(1) = σ(1).",
    "Gate weggelassen · W₂( SiLU(W₁x) )": "gate dropped · W₂( SiLU(W₁x) )",
    "Das ist ein Feed-Forward Network mit SiLU und ohne Gating – also genau die Baseline, gegen die A1 später in der Ablation swiglu_ablation vergleicht. Es läuft, es trainiert, es hat nur zwei statt drei großen Matrizen und damit weniger Parameter. Wer es versehentlich baut, misst in der Ablation zwei Mal dieselbe Architektur. Unsichtbar bleibt es, solange W₃x lauter Einsen liefert, denn dann ist das Produkt mit dem Inhaltszweig die Identität.": "This is a feed-forward network with SiLU and without gating — exactly the baseline A1 later compares against in the swiglu_ablation ablation. It runs, it trains, it just has two instead of three large matrices and therefore fewer parameters. Build it by accident and your ablation measures the same architecture twice. It stays invisible as long as W₃x produces all ones, because then the product with the content branch is the identity.",
    "ReLU statt SiLU auf dem Gate-Zweig": "ReLU instead of SiLU on the gate branch",
    "Abbildung 3 des Handouts stellt genau diese beiden Funktionen nebeneinander: ReLU knickt bei null hart ab und setzt alles Negative auf exakt null, SiLU ist glatt, hat bei leicht negativen Werten ein Minimum und lässt kleine negative Beiträge durch. Für z ≥ 0 liegen beide nah beieinander, was die Verwechslung im Mittel harmlos aussehen lässt. Übereinstimmend sind sie nur bei z = 0 – dort geben beide exakt null zurück.": "Figure 3 of the handout puts exactly these two functions side by side: ReLU kinks hard at zero and sets everything negative to exactly zero, while SiLU is smooth, has a minimum at slightly negative values, and lets small negative contributions through. For z ≥ 0 the two are close, which makes the mix-up look harmless on average. They agree only at z = 0 — there both return exactly zero.",
    "RMSNorm Zahl für Zahl": "RMSNorm number by number",
    "SwiGLU Zahl für Zahl": "SwiGLU number by number",
    "Regeln der gewählten Variante": "Rules of the chosen variant",
    "Reduktionsachse": "Reduction axis",
    "Platzierung von ε": "Placement of ε",
    "Gain g": "Gain g",
    "quadratisches Mittel": "mean of squares",
    "Nenner": "denominator",
    "Ausgabe pro Token": "Output per token",
    "für Token": "for token",
    "Größte Abweichung von der A1-Referenz über alle Tokens": "Largest deviation from the A1 reference across all tokens",
    "Größte Abweichung von der A1-Referenz": "Largest deviation from the A1 reference",
    "Welcher Zweig wird geformt": "Which branch is shaped",
    "mit welcher Funktion": "with which function",
    "wie wird zusammengeführt": "how they are combined",
    "Innere Breite F und Rückweg auf D": "Inner width F and the way back to D",
    "geformter Zweig": "shaped branch",
    "innerer Vektor vor W₂": "inner vector before W₂",
    "Die innere Breite ist keine freie Wahl": "The inner width is not a free choice",
    "nächstes Vielfaches von 64": "nearest multiple of 64",
    "Was dieser Fall beweisen kann": "What this case can prove",
    "Verglichen wird auf sechs Nachkommastellen. Ein Token mit Gain eins – der Fall, den man zuerst von Hand rechnet – kann zwei der vier Fehler grundsätzlich nicht sehen: die Reduktion über den ganzen Tensor fällt mit der Reduktion über D zusammen, solange es nur eine Zeile gibt, und der vergessene Gain ist bei g = 1 folgenlos. Erst mehrere Tokens mit verschiedenen Skalen und ein Gain ≠ 1 trennen alle vier Varianten, und genau diese Situation stellt test_rmsnorm mit geladenen Referenzgewichten her.": "The comparison runs to six decimals. One token with gain one — the case you compute by hand first — cannot see two of the four errors in principle: the reduction over the whole tensor coincides with the reduction over D as long as there is only one row, and a forgotten gain has no effect at g = 1. Only several tokens with different scales and a gain ≠ 1 separate all four variants, and that is exactly the situation test_rmsnorm sets up with loaded reference weights.",
    "Alle fünf Varianten haben dieselben Shapes, deshalb kann kein Shape-Check und keine Assertion über Dimensionen zwischen ihnen unterscheiden. Der Nullvektor macht alle vier Fehler unsichtbar, weil jede Variante entweder mit null multipliziert oder eine bei null verschwindende Funktion auswertet. Der Einservektor versteckt immer noch drei von vier, weil er beide Zweige gleichsetzt und zugleich SiLU(1) = σ(1) erzwingt. Erst verschiedene Einträge mit gemischten Vorzeichen trennen alle fünf – und genau das erzeugt test_swiglu, wenn es zufällige Referenzgewichte lädt.": "All five variants have the same shapes, so no shape check and no assertion about dimensions can tell them apart. The zero vector makes all four errors invisible, because every variant either multiplies by zero or evaluates a function that vanishes at zero. The all-ones vector still hides three of four, because it equates both branches and at the same time forces SiLU(1) = σ(1). Only different entries with mixed signs separate all five — and that is exactly what test_swiglu produces when it loads random reference weights.",
    "Ein einzelner Token mit Gain eins lässt zwei Fehler ungeprüft: mit nur einer Zeile ist die Reduktion über den ganzen Tensor dieselbe wie die über D, und bei g = 1 ist die Multiplikation mit dem Gain die Identität. Beim Nulltest der SwiGLU sind beide Zweige null, und SiLU, σ·z, ReLU und das weggelassene Gate liefern dort alle exakt dieselbe Ausgabe – der Test ist deshalb wertlos, obwohl er grün wird. Und ε unter oder neben der Wurzel entscheidet nichts, solange der quadratische Mittelwert um Größenordnungen darüber liegt; sobald er in den Bereich von ε kommt, ändert dieselbe Zeile das Ergebnis um ein Vielfaches.": "A single token with gain one leaves two errors unchecked: with only one row the reduction over the whole tensor is the same as the one over D, and at g = 1 multiplying by the gain is the identity. In the SwiGLU zero test both branches are zero, and SiLU, σ·z, ReLU and the dropped gate all return exactly the same output there — which makes the test worthless even though it goes green. And ε under or beside the root decides nothing as long as the mean of squares lies orders of magnitude above it; once it reaches the range of ε, the same line changes the result by a multiple.",
    "Frage bei jedem Feld, welche Zahl die falsche Variante überhaupt anfassen würde. Eine Reduktionsachse lässt sich nur unterscheiden, wenn es mehr als eine Zeile gibt. Ein Faktor lässt sich nur unterscheiden, wenn er nicht eins ist. Und ein Summand entscheidet nur dann etwas, wenn er nicht winzig gegen das ist, wozu er addiert wird.": "For each field, ask which number the wrong variant would touch at all. A reduction axis can only be distinguished when there is more than one row. A factor can only be distinguished when it is not one. And a summand only decides something when it is not tiny compared to what it is added to.",
    "__patterns": [
      {
        "source": "^(\\d+) Vorlesungen direkt mit Concepts, Formeln, Labs und Assignments verknüpft\\.$",
        "flags": "u",
        "target": "$1 lectures linked directly to concepts, formulas, labs, and assignments."
      },
      {
        "source": "^(\\d+) Concepts · (\\d+) Formeln · (\\d+) Labs(.*)$",
        "flags": "u",
        "target": "$1 concepts · $2 formulas · $3 labs$4"
      },
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
        "source": "^C=(\\d+) EFLOP: kleinstes Loss-N$",
        "flags": "u",
        "target": "C=$1 EFLOP: model size with lowest loss"
      },
      {
        "source": "^(\\d+)M Parameter$",
        "flags": "u",
        "target": "$1M parameters"
      },
      {
        "source": "^(\\d+) min · (\\d+) Konzepte · (\\d+) Labs$",
        "flags": "u",
        "target": "$1 min · $2 concepts · $3 labs"
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
        "source": "^(\\d+) Karten nie abgerufen · (\\d+) zuletzt nicht gewusst · (\\d+) zuletzt schwer · (\\d+) zuletzt gewusst$",
        "flags": "u",
        "target": "$1 cards never reviewed · $2 last rated again · $3 last rated hard · $4 last rated got it"
      },
      {
        "source": "^Abrufsitzung starten \\((\\d+)\\)$",
        "flags": "u",
        "target": "Start review session ($1)"
      },
      {
        "source": "^(\\d+) gemischte Kernfragen$",
        "flags": "u",
        "target": "$1 mixed core questions"
      },
      {
        "source": "^Formel · (.+)$",
        "flags": "u",
        "target": "Formula · $1"
      },
      {
        "source": "Mio\\.",
        "flags": "gu",
        "target": "M"
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
        "source": "^(\\d+) Kernfragen$",
        "flags": "u",
        "target": "$1 core questions"
      },
      {
        "source": "^(\\d+) Formeln · Geschlossen siehst du ausgeschriebene Abkürzungen und den Zweck, aber keine Gleichung; Namen und Zahlenbeispiel kommen vor der Formel\\.$",
        "flags": "u",
        "target": "$1 formulas · Closed cards show expanded abbreviations and purpose, but no equation; names and a numerical example come before the equation."
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
        "source": "^Antwort (\\d+): Reward R(\\d+)$",
        "flags": "u",
        "target": "Response $1: reward R$2"
      },
      {
        "source": "^Antwort (\\d+): unmaskierte Token n(\\d+)$",
        "flags": "u",
        "target": "Response $1: unmasked tokens n$2"
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
        "source": "Transfer laut begründet",
        "flags": "gu",
        "target": "transfer justified aloud"
      },
      {
        "source": "Transferfrage: Kannst du das Modulziel auf einen neuen Fall anwenden\\?",
        "flags": "gu",
        "target": "Transfer question: can you apply the module outcome to a new case?"
      },
      {
        "source": "Query Heads teilen einen KV Head",
        "flags": "gu",
        "target": "Query Heads share one KV Head"
      },
      {
        "source": "KV-Anteil",
        "flags": "gu",
        "target": "KV share"
      },
      {
        "source": "1 Byte\\b",
        "flags": "gu",
        "target": "1 byte"
      },
      {
        "source": "([2-9][0-9]*) Byte\\b",
        "flags": "gu",
        "target": "$1 bytes"
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
        "source": "^richtig\\. Öffne die betroffenen (?:Konzepte|Concepts) und beantworte die Frage nach dem Nacharbeiten erneut\\.$",
        "flags": "u",
        "target": "correct. Open the relevant concepts, review them, and then answer the question again."
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
        "source": "^(.+) · ○ offen$",
        "flags": "u",
        "target": "$1 · ○ open"
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
    "Kursumfang": "Course scope",
    "Keine künstliche Kompetenzwertung.": "No artificial competence score.",
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
    "Übersicht": "Overview",
    "Lernpfad": "Learning Path",
    "Konzepte": "Concepts",
    "Formeln & Symbole": "Formulas & Symbols",
    "Abruftraining": "Retrieval Practice",
    "Glossar": "Glossary",
    "Notizen": "Notes",
    "Neu": "New",
    "Gesehen": "Seen",
    "Erklärt": "Explained",
    "Gespeichert": "Saved",
    "Gespeichert.": "Saved.",
    "Lesezeichen entfernt": "Bookmark removed",
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
    "Formeln": "Formulas",
    "Lesezeichen entfernen": "Remove bookmark",
    "Konzept speichern": "Save concept",
    "Interaktiv": "Interactive",
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
    "15-Minuten-Diagnose": "15-minute diagnostic",
    "Konzepte begonnen": "concepts started",
    "Lesezeichen": "Bookmarks",
    "Diagnose vorhanden": "Diagnostic completed",
    "Diagnose offen": "Diagnostic pending",
    "Start hier": "Start here",
    "Deine Lücken sollen die Reihenfolge bestimmen.": "Let your knowledge gaps determine the order.",
    "Die Diagnose prüft Anwendung statt Begriffsabfrage und markiert Bereiche als bereit, auffrischen oder Blocker.": "The diagnostic tests application rather than vocabulary recall and marks areas as ready, review, or blockers.",
    "Diagnose starten": "Start diagnostic",
    "Jetzt sinnvoll": "A useful next step",
    "Ein kleiner Mix aus Fundament, Kurs und Abruf.": "A short mix of foundations, course material, and retrieval practice.",
    "Abruftraining öffnen": "Open retrieval training",
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
    "Jede Karte beginnt mit Problem und Zweck, erklärt alle Namen und rechnet einen kleinen Fall. Erst danach erscheint die allgemeine Gleichung.": "Every card begins with the problem and purpose, explains every name, and works through a small case. Only then does the general equation appear.",
    "Σ Formeln": "Σ Formulas",
    "α Symbole": "α Symbols",
    "Formeln und Symbole durchsuchen": "Search formulas and symbols",
    "Nach Kategorie filtern": "Filter by category",
    "Alle Kategorien": "All categories",
    "Symbole": "Symbols",
    " · Geschlossen siehst du ausgeschriebene Abkürzungen und den Zweck, aber keine Gleichung; Namen und Zahlenbeispiel kommen vor der Formel.": " · Closed cards show expanded abbreviations and purpose, but no equation; names and a numerical example come before the equation.",
    " · Ein Symbol kann je nach Kapitel etwas anderes bedeuten.": " · A symbol may mean different things in different chapters.",
    "Prüfe Schreibweise oder entferne einen Filter.": "Check the spelling or remove a filter.",
    "Selbst lösen, gezielt Unterstützung holen": "Solve it yourself, get targeted support",
    "Lernmodus – keine Abgabelösungen.": "Learning mode – no ready-to-submit solutions.",
    "Der Coach liefert Voraussetzungen, Invarianten, Tests und Reflexionsfragen. Code und konkrete Deliverables bleiben deine Arbeit.": "The coach provides prerequisites, invariants, tests, and reflection questions. Code and concrete deliverables remain your work.",
    "Kannst du es ohne Vorlage erklären?": "Can you explain it without looking at a reference?",
    "Beantworte erst aus dem Gedächtnis. Feedback erklärt den Grund, nicht nur richtig oder falsch.": "Answer from memory first. The feedback explains why, not merely whether you were right or wrong.",
    "12 Kernfragen": "12 core questions",
    "Stattdessen Karteikarten": "Use flashcards instead",
    "Antworten prüfen": "Check answers",
    "Ich weiß es nicht": "I don't know",
    "Richtig. ": "Correct. ",
    "Noch nicht. ": "Not yet. ",
    "richtig.": "correct.",
    "Erkläre jetzt drei Antworten laut ohne auf die Optionen zu schauen.": "Now explain three answers aloud without looking at the options.",
    "Öffne die betroffenen Konzepte und beantworte die Frage nach dem Nacharbeiten erneut.": "Open the relevant concepts, review them, and then answer the question again.",
    "Öffne die betroffenen Concepts und beantworte die Frage nach dem Nacharbeiten erneut.": "Open the relevant concepts, review them, and then answer the question again.",
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
    "Bevor du einsteigst": "Before you begin",
    "Orientierung": "Orientation",
    "Worum geht es?": "What is this about?",
    "Wo ordnet sich das ein?": "Where does this fit?",
    "Begriffe vor dem ersten Schritt": "Terms before the first step",
    "Mentales Modell": "Mental model",
    "Schritt für Schritt": "Step by step",
    "Typische Fehlannahmen": "Common misconceptions",
    "Aktiver Selbstcheck": "Active self-check",
    "Antworte zuerst selbst. Öffne danach die Musterlösung und vergleiche Begründung und Begriffe.": "Answer on your own first. Then open the model answer and compare the reasoning and terminology.",
    "Verknüpfte Formeln": "Linked formulas",
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
    "Original-Handout-Scope": "Original handout scope",
    "Vor dem Coding herleiten": "Derive before coding",
    "Diagnostisches Fehlersignal": "Diagnostic failure signal",
    "Gezielt vorbereiten": "Prepare deliberately",
    "Mentale Modelle": "Mental models",
    "Arbeitsreihenfolge auf hoher Ebene": "High-level workflow",
    "Versuche jede Frage zuerst selbst. Die aufklappbaren Konzeptantworten helfen beim Lernen, enthalten aber keinen Assignment-Code.": "Try each question yourself first. The expandable conceptual answers help you learn but contain no assignment code.",
    "Konzeptantwort anzeigen": "Show conceptual answer",
    "Aktuelle Mission": "Current mission",
    "Erste diagnostische Spur:": "First diagnostic lead:",
    "Was erwartest du, was beobachtest du, und welche Invariante könnte verletzt sein?": "What do you expect, what do you observe, and which invariant might be violated?",
    "Mindestens 20 Zeichen. Beispielstruktur: Ich erwarte …, beobachte …, mein kleinster trennender Test ist …": "At least 20 characters. Example structure: I expect …, observe …, and my smallest discriminating test is …",
    "Hinweis": "Hint",
    "Definition of Done": "Definition of Done",
    "Voraussetzungen": "Prerequisites",
    "Verknüpfte Konzepte": "Linked concepts",
    "Originalquellen": "Original sources",
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
    "Standardabweichungs-Konvention": "Standard-deviation convention",
    "Transfer-Kurzcheck · A5-Konvention": "Transfer quick check · A5 convention",
    "Fester Fall: Rewards [1,0,0,1], Sample Standard Deviation mit G−1 und Sequenzmittel. Leite zuerst ohne Regler her.": "Fixed case: rewards [1,0,0,1], sample standard deviation with G−1, and sequence mean. Derive it without the controls first.",
    "Gruppenmittel μ": "Group mean μ",
    "Sample-Standardabweichung σ": "Sample standard deviation σ",
    "Advantage der ersten Antwort": "Advantage of the first response",
    "Gesamtgewicht der ersten Sequenz nach ihrem Tokenmittel": "Total weight of the first sequence after its token mean",
    "Beantworte alle vier GRPO-Kurzcheck-Felder.": "Answer all four GRPO quick-check fields.",
    "Zentriere zuerst um μ=0.5. Für Sample-Std teilst du die Summe der vier quadrierten Abweichungen durch G−1=3. Beim Sequenzmittel wird der Advantage auf die Tokens verteilt, aber über die ganze Antwort wieder zu A_i aufsummiert.": "Center around μ=0.5 first. For sample standard deviation, divide the sum of the four squared deviations by G−1=3. The sequence mean distributes the Advantage across tokens, but summing over the full response returns A_i.",
    "μ=0.5, σ_sample=√(1/3)≈0.577 und A₁=(1−0.5)/0.577≈0.866. Das Sequenzmittel gibt jedem Token A₁/n₁; über n₁ Tokens bleibt das Gesamtgewicht A₁≈0.866.": "μ=0.5, σ_sample=√(1/3)≈0.577, and A₁=(1−0.5)/0.577≈0.866. The sequence mean gives every token A₁/n₁; across n₁ tokens, total weight remains A₁≈0.866.",
    "A5-Implementierung: Sample Std (G−1)": "A5 implementation: sample standard deviation (G−1)",
    "Vorlesungsformel: Population Std (G)": "Lecture equation: population standard deviation (G)",
    "A5 verlangt für die Implementierung PyTorchs standardmäßiges torch.std und damit die Sample Standard Deviation mit Nenner G−1. Die mathematische Herleitung im Handout zeigt daneben die Populationsform mit G. Dieses Lab macht den Unterschied sichtbar und isoliert anschließend das Reweighting; Importance Ratios, Clipping, KL und Microbatching kommen im vollständigen Training zusätzlich hinzu.": "For the implementation, A5 requires PyTorch's default torch.std and therefore the sample standard deviation with denominator G−1. The mathematical derivation in the handout also shows the population form with G. This lab makes the difference visible and then isolates reweighting; importance ratios, clipping, KL, and microbatching are additional parts of complete training.",
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
    "Für jedes Token mischt W_Q alle D Inputfeatures zu H·d_head Query-Features: Q_o=Σ_i X_i·W_Q,i,o. W_K und W_V rechnen genauso, besitzen aber eigene gelernte Gewichte. Dadurch kann derselbe Tokenzustand gleichzeitig ausdrücken, was er sucht (Q), was er zum Abgleich anbietet (K) und welchen Inhalt er beitragen kann (V). Die Rollen entstehen durch Backpropagation aus dem Loss; sie sind nicht von Menschen beschriftet. Technisch werden die drei Matrizen oft zu einem schnellen QKV Linear Layer fusioniert.": "For every token, W_Q mixes all D input features into H·d_head Query features: Q_o=Σ_i X_i·W_Q,i,o. W_K and W_V perform the same kind of calculation but use their own learned weights. The same token state can therefore express what it seeks (Q), what it offers for matching (K), and which content it can contribute (V). These roles emerge from the Loss through Backpropagation; humans do not label them feature by feature. Implementations often fuse the three matrices into one fast QKV Linear Layer.",
    "Attention Heads": "Attention Heads",
    "Merkmale pro Head": "features per Head",
    "QKᵀ erzeugt rohe Compatibility Scores": "QKᵀ produces raw compatibility scores",
    "Für jeden Head vergleicht jede Queryposition i ihren Query-Vektor mit dem Key-Vektor jeder Position j. Der Dot Product summiert d_head Featureprodukte; ohne Skalierung würde seine typische Varianz mit breiteren Heads wachsen und Softmax früh sättigen. Die Division durch √d_head hält diese Score-Skala kontrollierbarer. Erst Maske und Softmax machen daraus Gewichte.": "For every Head, each Query position i compares its Query vector with the Key vector at every position j. The Dot Product sums d_head feature products; without scaling, its typical variance would grow with wider Heads and make Softmax saturate early. Dividing by √d_head keeps this Score scale more controlled. Only the Mask and Softmax turn these Scores into weights.",
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
    "A bildet pro Query eine gewichtete Summe der Value-Vektoren. In diesem Lab gilt d_v=d_head, daher liegt Z als [B,H,T,d_head] vor. Transpose und Concat ordnen diese Zahlen nur zu [B,T,H·d_head] um; dabei wird nichts gelernt. Erst W_O ist wieder ein Linear Layer: Er lernt, welche Features aus welchen Heads gemeinsam eine nützliche Korrektur für den D-dimensionalen Residual Stream ergeben.": "For each Query, A forms a weighted sum of the Value vectors. In this lab d_v=d_head, so Z has Shape [B,H,T,d_head]. Transpose and Concat only rearrange these numbers into [B,T,H·d_head]; nothing is learned in that step. W_O is the next Linear Layer: it learns which features from which Heads jointly form a useful correction for the D-dimensional Residual Stream.",
    "Warum durch √d_head teilen?": "Why divide by √d_head?",
    "Ein QK-Dot-Product summiert d_head Featureprodukte. Ohne Skalierung wächst seine typische Varianz mit der Headbreite; Softmax würde dadurch leichter extrem scharf und seine Gradienten klein. Die Division hält die Score-Skala zwischen verschiedenen Headbreiten vergleichbarer.": "A QK Dot Product sums d_head feature products. Without scaling, its typical variance grows with Head width; Softmax would become extremely sharp more easily and its gradients small. The division keeps the Score scale more comparable across different Head widths.",
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
    "Merksatz: Aktivierungen tragen B und T, gelernte Linear-Layer-Matrizen nur Input- und Outputfeatures. Deshalb verändert längerer Kontext, wie oft dieselben Gewichte angewandt werden und wie viele Aktivierungen entstehen – aber weder die Matrix-Shape noch die Parameterzahl.": "Remember: activations carry B and T, while learned Linear-Layer matrices carry only input and output features. A longer context therefore changes how often the same weights are applied and how many activations are created—but neither the matrix Shape nor the parameter count.",
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
    "Zwei getrennte Step-Begriffe": "Two separate meanings of Step",
    "Der Regler t wählt die Learning Rate aus dem Schedule. Die Momentrechnung darunter isoliert unabhängig davon den ersten Adam-Update mit m₀=v₀=0; sie simuliert keine bis t fortgeschriebene Optimizerhistorie.": "Control t selects the Learning Rate from the Schedule. Independently, the moment calculation below isolates the first Adam update with m₀=v₀=0; it does not simulate Optimizer history advanced through t.",
    "Erster Adam-Moment": "First Adam moment",
    "Zweiter Adam-Moment": "Second Adam moment",
    "Separater AdamW-Decay": "Separate AdamW decay",
    "Adaptiver Gradientenschritt": "Adaptive gradient step",
    "Neuer Parameter": "New parameter",
    "Warum die Hüte?": "Why the hats?",
    "m und v starten bei null und wären am Anfang systematisch zu klein. Die Bias Correction teilt durch 1−β₁ᵗ beziehungsweise 1−β₂ᵗ. Im ersten Step werden dadurch m̂₁=g und v̂₁=g²; spätere Steps enthalten die geglättete Gradientenhistorie.": "m and v start at zero and would initially be systematically too small. Bias Correction divides by 1−β₁ᵗ and 1−β₂ᵗ, respectively. In the first Step this gives m̂₁=g and v̂₁=g²; later Steps contain the smoothed gradient history.",
    "Der Optimizer besitzt damit pro Parameter zwei zusätzliche Zustände. Backpropagation berechnet nur g; AdamW speichert m und v über Steps und verändert erst anschließend θ.": "The Optimizer therefore owns two additional states per parameter. Backpropagation computes only g; AdamW stores m and v across Steps and only then changes θ.",
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
    "normierter Slice mit B=H=1:": "normalized slice with B=H=1:",
    "Attention-Scoreelemente": "Attention score elements",
    "Trainings-Compute": "Training compute",
    "Idealisierte Laufzeit bei angenommenem P_eff": "Idealized runtime at assumed P_eff",
    "Was bedeuten die angenommenen 400 TFLOP/s?": "What do the assumed 400 TFLOP/s mean?",
    "P_eff ist hier ein didaktisch angenommener dauerhaft erreichter effektiver Durchsatz, nicht der garantierte Hardware-Peak. Die Laufzeit skaliert invers: Verdoppelt sich der tatsächlich gehaltene Durchsatz bei gleicher Arbeit C, halbiert sich diese Idealzeit.": "P_eff is a didactically assumed sustained effective throughput, not a guaranteed Hardware Peak. Runtime scales inversely: if the actually sustained throughput doubles for the same work C, this idealized time is halved.",
    "Warum reagieren die Regler unterschiedlich?": "Why do the controls behave differently?",
    "Woher kommt der Faktor 12?": "Where does factor 12 come from?",
    "Ein klassischer dichter Block besitzt ungefähr 4D² Attention-Parameter aus Q, K, V und Output sowie 8D² aus dem MLP D→4D→D. Zusammen ergibt das 12D² pro Layer. GQA, SwiGLU-Breite, Biases und Mixture of Experts verändern diesen Faktor.": "A standard dense Block contains about 4D² Attention parameters from Q, K, V, and Output plus 8D² from the D→4D→D MLP. Together this gives 12D² per Layer. GQA, SwiGLU width, Biases, and Mixture of Experts change that factor.",
    "Was bedeutet 16 Byte pro Parameter?": "What do 16 bytes per parameter mean?",
    "Hier werden pro Parameter 2 Byte BF16 Weight, 2 Byte BF16 Gradient, 4 Byte FP32 Master Weight und 8 Byte für zwei FP32 Adam-Momente gezählt. Aktivierungen, temporäre Buffer und Kommunikation sind zusätzlich.": "This counts 2 bytes for a BF16 Weight, 2 bytes for a BF16 gradient, 4 bytes for an FP32 master Weight, and 8 bytes for two FP32 Adam moments per parameter. Activations, temporary buffers, and communication are additional.",
    "Warum B=H=1 bei den Scores?": "Why B=H=1 for the Scores?",
    "Die Anzeige isoliert einen normierten Slice, damit nur L und T variiert werden. Für echte vollständig materialisierte Scores muss das Ergebnis mit der tatsächlichen Batchgröße B und Headzahl H multipliziert werden.": "The display isolates a normalized slice so only L and T vary. For actual fully materialized Scores, multiply the result by the real Batch size B and number of Heads H.",
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
    "Was bewegt die Kommunikation?": "What does the communication move?",
    "All-Reduce kombiniert die gleich positionierten lokalen Gradienten aller Ranks und gibt jedem Rank denselben vollständigen reduzierten Gradient zurück. Deshalb führen anschließend alle replizierten Modelle dasselbe Update aus.": "All-Reduce combines corresponding local gradients from all Ranks and returns the same complete reduced gradient to every Rank. All replicated models therefore perform the same update afterward.",
    "Reduce-Scatter kombiniert die lokalen Gradienten, lässt aber auf jedem Rank nur einen anderen 1/W-Shard zurück. Nach dem lokalen Optimizer-Update besitzt jeder Rank nur aktualisierte Parameter-Shards; All-Gather setzt diese wieder zur vollständigen replizierten Parameterkopie auf jedem Rank zusammen.": "Reduce-Scatter combines local gradients but leaves a different 1/W shard on every Rank. After the local Optimizer update, each Rank holds only updated Parameter shards; All-Gather reconstructs the complete replicated Parameter copy on every Rank.",
    "Vor einem geshardeten Layer rekonstruiert All-Gather dessen vollständige Parameter nur für die Berechnung. Im Backward kombiniert Reduce-Scatter die Gradienten und verteilt wieder unterschiedliche Shards, die der lokale Optimizer aktualisiert.": "Before a sharded Layer, All-Gather reconstructs its complete Parameters only for computation. During Backward, Reduce-Scatter combines the gradients and redistributes distinct shards that each local Optimizer updates.",
    "Tensor Parallelism teilt eine Layeroperation entlang einer Matrixachse. Je nach Sharding müssen partielle Summen per All-Reduce kombiniert oder Output-Shards per All-Gather zusammengesetzt werden – daher entsteht Kommunikation innerhalb vieler Layer.": "Tensor Parallelism splits a Layer operation along a matrix axis. Depending on the sharding, partial sums must be combined with All-Reduce or Output shards reconstructed with All-Gather, so communication occurs inside many Layers.",
    "Pipeline Parallelism verschiebt Aktivierungen im Forward und deren Gradienten im Backward zwischen benachbarten Stages. Jeder Rank besitzt andere Layer; Microbatches halten mehrere Stages gleichzeitig beschäftigt.": "Pipeline Parallelism sends activations during Forward and their gradients during Backward between adjacent Stages. Every Rank owns different Layers; Microbatches keep several Stages busy at once.",
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
    "Lower Envelope auswählen": "Select the lower envelope",
    "Noch nicht gewählt": "Not selected yet",
    "C=64: Lage des beobachteten Minimums": "C=64: location of the observed minimum",
    "Eingeklammertes inneres Minimum": "Bracketed interior minimum",
    "Randminimum · Suchbereich erweitern": "Boundary minimum · expand the search range",
    "Envelope prüfen und fitten": "Check envelope and fit",
    "Die Daten sind synthetisch und absichtlich handrechenbar. Sie sind keine Assignment-Messwerte und keine Prognose für reale Modelle.": "The data are synthetic and deliberately hand-computable. They are neither assignment measurements nor a forecast for real models.",
    "Interaktiver Scaling-Law-Fit": "Interactive Scaling-Law fit",
    "Synthetische Run-Matrix": "Synthetic run matrix",
    "Vergleiche Loss nur innerhalb desselben C-Tiers. Ein Run ist vollständig; niedrigere Werte sind besser.": "Compare loss only within the same C tier. Every run is complete; lower values are better.",
    "Achtung: getesteter N-Bereich endet rechts": "Warning: the tested N range ends on the right",
    "Gültiger Lower Envelope": "Valid lower envelope",
    "jeweils innen eingeklammert": "each bracketed in the interior",
    "Randminimum, daher nicht fitten": "boundary minimum, therefore exclude from fit",
    "Log-Log-Fit": "Log-Log fit",
    "Fitpunkte": "Fit points",
    "Steigung": "Slope",
    "Achsenabschnitt": "Intercept",
    "Zurücktransformiert": "Back-transformed",
    "Leave-one-tier-out statt In-Sample-Selbstbestätigung": "Leave-one-tier-out instead of in-sample self-confirmation",
    "Fit ohne C=16": "Fit without C=16",
    "Vorhersage für ausgelassenes Tier": "Prediction for the held-out tier",
    "Beobachtetes inneres Minimum": "Observed interior minimum",
    "logarithmischer Vorhersagefehler": "log prediction error",
    "Nächste Messentscheidung": "Next measurement decision",
    "Der Fit sagt für C=64 ungefähr": "For C=64, the fit predicts about",
    "voraus, während der beste beobachtete Run am rechten Rand bei 70M liegt. Das ist ein Auftrag, größere N um etwa 80M zu messen – kein Beweis, dass 80M bereits das Optimum ist.": "while the best observed run is at the right boundary at 70M. This is a request to measure larger N around 80M—not proof that 80M is already optimal.",
    "Wähle für jedes Tier ein Minimum und klassifiziere den Randpunkt.": "Select a minimum for every tier and classify the boundary point.",
    "Noch nicht: Wähle pro Tier zuerst nur den kleinsten Loss. Prüfe danach, ob sowohl links als auch rechts dieses N ein höherer Loss gemessen wurde.": "Not yet: first select only the smallest loss in each tier. Then check whether a higher loss was measured both to the left and right of that N.",
    "Transfer-Kurzcheck bestanden": "Transfer quick check passed",
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
    "Dedup-Pipeline": "Dedup pipeline",
    "← Vorheriger Schritt": "← Previous step",
    "Nächster Schritt →": "Next step →",
    "Öffne nie die nächste Stufe, bevor du ihren Output vorhergesagt hast.": "Never open the next stage before predicting its output.",
    "· Öffne nie die nächste Stufe, bevor du ihren Output vorhergesagt hast.": "· Never open the next stage before predicting its output.",
    "Verification-Threshold τ": "Verification threshold τ",
    "Transfer-Kurzcheck für τ=0.5": "Transfer quick check for τ=0.5",
    "Welche Paare erreichen die exakte Verification?": "Which pairs reach exact verification?",
    "Welche Kanten überleben J > 0.5?": "Which edges survive J > 0.5?",
    "keine": "none",
    "Welche Components entstehen?": "Which components result?",
    "Interaktive Near-Dedup-Pipeline": "Interactive near-dedup pipeline",
    "Normalisieren": "Normalize",
    "Word-Bigrams bilden": "Build word bigrams",
    "Exakte Jaccard-Matrix": "Exact Jaccard matrix",
    "MinHash-Signaturen": "MinHash signatures",
    "LSH-Kandidaten": "LSH candidates",
    "Exakt verifizieren": "Verify exactly",
    "Vertrag: lowercase → Unicode NFD → Akzentmarken entfernen → Satzzeichen zu Spaces → Whitespace kollabieren.": "Contract: lowercase → Unicode NFD → remove accent marks → punctuation to spaces → collapse whitespace.",
    "Normalisierung erhöht Recall, kann aber auch Bedeutungsunterschiede zusammenziehen. Sie muss deshalb versioniert und vor Hashing identisch angewandt werden.": "Normalization increases recall but can also collapse meaningful differences. It must therefore be versioned and applied identically before hashing.",
    "Jedes Symbol steht für zwei direkt benachbarte normalisierte Wörter.": "Each symbol represents two directly adjacent normalized words.",
    "Shingle-Legende": "Shingle legend",
    "Sechs feste Toy-Hashordnungen wählen je Dokument das erste vorkommende Shingle. Gleiche Signaturpositionen schätzen Jaccard; sechs Positionen sind bewusst verrauscht.": "Six fixed toy hash orderings select the first occurring shingle for each document. Matching signature positions estimate Jaccard; six positions are deliberately noisy.",
    "Sechs Toy-Hashordnungen anzeigen": "Show six toy hash orderings",
    "Das ist eine transparente Miniatur, kein Production Hashing. Die Signatur darf Paare überschätzen; genau deshalb folgt später die exakte Verification.": "This is a transparent miniature, not production hashing. The signature may overestimate pairs; that is exactly why exact verification follows.",
    "Teile sechs Signaturzeilen in drei Bands mit je zwei Rows. Ein identisches Band reicht für Retrieval.": "Split six signature rows into three bands of two rows. One identical band is enough for retrieval.",
    "Kandidatenmenge": "Candidate set",
    "A–B kollidiert in Band 1, B–C in Band 2 und A–D in Band 3. Noch wurde kein Paar als Duplicate akzeptiert.": "A–B collides in band 1, B–C in band 2, and A–D in band 3. No pair has yet been accepted as a duplicate.",
    "Nur LSH-Kandidaten erreichen diese teurere Stufe. Die Entscheidung verwendet jetzt echtes Jaccard mit strikt J>τ.": "Only LSH candidates reach this more expensive stage. The decision now uses exact Jaccard with strict J>τ.",
    "Kante": "edge",
    "verwerfen": "reject",
    "Akzeptierte Kanten bei τ=": "Accepted edges at τ=",
    "Eine Component verbindet alle über akzeptierte Kanten erreichbaren Dokumente. Das ist Transitivität, nicht zusätzliche paarweise Ähnlichkeit.": "A component joins all documents reachable through accepted edges. This is transitivity, not additional pairwise similarity.",
    "Component": "Component",
    "Warum ist das wichtig?": "Why does this matter?",
    "A und C liegen über den Pfad A–B–C zusammen, obwohl A–C selbst kein verifiziertes Edge ist. D bleibt separat, weil die A–D-LSH-Kollision die exakte Schwelle verfehlt.": "A and C are joined through the path A–B–C even though A–C itself is not a verified edge. D remains separate because the A–D LSH collision fails the exact threshold.",
    "Ändere τ auf 0.5, um Retrieval-False-Positive und transitive Clusterbildung gleichzeitig zu sehen.": "Set τ to 0.5 to see a retrieval false positive and transitive clustering at the same time.",
    "Beantworte alle drei Dedup-Kurzchecks.": "Answer all three dedup quick checks.",
    "Trenne die drei Mengen: LSH-Kandidaten, nach J>0.5 akzeptierte Kanten und daraus gebildete transitive Components.": "Separate the three sets: LSH candidates, edges accepted by J>0.5, and the transitive components formed from them.",
    "Retrieval: A–B, B–C, A–D. Verification: A–B und B–C. Components: {A,B,C} und {D}.": "Retrieval: A–B, B–C, A–D. Verification: A–B and B–C. Components: {A,B,C} and {D}.",
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
    "Konvention": "Convention",
    "A5 / torch.std default: Sample Standard Deviation mit G−1": "A5 / torch.std default: sample standard deviation with G−1",
    "Herleitungsform: Population Standard Deviation mit G": "Derivation form: population standard deviation with G",
    "Advantage je Antwort": "Advantage per response",
    "Gruppenmittel μ": "Group mean μ",
    "Gruppen-Std σ": "Group standard deviation σ",
    "Antwort": "Response",
    "Alle Rewards sind gleich: Nach Zentrierung gibt es kein relatives Lernsignal.": "All rewards are equal: after centering, there is no relative learning signal.",
    "Positive Advantages erhöhen im idealisierten Gradient-Ascent die Logwahrscheinlichkeit; negative senken sie.": "In idealized gradient ascent, positive Advantages increase log-probability and negative Advantages decrease it.",
    "Durch σ teilen macht die Skala gruppenabhängig.": "Dividing by σ makes the scale group-dependent.",
    "Ohne σ bleibt die Rewardskala erhalten.": "Without σ, the reward scale is preserved.",
    "Antworten einer Promptgruppe": "Responses in one prompt group",
    "Loss-Aggregation": "Loss aggregation",
    "Sequenzmittel · jede Antwort gleiches Gesamtgewicht": "Sequence mean · every response has equal total weight",
    "Globales Tokenmittel · lange Antworten mehr Gesamtgewicht": "Global token mean · long responses have greater total weight",
    "Fixer Nenner 16 · Länge bleibt im Gesamtgewicht": "Fixed denominator 16 · length remains in the total weight",
    "Dieses Lab isoliert Reweighting. Importance Ratios, Clipping, KL und Microbatching kommen im vollständigen Training zusätzlich hinzu.": "This lab isolates reweighting. Importance ratios, clipping, KL, and microbatching are additional parts of complete training.",
    "Jede Sequenz mittelt über ihre eigenen n_i Token: Das Gesamtgewicht bleibt A_i, einzelne Token langer Antworten erhalten kleinere Koeffizienten.": "Each sequence averages over its own n_i tokens: total weight remains A_i, while individual tokens in long responses receive smaller coefficients.",
    "Alle Antworttoken teilen denselben globalen Nenner. Bei gleichem Advantage erhält eine längere Antwort dadurch mehr Gesamtgewicht.": "All response tokens share the same global denominator. At equal Advantage, a longer response therefore receives greater total weight.",
    "Der feste Nenner ist unabhängig von der beobachteten Antwortlänge. Das Gesamtgewicht wächst deshalb mit n_i und kann Längeneffekte sichtbar machen.": "The fixed denominator is independent of observed response length. Total weight therefore grows with n_i and can expose length effects.",
    "Vom Reward zum Tokengewicht": "From reward to token weight",
    "Gewählter Loss-Nenner": "Selected loss denominator",
    "n_i pro Sequenz": "n_i per sequence",
    "Gewicht je Antwort": "Weight per response",
    "gesamt": "total",
    "Was ändert die Aggregation?": "What does aggregation change?",
    "Die Zeilen zeigen relative Koeffizienten eines vereinfachten On-Policy-Loss. Maskierte Prompt- und Paddingtoken erhalten Gewicht null; Ratios, Clipping und weitere Regularisierung sind absichtlich nicht eingerechnet.": "The rows show relative coefficients of a simplified on-policy loss. Masked prompt and padding tokens receive zero weight; ratios, clipping, and further regularization are intentionally omitted.",
    "Der schnelle, tiefe Weg": "The fast, deep path",
    "Diagnose → verstehen → vorhersagen → anwenden → aktiv abrufen": "Diagnose → understand → predict → apply → retrieve actively",
    "Nutze die Diagnose nur zum Überspringen belegbar vorhandener Prerequisites.": "Use the diagnostic only to skip prerequisites you can demonstrably satisfy.",
    "Erkläre ein Concept ohne Vorlage und öffne erst danach die Musterlösung.": "Explain a concept without looking at a reference, then open the model answer.",
    "Im Lab: Vorhersage vor Regler; Formel und Ursache nach Beobachtung.": "In a lab: predict before using a control; explain the formula and cause after observing.",
    "Prerequisite-Blocker zuerst": "Prerequisite blockers first",
    "Prerequisite Sprint kann verkürzt werden": "You can shorten the prerequisite sprint",
    "Der nächste Fokus führt dich gezielt zum schwächsten Foundation-Vertrag. Danach gehst du in kausaler Kursreihenfolge weiter.": "Your next focus targets the weakest foundation contract. After that, continue in the course's causal order.",
    "Die Foundation-Fragen waren korrekt. Starte direkt im Kurs und nutze die Foundation-Seiten nur, wenn ein Selbstcheck oder Assignment-Fehler eine Lücke zeigt.": "Your foundation answers were correct. Start directly with the course and return to foundation pages only when a self-check or assignment error reveals a gap.",
    "Die Reihenfolge ist absichtlich kausal: Formen und Wahrscheinlichkeiten tragen den Transformer; dieser trägt Training, Systems, Daten, Evaluation, Inference und Reinforcement Learning.": "The order is intentionally causal: shapes and probability support the Transformer; the Transformer supports training, systems, data, evaluation, inference, and Reinforcement Learning.",
    "Ground-Truth-Vertrag:": "Ground-truth contract:",
    "Jede Concept-Seite nennt ihre Lecture-/Assignment-Quelle. Im Lernpfad findest du pro Modul die Original-PDFs; in den Assignment Missions zusätzlich die echten Problem-IDs. Die PDFs bleiben maßgeblich für administrative Regeln, exakte Interfaces und Abgabeanforderungen.": "Every concept page cites its lecture or assignment source. The learning path links each module's original PDFs, and assignment missions also list the real problem IDs. The PDFs remain authoritative for administrative rules, exact interfaces, and submission requirements.",
    "Nutze diese Map, wenn du eine bestimmte Lecture nacharbeiten oder eine Aussage zur Originalquelle zurückverfolgen willst. Der eigentliche Lernpfad bleibt nach Voraussetzungen geordnet, nicht bloß nach Lecture-Nummer.": "Use this map when you want to revisit a particular lecture or trace a claim back to its original source. The main learning path remains ordered by prerequisites, not merely by lecture number.",
    "Original-PDF": "Original PDF",
    "Concept-Abdeckung": "Concept coverage",
    "Keine direkte Concept-Zuordnung.": "No direct concept mapping.",
    "Formeln mit dieser Quelle": "Formulas citing this source",
    "Passende Experimente": "Relevant experiments",
    "Assignment-Bezug": "Assignment connection",
    "Belegbarer Abschluss": "Evidence-based completion",
    "Übertrage das Modulziel auf einen neuen Fall: Was würdest du vorhersagen, prüfen und mit welcher Invariante begründen?": "Transfer the module outcome to a new case: what would you predict, test, and justify with which invariant?",
    "Die Concepts und Labs stehen in ihrer Lernreihenfolge direkt im Lernpfad. Nutze die Originalquellen für Abbildungen, genaue Assignment-Spezifikationen und gezielte Nachprüfung – nicht als Pflichtdopplung jeder Erklärung.": "Concepts and labs appear in learning order directly in the learning path. Use the original sources for figures, exact assignment specifications, and targeted verification—not as mandatory duplication of every explanation.",
    "Ground-Truth-Quellen": "Ground-truth sources",
    "Text inklusive Whitespace und Unicode": "Text including whitespace and Unicode",
    "Startrepräsentation": "Initial representation",
    "UTF-8 bytes · assignmentnah": "UTF-8 bytes · assignment-aligned",
    "Unicode-Zeichen · intuitiv": "Unicode characters · intuitive",
    "<|endoftext|> als unteilbares Special Token schützen": "Protect <|endoftext|> as an indivisible special token",
    "Die Pretokens folgen dem in A1 vorgegebenen GPT-2-artigen Regex und behalten führenden Whitespace dort, wo das Pattern ihn bindet. Gezählt werden alle benachbarten Paarpositionen; bei gleicher Häufigkeit gewinnt das lexikographisch größere Paar. Die Ersetzung läuft links nach rechts ohne Überlappung und nie über Pretoken- oder Special-Token-Grenzen.": "Pretokens follow the GPT-2-style regular expression prescribed by A1 and retain leading whitespace wherever the pattern binds it. Every adjacent pair position is counted; at equal frequency, the lexicographically greater pair wins. Replacement proceeds left to right without overlap and never crosses pretoken or special-token boundaries.",
    "Startvokabular: echte UTF-8-Bytes. Mehrbyte-Zeichen wie é beginnen deshalb als mehrere Byte-Symbole.": "Initial vocabulary: actual UTF-8 bytes. Multi-byte characters such as é therefore begin as several byte symbols.",
    "Startvokabular: Unicode-Zeichen. Dieser Modus zeigt die Merge-Idee, ist aber nicht die Byte-Level-Basis aus A1.": "Initial vocabulary: Unicode characters. This mode illustrates the merge idea, but it is not the byte-level foundation used in A1.",
    "Roundtrip-Invariante": "Round-trip invariant",
    "Originaltext": "original text",
    "Pretokens / aktuelle Tokens": "Pretokens / current tokens",
    "Tie-Break": "Tie-break",
    "Bei gleichem count gewinnt wie in A1 das lexikographisch größere Paar.": "At equal count, the lexicographically greater pair wins, as specified in A1.",
    "Operation und Muster": "Operation and pattern",
    "A1-Kernoperation": "A1 core operation",
    "Führende Achsen im Ellipsis-Teil": "Leading axes inside the ellipsis",
    "keine · ein einzelnes Beispiel": "none · a single example",
    "Batch B=2 und Heads H=3": "Batch B=2 and Heads H=3",
    "Gewähltes Muster": "Selected pattern",
    "Sage vor jedem Wechsel voraus, welche Achse kontrahiert wird und welche Shape herauskommt. Erst danach die Auflösung lesen. Die führenden Achsen ändern das Muster nie – genau das ist der Zweck der drei Punkte.": "Before every change, predict which axis gets contracted and which shape comes out. Only then read the resolution. The leading axes never change the pattern — that is exactly what the three dots are for.",
    "Feste Fälle ohne Regler. Leite zuerst selbst her.": "Fixed cases without sliders. Derive them yourself first.",
    "1. Für x [2,3,4] und W [5,4] mit dem Muster „... d_in, d_out d_in -> ... d_out“: Welche Achse wird kontrahiert?": "1. For x [2,3,4] and W [5,4] with the pattern \"... d_in, d_out d_in -> ... d_out\": which axis is contracted?",
    "2. Für Q und K je [B,3,4] mit dem Muster „... query d_k, ... key d_k -> ... query key“: Welche Shape entsteht?": "2. For Q and K both [B,3,4] with the pattern \"... query d_k, ... key d_k -> ... query key\": which shape results?",
    "3. Was passiert beim Muster „... query key, ... key d_v -> ... query key“?": "3. What happens with the pattern \"... query key, ... key d_v -> ... query key\"?",
    "keine · beide bleiben erhalten": "none · both are preserved",
    "d_v wird aufsummiert; die Values gehen als Featurevektor verloren": "d_v is summed away; the Values are lost as a feature vector",
    "Das Muster ist ungültig und wirft einen Fehler": "The pattern is invalid and raises an error",
    "Identisch zum korrekten Muster, nur andere Achsenreihenfolge": "Identical to the correct pattern, only with a different axis order",
    "Interaktiver Einsum-Muster-Auflöser": "Interactive einsum pattern resolver",
    "Beantworte alle drei Kurzcheck-Felder.": "Answer all three quick-check fields.",
    "Linear Layer · y = x Wᵀ": "Linear Layer · y = x Wᵀ",
    "Attention-Scores · Q Kᵀ": "Attention scores · Q Kᵀ",
    "Value-Mischung · A V": "Value mixing · A V",
    "Mische die d_in Features jedes Tokens zu d_out neuen Features. Tokenpositionen werden dabei nicht gemischt.": "Mix the d_in features of every token into d_out new features. Token positions are not mixed in the process.",
    "Vergleiche jede Queryposition mit jeder Keyposition und summiere dabei über die Featureachse d_k.": "Compare every Query position with every Key position, summing over the feature axis d_k.",
    "Mische die Value-Vektoren mit den Attention-Gewichten und summiere dabei über die Keyachse.": "Mix the Value vectors using the Attention weights, summing over the Key axis.",
    "Genau das verlangt A1. d_in steht in beiden Inputs und fehlt rechts, wird also kontrahiert; d_out bleibt als neue Featureachse stehen, und die drei Punkte reichen alle führenden Achsen unverändert durch.": "This is exactly what A1 requires. d_in appears in both inputs and is missing on the right, so it is contracted; d_out remains as the new feature axis, and the three dots pass every leading axis through unchanged.",
    "Hier wird d_out aufsummiert statt d_in. Das Ergebnis ist eine gewichtete Summe über die Ausgabefeatures und behält die Eingangsbreite. Hier fällt es an der Shape auf, weil d_in=4 und d_out=6 verschieden sind – in einer quadratischen Schicht mit d_in=d_out wäre die Shape gültig und der Fehler unsichtbar.": "Here d_out is summed away instead of d_in. The result is a weighted sum over the output features and keeps the input width. The shape exposes it here because d_in=4 and d_out=6 differ — in a square layer with d_in=d_out the shape would be valid and the mistake invisible.",
    "Das ist der klassische vergessene Transpose: Die Featureachse von x wird als d_out gelesen. Weil derselbe Name zwei verschiedene Längen binden müsste, bricht einsum sofort ab – genau wie x @ W ohne Transpose. Diese Fehlerklasse fängt schon die Namensbindung ab.": "This is the classic forgotten transpose: the feature axis of x is read as d_out. Because the same name would have to bind two different lengths, einsum aborts immediately — exactly like x @ W without the transpose. This class of mistake is already caught by name binding.",
    "d_k steht in beiden Inputs und fehlt rechts, wird also kontrahiert. Query- und Key-Achse bleiben als die beiden äußeren Achsen erhalten; der nachfolgende Softmax normalisiert über die letzte Achse, also über die Keys.": "d_k appears in both inputs and is missing on the right, so it is contracted. The Query and Key axes remain as the two outer axes; the following Softmax normalizes over the last axis, that is over the Keys.",
    "Die Shape ist identisch zur korrekten, weil Query- und Key-Achse dieselbe Länge haben. Inhaltlich entsteht aber die transponierte Scorematrix: Der Softmax über die letzte Achse normalisiert danach über die Queries, und eine kausale Maske trifft das falsche Dreieck. Aufdecken lässt sich das nur mit T_query ≠ T_key oder einem Referenzvergleich.": "The shape is identical to the correct one, because the Query and Key axes have the same length. What you actually get is the transposed score matrix: a Softmax over the last axis then normalizes over the Queries, and a causal mask hits the wrong triangle. Only T_query ≠ T_key or a reference comparison can expose it.",
    "Weil key rechts fehlt, wird zusätzlich über alle Keys summiert. Statt einer Scorematrix entsteht ein Vektor mit einem Wert pro Query. Diese Verwechslung verrät sich hier an der Shape – aber erst, wenn du sie liest.": "Because key is missing on the right, everything is additionally summed over all Keys. Instead of a score matrix you get a vector with one value per Query. This confusion does reveal itself in the shape here — but only if you read it.",
    "key steht in beiden Inputs und fehlt rechts, wird also kontrahiert – das ist die eigentliche gewichtete Summe über alle Keypositionen. Jede Query erhält ihren eigenen Value-Vektor der Breite d_v.": "key appears in both inputs and is missing on the right, so it is contracted — that is the actual weighted sum over all Key positions. Every Query receives its own Value vector of width d_v.",
    "Hier wird query aufsummiert statt key. Die Shape bleibt gültig, weil beide Positionsachsen gleich lang sind, aber jede Zeile enthält nun eine Summe über alle Queries statt das Ergebnis einer einzelnen Query. Die Attention-Gewichte werden dadurch entlang der falschen Achse angewandt.": "Here query is summed away instead of key. The shape stays valid because both position axes have the same length, but every row now holds a sum over all Queries instead of the result of a single Query. The Attention weights are thereby applied along the wrong axis.",
    "Weil d_v rechts fehlt, wird über die Value-Featureachse summiert. Übrig bleibt eine Matrix in Positionsform; die Values sind als Featurevektor verloren. Die Shape ähnelt der Scorematrix und wird deshalb leicht für ein Zwischenergebnis gehalten.": "Because d_v is missing on the right, the Value feature axis is summed away. What remains is a matrix in position form; the Values are lost as a feature vector. The shape resembles the score matrix and is therefore easily mistaken for an intermediate result.",
    "Achsennamen im gewählten Muster": "Axis names in the selected pattern",
    "Länge": "length",
    "gekoppelt und im Output behalten": "coupled and kept in the output",
    "bleibt im Output": "stays in the output",
    "gekoppelt und aufsummiert · kontrahiert": "coupled and summed away · contracted",
    "aufsummiert und verschwunden": "summed away and gone",
    "einsum bricht ab:": "einsum aborts:",
    "Derselbe Achsenname müsste zwei verschiedene Längen binden.": "The same axis name would have to bind two different lengths.",
    "Es entsteht keine Output-Shape.": "No output shape is produced.",
    "Aufgelöste Output-Shape": "Resolved output shape",
    "führende Achsen": "leading axes",
    "kontrahiert": "contracted",
    "nichts": "nothing",
    "Korrektes Muster.": "Correct pattern.",
    "Falsches Muster – und die Shape verrät es nicht.": "Wrong pattern — and the shape does not reveal it.",
    "Falsches Muster – hier verrät es die Shape.": "Wrong pattern — here the shape reveals it.",
    "Inputs mit benannten Achsen": "Inputs with named axes",
    "Lies es als Vertrag: gleiche Namen koppeln, rechts fehlende Namen verschwinden durch Summation.": "Read it as a contract: equal names couple, names missing on the right disappear through summation.",
    "Schicksal jeder Achse": "Fate of every axis",
    "Dieselbe Rechnung ohne Einsum": "The same computation without einsum",
    "identisches Ergebnis für das korrekte Muster, aber die Achsenbedeutung steckt nur noch in Positionen wie −2 und −1. PyTorch führt beide Wege auf dieselben Matmul-Kernels zurück; der Gewinn liegt im vermiedenen Achsenfehler, nicht in der Geschwindigkeit.": "identical result for the correct pattern, but the meaning of each axis now lives only in positions such as −2 and −1. PyTorch lowers both routes to the same matmul kernels; the gain is the avoided axis mistake, not speed.",
    "d_in steht in beiden Inputs und fehlt rechts, wird also kontrahiert. Bei Q und K je [B,3,4] überleben query und key mit je Länge 3, sodass [B,3,3] entsteht. Fehlt d_v rechts vom Pfeil, wird über die Value-Features summiert – das Muster bleibt gültig und liefert stillschweigend das Falsche.": "d_in appears in both inputs and is missing on the right, so it is contracted. With Q and K both [B,3,4], query and key survive with length 3 each, producing [B,3,3]. If d_v is missing to the right of the arrow, the Value features are summed away — the pattern stays valid and silently returns the wrong thing.",
    "Gehe jedes Muster in drei Schritten durch: Welche Namen stehen in beiden Inputs? Welche Namen fehlen rechts vom Pfeil? Genau die Schnittmenge daraus wird kontrahiert, alles Übrige bleibt in der Output-Shape stehen.": "Work through every pattern in three steps: which names appear in both inputs? Which names are missing to the right of the arrow? Exactly their intersection is contracted, everything else remains in the output shape.",
    "Schritt und Variante": "Step and variant",
    "Welcher A1-Schritt": "Which A1 step",
    "Cross-Entropy · adapters.run_cross_entropy": "Cross-entropy · adapters.run_cross_entropy",
    "Globales Gradient Clipping · adapters.run_gradient_clipping": "Global gradient clipping · adapters.run_gradient_clipping",
    "Eingabefall": "Input case",
    "Gewählte Implementierung": "Selected implementation",
    "Maximale Gesamtnorm M": "Maximum total norm M",
    "Sage vor jedem Wechsel voraus, ob sich das Ergebnis überhaupt ändert. Fast jede falsche Variante sieht bei mindestens einer Einstellung völlig korrekt aus – genau das ist der Inhalt dieses Labs.": "Before every change, predict whether the result changes at all. Almost every wrong variant looks perfectly correct at at least one setting — that is exactly the content of this lab.",
    "1. Ohne Abziehen des Maximums bei Logits um 100: Was liefert float32?": "1. Without subtracting the maximum, at logits around 100: what does float32 return?",
    "exp läuft über nach unendlich; unendlich geteilt durch unendlich ergibt NaN": "exp overflows to infinity; infinity divided by infinity gives NaN",
    "Denselben Wert; Softmax ist verschiebungsinvariant": "The same value; Softmax is shift-invariant",
    "Exakt null, weil alle Exponenten gleich groß sind": "Exactly zero, because all exponents are equally large",
    "2. Welche der beiden A1-Regeln verhindert unendlich bei einem sehr sicheren Fehlurteil?": "2. Which of the two A1 rules prevents infinity for a very confident wrong call?",
    "log und exp kürzen, statt die Wahrscheinlichkeit zwischendurch zu bilden": "Cancelling log against exp instead of forming the probability in between",
    "Das Maximum abziehen": "Subtracting the maximum",
    "Über die Batchachse mitteln statt summieren": "Averaging over the batch axis instead of summing",
    "3. Was ändert Clipping pro Tensor gegenüber globalem Clipping zusätzlich zur Länge?": "3. Beyond the length, what else does per-tensor clipping change compared with global clipping?",
    "Die Richtung des Gesamtgradienten": "The direction of the total gradient",
    "Nichts; nur die Rechenzeit": "Nothing; only the compute time",
    "Das Vorzeichen einzelner Gradienten": "The sign of individual gradients",
    "Interaktiver Loss- und Clipping-Rechner": "Interactive loss and clipping calculator",
    "Harmlos · Logits um 0": "Harmless · logits around 0",
    "Genau dieser Fall steht in fast jedem selbstgeschriebenen Test. Alle vier Varianten stimmen überein – er kann keinen der drei Fehler aufdecken.": "This is the case in almost every hand-written test. All four variants agree — it cannot expose any of the three mistakes.",
    "Verschoben · dieselbe Verteilung, +100 auf jedes Logit": "Shifted · same distribution, +100 on every logit",
    "Die Softmax-Verteilung ist identisch zum harmlosen Fall, denn eine additive Konstante kürzt sich in Zähler und Nenner. Der korrekte Loss muss also unverändert bleiben.": "The Softmax distribution is identical to the harmless case, because an additive constant cancels in numerator and denominator. The correct loss must therefore stay unchanged.",
    "Sehr sicheres Fehlurteil · das richtige Logit liegt 120 unter dem Maximum": "Very confident wrong call · the correct logit sits 120 below the maximum",
    "So sieht ein Modell aus, das die richtige Antwort für praktisch unmöglich hält. Der korrekte Loss ist groß, aber endlich – genau solche Zeilen entstehen früh im Training.": "This is what a model looks like when it considers the correct answer practically impossible. The correct loss is large but finite — rows exactly like this appear early in training.",
    "korrekt · Maximum abziehen, log und exp kürzen": "correct · subtract the maximum, cancel log against exp",
    "Genau das verlangt A1. Das Abziehen des Maximums hält jeden Exponenten bei höchstens null, sodass exp nie überläuft. Und weil log und exp gegeneinander gekürzt werden, entsteht die winzige Zielwahrscheinlichkeit nie als eigene Zahl: ihr Logarithmus wird direkt als Differenz zweier moderater Größen berechnet.": "This is exactly what A1 requires. Subtracting the maximum keeps every exponent at zero or below, so exp never overflows. And because log and exp are cancelled against each other, the tiny target probability never comes into existence as a number of its own: its logarithm is computed directly as the difference of two moderate quantities.",
    "Softmax ohne Maximum-Abzug, danach Logarithmus": "Softmax without subtracting the maximum, then the logarithm",
    "Hier fehlt der Maximum-Abzug. exp wird direkt auf die rohen Logits angewandt – oberhalb von etwa 88,7 ist das in float32 unendlich. Zähler und Nenner werden beide unendlich, ihr Quotient ist NaN, und ab da ist jeder Gradient im Netz NaN.": "The maximum subtraction is missing here. exp is applied directly to the raw logits — above roughly 88.7 that is infinity in float32. Numerator and denominator both become infinite, their quotient is NaN, and from that point every gradient in the network is NaN.",
    "stabiler Softmax, danach Logarithmus": "stable Softmax, then the logarithm",
    "Der Maximum-Abzug ist da, aber log und exp werden nicht gekürzt: Die Zielwahrscheinlichkeit wird zwischendurch als eigene float32-Zahl gebildet. Unterhalb von etwa exp(−104) ist sie exakt null, und log(0) ist minus unendlich – der Loss wird unendlich, obwohl der richtige Wert eine harmlose zweistellige Zahl ist.": "The maximum subtraction is there, but log and exp are not cancelled: the target probability is formed in between as a float32 number of its own. Below roughly exp(−104) it is exactly zero, and log(0) is minus infinity — the loss becomes infinite even though the right value is a harmless two-digit number.",
    "korrekt pro Zeile, aber Summe statt Mittelwert": "correct per row, but a sum instead of a mean",
    "Die Zeilenrechnung ist perfekt stabil, nur die Reduktion stimmt nicht. A1 verlangt den Durchschnitt über alle Batchdimensionen. Eine Summe skaliert den Loss – und damit jeden Gradienten – mit der Batchgröße, sodass dieselbe Lernrate bei anderer Batchgröße plötzlich divergiert.": "The per-row computation is perfectly stable, only the reduction is wrong. A1 requires the average over all batch dimensions. A sum scales the loss — and with it every gradient — by the batch size, so the same learning rate suddenly diverges at a different batch size.",
    "korrekt · eine Norm über alle Parameter, skaliert nur bei Überschreitung": "correct · one norm over all parameters, scaled only when the limit is exceeded",
    "Genau das verlangt A1. Alle Parameter werden zu einem einzigen Vektor zusammengedacht, dessen ℓ2-Norm über die Grenze entscheidet. Weil jeder Gradient mit demselben Faktor multipliziert wird, ändert sich ausschließlich die Länge, nie die Richtung.": "This is exactly what A1 requires. All parameters are thought of as a single vector whose ℓ2 norm decides against the limit. Because every gradient is multiplied by the same factor, only the length changes, never the direction.",
    "jede Parametergruppe einzeln auf M clippen": "clip every parameter group to M on its own",
    "Jeder Tensor bekommt seinen eigenen Faktor. Damit werden große Gruppen stärker gestaucht als kleine, und der Gesamtgradient zeigt anschließend in eine andere Richtung – aus dem reinen Längenschutz wird eine stillschweigende Umgewichtung der Schichten. Genau das misst die Kosinusähnlichkeit im Ergebnis.": "Every tensor gets its own factor. Large groups are therefore compressed more than small ones, and the total gradient afterwards points in a different direction — the pure length guard silently turns into a reweighting of the layers. That is exactly what the cosine similarity in the result measures.",
    "korrekt, aber ohne das ε im Nenner": "correct, but without the ε in the denominator",
    "Numerisch fast identisch – der Unterschied liegt bei etwa 10⁻⁷. Der Zweck von ε ist ein anderer: Ist der Gesamtgradient exakt null, teilt diese Variante null durch null und schreibt NaN in jeden Parameter. A1 nennt ε = 10⁻⁶ ausdrücklich, und der Test vergleicht gegen die Referenz mit ε.": "Numerically almost identical — the difference is around 10⁻⁷. The purpose of ε is a different one: if the total gradient is exactly zero, this variant divides zero by zero and writes NaN into every parameter. A1 names ε = 10⁻⁶ explicitly, and the test compares against the reference that uses it.",
    "immer auf M skalieren, ohne die Grenze zu prüfen": "always scale to M without checking the limit",
    "Ohne das min(1, ·) wird jeder Gradient auf die Länge M gebracht – auch ein kleiner. Das Verfahren begrenzt dann nicht mehr, sondern normiert: harmlose Schritte werden künstlich aufgeblasen, und die effektive Lernrate hängt nicht mehr vom Gradienten ab.": "Without the min(1, ·), every gradient is brought to length M — including a small one. The procedure then no longer limits, it normalizes: harmless steps are inflated artificially, and the effective learning rate no longer depends on the gradient.",
    "Cross-Entropy in simulierter float32-Arithmetik": "Cross-entropy in simulated float32 arithmetic",
    "Batchzeile": "Batch row",
    "Zielindex": "target index",
    "A1-Referenz": "A1 reference",
    "Verlust pro Batchzeile": "Loss per batch row",
    "Reduktion über den Batch": "Reduction over the batch",
    "Gewählte Variante": "Selected variant",
    "Summe über beide Batchzeilen": "sum over both batch rows",
    "Mittelwert über beide Batchzeilen": "mean over both batch rows",
    "Korrekte A1-Referenz": "Correct A1 reference",
    "Korrekte Implementierung.": "Correct implementation.",
    "Falsch – aber dieser Eingabefall deckt es nicht auf.": "Wrong — but this input case does not expose it.",
    "Falsch – und dieser Eingabefall deckt es auf.": "Wrong — and this input case exposes it.",
    "float32-Grenzen, die hier entscheiden": "The float32 limits that decide here",
    "Größte darstellbare Zahl ≈ 3,4·10³⁸, also läuft exp(x) oberhalb von x ≈ 88,7 nach unendlich über. Kleinste subnormale Zahl ≈ 1,4·10⁻⁴⁵, also wird exp(x) unterhalb von x ≈ −104 exakt null. Genau zwischen diesen beiden Klippen muss die Implementierung hindurch.": "Largest representable number ≈ 3.4·10³⁸, so exp(x) overflows to infinity above x ≈ 88.7. Smallest subnormal number ≈ 1.4·10⁻⁴⁵, so exp(x) becomes exactly zero below x ≈ −104. The implementation has to pass exactly between those two cliffs.",
    "Globales Clipping über alle Parameter": "Global clipping across all parameters",
    "Drei Parametergruppen, deren Gesamtgradient exakt die Norm 13 hat. Bewege M über und unter diesen Wert – die falschen Varianten verraten sich jeweils nur in einem der beiden Bereiche, eine von ihnen mit diesem Gradienten überhaupt nicht.": "Three parameter groups whose total gradient has exactly norm 13. Move M above and below that value — each wrong variant gives itself away in only one of the two ranges, and one of them not at all with this gradient.",
    "Norm über alle Parameter gemeinsam": "Norm over all parameters jointly",
    "Vorgegebene Grenze": "Prescribed limit",
    "überschritten, es muss skaliert werden": "exceeded, scaling has to happen",
    "nicht überschritten, es darf nichts passieren": "not exceeded, nothing may happen",
    "Angewandter Faktor pro Parametergruppe": "Applied factor per parameter group",
    "Norm nach dem Clipping": "Norm after clipping",
    "Kosinusähnlichkeit zum ursprünglichen Gradienten": "Cosine similarity to the original gradient",
    "Falsch – aber diese Einstellung deckt es nicht auf.": "Wrong — but this setting does not expose it.",
    "Falsch – und diese Einstellung deckt es auf.": "Wrong — and this setting exposes it.",
    "Warum die Kosinusähnlichkeit die eigentliche Prüfgröße ist": "Why cosine similarity is the quantity that actually matters",
    "Clipping darf ausschließlich die Schrittlänge begrenzen. Bleibt der Kosinus bei exakt 1, zeigt der geclippte Gradient noch in dieselbe Richtung und der Optimierer läuft weiter bergab. Jeder Wert darunter bedeutet: die Update-Richtung selbst wurde verändert.": "Clipping may limit the step length and nothing else. If the cosine stays at exactly 1, the clipped gradient still points in the same direction and the optimizer keeps going downhill. Any value below that means the update direction itself was changed.",
    "Ohne Maximum-Abzug überläuft exp bei Logits um 100 nach unendlich; Zähler und Nenner werden beide unendlich und ihr Quotient ist NaN. Gegen das sichere Fehlurteil hilft dagegen nur das Kürzen von log und exp – wird die Wahrscheinlichkeit zwischendurch gebildet, ist sie in float32 exakt null und ihr Logarithmus minus unendlich. Und Clipping pro Tensor begrenzt zwar auch die Länge, dreht dabei aber die Richtung des Gesamtgradienten.": "Without subtracting the maximum, exp overflows to infinity at logits around 100; numerator and denominator both become infinite and their quotient is NaN. Against the confident wrong call, only cancelling log against exp helps — if the probability is formed in between, it is exactly zero in float32 and its logarithm minus infinity. And per-tensor clipping does limit the length too, but it turns the direction of the total gradient while doing so.",
    "Frage bei jedem Feld, welche Zwischengröße überhaupt als float32-Zahl entsteht. Der Maximum-Abzug schützt die Exponentialfunktion vor dem Überlauf nach oben; das Kürzen von log und exp verhindert, dass eine winzige Wahrscheinlichkeit jemals gebildet wird. Und beim Clipping entscheidet allein, ob alle Parameter denselben Faktor bekommen.": "For every field, ask which intermediate quantity comes into existence as a float32 number at all. Subtracting the maximum protects the exponential from overflowing upwards; cancelling log against exp keeps a tiny probability from ever being formed. And for clipping, the only thing that decides is whether all parameters receive the same factor.",
    "Eingabefall und Variante": "Input case and variant",
    "Eingabefall (d_k, token_positions)": "Input case (d_k, token_positions)",
    "Interaktiver RoPE-Rechner": "Interactive RoPE calculator",
    "\u0398 ist auf 10000 festgelegt, und der Eingabevektor q bleibt \u00fcber alle Positionen derselbe \u2013 jede Zeilendifferenz kommt damit ausschlie\u00dflich von der Position. Sage vor jedem Wechsel voraus, ob sich \u00fcberhaupt eine Zahl \u00e4ndert. Jede der vier falschen Varianten ist auf mindestens einem der vier F\u00e4lle Zahl f\u00fcr Zahl identisch mit der korrekten.": "\u0398 is fixed at 10000, and the input vector q stays the same across all positions \u2014 so every difference between rows comes from the position alone. Predict before each switch whether any number changes at all. Each of the four wrong variants is number-for-number identical to the correct one on at least one of the four cases.",
    "1. Warum kann ein Test mit d_k = 2 die Half-Split-Verwechslung nicht aufdecken?": "1. Why can a test with d_k = 2 not expose the Half-Split mix-up?",
    "Weil es bei d = 2 nur ein Paar gibt und benachbarte Paarung wie Half-Split dieselben zwei Koordinaten bezeichnen": "Because d = 2 leaves exactly one pair, and neighbouring pairing and Half-Split name the same two coordinates there",
    "Weil bei d = 2 alle Winkel null sind": "Because all angles are zero when d = 2",
    "Weil Half-Split erst ab vier Attention Heads \u00fcberhaupt definiert ist": "Because Half-Split is only defined from four Attention Heads upwards",
    "2. Warum liefern an Position 0 alle f\u00fcnf Varianten denselben Vektor?": "2. Why do all five variants return the same vector at position 0?",
    "Weil alle \u03b8_(0,k) null sind und jede Rotationsmatrix damit die Identit\u00e4t ist": "Because every \u03b8_(0,k) is zero, which makes each rotation matrix the identity",
    "Weil das erste Token per Konvention von RoPE ausgenommen wird": "Because the first token is exempt from RoPE by convention",
    "Weil cos(0) = 0 und sin(0) = 1 gilt": "Because cos(0) = 0 and sin(0) = 1",
    "3. Was pr\u00fcft ein Test nicht, der token_positions immer als 0\u2026T\u22121 \u00fcbergibt?": "3. What does a test never check if it always passes token_positions as 0\u2026T\u22121?",
    "Ob die Implementierung die \u00fcbergebenen Positionen liest oder nur den Index der Sequenzachse hochz\u00e4hlt": "Whether the implementation reads the positions it was handed or merely counts up the sequence-axis index",
    "Ob benachbarte Paare oder Half-Split verwendet werden": "Whether neighbouring pairs or Half-Split are used",
    "Ob \u0398 auf 10000 gesetzt ist": "Whether \u0398 is set to 10000",
    "Ein Token an Position 0 \u00b7 d_k = 4": "One token at position 0 \u00b7 d_k = 4",
    "Drei Positionen \u00b7 d_k = 2, also genau ein Paar": "Three positions \u00b7 d_k = 2, so exactly one pair",
    "Drei Positionen 0, 1, 2 \u00b7 d_k = 4": "Three positions 0, 1, 2 \u00b7 d_k = 4",
    "Drei Positionen 5, 6, 7 \u00b7 d_k = 4, Cache-Slice": "Three positions 5, 6, 7 \u00b7 d_k = 4, cache slice",
    "Der Fall, den man beim Nachrechnen von Hand zuerst nimmt: ein Vektor, Position 0. Alle Winkel sind exakt null, jede Rotationsmatrix ist damit die Identit\u00e4t. Sage voraus, wie viele der vier falschen Varianten hier auffallen.": "The case you reach for first when checking by hand: one vector, position 0. Every angle is exactly zero, which makes each rotation matrix the identity. Predict how many of the four wrong variants stand out here.",
    "Der kleinste Vektor, mit dem sich RoPE \u00fcberhaupt rechnen l\u00e4sst. Bei d = 2 gibt es nur ein einziges Paar \u2013 und genau deshalb bezeichnen benachbarte Paarung und Half-Split dieselben zwei Koordinaten. Ein Fehler bleibt hier vollst\u00e4ndig verborgen.": "The smallest vector RoPE can be computed on at all. With d = 2 there is a single pair \u2014 and that is exactly why neighbouring pairing and Half-Split name the same two coordinates. One error stays completely hidden here.",
    "Der Normalfall beim Training: token_positions l\u00e4uft l\u00fcckenlos von null hoch. Jetzt gibt es zwei Paare mit zwei verschiedenen Winkeln, \u03b8_(i,1) = i und \u03b8_(i,2) = i/100. Eine Variante bleibt trotzdem unsichtbar \u2013 \u00fcberlege vorher, welche.": "The normal training case: token_positions counts up from zero without gaps. There are now two pairs with two different angles, \u03b8_(i,1) = i and \u03b8_(i,2) = i/100. One variant still stays invisible \u2014 work out which one first.",
    "Derselbe Vektor, aber die Positionen beginnen nicht bei null \u2013 so sieht es beim Decoding mit KV-Cache, bei gepackten Sequenzen und bei zugeschnittenen Fenstern aus. Das Handout verlangt ausdr\u00fccklich, dass token_positions die vorberechneten cos/sin-Tabellen indiziert. Erst dieser Fall pr\u00fcft, ob das auch passiert.": "The same vector, but the positions do not start at zero \u2014 this is what decoding with a KV cache, packed sequences, and cropped windows look like. The handout explicitly requires token_positions to index the precomputed cos/sin tables. Only this case checks that it actually happens.",
    "korrekt \u00b7 benachbarte Paare, Exponent (2k\u22122)/d, token_positions": "correct \u00b7 neighbouring pairs, exponent (2k\u22122)/d, token_positions",
    "Half-Split \u00b7 Koordinate j wird mit j + d/2 gepaart": "Half-Split \u00b7 coordinate j is paired with j + d/2",
    "Vorzeichen vertauscht \u00b7 Drehung um \u2212\u03b8 statt +\u03b8": "sign swapped \u00b7 rotation by \u2212\u03b8 instead of +\u03b8",
    "Exponent 2k/d statt (2k\u22122)/d \u00b7 Paarindex ab eins": "exponent 2k/d instead of (2k\u22122)/d \u00b7 pair index from one",
    "token_positions ignoriert \u00b7 Winkel aus dem Achsenindex": "token_positions ignored \u00b7 angle taken from the axis index",
    "benachbart \u00b7 (2k\u22121, 2k)": "neighbouring \u00b7 (2k\u22121, 2k)",
    "Half-Split \u00b7 (j, j + d/2)": "Half-Split \u00b7 (j, j + d/2)",
    "\u03b8 = i/\u0398^((2k\u22122)/d)": "\u03b8 = i/\u0398^((2k\u22122)/d)",
    "\u03b8 = i/\u0398^((2k\u22122)/d) \u00b7 Drehrichtung invertiert": "\u03b8 = i/\u0398^((2k\u22122)/d) \u00b7 direction of rotation inverted",
    "\u03b8 = i/\u0398^(2k/d)": "\u03b8 = i/\u0398^(2k/d)",
    "i aus token_positions": "i from token_positions",
    "i = laufender Index der Sequenzachse": "i = running index of the sequence axis",
    "Genau der A1-Vertrag: das k-te Paar besteht aus den benachbarten Koordinaten 2k\u22121 und 2k, sein Winkel entsteht mit k ab eins aus dem Exponenten (2k\u22122)/d, und i ist die \u00fcbergebene Tokenposition. Der Winkel des ersten Paares ist damit \u03b8_(i,1) = i, weil \u0398 hoch null gleich eins ist.": "Exactly the A1 contract: the k-th pair consists of the neighbouring coordinates 2k\u22121 and 2k, its angle follows from the exponent (2k\u22122)/d with k starting at one, and i is the token position you were handed. The first pair therefore rotates by \u03b8_(i,1) = i, because \u0398 to the power of zero is one.",
    "Das ist die in vielen Codebasen \u00fcbliche Paarung, und sie ist als Positionsschema v\u00f6llig in Ordnung: die Norm bleibt erhalten, die Attention h\u00e4ngt weiterhin nur vom Abstand zweier Positionen ab, ein damit trainiertes Modell funktioniert. Nur erzeugt sie andere Zahlen als die A1-Referenz, weil andere Koordinaten dieselbe Frequenz teilen \u2013 und test_rope vergleicht Zahlen, nicht Eigenschaften. Unsichtbar bleibt der Unterschied, solange es nur ein Paar gibt, also bei d = 2.": "This is the pairing many codebases use, and it is perfectly fine as a position scheme: the norm is preserved, Attention still depends only on the distance between two positions, and a model trained with it works. It merely produces different numbers than the A1 reference, because different coordinates share the same frequency \u2014 and test_rope compares numbers, not properties. The difference stays invisible as long as there is only one pair, that is, at d = 2.",
    "Die Rotationsmatrix wurde transponiert: sin steht mit dem falschen Vorzeichen, also dreht jedes Paar in die Gegenrichtung. Auch das bleibt ein g\u00fcltiges relatives Schema \u2013 der Score h\u00e4ngt weiter nur vom Abstand ab, nur eben mit umgekehrtem Vorzeichen im Winkel. Die Ausgabe hat dieselbe Norm wie die korrekte und unterscheidet sich nur in der Verteilung der beiden Komponenten. Unsichtbar ist der Fehler an Position 0, wo sin \u03b8 = 0 ist.": "The rotation matrix has been transposed: sin carries the wrong sign, so every pair turns the other way. This too remains a valid relative scheme \u2014 the score still depends only on the distance, just with the opposite sign in the angle. The output has the same norm as the correct one and differs only in how the two components are distributed. The error is invisible at position 0, where sin \u03b8 = 0.",
    "Der klassische Off-by-one zwischen den beiden Z\u00e4hlweisen: A1 z\u00e4hlt k ab eins und schreibt deshalb 2k\u22122 in den Exponenten. Wer den Exponenten 2k einer nullbasierten Formel \u00fcbernimmt, aber trotzdem ab eins z\u00e4hlt, verschiebt die gesamte Frequenzleiter um eine Stufe nach unten. Das erste Paar dreht dann nicht mehr mit \u03b8 = i, sondern hundertfach langsamer, und die letzte Frequenz fehlt ganz. Unsichtbar bleibt das nur an Position 0.": "The classic off-by-one between the two counting conventions: A1 counts k from one and therefore writes 2k\u22122 in the exponent. Taking the exponent 2k from a zero-based formula while still counting from one shifts the whole frequency ladder down by one rung. The first pair then no longer turns with \u03b8 = i but a hundred times more slowly, and the last frequency is missing entirely. This stays invisible only at position 0.",
    "Hier wird nicht mit den \u00fcbergebenen Positionen gerechnet, sondern mit arange \u00fcber die Sequenzachse. Solange token_positions zuf\u00e4llig 0, 1, 2 \u2026 ist, sind beide identisch \u2013 deshalb \u00fcbersteht dieser Fehler jeden Test, der die Positionen nicht bewusst verschiebt. Er ist zugleich der heimt\u00fcckischste: die Attention-Scores bleiben unver\u00e4ndert, weil auch der Achsenindex einen konstanten Abstand hat. Falsch wird erst der Tensor selbst, und nur ihn vergleicht test_rope.": "Here the computation does not use the positions it was handed but an arange over the sequence axis. As long as token_positions happens to be 0, 1, 2 \u2026, the two are identical \u2014 which is why this error survives every test that does not deliberately shift the positions. It is also the most insidious one: the Attention Scores stay unchanged, because the axis index has a constant spacing too. Only the tensor itself becomes wrong, and only that is what test_rope compares.",
    "RoPE-Rotation Zahl f\u00fcr Zahl": "RoPE rotation, number by number",
    "Winkel und Paarbildung der gew\u00e4hlten Variante": "Angles and pairing of the selected variant",
    "Paarregel": "Pairing rule",
    "Winkelregel": "Angle rule",
    "Positionsquelle": "Position source",
    "gerechnet wird aber mit": "but the computation uses",
    "Paare": "Pairs",
    "Der gedrehte Query-Vektor pro Position": "The rotated Query vector per position",
    "Eingabe": "Input",
    "Gr\u00f6\u00dfte Abweichung von der A1-Referenz \u00fcber alle Positionen": "Largest deviation from the A1 reference across all positions",
    "Attention-Score zweier Positionen mit Abstand 1": "Attention Score of two positions one apart",
    "gegen": "versus",
    "festes": "fixed",
    "gleich, also h\u00e4ngt der Score nur vom Abstand ab": "equal, so the score depends only on the distance",
    "verschieden": "different",
    "Derselbe Score unter der A1-Referenz": "The same score under the A1 reference",
    "identisch mit der gew\u00e4hlten Variante": "identical to the selected variant",
    "von der gew\u00e4hlten Variante verschieden": "different from the selected variant",
    "Warum ein RoPE-Fehler nicht auff\u00e4llt": "Why a RoPE error does not stand out",
    "Eine Rotation erh\u00e4lt die Norm, also sieht jede der f\u00fcnf Varianten unauff\u00e4llig aus. Schwerer wiegt die Score-Zeile: bei allen vier falschen Varianten h\u00e4ngt der Attention-Score weiterhin nur vom Abstand zweier Positionen ab. Jede von ihnen w\u00e4re als eigenst\u00e4ndiges Positionsschema brauchbar, ein damit trainiertes Modell w\u00fcrde lernen, und die Lernkurve verriete nichts. Was test_rope pr\u00fcft, ist deshalb nicht die Eigenschaft, sondern der Tensor selbst \u2013 und ein eigener Test tut das nur, wenn er mindestens vier Koordinaten hat und token_positions nicht bei null beginnen l\u00e4sst.": "A rotation preserves the norm, so each of the five variants looks unremarkable. The score line weighs heavier: in all four wrong variants the Attention Score still depends only on the distance between two positions. Every one of them would work as a position scheme in its own right, a model trained with it would learn, and the learning curve would give nothing away. What test_rope checks is therefore not the property but the tensor itself \u2014 and a test of your own only does that if it has at least four coordinates and does not let token_positions start at zero.",
    "Bei d = 2 gibt es nur ein Paar, und benachbarte Paarung wie Half-Split bezeichnen dort dieselben zwei Koordinaten \u2013 ein solcher Test kann die Verwechslung gar nicht sehen. An Position 0 sind alle Winkel null, jede Rotationsmatrix ist die Identit\u00e4t, und damit liefern Paarung, Drehrichtung und Exponent gleicherma\u00dfen den unver\u00e4nderten Eingabevektor zur\u00fcck. Und wer token_positions immer als 0\u2026T\u22121 \u00fcbergibt, pr\u00fcft nie, ob die Implementierung diese Positionen \u00fcberhaupt liest oder nur den Achsenindex hochz\u00e4hlt.": "With d = 2 there is only one pair, and neighbouring pairing and Half-Split name the same two coordinates there \u2014 such a test cannot see the mix-up at all. At position 0 every angle is zero, each rotation matrix is the identity, and pairing, direction of rotation, and exponent therefore all return the unchanged input vector. And passing token_positions as 0\u2026T\u22121 every time never checks whether the implementation reads those positions at all or merely counts up the axis index.",
    "Schreibe f\u00fcr jedes Feld auf, welche Zahlen die Implementierung \u00fcberhaupt ber\u00fchrt. Bei d = 2 entscheidet, wie viele Paare es gibt. An Position 0 entscheidet, welchen Wert cos und sin dort annehmen. Und bei l\u00fcckenlosen Positionen entscheidet, ob sich token_positions und der Achsenindex unterscheiden lassen.": "For each field, write down which numbers the implementation touches at all. At d = 2 what decides is how many pairs there are. At position 0 what decides is the value cos and sin take there. And with gapless positions what decides is whether token_positions and the axis index can be told apart.",
    "Präferenzpaar und Variante": "Preference pair and variant",
    "Präferenzpaar (x, y_w, y_l)": "Preference pair (x, y_w, y_l)",
    "Interaktiver DPO-Loss-Rechner": "Interactive DPO loss calculator",
    "β ist auf 0,1 festgelegt – genau den Wert nennt das Supplement für das DPO-Training. Sage vor jedem Wechsel voraus, ob sich der Loss überhaupt ändert. Jede der vier falschen Varianten ist auf mindestens einem der vier Paare bit-identisch zur korrekten Implementierung; genau das ist der Inhalt dieses Labs.": "β is fixed at 0.1 — exactly the value the supplement names for DPO training. Before every switch, predict whether the loss changes at all. Each of the four wrong variants is bit-identical to the correct implementation on at least one of the four pairs; that is precisely what this lab is about.",
    "1. Das Supplement rechnet statt log πθ(y|x) die unbedingte Logwahrscheinlichkeit von concat(x, y). Warum ist das hier erlaubt?": "1. Instead of log πθ(y|x), the supplement computes the unconditional log-probability of concat(x, y). Why is that permitted here?",
    "Weil im DPO-Logit nur Differenzen unter demselben Modell auftreten und log πθ(x) sich darin herauskürzt": "Because the DPO logit contains only differences under the same model, and log πθ(x) cancels out inside them",
    "Weil Prompttoken grundsätzlich nicht zum Loss beitragen": "Because prompt tokens never contribute to the loss in principle",
    "Weil der Prompt gegenüber der Antwort so kurz ist, dass sein Beitrag vernachlässigbar bleibt": "Because the prompt is so short compared to the response that its contribution stays negligible",
    "2. Was ändert sich am Ziel, wenn die Sequenz-Logprobs durch die Tokenzahl geteilt werden?": "2. What changes about the objective if the sequence log-probs are divided by the token count?",
    "Die Marge wird längenabhängig: dasselbe Präferenzsignal wiegt bei einer kurzen Antwort mehr als bei einer langen": "The margin becomes length-dependent: the same preference signal weighs more on a short response than on a long one",
    "Nichts; β skaliert die Marge ohnehin und absorbiert den Faktor": "Nothing; β scales the margin anyway and absorbs the factor",
    "Nur die numerische Stabilität; das Optimum bleibt identisch": "Only the numerical stability; the optimum stays identical",
    "3. Wann liefert eine Implementierung ohne die beiden Referenzterme exakt denselben Loss wie die korrekte?": "3. When does an implementation without the two reference terms return exactly the same loss as the correct one?",
    "Wenn die Referenz beide Antworten gleich bewertet, also log π_ref(y_w|x) = log π_ref(y_l|x)": "When the reference scores both responses equally, that is log π_ref(y_w|x) = log π_ref(y_l|x)",
    "Wenn h null ist": "When h is zero",
    "Wenn beide Antworten gleich viele Token haben": "When both responses have the same number of tokens",
    "Unterschiedliche Antwortlängen · 3 gegen 5 Token": "Differing response lengths · 3 against 5 tokens",
    "Die bevorzugte Antwort ist kürzer und wird von der Policy stärker bevorzugt als von der Referenz. Die abgelehnte Antwort ist länger und sammelt allein durch ihre Länge eine kleinere Logwahrscheinlichkeit ein. Genau diese Längendifferenz trennt Summe von Mittelwert.": "The preferred response is shorter and the policy favours it more strongly than the reference does. The rejected response is longer and collects a smaller log-probability by its length alone. It is exactly this length difference that separates a sum from a mean.",
    "Referenz bewertet beide Antworten gleich": "Reference scores both responses equally",
    "Hier ergeben beide Referenzsummen exakt −2,0: die eingefrorene Referenz ist zwischen den beiden Antworten indifferent. Sage vorher, welche falsche Variante dadurch unsichtbar wird.": "Here both reference sums come to exactly −2.0: the frozen reference is indifferent between the two responses. Predict which wrong variant that makes invisible.",
    "Keine Präferenzmarge · der DPO-Logit ist exakt null": "No preference margin · the DPO logit is exactly zero",
    "Alle vier Sequenzsummen sind so gewählt, dass beide Policy-zu-Referenz-Margen exakt 0,25 betragen. Damit ist h exakt null und der Loss genau log 2 ≈ 0,693147 – der Wert, den eine vollständig unentschiedene Policy erhält.": "All four sequence sums are chosen so that both policy-to-reference margins come to exactly 0.25. That makes h exactly zero and the loss exactly log 2 ≈ 0.693147 — the value a completely undecided policy receives.",
    "Lange Antworten · die Policy liegt sehr sicher falsch": "Long responses · the policy is confidently wrong",
    "Realistische Größenordnung mit 512 gegen 480 Antworttoken. Die Policy hat die bevorzugte Antwort gegenüber der Referenz massiv abgewertet, deshalb liegt h bei −119. Nur die einzelnen Sequenzsummen gehen in den Loss ein, eine Tokenliste braucht es dafür nicht.": "A realistic order of magnitude with 512 against 480 response tokens. The policy has massively devalued the preferred response relative to the reference, which puts h at −119. Only the individual sequence sums enter the loss, so no token list is needed for it.",
    "korrekt · summierte Sequenz-Logprobs, Referenz abgezogen, logsigmoid": "correct · summed sequence log-probs, reference subtracted, logsigmoid",
    "Genau Gleichung (3) des Supplements: pro Antwort die Summe der Token-Logprobs, davon die Referenzsumme abgezogen, die Differenz beider Margen mit β skaliert und der Loss als softplus(−h). Weder eine Wahrscheinlichkeit noch σ(h) entsteht dabei als eigene float32-Zahl.": "Exactly Equation (3) of the supplement: per response the sum of the token log-probs, minus the reference sum, the difference of the two margins scaled by β, and the loss as softplus(−h). Neither a probability nor σ(h) comes into existence as a float32 number of its own along the way.",
    "ohne die Referenzterme · nur πθ(y_w) gegen πθ(y_l)": "without the reference terms · only πθ(y_w) against πθ(y_l)",
    "Ohne die Referenzterme ist das kein DPO mehr, sondern ein reines Präferenz-Ranking auf πθ allein. Nichts hält die Policy in der Nähe ihrer Ausgangsverteilung, und der Loss lässt sich beliebig senken, indem die abgelehnte Antwort global unwahrscheinlich gemacht wird – auch dort, wo sie eigentlich sinnvoll war. Sichtbar wird der Fehler nur, wenn die Referenz die beiden Antworten unterschiedlich bewertet: bei gleicher Referenzbewertung heben sich die beiden fehlenden Terme gegenseitig auf und das Ergebnis ist bit-identisch.": "Without the reference terms this is no longer DPO but a pure preference ranking on πθ alone. Nothing keeps the policy near its starting distribution, and the loss can be pushed arbitrarily low by making the rejected response globally unlikely — including in the places where it was actually sensible. The defect becomes visible only when the reference scores the two responses differently: with an equal reference score the two missing terms cancel each other and the result is bit-identical.",
    "chosen und rejected vertauscht": "chosen and rejected swapped",
    "h wechselt das Vorzeichen, und der Gradient drückt genau die bevorzugte Antwort nach unten – das Training läuft der Präferenz zuverlässig entgegen. Der Loss bleibt dabei eine plausible positive Zahl in derselben Größenordnung; nichts an seinem Wert verrät den Fehler. Nur bei h = 0 ist die Vertauschung unsichtbar, weil beide Richtungen dort zusammenfallen.": "h flips sign and the gradient pushes down exactly the preferred response — the training reliably runs against the preference. The loss meanwhile stays a plausible positive number of the same order of magnitude; nothing about its value gives the defect away. The swap is invisible only at h = 0, because both directions coincide there.",
    "pro Token gemittelt statt summiert": "averaged per token instead of summed",
    "Das Teilen durch die Tokenzahl macht aus der Summe einen Mittelwert und die Marge damit längenabhängig: dasselbe Präferenzsignal wiegt bei einer kurzen Antwort mehr als bei einer langen, und bei unterschiedlich langen Antworten wird zusätzlich durch zwei verschiedene Nenner geteilt. Gleichung (3) enthält keinen solchen Nenner – log πθ(y|x) ist die Summe über die Antworttoken. Unsichtbar bleibt der Fehler nur, wenn beide Antworten gleich lang sind und h ohnehin null ist.": "Dividing by the token count turns the sum into a mean and the margin thereby into a length-dependent quantity: the same preference signal weighs more on a short response than on a long one, and with responses of differing length two different denominators are used on top of that. Equation (3) contains no such denominator — log πθ(y|x) is the sum over the response tokens. The defect stays invisible only when both responses are the same length and h is zero anyway.",
    "erst σ(h) bilden, danach logarithmieren": "form σ(h) first, then take the logarithm",
    "Mathematisch identisch, numerisch nicht. Diese Variante bildet σ(h) als eigene float32-Zahl; bei stark negativem h wird sie exakt null und der Loss plus unendlich, womit auch der Gradient verloren ist. Solange |h| klein bleibt, ist das Ergebnis bit-identisch zur korrekten Form – deshalb übersteht dieser Fehler jeden selbst gebauten Test mit moderaten Logprobs und schlägt erst im Training bei langen Antworten zu. In PyTorch ist die Lösung ein einziger Funktionsname: logsigmoid statt log(sigmoid(·)).": "Mathematically identical, numerically not. This variant forms σ(h) as a float32 number of its own; at strongly negative h it becomes exactly zero and the loss plus infinity, which loses the gradient as well. As long as |h| stays small the result is bit-identical to the correct form — which is why this defect survives every self-built test with moderate log-probs and only strikes in training on long responses. In PyTorch the fix is a single function name: logsigmoid instead of log(sigmoid(·)).",
    "Σ log πθ − Σ log π_ref": "Σ log πθ − Σ log π_ref",
    "Σ log πθ · Referenzterm fehlt": "Σ log πθ · reference term missing",
    "(Σ log πθ − Σ log π_ref) / T": "(Σ log πθ − Σ log π_ref) / T",
    "h = β · (Marge_w − Marge_l)": "h = β · (margin_w − margin_l)",
    "h = β · (Marge_l − Marge_w) · vertauscht": "h = β · (margin_l − margin_w) · swapped",
    "DPO-Loss aus Gleichung (3) in simulierter float32-Arithmetik": "DPO loss from Equation (3) in simulated float32 arithmetic",
    "Die vier Sequenz-Logwahrscheinlichkeiten": "The four sequence log-probabilities",
    "Margen, Logit und Loss unter der gewählten Variante": "Margins, logit, and loss under the selected variant",
    "Marge_w der bevorzugten Antwort": "margin_w of the preferred response",
    "Marge_l der abgelehnten Antwort": "margin_l of the rejected response",
    "y_w · log πθ pro Token": "y_w · log πθ per token",
    "y_w · log π_ref pro Token": "y_w · log π_ref per token",
    "y_l · log πθ pro Token": "y_l · log πθ per token",
    "y_l · log π_ref pro Token": "y_l · log π_ref per token",
    "Antworttoken": "response tokens",
    "σ(h) als eigene float32-Zahl": "σ(h) as a float32 number of its own",
    "exakt 0 · unterlaufen": "exactly 0 · underflowed",
    "Referenz nach Gleichung (3)": "reference per Equation (3)",
    "Falsch – aber dieses Präferenzpaar deckt es nicht auf.": "Wrong — but this preference pair does not expose it.",
    "Falsch – und dieses Präferenzpaar deckt es auf.": "Wrong — and this preference pair exposes it.",
    "Was ein einzelnes Testpaar beweisen kann": "What a single test pair can prove",
    "Der Test test_per_instance_dpo_loss vergleicht gegen eine feste Referenz. Diese vier Paare zeigen, warum ein selbst gebautes Paar das nicht ersetzt: jede der vier falschen Varianten ist auf mindestens einem Paar bit-identisch zur korrekten. Ein belastbarer eigener Test braucht deshalb mindestens ein Paar mit unterschiedlich langen Antworten, ein Paar mit ungleicher Referenzbewertung und ein Paar mit großem Betrag von h.": "The test test_per_instance_dpo_loss compares against a fixed reference. These four pairs show why a self-built pair is no substitute: each of the four wrong variants is bit-identical to the correct one on at least one pair. A dependable test of your own therefore needs at least one pair with responses of differing length, one pair with an unequal reference score, and one pair with a large magnitude of h.",
    "Im DPO-Logit kommt log πθ(y|x) nur in Differenzen unter demselben Modell vor; der Promptanteil log πθ(x) ist in beiden Termen identisch und kürzt sich heraus – deshalb darf mit der unbedingten Logwahrscheinlichkeit von concat(x, y) gerechnet werden. Ein Nenner mit der Tokenzahl macht die Marge dagegen längenabhängig und verändert das Ziel, statt es nur zu skalieren. Und die fehlenden Referenzterme bleiben genau dann unsichtbar, wenn die Referenz beide Antworten gleich bewertet: nur dann heben sich die beiden weggelassenen Summanden gegenseitig auf.": "In the DPO logit, log πθ(y|x) appears only inside differences under the same model; the prompt part log πθ(x) is identical in both terms and cancels out — which is why you may compute with the unconditional log-probability of concat(x, y). A denominator with the token count, by contrast, makes the margin length-dependent and changes the objective instead of merely scaling it. And the missing reference terms stay invisible exactly when the reference scores both responses equally: only then do the two omitted summands cancel each other.",
    "Schreibe den DPO-Logit einmal vollständig aus und frage bei jedem Feld, welcher Summand sich dabei wegkürzt. Beim Prompt entscheidet, dass beide Differenzen unter demselben Modell gebildet werden. Beim Nenner entscheidet, ob er für beide Antworten derselbe ist. Und bei der Referenz entscheidet, wann ihre beiden Summen gleich groß sind.": "Write the DPO logit out in full once and ask, for each field, which summand cancels while you do. For the prompt, what decides is that both differences are formed under the same model. For the denominator, what decides is whether it is the same for both responses. And for the reference, what decides is when its two sums are equally large.",
    "Launch-Konfiguration": "Launch configuration",
    "Vektorlänge N": "Vector length N",
    "Program ID": "Program ID",
    "Default-Orakel: N=17 und BLOCK_SIZE=8 starten 3 Programs. Program 2 besitzt offsets 16…23; nur offset 16 ist gültig.": "Default oracle: N=17 and BLOCK_SIZE=8 launch 3 Programs. Program 2 owns offsets 16…23; only offset 16 is valid.",
    "Transfer-Kurzcheck": "Transfer quick check",
    "N=37, BLOCK_SIZE=16, program_id=2: Leite zuerst auf Papier her.": "N=37, BLOCK_SIZE=16, program_id=2: derive it on paper first.",
    "Wie viele Programs?": "How many Programs?",
    "Wie viele gültige Lanes in Program 2?": "How many valid lanes in Program 2?",
    "Kurzcheck prüfen": "Check answer",
    "Beantworte beide Kurzcheck-Felder.": "Answer both quick-check fields.",
    "✓ Transfer-Kurzcheck bestanden": "✓ Transfer quick check passed",
    "ceil(37/16)=3. Program 2 besitzt offsets 32…47; genau 32…36 sind gültig, also 5 Lanes. Die übrigen 11 Speicherzugriffe werden maskiert.": "ceil(37/16)=3. Program 2 owns offsets 32…47; exactly 32…36 are valid, giving 5 lanes. The other 11 memory accesses are masked.",
    "Noch nicht.": "Not yet.",
    "Noch nicht": "Again",
    "Schreibe zuerst offsets = 2·16 + [0,…,15] auf. Vergleiche danach jeden Offset mit N=37; für das Grid brauchst du ceil, nicht floor.": "First write offsets = 2·16 + [0,…,15]. Then compare every offset with N=37; the grid needs ceil, not floor.",
    "Bestehe zuerst den Transfer-Kurzcheck.": "Pass the transfer quick check first.",
    "Stelle für diesen festen Kurzcheck zuerst τ=0.5 ein.": "Set τ=0.5 before taking this fixed quick check.",
    "Danach kannst du τ wieder verändern und die anderen Component-Strukturen untersuchen.": "Afterward, you can change τ again and explore the other component structures.",
    "Interaktiver Triton Tile- und Masken-Tracer": "Interactive Triton tile and mask tracer",
    "Vom Launch Grid zu sicheren Speicheradressen": "From launch grid to safe memory addresses",
    "Zahl der Programs": "Number of Programs",
    "Offsets des gewählten Programs": "Offsets of the selected Program",
    "Randmaske": "Boundary mask",
    "Gültige Lanes": "Valid lanes",
    "Gesamtes Launch Grid": "Complete launch grid",
    "gültige Adresse": "valid address",
    "maskierte Rand-Lane": "masked boundary lane",
    "Lanes aktiv": "addresses valid",
    "Adressen gültig": "addresses valid",
    "Generisches Speicher-Muster": "Generic memory-access pattern",
    "Randfall aktiv:": "Boundary case active:",
    "Kein Randfall:": "No boundary case:",
    "ceil_div startet ein zusätzliches teilweise gefülltes Program. Jede ungültige Lane braucht beim Load und Store dieselbe Adressmaske.": "ceil_div launches an additional partially filled Program. Every invalid lane needs the same address mask at load and store.",
    "N ist durch BLOCK_SIZE teilbar. Ändere N, damit du das teilweise gefüllte letzte Program untersuchen kannst.": "N is divisible by BLOCK_SIZE. Change N so you can inspect the partially filled last Program.",
    "program_id wählt das Tile; arange wählt parallele Lanes innerhalb dieses Tiles. Erst ihre Summe ergibt globale Elementindizes.": "program_id selects the tile; arange selects parallel lanes within that tile. Only their sum produces global element indices.",
    "Zwei Score-Tiles": "Two score tiles",
    "Tile 1 ist fest: Scores [0,1], skalare Values [1,2]. Tile 2 enthält einen Score und den Value 4. Das eindimensionale Value-Beispiel macht dieselbe Akkumulatorrechnung sichtbar, die real pro d_v-Feature läuft.": "Tile 1 is fixed: scores [0,1] and scalar Values [1,2]. Tile 2 contains one score and Value 4. The one-dimensional Value example exposes the same accumulator calculation that runs for every d_v feature in practice.",
    "Score im zweiten Tile": "Score in the second tile",
    "Transfer-Kurzcheck für Score 2": "Transfer quick check for score 2",
    "Neues Maximum m′": "New maximum m′",
    "Faktor für alte Beiträge α": "Factor for earlier contributions α",
    "Neue Exponentialsumme ℓ′": "New exponential sum ℓ′",
    "Größte finale Wahrscheinlichkeit": "Largest final probability",
    "Interaktiver Online-Softmax-Akkumulator": "Interactive Online Softmax accumulator",
    "Eine Queryzeile, zwei Tiles, ein exaktes Ergebnis": "One Query row, two tiles, one exact result",
    "Tile 1 · laufendes Maximum": "Tile 1 · running maximum",
    "Tile 1 · Exponentialsumme": "Tile 1 · exponential sum",
    "Tile 1 · Value-Akkumulator": "Tile 1 · Value accumulator",
    "Tile 2 · neues Maximum und Reskalierung": "Tile 2 · new maximum and rescaling",
    "Tile 2 · aktualisierte Summe": "Tile 2 · updated sum",
    "Tile 2 · aktualisierter Value-Akkumulator": "Tile 2 · updated Value accumulator",
    "Online-Output": "Online output",
    "Direkter Kontrollpfad": "Direct control path",
    "Softmax über alle Scores": "Softmax over all scores",
    "Direkter gewichteter Value": "Direct weighted Value",
    "Invariante bestätigt:": "Invariant confirmed:",
    "Online- und Direktpfad stimmen bis auf Rundung überein. FlashAttention nutzt diese Zeilenstatistiken tileweise, statt die vollständige Scorematrix im HBM abzulegen.": "The online and direct paths agree up to rounding. FlashAttention carries these row statistics across tiles instead of storing the complete score matrix in HBM.",
    "Stelle für diesen festen Kurzcheck zuerst den zweiten Score auf 2.": "Set the second score to 2 before taking this fixed quick check.",
    "Beantworte alle vier Online-Softmax-Felder.": "Answer all four Online Softmax fields.",
    "Beginne mit m′=max(1,2). Rechne danach jeden alten Beitrag relativ zu diesem neuen Maximum um; erst am Ende normierst du die drei Wahrscheinlichkeiten.": "Start with m′=max(1,2). Then convert every earlier contribution relative to that new maximum; normalize the three probabilities only at the end.",
    "m′=2, α=e⁻¹≈0.368 und ℓ′≈1.503. Der Score 2 erhält e⁰/ℓ′≈0.665; die anderen Wahrscheinlichkeiten sind ungefähr 0.090 und 0.245.": "m′=2, α=e⁻¹≈0.368, and ℓ′≈1.503. Score 2 receives e⁰/ℓ′≈0.665; the other probabilities are approximately 0.090 and 0.245.",
    "Serving-Konfiguration": "Serving configuration",
    "Aktive Sequenzen B": "Active sequences B",
    "Gecachter Kontext T": "Cached context T",
    "Gecachter Kontext S": "Cached context S",
    "Modelldimension D": "Model dimension D",
    "Query Heads H_q": "Query Heads H_q",
    "Key-Value Heads H_kv": "Key-Value Heads H_kv",
    "Input-Embedding und LM Head teilen (Weight Tying)": "Share input Embedding and LM Head (Weight Tying)",
    "KV-Cache-Dtype": "KV Cache data type",
    "Weight-Präzision": "Weight precision",
    "HBM-Bandbreite": "HBM bandwidth",
    "BF16 / FP16 · 2 Byte": "BF16 / FP16 · 2 bytes",
    "8 Bit · 1 Byte": "8-bit · 1 byte",
    "16 Bit": "16-bit",
    "8 Bit": "8-bit",
    "4 Bit": "4-bit",
    "V_vocab ist für die Modellnäherung auf 50.000 gesetzt. Ändere nur einen Regler und sage vorher, welcher Speicherterm reagiert.": "V_vocab is fixed at 50,000 for the model approximation. Change only one control and predict which memory term will respond.",
    "Lecture-10-Setup: V=50.000 und gated MLP mit F=4D; Weight Tying ist standardmäßig aus. Ändere genau einen Regler und sage vorher, welche Formelterme reagieren.": "Lecture 10 setup: V=50,000 and a gated MLP with F=4D; Weight Tying is off by default. Change exactly one control and first predict which equation terms will respond.",
    "Interaktives Inference-Budget": "Interactive inference budget",
    "Ungültige Head-Aufteilung.": "Invalid Head configuration.",
    "H_q muss D_model teilen; H_kv darf nicht größer als H_q sein und muss H_q ganzzahlig teilen.": "H_q must divide D_model; H_kv must not exceed H_q and must divide H_q evenly.",
    "H_q muss D teilen; H_kv darf nicht größer als H_q sein und muss H_q ganzzahlig teilen.": "H_q must divide D; H_kv must not exceed H_q and must divide H_q evenly.",
    "Serving-Budget mit eingesetzten Shapes": "Serving budget with substituted shapes",
    "Serving-Budget aus Lecture 10": "Serving budget from Lecture 10",
    "Head-Breite und GQA-Gruppe": "Head width and GQA group",
    "Head-Breite, GQA-Gruppe und MLP-Breite": "Head width, GQA group, and MLP width",
    "K oder V pro Layer": "K or V per layer",
    "Was bedeuten die vier Achsen?": "What do the four axes mean?",
    "B zählt parallele Sequenzen, H_kv getrennte Key-Value Heads, S alle bisher gespeicherten Tokenpositionen und d_head die Features jedes Head-Vektors. Bei jedem Decode-Step wächst nur S um eins; B, H_kv und d_head bleiben für die Konfiguration gleich.": "B counts parallel Sequences, H_kv distinct Key-Value Heads, S all Token positions stored so far, and d_head the features in each Head vector. At every Decode Step, only S grows by one; B, H_kv, and d_head stay fixed for the configuration.",
    "Parameterzerlegung": "Parameter breakdown",
    "Vokabular + LM Head": "Vocabulary + LM Head",
    "Gated MLP pro Layer": "Gated MLP per layer",
    "GQA Attention pro Layer": "GQA Attention per layer",
    "Gesamtparameter": "Total parameters",
    "Speicher und ideale Decode-Grenze": "Memory and ideal decode bound",
    "Residenter Weight-Speicher": "Resident weight memory",
    "Vollständiger KV-Cache": "Complete KV Cache",
    "KV-Cache pro Sequenz": "KV Cache per sequence",
    "Warum Faktor 2 und warum wächst S?": "Why factor 2, and why does S grow?",
    "Jeder Layer speichert sowohl K als auch V. Der neue Token erzeugt in jedem Layer genau einen neuen Key- und Value-Vektor pro KV Head und hängt beide an die S-Achse an; alte Werte bleiben, damit sie nicht erneut berechnet werden müssen. Alte Queries und Attention-Gewichte werden nicht gecacht.": "Every Layer stores both K and V. In every Layer, the new Token creates exactly one new Key and Value vector per KV Head and appends both along the S axis; earlier values remain so they do not need to be recomputed. Earlier Queries and Attention weights are not cached.",
    "linear in S": "linear in S",
    "Modellgewichte": "Model weights",
    "Gemeinsames Mindestbudget": "Combined minimum budget",
    "KV-Anteil": "KV share",
    "Ideale Decode-Latenz-Untergrenze": "Ideal decode latency lower bound",
    "Ideale Throughput-Obergrenze": "Ideal throughput upper bound",
    "Token/s": "tokens/s",
    "Arithmetic Intensity aus Lecture 10": "Arithmetic Intensity from Lecture 10",
    "Gated MLP · Prefill": "Gated MLP · prefill",
    "Gated MLP · Decode": "Gated MLP · decode",
    "Attention · Prefill (MHA-Modell)": "Attention · prefill (MHA model)",
    "Attention · Decode (MHA-Modell)": "Attention · decode (MHA model)",
    "Attention · Decode (ideale GQA-Wiederverwendung)": "Attention · decode (ideal GQA reuse)",
    "Warum spart GQA hier Speicher?": "Why does GQA save memory here?",
    "MHA würde H_kv = H_q verwenden. Die gewählte Aufteilung reduziert den KV-Cache gegenüber MHA um": "MHA would use H_kv = H_q. The selected configuration reduces the KV Cache relative to MHA by",
    "Query Heads bleiben erhalten; nur frühere Keys und Values werden geteilt.": "Query Heads remain; only earlier Keys and Values are shared.",
    "Sie senkt außerdem die K/V-Projektionsparameter; Query Heads bleiben erhalten.": "It also reduces K/V projection parameters; Query Heads remain.",
    "Prefill versus Decode": "Prefill versus decode",
    "Prefill verarbeitet B·T =": "Prefill processes B·T =",
    "Prefill verarbeitet B·S =": "Prefill processes B·S =",
    "Promptpositionen parallel und erzeugt den Cache. Decode verarbeitet pro Schritt nur B neue Positionen und liest dafür Gewichte sowie alte Keys und Values.": "prompt positions in parallel and creates the cache. Decode processes only B new positions per step while reading weights and earlier Keys and Values.",
    "Promptpositionen parallel. Decode verarbeitet pro Schritt nur B neue Positionen und liest dafür Gewichte sowie den bisherigen KV-Cache.": "prompt positions in parallel. Decode processes only B new positions per step and reads weights plus the existing KV Cache.",
    "Batch 1 bietet beim Decode wenig Wiederverwendung der Gewichte; der Pfad ist häufig stark bandbreitenlimitiert.": "Batch 1 provides little weight reuse during decode, so the path is often strongly bandwidth-limited.",
    "Batch 1 bietet beim Decode kaum Wiederverwendung der Gewichte; der Pfad ist häufig stark bandbreitenlimitiert.": "Batch 1 provides almost no weight reuse during decode, so the path is often strongly bandwidth-limited.",
    "Mehr aktive Sequenzen erhöhen die Wiederverwendung der Gewichte und damit oft den Throughput, vergrößern aber KV-Cache und mögliche Queueing-Latenz.": "More active sequences increase weight reuse and often throughput, but also enlarge the KV Cache and potential queueing latency.",
    "Das Budget enthält Modellgewichte und KV-Cache, aber noch keine temporären Aktivierungen, Runtime-Buffer, Fragmentierung oder mehrere Modellkopien. Quantization spart nur dann entsprechende Laufzeit, wenn geeignete Kernel und der gemessene Bottleneck dazu passen.": "The budget includes model weights and the KV Cache, but not temporary activations, runtime buffers, fragmentation, or multiple model copies. Quantization saves corresponding runtime only when suitable kernels and the measured bottleneck support it.",
    "Untere beziehungsweise obere Idealgrenze:": "Ideal lower or upper bound:",
    "Die Rechnung nimmt an, dass Gewichte und relevanter KV-Cache je Decode-Schritt genau einmal aus HBM gelesen werden. Compute, Kommunikation, Scheduling, temporäre Aktivierungen, Runtime-Buffer und Fragmentierung fehlen. Sie schätzt nicht die Time to First Token.": "The calculation assumes that weights and the relevant KV Cache are read from HBM exactly once per decode step. Compute, communication, scheduling, temporary activations, runtime buffers, and fragmentation are omitted. It does not estimate Time to First Token.",
    "Transfer belegen": "Provide transfer evidence",
    "Exit-Ticket-Markierung entfernt": "Exit-ticket mark removed",
    "Grundlagen-Diagnose": "Foundations diagnostic",
    "12–15 Minuten · ohne Hilfsmittel": "12–15 minutes · closed book",
    "15–20 Minuten · ohne Hilfsmittel": "15–20 minutes · closed book",
    "12 Minuten · ohne Hilfsmittel": "12 minutes · closed book",
    "Beantworte aus deinem aktuellen Verständnis. Das Ergebnis priorisiert den Lernpfad, benotet dich aber nicht.": "Answer from your current understanding. The result prioritizes your learning path but does not grade you.",
    "Beantworte aus deinem aktuellen Verständnis. „Ich weiß es nicht“ ist wertvolle Information. Die vier kurzen Herleitungen verhindern, dass Recognition allein ganze Prerequisites überspringt.": "Answer from your current understanding. ‘I don't know’ is valuable information. The four short derivations prevent recognition alone from skipping entire prerequisites.",
    "Bitte beantworte alle Fragen.": "Please answer every question.",
    "Abrufsitzung abgeschlossen": "Review session complete",
    "Abruf vor Wiederlesen": "Retrieve before rereading",
    "Gewusst": "Got it",
    "Schwer": "Hard",
    "Du entscheidest, wann du wieder übst.": "You decide when to practice again.",
    "Aktiver Abruf": "Active retrieval",
    "Musterantwort anzeigen": "Show model answer",
    "Bewerte die Qualität deiner eigenen Erklärung, nicht ob die Musterantwort vertraut aussieht.": "Rate the quality of your own explanation, not whether the model answer looks familiar.",
    "Musterantwort sichtbar": "Model answer shown",
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
      "noch keine": "none yet",
      "Fester Mini-Rollout": "Fixed mini Rollout",
      "Prompt [7,8] · Padding-ID 0": "Prompt [7,8] · Padding ID 0",
      "Antwort 1 [21,22], Advantage +1, full tokens [7,8,21,22], aligned target log-probs [−0.10,−0.20,−0.40].": "Response 1 [21,22], Advantage +1, full tokens [7,8,21,22], aligned target Log-Probabilities [−0.10,−0.20,−0.40].",
      "Antwort 2 [31], Advantage −1, full tokens [7,8,31,0], aligned target log-probs [−0.30,−0.60,−9.00].": "Response 2 [31], Advantage −1, full tokens [7,8,31,0], aligned target Log-Probabilities [−0.30,−0.60,−9.00].",
      "Die Log-Probabilities sind bereits entlang der shifted labels gathered. Deine Aufgabe ist, Shift, Maske, Lossvorzeichen und Reduktion korrekt zusammenzusetzen.": "The Log-Probabilities are already gathered along the shifted labels. Your task is to assemble the Shift, mask, Loss sign, and reduction correctly.",
      "Objektiver Transfer-Kurzcheck": "Objective transfer quick check",
      "1. Welche labels und response_mask sind korrekt?": "1. Which labels and response_mask are correct?",
      "2. Welche Sequenzmittel entstehen aus −A·log p?": "2. Which sequence means result from −A·log p?",
      "0.30 und −0.60": "0.30 and −0.60",
      "−0.30 und 0.60": "−0.30 and 0.60",
      "0.20 und −0.20": "0.20 and −0.20",
      "3. Standard: erst je Sequenz mitteln, dann B mitteln": "3. Standard: average each sequence first, then average over B",
      "Geführte Herleitung öffnen, wenn du feststeckst": "Open the guided derivation if you get stuck",
      "Shift:": "Shift:",
      "input_ids sind jeweils die ersten drei Tokens; labels sind die letzten drei. Logits an der ersten Eingabeposition 7 sagen deshalb Label 8 voraus.": "input_ids are the first three tokens in each row; labels are the last three. Logits at the first input position 7 therefore predict label 8.",
      "Mask:": "Mask:",
      "Auf der Labelachse zählen nur 21, 22 und 31 als Antworttoken. Promptlabel 8 und Paddinglabel 0 erhalten Gewicht null.": "Only 21, 22, and 31 count as response tokens on the label axis. Prompt label 8 and Padding label 0 receive zero weight.",
      "Token-Loss:": "Token Loss:",
      "−A·log p ergibt [[0,0.20,0.40],[0,−0.60,0]]. Ein negativer Advantage kehrt das Vorzeichen um.": "−A·log p gives [[0,0.20,0.40],[0,−0.60,0]]. A negative Advantage reverses the sign.",
      "Reduce:": "Reduce:",
      "Sequenzmittel sind 0.30 und −0.60; ihr Mittel ist −0.15. Ein globales Tokenmittel wäre (0.20+0.40−0.60)/3=0 und gewichtet lange Antworten anders.": "The sequence means are 0.30 and −0.60; their mean is −0.15. A global token mean would be (0.20+0.40−0.60)/3=0 and weights long responses differently.",
      "Shift-, Masken- und Loss-Pipeline": "Shift, mask, and Loss pipeline",
      "input_ids und labels nach Shift": "input_ids and labels after the Shift",
      "Vocabulary logits vor Gather": "Vocabulary Logits before Gather",
      "Sequenzloss nach maskierter Tokenreduktion": "Sequence Loss after masked token reduction",
      "Batchloss nach zweiter Reduktion": "Batch Loss after the second reduction",
      "Skalar": "Scalar",
      "Wichtige Invariante": "Key invariant",
      "labels, gathered log p und response_mask müssen dieselbe (B,T_shifted)-Shape und dieselbe Positionsbedeutung besitzen.": "labels, gathered log p, and response_mask must have the same (B,T_shifted) shape and the same positional meaning.",
      "Beantworte alle drei Policy-Loss-Kurzcheck-Felder.": "Answer all three Policy-Loss quick-check fields.",
      "Arbeite in dieser Reihenfolge: next-token Shift, Antwortmaske auf der Labelachse, Gather des beobachteten Labels, −A·log p, dann erst die zwei Reduktionen. Promptlabel 8 und Paddinglabel 0 müssen Gewicht null erhalten.": "Work in this order: next-token Shift, response mask on the label axis, Gather of the observed label, −A·log p, and only then the two reductions. Prompt label 8 and Padding label 0 must receive zero weight.",
      "Die gültigen Token-Losses sind 0.20, 0.40 und −0.60. Erst pro Sequenz gemittelt ergeben sie 0.30 und −0.60, danach −0.15. Ein globales Tokenmittel wäre dagegen 0 und würde lange Antworten stärker gewichten.": "The valid token Losses are 0.20, 0.40, and −0.60. Averaging within each sequence first gives 0.30 and −0.60, then −0.15. A global token mean would instead be 0 and would weight long responses more strongly.",
      "Transfer-Kurzcheck ohne Regler": "Transfer quick check without controls",
      "Fester Fall: B=2, T=5, D=12 und H=3. Leite d_head und die Shapes zuerst selbst her.": "Fixed case: B=2, T=5, D=12, and H=3. Derive d_head and the shapes yourself first.",
      "Q nach Head-Aufteilung": "Q after splitting into Heads",
      "QKᵀ Compatibility Scores": "QKᵀ compatibility scores",
      "Nur T wird von 5 auf 10 verdoppelt": "Only T is doubled from 5 to 10",
      "X-Elemente ×2 · Score-Elemente ×4 · Gewichte unverändert": "X elements ×2 · score elements ×4 · weights unchanged",
      "Alles einschließlich Gewichte ×2": "Everything including weights ×2",
      "X- und Score-Elemente ×2 · Gewichte ×2": "X and score elements ×2 · weights ×2",
      "Beantworte alle drei Shape-Kurzcheck-Felder.": "Answer all three shape quick-check fields.",
      "Berechne zuerst d_head=D/H=4. Head-Aufteilung ordnet dieselben D Merkmale als H·d_head an. In QKᵀ bleibt d_head die kontrahierte innere Achse; T_query und T_key bleiben als zwei getrennte Positionsachsen erhalten.": "First calculate d_head=D/H=4. Splitting into Heads rearranges the same D features as H·d_head. In QKᵀ, d_head is the contracted inner axis; T_query and T_key remain as two separate position axes.",
      "Q hat [B,H,T,d_head]=[2,3,5,4]. Q·Kᵀ kontrahiert nur d_head und ergibt [2,3,5,5]. Bei doppeltem T wachsen tokenweise Aktivierungen linear und die zwei Positionsachsen der Scores quadratisch; Gewichtsmatrizen hängen nicht von einer Eingabelänge ab.": "Q has [B,H,T,d_head]=[2,3,5,4]. Q·Kᵀ contracts only d_head and gives [2,3,5,5]. When T doubles, token-wise activations grow linearly and the two positional score axes grow quadratically; weight matrices do not depend on a particular input length.",
      "Gathered log p und response_mask": "Gathered log p and response_mask",
      "Jaccard Similarity für jedes Dokumentpaar": "Jaccard Similarity for every document pair",
      "Dokument": "Document",
      "Fünf kleine Failure Traces": "Five small failure traces",
      "Jeder Fall ist ein unabhängiges Toy-Beispiel. Suche nicht die schönste Umformulierung, sondern den gebrochenen Vertrag und den kleinsten Test, der ihn beweist.": "Each case is an independent toy example. Do not search for the prettiest rewrite; identify the broken contract and the smallest test that proves it.",
      "Welche Diagnose plus kleinster Test passen?": "Which diagnosis and smallest test fit?",
      "1 · Unregistrierte Layer": "1 · Unregistered layers",
      "Layer fehlen in named_parameters/state_dict · ModuleList verwenden und Parameternamen prüfen": "Layers are absent from named_parameters/state_dict · use ModuleList and inspect parameter names",
      "backward kann keine Python-Listen verarbeiten · nur den Loss testen": "backward cannot process Python lists · test only the Loss",
      "Listen verschieben sich automatisch, aber Linear braucht einen Buffer · Outputshape testen": "Lists move automatically, but Linear needs a Buffer · test the output shape",
      "2 · Tensor bleibt auf der CPU": "2 · Tensor remains on the CPU",
      "Plain Tensor folgt model.to nicht · als Buffer registrieren und Device im Test prüfen": "A plain tensor does not follow model.to · register it as a Buffer and check the device in the test",
      "Jeder konstante Tensor muss nn.Parameter sein · nur requires_grad prüfen": "Every constant tensor must be an nn.Parameter · check only requires_grad",
      "torch.ones ist immer Integer · zu float casten": "torch.ones is always integer · cast to float",
      "3 · View nach transpose": "3 · View after transpose",
      "transpose ändert Strides · reshape oder contiguous().view verwenden und Werteordnung testen": "transpose changes Strides · use reshape or contiguous().view and test value order",
      "transpose kopiert immer Daten · flatten ist deshalb grundsätzlich verboten": "transpose always copies data · flatten is therefore always forbidden",
      "view trennt immer Autograd · detach vermeiden": "view always disconnects Autograd · avoid detach",
      "4 · Gradient wächst von Step zu Step": "4 · Gradient grows from step to step",
      ".grad akkumuliert · vor jedem Update zero_grad und Gradienten zweier kontrollierter Steps vergleichen": ".grad accumulates · call zero_grad before each update and compare gradients across two controlled steps",
      "scheduler.step fehlt · nur die Learning Rate loggen": "scheduler.step is missing · log only the Learning Rate",
      "model.eval fehlt · Outputs ohne backward vergleichen": "model.eval is missing · compare outputs without backward",
      "5 · Loss ist noch ein Vektor": "5 · Loss is still a vector",
      "Beabsichtigte maskierte Reduktion und loss.ndim==0 · mit Handwerten und ungleichen Längen prüfen": "Intended masked reduction and loss.ndim==0 · test with hand-computable values and unequal lengths",
      "Jeder Loss muss Shape [B,T] behalten · backward ohne Änderung wiederholen": "Every Loss must retain shape [B,T] · repeat backward without changes",
      "mean ist in Language Models verboten · immer unnormalisiert summieren": "mean is forbidden in Language Models · always sum without normalization",
      "Alle fünf Diagnosen prüfen": "Check all five diagnoses",
      "Gemeinsame Herleitung öffnen": "Open the shared derivation",
      "Registrierung:": "Registration:",
      "ModuleList, ModuleDict oder Modulattribut machen Untermodulparameter für Optimizer, Device-Wechsel und state_dict sichtbar.": "ModuleList, ModuleDict, or a module attribute make submodule parameters visible to the Optimizer, device moves, and state_dict.",
      "Zustand:": "State:",
      "Ein Buffer ist nicht trainierbar, folgt aber dem Modul. Ein Plain Tensor besitzt diesen Vertrag nicht.": "A Buffer is not trainable, but follows the module. A plain tensor does not have that contract.",
      "Layout:": "Layout:",
      "transpose kann eine View mit anderer Stride-Reihenfolge erzeugen; reshape darf kopieren, view nicht.": "transpose can produce a View with a different Stride order; reshape may copy, while view may not.",
      "Autograd:": "Autograd:",
      "backward akkumuliert in .grad. zero_grad definiert die Grenze zwischen unabhängigen Updates.": "backward accumulates into .grad. zero_grad defines the boundary between independent updates.",
      "Reduction:": "Reduction:",
      "Die Achse und Maske definieren das Lernziel. Ein zufällig skalarer Wert reicht nicht; Handwerte müssen die beabsichtigte Gewichtung beweisen.": "The axis and mask define the learning objective. An accidentally scalar value is insufficient; hand-computable values must prove the intended weighting.",
      "PyTorch Debugging-Leiter": "PyTorch debugging ladder",
      "Die schnelle Debugging-Leiter": "The fast debugging ladder",
      "Repräsentation:": "Representation:",
      "Shape, Dtype, Device, Strides und Achsenbedeutung notieren.": "Write down shape, dtype, device, Strides, and axis meaning.",
      "Parameter, Buffer, Submodule, Gradienten und Optimizerhistorie getrennt inventarisieren.": "Inventory parameters, Buffers, submodules, gradients, and Optimizer history separately.",
      "Kleinster Test:": "Smallest test:",
      "Nicht das Gesamtmodell starten; einen handrechenbaren, nichtquadratischen oder zweiten Step isolieren.": "Do not run the full model; isolate a hand-computable, non-square, or second-step case.",
      "Beweis:": "Evidence:",
      "Wert, Shape, Gradient, Registrierung oder Save/Reload mit der passenden Assertion prüfen.": "Check value, shape, gradient, registration, or Save/Reload with the appropriate assertion.",
      "Test auswählen": "Select the test",
      "Tensorwerte vergleichen": "Compare tensor values",
      "Registrierung prüfen": "Check registration",
      "Gradienten prüfen": "Check gradients",
      "Die Snippets sind absichtlich isomorphe Toy-Fälle und keine Implementierungen aus dem Assignment.": "The snippets are deliberately isomorphic toy cases, not implementations from the assignment.",
      "Beantworte alle fünf PyTorch-Diagnosen.": "Answer all five PyTorch diagnoses.",
      "Mindestens ein Vertrag ist noch falsch zugeordnet.": "At least one contract is still matched incorrectly.",
      "Beginne beim ersten geöffneten Fall: Welcher Zustand oder welche Tensor-Metadaten ändern sich außerhalb dieses einzelnen Forward Pass, und welche Assertion würde genau das sichtbar machen?": "Start with the first opened case: which state or tensor metadata changes outside this single Forward Pass, and which assertion would expose exactly that?",
      "✓ Fünf Debugging-Verträge bestanden": "✓ Five debugging contracts passed",
      "Du hast Registrierung, Buffer-Device, Strides, Gradientenzustand und skalare Lossreduktion jeweils mit einem passenden trennenden Test verbunden.": "You matched registration, Buffer device placement, Strides, gradient state, and scalar Loss reduction with an appropriate discriminating test.",
      "Drei Fragen an dieselben Dokumente": "Three questions for the same documents",
      "Auswahlmethode": "Selection method",
      "Target LM / KenLM · niedrigste Perplexity": "Target LM / KenLM · lowest Perplexity",
      "fastText · höchstes p(Target|x)": "fastText · highest p(Target|x)",
      "DSIR · höchstes p_T(x)/p_R(x)": "DSIR · highest p_T(x)/p_R(x)",
      "Die Werte sind feste Toy-Scores, keine Assignment-Daten. Sage die Rangfolge voraus, bevor du die Methode wechselst.": "These are fixed toy scores, not assignment data. Predict the ranking before switching methods.",
      "Target LM wählt": "Target LM selects",
      "fastText wählt": "fastText selects",
      "DSIR wählt": "DSIR selects",
      "Interaktiver Vergleich von KenLM, fastText und DSIR": "Interactive comparison of KenLM, fastText, and DSIR",
      "Bit Budget & Hashes": "Bit Budget & Hashes",
      "Bits m": "Bits m",
      "Eingefügte Elemente n": "Inserted elements n",
      "Hash Functions k": "Hash Functions k",
      "Die Formel nimmt gleichmäßig verteilte, hinreichend unabhängige Hashes an. Reale Hashqualität und Query-Verteilung müssen zusätzlich gemessen werden.": "The formula assumes uniformly distributed, sufficiently independent hashes. Real hash quality and the query distribution must also be measured.",
      "Objektiver Transfer-Kurzcheck · m=100, n=10": "Objective transfer quick check · m=100, n=10",
      "Nächstes ganzzahliges k*": "Nearest integer k*",
      "Ein geprüftes Bit ist null": "One tested bit is zero",
      "Definitiv nicht enthalten": "Definitely absent",
      "Möglicherweise enthalten": "Possibly present",
      "k über das Optimum hinaus erhöhen": "Increase k beyond the optimum",
      "Die FPR steigt schließlich wieder": "FPR eventually rises again",
      "Die FPR sinkt immer weiter": "FPR keeps decreasing",
      "Interaktiver Bloom-Filter-Simulator": "Interactive Bloom Filter simulator",
      "✓ Drei Filterziele getrennt": "✓ Three filtering objectives separated",
      "Target LM: A wegen kleinster Perplexity. fastText: C wegen größtem p(Target|x). DSIR: B wegen größtem Ratio 0,20/0,10=2.": "Target LM: A because it has the lowest Perplexity. fastText: C because it has the highest p(Target|x). DSIR: B because it has the largest ratio, 0.20/0.10=2.",
      "✓ Bloom-Vertrag verstanden": "✓ Bloom contract understood",
      "k*=(100/10)ln2≈6,93, also zuerst k=7 prüfen. Ein Nullbit beweist Abwesenheit; oberhalb des Optimums überwiegt zusätzliche Bitbelegung und die FPR steigt wieder.": "k*=(100/10)ln2≈6.93, so test k=7 first. A zero bit proves absence; beyond the optimum, additional Bit-Array occupancy dominates and FPR rises again.",
      "häufig im Target, aber noch häufiger im Raw Corpus": "common in the target, but even more common in the raw corpus",
      "im Target relativ zum Raw Corpus überrepräsentiert": "overrepresented in the target relative to the raw corpus",
      "stärkstes Classifier-Label, aber schwache Target-Likelihood": "strongest classifier label, but weak target likelihood",
      "Wie vertraut ist x unter dem Target Language Model?": "How familiar is x under the target Language Model?",
      "Wie wahrscheinlich weist der Classifier x dem Target-Label zu?": "How likely is the classifier to assign x to the target label?",
      "Wie stark ist x im Target relativ zum Raw Corpus vertreten?": "How strongly is x represented in the target relative to the raw corpus?",
      "niedrigste PPL": "lowest PPL",
      "höchstes p(Target|x)": "highest p(Target|x)",
      "höchstes p_T/p_R": "highest p_T/p_R",
      "Gleiche Dokumente, andere Zielfunktion": "Same documents, different objective",
      "Aktuelle Frage": "Current question",
      "Auswahl nach": "Selection by",
      "Im echten DSIR sind w̃ Resampling-Wahrscheinlichkeiten; der größte Wert ist nicht bei jedem Sample garantiert.": "In actual DSIR, w̃ values are resampling probabilities; the largest value is not guaranteed to win every sample.",
      "Das Ranking beantwortet nur die gewählte Modellfrage, keine universelle Datenqualität.": "The ranking answers only the selected modeling question, not universal data quality.",
      "Rechnung A versus B": "Calculation for A versus B",
      "B hat trotz kleinerem Target-Score das viermal größere Density Ratio.": "Despite its lower target score, B has four times the density ratio.",
      "Beantworte alle drei Filter-Kurzchecks.": "Answer all three filtering quick checks.",
      "Nutze pro Spalte nur die passende Regel: kleinste Perplexity, größte Class Probability oder größtes Density Ratio p_T/p_R.": "Use only the relevant rule for each column: lowest Perplexity, highest class probability, or largest density ratio p_T/p_R.",
      "Membership-Budget": "Membership budget",
      "Bit bleibt null": "Bit remains zero",
      "Erwartete Bitbelegung": "Expected Bit-Array occupancy",
      "Standardmodell-FPR": "Standard-model FPR",
      "Exponentialapproximation": "Exponential approximation",
      "Optimale Hashzahl": "Optimal number of hashes",
      "Schematische erwartete Bitbelegung": "Schematic expected Bit-Array occupancy",
      "Die 24 Zellen visualisieren nur den erwarteten Anteil; sie sind kein konkreter Hashlauf.": "The 24 cells visualize only the expected fraction; they are not one concrete hashing run.",
      "k liegt nahe am theoretischen Optimum.": "k is close to the theoretical optimum.",
      "k liegt deutlich neben dem theoretischen Optimum.": "k is far from the theoretical optimum.",
      "Vergleiche benachbarte ganze k und miss reale negative Queries; die Formel ist ein Modell unter Hashannahmen.": "Compare neighboring integer values of k and measure real negative queries; the formula is a model based on hashing assumptions.",
      "Beantworte alle drei Bloom-Kurzchecks.": "Answer all three Bloom quick checks.",
      "Rechne k*=(m/n)ln2 und trenne Query-Strenge von Bitbelegung: zusätzliche Hashes verbessern nicht monoton.": "Calculate k*=(m/n)ln2 and separate query strictness from Bit-Array occupancy: additional hashes do not improve performance monotonically.",
      "Schritt und Strategie": "Step and strategy",
      "Merges anwenden · Tokenizer.encode": "Apply merges · Tokenizer.encode",
      "Datei streamen · Tokenizer.encode_iterable": "Stream a file · Tokenizer.encode_iterable",
      "Eingabetext": "Input text",
      "Gewählte Strategie": "Chosen strategy",
      "Blockgröße in Zeichen · wirkt nur bei festen Blöcken": "Block size in characters · only affects fixed blocks",
      "Der Tokenizer ist bereits trainiert; hier wird er nur angewandt. Sage vor jedem Wechsel voraus, ob sich die ID-Folge überhaupt ändert. Jede falsche Strategie sieht bei mindestens einer Einstellung völlig korrekt aus – genau das ist der Inhalt dieses Labs.": "The tokenizer is already trained; here it is only applied. Before every change, predict whether the ID sequence changes at all. Every wrong strategy looks perfectly correct under at least one setting – that is exactly what this lab is about.",
      "1. Wie zerlegt dieser Tokenizer das Pretoken „the“?": "1. How does this tokenizer split the pretoken „the“?",
      "„t“ + „he“": "„t“ + „he“",
      "„th“ + „e“": "„th“ + „e“",
      "„t“ + „h“ + „e“": "„t“ + „h“ + „e“",
      "2. Was entscheidet darüber?": "2. What decides that?",
      "Der Erzeugungsrang: (h,e) entstand als Rang 2, (t,h) erst als Rang 4": "The creation rank: (h,e) was created as rank 2, (t,h) only as rank 4",
      "Die Länge: der längere Vokabulareintrag gewinnt": "Length: the longer vocabulary entry wins",
      "Die Richtung: Pretokens werden von rechts nach links verarbeitet": "Direction: pretokens are processed from right to left",
      "3. Welche Streaming-Strategie liefert dieselben IDs wie die ganze Datei und hält den Speicher trotzdem beschränkt?": "3. Which streaming strategy returns the same IDs as the whole file and still keeps memory bounded?",
      "An den Dokumentgrenzen chunken, die das Special Token markiert": "Chunk at the document boundaries marked by the special token",
      "Blöcke fester Zeichenzahl lesen": "Read blocks of a fixed number of characters",
      "Die ganze Datei auf einmal einlesen": "Read the whole file at once",
      "Interaktiver Encoding- und Streaming-Rechner": "Interactive encoding and streaming calculator",
      "„that hat“ · keine Überlappung zwischen gelernten Tokens": "„that hat“ · no overlap between learned tokens",
      "„the that“ · „th“ und „he“ greifen im ersten Pretoken ineinander": "„the that“ · „th“ and „he“ interlock in the first pretoken",
      "„hehe the“ · dasselbe Paar kommt im Pretoken zweimal vor": "„hehe the“ · the same pair occurs twice inside the pretoken",
      "Genau so sieht der Text aus, an dem eine falsche Encode-Strategie nie auffällt: alle vier Strategien liefern dieselbe ID-Folge. Ein selbstgeschriebener Test mit diesem Satz beweist deshalb nichts.": "This is exactly the kind of text on which a wrong encoding strategy never shows up: all four strategies return the same ID sequence. A self-written test using this sentence therefore proves nothing.",
      "Im Pretoken „the“ passen zwei gelernte Tokens auf dieselben Zeichen: „th“ (Rang 4) und „he“ (Rang 2). Nur eines von beiden kann gebildet werden. Vergleiche nur das erste Pretoken – das zweite ist bei allen Strategien gleich.": "Inside the pretoken „the“ two learned tokens fit the same characters: „th“ (rank 4) and „he“ (rank 2). Only one of them can be formed. Compare only the first pretoken – the second is identical under all strategies.",
      "„hehe“ enthält (h,e) an zwei Stellen. Eine Strategie, die jeden Rang nur einmal anwendet, verrät sich genau hier – und nur hier.": "„hehe“ contains (h,e) in two places. A strategy that applies each rank only once gives itself away exactly here – and only here.",
      "korrekt · Merge-Liste von Rang 1 bis R, jeder Rang an allen Fundstellen": "correct · merge list from rank 1 to R, every rank at every occurrence",
      "das im Eingabetext häufigste Paar zuerst mergen": "merge the pair that is most frequent in the input text first",
      "an jeder Position den längsten passenden Vokabulareintrag nehmen": "take the longest matching vocabulary entry at every position",
      "jeden Rang nur an der ersten Fundstelle anwenden": "apply each rank only at the first occurrence",
      "Genau das verlangt A1: die gelernten Merges werden in ihrer Erzeugungsreihenfolge angewandt. Rang 2 verschmilzt (h,e), lange bevor Rang 4 (t,h) überhaupt geprüft wird – deshalb entsteht in „the“ das Paar „t“+„he“ und nicht „th“+„e“. Die Häufigkeit im Eingabetext spielt hier keine Rolle mehr; sie hat beim Training bereits entschieden, welchen Rang eine Regel bekommt.": "This is exactly what A1 requires: the learned merges are applied in their creation order. Rank 2 merges (h,e) long before rank 4 (t,h) is even checked – which is why „the“ becomes „t“+„he“ and not „th“+„e“. Frequency in the input text plays no role at this point; it already decided during training which rank a rule received.",
      "Diese Strategie wendet die Trainingsregel ein zweites Mal an, diesmal auf den Eingabetext. Das ist der häufigste Denkfehler beim Schritt von train_bpe zu Tokenizer.encode. Bei vielen Texten liefert sie zufällig dasselbe Ergebnis, weil das häufigste Paar oft auch das mit dem kleinsten Rang ist. Sobald zwei gelernte Tokens um dieselben Zeichen konkurrieren, entscheidet sie falsch – und das Ergebnis hängt zusätzlich davon ab, welcher Text gerade enkodiert wird.": "This strategy applies the training rule a second time, now to the input text. It is the most common misconception in the step from train_bpe to Tokenizer.encode. For many texts it coincidentally returns the same result, because the most frequent pair is often also the one with the smallest rank. As soon as two learned tokens compete for the same characters, it decides wrongly – and the result additionally depends on which text is being encoded right now.",
      "Das ist Greedy-Longest-Match, die Regel von WordPiece-artigen Tokenizern – nicht die von BPE. Sie liest nur das Vokabular und ignoriert die Merge-Ränge vollständig. Ein A1-Tokenizer, der so gebaut ist, besteht viele eigene Tests und scheitert am Vergleich mit der Referenzimplementierung, weil dort die Reihenfolge der Merges Teil des Tokenizerzustands ist.": "This is greedy longest match, the rule of WordPiece-style tokenizers – not the rule of BPE. It reads only the vocabulary and ignores the merge ranks entirely. An A1 tokenizer built this way passes many self-written tests and fails against the reference implementation, because there the order of the merges is part of the tokenizer state.",
      "Ein Off-by-one im Schleifenkörper: nach der ersten Ersetzung wird zum nächsten Rang gesprungen, statt das Pretoken erneut zu durchsuchen. Bei Pretokens, in denen ein Paar nur einmal vorkommt, ist das Ergebnis korrekt – der Fehler zeigt sich erst bei Wiederholungen und macht die Sequenz dann länger als nötig.": "An off-by-one in the loop body: after the first replacement it jumps to the next rank instead of scanning the pretoken again. For pretokens in which a pair occurs only once the result is correct – the bug shows up only on repetitions and then makes the sequence longer than necessary.",
      "ganze Datei lesen und in einem Rutsch enkodieren": "read the whole file and encode it in one go",
      "feste Blöcke mit fester Zeichenzahl": "fixed blocks with a fixed number of characters",
      "an den Dokumentgrenzen chunken, die das Special Token markiert": "chunk at the document boundaries marked by the special token",
      "ganze Datei, aber ohne das Special Token auszuschneiden": "whole file, but without cutting out the special token",
      "Die ID-Folge stimmt – als Referenz ist diese Variante genau richtig. Sie erfüllt die Aufgabe trotzdem nicht: der Peak wächst mit der Dateigröße, und A1 verlangt encode_iterable ausdrücklich für Dateien, die nicht in den Speicher passen. Lies den Peak-Wert und vergleiche ihn mit der korrekten Variante.": "The ID sequence is right – as a reference this variant is exactly correct. It still does not solve the task: the peak grows with the file size, and A1 requires encode_iterable explicitly for files that do not fit into memory. Read the peak value and compare it with the correct variant.",
      "Der Speicher ist beschränkt, aber der Schnitt liegt an einer beliebigen Stelle: mitten in einem Pretoken oder mitten im Special Token. Beides darf der Tokenizer nie trennen. Stelle die Blockgröße durch – bei kleinen Blöcken zerfällt der Text sichtbar in zu viele Tokens, bei großen stimmt die Tokenzahl manchmal exakt und die ID-Folge trotzdem nicht.": "Memory is bounded, but the cut lands at an arbitrary position: in the middle of a pretoken or in the middle of the special token. The tokenizer must never split either. Step through the block sizes – with small blocks the text visibly falls apart into too many tokens, with large ones the token count is sometimes exactly right and the ID sequence still is not.",
      "Die einzige Variante, die beides erfüllt: exakt dieselbe ID-Folge wie über die ganze Datei und ein Peak, der nur vom längsten Dokument abhängt, nicht von der Dateigröße. Der Grund ist strukturell – über ein Special Token hinweg wird ohnehin nie gemerged, also ist genau dort ein Schnitt ohne Wirkung. So funktioniert encode_iterable in A1.": "The only variant that satisfies both: exactly the same ID sequence as over the whole file, and a peak that depends only on the longest document, not on the file size. The reason is structural – merging never happens across a special token anyway, so a cut there has no effect at all. This is how encode_iterable works in A1.",
      "Hier wird <|endoftext|> wie gewöhnlicher Text behandelt und in seine Einzelzeichen zerlegt. Statt einer einzigen ID entstehen viele, und das Dokumentende verschwindet aus der Sequenz. Die mit ? markierten Zeichen kennt dieses Mini-Vokabular nicht einmal, weil es nur die Zeichen des Trainingskorpus enthält; ein echtes Byte-Level-Vokabular hätte für sie zwar IDs, aber ebenso wenig Bedeutung. Das Ausschneiden der Special Tokens muss deshalb vor der Pretokenization passieren – in beiden Encode-Wegen gleich.": "Here <|endoftext|> is treated like ordinary text and split into its individual characters. Instead of one single ID many appear, and the document boundary disappears from the sequence. The characters marked with ? are not even known to this mini vocabulary, because it contains only the characters of the training corpus; a real byte-level vocabulary would have IDs for them, but just as little meaning. Cutting out the special tokens therefore has to happen before pretokenization – identically in both encoding paths.",
      "Rang": "Rank",
      "Der trainierte Mini-Tokenizer": "The trained mini tokenizer",
      "Trainiert auf dem Korpus „he he ate that at“ mit fünf Merges, nach genau der A1-Regel: häufigstes Paar, bei Gleichstand das lexikographisch größere. Dieses Lab benutzt ihn ausschließlich, es trainiert nicht.": "Trained on the corpus „he he ate that at“ with five merges, following exactly the A1 rule: most frequent pair, ties broken by the lexicographically greater pair. This lab only uses it; it does not train.",
      "Merges auf neuen Text anwenden": "Applying merges to new text",
      "Pretokens": "Pretokens",
      "Zerlegung der gewählten Strategie": "Split produced by the chosen strategy",
      "ID-Folge": "ID sequence",
      "Tokens": "tokens",
      "Merge-Liste in Erzeugungsreihenfolge": "merge list in creation order",
      "Erste abweichende Position": "First differing position",
      "Korrekte Strategie:": "Correct strategy:",
      "Falsche Strategie, hier unauffällig:": "Wrong strategy, inconspicuous here:",
      "Falsche Strategie, hier sichtbar:": "Wrong strategy, visible here:",
      "Bei diesem Eingabetext stimmt das Ergebnis zufällig. Wechsle den Eingabefall, bis die Abweichung sichtbar wird – genau solche Texte fehlen in selbstgeschriebenen Tests.": "For this input text the result happens to be right. Switch the input case until the deviation becomes visible – texts like that are exactly what self-written tests are missing.",
      "Der Test in tests/test_tokenizer.py vergleicht die ID-Folge Element für Element gegen die Referenz. Eine Abweichung an einer einzigen Position genügt zum Fehlschlag.": "The test in tests/test_tokenizer.py compares the ID sequence element by element against the reference. A deviation at a single position is enough to fail.",
      "encode_iterable über eine Datei mit zwei Dokumenten": "encode_iterable over a file with two documents",
      "Der gesamte Text der simulierten Datei:": "The complete text of the simulated file:",
      "Zeichen": "characters",
      "Gelesene Stücke": "Pieces that were read",
      "Erzeugte Tokens": "Tokens produced",
      "Gleichzeitig im Speicher (Peak)": "Held in memory at once (peak)",
      "· beschränkt": "· bounded",
      "· wächst mit der Dateigröße": "· grows with the file size",
      "Referenz": "Reference",
      "Gesamttext": "full text",
      "A1-Anforderung: identische IDs und beschränkter Peak": "A1 requirement: identical IDs and a bounded peak",
      "IDs": "IDs",
      "Speicher": "memory",
      "Erfüllt beide Anforderungen:": "Satisfies both requirements:",
      "Erfüllt nicht beide Anforderungen:": "Does not satisfy both requirements:",
      "Diese Blockgröße trifft zufällig alle Grenzen richtig. Verschiebe den Regler um eins – die Strategie ist damit nicht korrekt, sondern nur gerade glücklich.": "This block size happens to hit every boundary correctly. Move the slider by one – that does not make the strategy correct, only currently lucky.",
      "Gleich viele Tokens, andere IDs: zwei Fehler an verschiedenen Stellen haben sich in der Länge ausgeglichen. Genau deshalb prüft der Test die ID-Folge und nicht die Tokenzahl.": "Same number of tokens, different IDs: two errors in different places cancelled out in length. This is exactly why the test checks the ID sequence and not the token count.",
      "„the“ zerfällt in „t“ + „he“, obwohl „th“ im Vokabular steht und genauso lang ist. Entscheidend ist allein der Erzeugungsrang: (h,e) entstand als Rang 2, (t,h) erst als Rang 4 – und wenn „he“ gebildet ist, gibt es kein „t“+„h“ mehr zu mergen. Beim Streaming folgt daraus dasselbe Prinzip eine Ebene höher: nur ein Schnitt an einer Grenze, an der ohnehin nie gemerged wird, lässt die ID-Folge unverändert. Das Special Token markiert genau solche Grenzen und hält den Speicher trotzdem auf ein Dokument beschränkt.": "„the“ splits into „t“ + „he“ even though „th“ is in the vocabulary and is exactly as long. What decides is the creation rank alone: (h,e) was created as rank 2, (t,h) only as rank 4 – and once „he“ has been formed there is no „t“+„h“ left to merge. For streaming the same principle applies one level up: only a cut at a boundary where merging never happens anyway leaves the ID sequence unchanged. The special token marks exactly such boundaries and still keeps memory bounded to a single document.",
      "Gehe die Merge-Liste von oben nach unten durch und frage bei jedem Rang, ob sein Paar im Pretoken noch vorhanden ist. Die Länge eines Vokabulareintrags spielt dabei keine Rolle. Frage beim Streaming, an welchen Stellen der Tokenizer ohnehin nie mergen würde – nur dort darf geschnitten werden.": "Walk the merge list from top to bottom and ask at every rank whether its pair is still present in the pretoken. The length of a vocabulary entry plays no role. For streaming, ask where the tokenizer would never merge anyway – only there may a cut be made."
  }
});
