# Contract: Exercise Format

This contract defines the exact format for each of the three exercise types that appear
at the end of every chapter. All exercises MUST conform to this specification.

---

## Exercise 1: Recall

**Purpose**: Verify basic comprehension of the chapter's primary concept.

**Difficulty**: Beginner.

**Format**: Open-ended short-answer question.

```
**Exercise 1 — Recall**

In your own words: [plain-language question about the chapter's primary concept].

*(Hint: Think about the analogy we used earlier in this chapter.)*
```

**Rules**:

- MUST be answerable using only knowledge from the current chapter.
- MUST reference the chapter's analogy in the hint.
- MUST NOT require any prior AWS experience to answer.
- MUST be answerable in 2–4 sentences.

---

## Exercise 2: SAA-C03 Scenario

**Purpose**: Simulate an actual exam question in the format the reader will encounter.

**Difficulty**: Intermediate.

**Format**: Scenario-based multiple-choice or multiple-response.

```
**Exercise 2 — Exam Practice**

*Scenario*: [2–4 sentence scenario describing a business problem that maps to this chapter's
concept. The scenario MUST NOT mention the AWS service by name. It MUST describe symptoms
or requirements that point toward the correct service.]

Which of the following would BEST address this requirement?

A) [Correct answer — the service or approach taught in this chapter]
B) [Plausible distractor — a related service that almost fits but has a key limitation]
C) [Plausible distractor — a common wrong answer a candidate with partial knowledge might choose]
D) [Obvious wrong answer — present to provide contrast, not to trick]

---

**Hint 1**: [Points the reader toward the category of solution, not the specific service.
Example: "Think about what kind of storage the scenario requires."]

**Hint 2**: [Narrows the field. Example: "The scenario mentions that the files must be
accessible from anywhere. Which storage type fits that pattern?"]

**Hint 3**: [Points directly at the correct service without naming it explicitly.
Example: "We covered a service in this chapter that is designed exactly for this."]

---

**Answer**: A

**Explanation**: [2–4 sentences explaining why A is correct, using the language and
analogies from the chapter. Connects the scenario back to the Nimbus story where possible.]

**Why not B?**: [1–2 sentences explaining the key limitation that makes B wrong.]
**Why not C?**: [1–2 sentences explaining why C is a plausible but incorrect choice.]
**Why not D?**: [1 sentence.]

*SAA-C03 Domain: [Domain name] — [Task reference, e.g., Task 3.1]*
```

**Rules**:

- MUST have exactly 4 answer options (A, B, C, D) for multiple-choice questions.
- For multiple-response questions: MUST explicitly state "Select TWO" and have 5 options.
- MUST have exactly 3 progressive hints.
- MUST include distractor explanations for every wrong answer.
- MUST reference the SAA-C03 domain and task at the bottom.
- Scenarios MUST be grounded in realistic business situations, not abstract technical puzzles.
- Distractors MUST be plausible — they should be services a candidate with partial knowledge
  might reasonably consider.

---

## Exercise 3: Architecture Challenge

**Purpose**: Develop open-ended reasoning and architectural thinking.

**Difficulty**: Advanced.

**Optional in**: Chapters 00–07 (labeled as optional).

**Format**: Open-ended design prompt with no single correct answer.

```
**Exercise 3 — Architecture Challenge** *(Optional in early chapters)*

The Nimbus team is facing a new version of this chapter's problem:

[2–3 sentence extension of the Nimbus scenario that adds complexity — e.g., higher scale,
multi-region requirements, cost constraints, security concerns.]

Sketch your approach. There is no single correct answer, but your response should address:

- Which AWS service(s) would you use, and why?
- What is the main trade-off of your approach?
- What would you give up if budget were cut in half?

*(There are no hints for this exercise. The goal is to practice thinking, not to find
the right answer.)*
```

**Rules**:

- MUST NOT have a single "correct" answer.
- MUST ask the reader to consider at least one trade-off dimension (cost, security,
  or resilience).
- MUST be grounded in the Nimbus narrative from the current or previous chapters.
- MUST explicitly state "There is no single correct answer."
- MUST be marked optional in chapters 00–07.
- MUST NOT reference services not yet introduced in the book.
