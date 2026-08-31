---
permalink: /
title: "About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi, I'm Yuning Han, a PhD student in the Department of Computer & Information Science & Engineering (CISE) at the University of Florida. My research focuses on efficient LLM inference.

Feel free to reach out via [email](mailto:yuninghan@ufl.edu), or connect with me on [GitHub](https://github.com/ElizaFuLan), [LinkedIn](https://www.linkedin.com/in/yuning-han-827a56288/), or [Google Scholar](https://scholar.google.com/citations?user=QgPTwS8AAAAJ&hl=en).

Selected Publications
======

CATS: Cascaded Adaptive Tree Speculation for Memory-Limited LLM Inference Acceleration
------

![CATS cascaded adaptive tree speculation framework overview](/images/publications/cats-framework.png)

A self-speculative decoding framework for memory-limited LLM inference on edge devices: a lightweight draft adapter proposes a candidate token tree, a shallow verifier cheaply prunes it, and the target model confirms the survivors in a single pass — cutting target-model forward calls without raising peak memory. Achieves up to 5.08&times; wall-clock speedup with no loss in generation quality, outperforming the prior SOTA by up to 1.45&times;. *Under review, NeurIPS 2026.*

[Read Paper](https://arxiv.org/abs/2605.11186){: .btn .btn--primary}
[Code](https://github.com/ElizaFuLan/CATS){: .btn}

UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models
------

![UIBDiffusion trigger generation and forward/backward diffusion process](/images/publications/uibdiffusion.jpg)

A universal, imperceptible backdoor trigger for diffusion models built from universal adversarial perturbations: image- and model-agnostic, it drives a high attack success rate on triggered inputs while keeping generation quality high on clean data, and evades state-of-the-art backdoor defenses (Elijah, TERD). **CVPR 2025.**

[Read Paper](https://ieeexplore.ieee.org/abstract/document/11093857){: .btn .btn--primary}
[Code](https://github.com/TheLaoLab/UIBDiffusion){: .btn}
