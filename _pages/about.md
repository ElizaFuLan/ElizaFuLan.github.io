---
permalink: /
title: "About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
feature_row_cats:
  - image_path: publications/cats-framework.png
    alt: "CATS cascaded adaptive tree speculation framework overview"
    title: "CATS: Cascaded Adaptive Tree Speculation for Memory-Limited LLM Inference Acceleration"
    excerpt: "A self-speculative decoding framework for memory-limited LLM inference on edge devices: a lightweight draft adapter proposes a candidate token tree, a shallow verifier cheaply prunes it, and the target model confirms the survivors in a single pass — cutting target-model forward calls without raising peak memory. Achieves up to 5.08&times; wall-clock speedup with no loss in generation quality, outperforming the prior SOTA by up to 1.45&times;. *Under review, NeurIPS 2026.* &nbsp;[Code](https://github.com/ElizaFuLan/CATS){: .btn .btn--small}"
    url: "https://arxiv.org/abs/2605.11186"
    btn_label: "Read Paper"
    btn_class: "btn--primary"
feature_row_uib:
  - image_path: publications/uibdiffusion.jpg
    alt: "UIBDiffusion trigger generation and forward/backward diffusion process"
    title: "UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models"
    excerpt: "A universal, imperceptible backdoor trigger for diffusion models built from universal adversarial perturbations: image- and model-agnostic, it drives a high attack success rate on triggered inputs while keeping generation quality high on clean data, and evades state-of-the-art backdoor defenses (Elijah, TERD). **CVPR 2025.** &nbsp;[Code](https://github.com/TheLaoLab/UIBDiffusion){: .btn .btn--small}"
    url: "https://ieeexplore.ieee.org/abstract/document/11093857"
    btn_label: "Read Paper"
    btn_class: "btn--primary"
---

Hi, I'm Yuning Han, a PhD student in the Department of Computer & Information Science & Engineering (CISE) at the University of Florida. My research focuses on efficient LLM inference.

Feel free to reach out via [email](mailto:yuninghan@ufl.edu), or connect with me on [GitHub](https://github.com/ElizaFuLan), [LinkedIn](https://www.linkedin.com/in/yuning-han-827a56288/), or [Google Scholar](https://scholar.google.com/citations?user=QgPTwS8AAAAJ&hl=en).

Selected Publications
======

{% include feature_row id="feature_row_cats" type="left" %}

{% include feature_row id="feature_row_uib" type="left" %}
