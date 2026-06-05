\newpage

*Copyright © 2026 AI(2)M(2)IA*

*All rights reserved. No part of this publication may be reproduced, distributed,
or transmitted in any form or by any means, including photocopying, recording, or
other electronic or mechanical methods, without the prior written permission of
the publisher, except in the case of brief quotations embodied in critical reviews
and certain other noncommercial uses permitted by copyright law.*

*The story of Nimbus and its characters is fictional. Any resemblance to actual
persons, living or dead, or actual events is purely coincidental.*

*The AWS services, pricing models, best practices, and exam content described in
this book are based on publicly available documentation as of the publication date.
Amazon Web Services, AWS, and related marks are trademarks of Amazon.com, Inc.
or its affiliates. This book is an independent educational resource and is not
affiliated with, endorsed by, or sponsored by Amazon Web Services.*

*AWS pricing and service features change frequently. Always verify current
information at aws.amazon.com before making architectural or financial decisions.*

*The AWS Solutions Architect Associate (SAA-C03) exam is a real certification
exam. Visit aws.amazon.com/certification to register.*

*First Edition, 2026*

*Printed and distributed through Amazon KDP*

---

\newpage

# A Note on Method

This book was written with AI assistance and disclosed under the pen name AI(2)M(2)IA, in keeping with the practice of every volume on this shelf.

The curriculum you are about to follow — its premise, its characters, the shape of Nimbus's infrastructure from a restaurant phone line to a production-grade AWS architecture, the trade-offs the team makes under pressure and the ones they get wrong first — these were chosen by a human author and carried, service by service, through a long collaboration with a large language model. The cover was designed with the help of an image-generation model under the same direction. The ebook itself was prepared by automated tooling.

What you read is what was kept.

There is no claim in these pages of unaided authorship; there is also no claim that the machine alone is the author. The work, like the infrastructure it describes, is held up by layers that depend on each other.

---

\newpage

*For everyone who opened a browser, typed a command, and made something work —
and for everyone who opened a browser, typed a command, and learned from what
didn't.*

---

\newpage

# Preface

You have probably tried to learn AWS before.

Maybe you opened the documentation and, ten minutes later, found yourself staring at IAM policy syntax before you even understood what IAM was for.

Maybe you finished a video course and realized you still could not explain where a website actually lives.

Maybe you highlighted an exam guide, memorized service names, and then froze the first time a scenario asked what you would do if a database failed during dinner rush.

That is not your fault.

That is how cloud computing is usually taught: as a catalog first, and a system later.

This book works differently.

**You won't study AWS. You'll use it.**

We begin with a restaurant that is losing orders because the phone line is busy and there is no website.

From there, you will follow Maya, Tom, Priya, and Leo as they build Nimbus's infrastructure one decision at a time. Not in the neat order a certification syllabus would prefer, but in the messy order real systems demand.

By the end, Nimbus will be handling 18,000 daily orders: running across multiple Availability Zones, recovering automatically from failures, serving West Coast users in milliseconds through a content delivery network, processing every order through a real-time analytics pipeline, and keeping costs under control as the architecture grows up with the business.

Every AWS service in this book appears at the moment it becomes necessary. Not because a syllabus demands it. Because the system does.

**Who this book is for** If you learn better through problems than through documentation, this book was written for you. If you are preparing for the AWS Solutions Architect Associate certification (SAA-C03), this book is also for you: every exam domain is covered, and every chapter ends with Exam Tips and SAA-C03-style practice questions. If you are already working in engineering and want to understand *why* the architectural decisions work, not just what the services are called, you will find that reasoning on every page.

**What you will not find here** A shortcut. This is not a cram guide. It is longer than a cram guide because understanding takes longer than memorizing, and it is the understanding that transfers to your next role, your next system, and the production incident nobody documented properly.

**How to read this book** Read it like a novel the first time through. Let the architecture reveal itself as the team runs into real problems and makes real trade-offs. At the end of each chapter, stop and use the Exam Tips and exercises actively: cover the answers, reason through the scenario yourself, and only then check what happened.

When you finish, Nimbus will be in production. So will your understanding of AWS.

Let's begin.
