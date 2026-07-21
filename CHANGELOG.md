# Revision history

*Let's Build on AWS Together* is a living book. This file records what changed
in each revision, newest first.

---

## 2026-07-07

**Licensing and companions**

- Replaced the legacy "All rights reserved" notice with a free-culture
  disclaimer matching the book's actual license (CC BY-NC-SA 4.0): free to read,
  copy, translate, adapt, and share; no selling and no paywalling; asking for
  voluntary support is welcome, but it can never be a condition for reading.
  Includes plain examples (translating the book; building a new study guide on
  top of it).
- Propagated that disclaimer to **all 20 languages**.
- Added the companion links to the front matter: the repository, the free
  practice app, and the video playlist.
- Added a **"Last updated"** date to the front matter, so readers can tell how
  current the (fast-moving) AWS content is.

**Editorial revision — corrections**

A full editorial pass over the English chapters. Technical currency was
re-verified and found current; the following concrete corrections were applied:

| Chapter | Correction |
|---|---|
| 03 | Section title said the breach cost "$80,000 in Four Hours". The story's own figures are ~$3,400 for those four hours; the $80,000 is the total damage found later in the audit. Title corrected. |
| 06 | "EFS not available in all Regions" was outdated. Replaced with a limitation that is both true and exam-relevant: EFS is Linux/NFS only — Windows workloads need FSx for Windows File Server. |
| 15 | Prefix list ID `pl-63a5400a` is the **us-east-1** S3 gateway endpoint list; Nimbus runs in us-west-2. Corrected to `pl-68a54001`. |
| 16 | "Secrets Manager would have caught the static key" overstated the service. Secrets Manager stores and rotates secrets; it does not detect exposure. Rewritten to say what rotation actually buys you. |
| 23 | "S3 knows. It tracks last access time." Lifecycle transitions are **age**-based; access tracking is S3 Intelligent-Tiering / Storage Class Analysis. Corrected. |
| 26 | A line of dialogue appeared verbatim twice. The second instance is now a deliberate callback rather than a repeat. |
| 28 | "You can't go back from gp3 to gp2" — `ModifyVolume` does support it. Corrected, keeping the point that there is rarely a reason to. |
| 32 | ADR count was internally inconsistent ("the first ADR" vs `ADR-007` vs "three ADRs"). Reconciled: the review produced three ADRs, this is the first of them, and it is the seventh in the company's running sequence. |
| 32 | Post-credits teaser said "In the final chapter" about a chapter that is not the last. Corrected. |

**Verified and deliberately left unchanged**

- All exam answer keys (in-chapter exercises and the practice exam).
- AWS technical currency: the Amazon Data Firehose rename, the QLDB
  discontinuation, the Snow Family retirement, gp3 defaults, and the six
  Well-Architected pillars are all current and correctly framed.
- Mixed casing of `multi-AZ` / `Multi-AZ`, `well-architected` /
  `Well-Architected`, and `availability zone` — inspection confirmed the book
  already distinguishes the AWS feature name from the generic adjective, and
  some instances are literal API paths.
