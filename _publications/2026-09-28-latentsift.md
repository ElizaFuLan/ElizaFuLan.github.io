---
title: "LatentSift: Policy-State Filtering for Token-Efficient Verification of Software Engineering Agents"
collection: publications
category: preprints
permalink: /publication/2026-09-28-latentsift
excerpt: 'A token-free, execution-free filter that verifies software engineering agents with the hidden states the policy already produced, cutting total verification tokens by 49.1–62.1% at K=16 while hybrid Best@16 matches or improves on each agent&apos;s reference workflow.'
date: 2026-09-28
venue: 'arXiv preprint (in submission)'
paperurl: 'https://arxiv.org/abs/2609.36371'
citation: 'Han, Y., Jin, Y., Jandreau, T., &amp; Sun, J. (2026). &quot;LatentSift: Policy-State Filtering for Token-Efficient Verification of Software Engineering Agents.&quot; <i>arXiv preprint arXiv:2609.36371</i>.'
---

Test-time scaling improves software engineering agents by generating multiple candidate trajectories and selecting the best one, but verifying and selecting among these long interactions can consume as many tokens as generation itself. Existing hybrid workflows first apply an LLM-based execution-free (EF) verifier to every candidate before running tests. LatentSift replaces this first stage with a token-free, execution-free filter built on hidden states the policy already produces while generating the candidates: each candidate is represented by its reasoning, observation and function-call states, compared with positive and negative banks collected from successful and unsuccessful trajectories during policy training, and the distance scores are fused with a learned linear score to retain promising candidates for the execution-based stages.

On SWE-bench Verified, across three agents and two policy sizes, LatentSift cuts EF-verifier tokens by 66.6–81.0% and total verification tokens (including test generation) by 49.1–62.1% at K=16, while hybrid Best@16 matches or improves on each agent's reference workflow, rising from 59.26% to 60.06% on DeepSWE-Preview.
