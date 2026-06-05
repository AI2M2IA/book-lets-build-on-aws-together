# Contract: Chapter Structure

This contract defines what every chapter MUST contain, in what order, and what
constraints apply to each section. It is the authoritative structure reference for
all chapter generation tasks.

---

## Required Sections (in order)

### 1. Light Opening

**Purpose**: Give the reader a moment to transition from the real world into the story.

**Length**: 1–3 short paragraphs.

**Rules**:

- MUST reference a physical or sensory action (pause, walk, stretch, water, coffee, breath).
- MUST feel like a real moment, not a filler sentence.
- MUST NOT introduce any AWS concept, character dialogue, or technical term.

**Accepted patterns**:

- A quiet moment before the characters get back to work.
- A brief scene-setting description of where the characters are.
- A reflection on the previous chapter's lesson, framed as a feeling (not a summary).

---

### 2. Recap of Previous Chapter

**Purpose**: Orient readers who may not have read the previous chapter recently.

**Length**: 1 paragraph (3–5 sentences maximum).

**Rules**:

- MUST be subtle — it is a story beat, not a bullet-point summary.
- MUST reference at least one character from the previous chapter.
- MUST connect the previous chapter's resolution to the current chapter's opening problem.
- MUST NOT repeat more than one technical term from the previous chapter verbatim.

**Accepted pattern**: "Last time, Maya and the team had figured out [vague reference to
previous lesson]. It seemed to work. But now [new problem is emerging]."

---

### 3. Concrete Situation or Problem

**Purpose**: Present the problem the chapter will solve, grounded in the Nimbus narrative.

**Length**: 2–5 paragraphs.

**Rules**:

- MUST describe a situation a non-technical reader can picture.
- MUST NOT name the AWS service that will solve it (the characters don't know yet).
- MUST make the reader feel the problem — not just understand it intellectually.
- MUST end with an implicit or explicit question: "So what do we do?"

---

### 4. Discovery of the Concept

**Purpose**: The characters encounter the AWS concept for the first time.

**Length**: 3–6 paragraphs.

**Rules**:

- MUST introduce the concept through character action or dialogue, not narration alone.
- MUST use the chapter's designated analogy before any technical term is used.
- The concept's name (e.g., "Amazon S3") MUST appear only after the analogy has landed.
- At least one character MUST express confusion or ask a naive question before the concept
  is clarified — this models the reader's expected internal state.

---

### 5. Simple Formalization

**Purpose**: Give the concept a name and a crisp one-line definition.

**Length**: 1 short paragraph or a highlighted callout box.

**Rules**:

- MUST state the concept's official AWS name.
- MUST give a plain-language definition in one sentence.
- MUST NOT yet enumerate features, pricing, or edge cases.

**Accepted pattern**: "Amazon S3 — or Simple Storage Service — is AWS's way of storing
files in the cloud. Think of it as a hard drive that lives on the internet and never runs
out of space."

---

### 6. Plain-Language Explanation

**Purpose**: Explain how the concept works at a conceptual level.

**Length**: 3–8 paragraphs.

**Rules**:

- MUST avoid jargon not yet introduced in the book.
- MUST explain at least one strength and one limitation.
- MUST use short sentences and vary paragraph length.
- MUST include at least one question addressed to the reader ("You might be wondering…",
  "So why not just…").
- MUST NOT include pricing, console steps, or CLI commands.

---

### 7. Practical Example

**Purpose**: Show the concept in action within the Nimbus narrative.

**Length**: 2–5 paragraphs.

**Rules**:

- MUST be grounded in the chapter's Nimbus problem from section 3.
- MUST show the concept solving (or partially solving) the problem.
- MUST involve at least one named character actively using or deciding on the concept.
- MUST show a consequence — what happens after they apply the concept.

---

### 8. Variation or Refinement

**Purpose**: Introduce a contrasting option, a common mistake, or a more advanced use case.

**Length**: 2–4 paragraphs.

**Rules**:

- MUST present at least one explicit trade-off: "If you do X, you get Y but lose Z."
- MUST connect the variation to the SAA-C03 exam reasoning ("On the exam, you might see…").
- MUST NOT introduce a new primary concept — this section expands on the chapter's concept only.

---

### 8b. Strengths and Limitations

**Purpose**: Give the reader a scannable judgment of when the chapter's concept is the right
choice — and when it isn't.

**Length**: 2–6 short paragraphs or labeled bold blocks (e.g., "**X is the right choice
for**: …" / "**When X is not what you need**: …").

**Rules**:

- Appears as a `## Strengths and Limitations` heading, immediately before the Summary.
- MUST state at least one situation where the concept fits and one where it does not.
- MAY name related or alternative AWS services as the better fit for the "not" cases
  (e.g., EFS vs. EBS vs. S3; ALB instead of Route 53 for in-region load balancing).
- Present in every concept chapter (00–32); the closing chapters (33–34) omit it.

---

### 9. Short Summary

**Purpose**: Consolidate the chapter's key learning in a scannable format.

**Length**: 1 paragraph + 3–5 bullet points.

**Rules**:

- The paragraph MUST be written in the same narrative voice as the rest of the chapter.
- Bullet points MUST be concise (one line each).
- Bullet points MUST cover: primary concept, one strength, one limitation, and the
  chapter's key trade-off.
- MUST NOT introduce any new information.

---

### 10. Exercises + Exam Tips

**Purpose**: Reinforce learning and prepare for SAA-C03.

**Length**: 3 exercises (see exercise-format.md for each exercise's contract).

**Rules**:

- Exercise order MUST be: (1) Recall, (2) SAA-C03 Scenario, (3) Architecture Challenge.
- Exam tips MUST appear as a labeled sub-section before or after the exercises.
- Exam tips MUST reference the specific SAA-C03 domain and task covered.
- Exam tips MUST be concise: 5–15 bullet points (typically 6–12), preceded by an italic
  line naming the SAA-C03 domain and task.
- Architecture Challenge MUST be marked optional in chapters 00–07.

---

### 11. Post-Credits Scene

**Purpose**: Maintain narrative momentum and create curiosity about the next chapter.

**Length**: 1–3 short paragraphs.

**Rules**:

- MUST reference a problem or situation the next chapter will explore.
- MUST NOT name the next chapter's AWS service.
- MUST leave a question unanswered (a cliffhanger, however subtle).
- MUST feel like the end of a TV episode, not the end of a textbook section.

---

## Prohibited Patterns (any section)

- Opening a chapter with a technical definition or an AWS service name.
- Using jargon that has not been introduced in a previous chapter without immediate
  plain-language clarification.
- Writing paragraphs longer than 8 sentences without a rhythm break.
- Introducing a new primary concept in the "Variation" section.
- Ending a chapter without a post-credits scene.
- Leaving a character out of a chapter for more than 5 consecutive chapters.
