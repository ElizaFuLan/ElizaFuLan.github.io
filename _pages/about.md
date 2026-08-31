---
permalink: /
title: "About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<div class="reveal">
  <p class="intro__lead">
    Hi, I'm <strong>Yuning Han</strong>, a PhD student in the Department of Computer &amp;
    Information Science &amp; Engineering (CISE) at the University of Florida, advised by
    Dr. Jingwei Sun. My research focuses on making large language model inference fast and
    practical under real memory budgets.
  </p>

  <ul class="tag-list">
    <li>Efficient LLM Inference</li>
    <li>Speculative Decoding</li>
    <li>On-Device &amp; Edge AI</li>
    <li>Diffusion Models</li>
    <li>AI Security</li>
  </ul>

  <p class="intro__links">
    Reach me at <a href="mailto:yuninghan@ufl.edu">yuninghan@ufl.edu</a> &middot;
    <a href="https://github.com/ElizaFuLan">GitHub</a> &middot;
    <a href="https://www.linkedin.com/in/yuning-han-827a56288/">LinkedIn</a> &middot;
    <a href="https://scholar.google.com/citations?user=QgPTwS8AAAAJ&amp;hl=en">Google Scholar</a>
  </p>
</div>

<h2 class="section-heading reveal">Selected Publications</h2>

<article class="pub-card reveal">
  <div class="pub-card__figure">
    <a href="/images/publications/cats-framework.png" target="_blank" rel="noopener">
      <img src="/images/publications/cats-framework.png"
           alt="CATS cascaded adaptive tree speculation framework overview">
    </a>
  </div>
  <div class="pub-card__body">
    <span class="pub-card__venue">Under review &middot; NeurIPS 2026</span>
    <h3 class="pub-card__title">
      CATS: Cascaded Adaptive Tree Speculation for Memory-Limited LLM Inference Acceleration
    </h3>
    <p class="pub-card__authors">
      <strong>Yuning Han</strong>, Yangchenchen Jin, Dylan Zhao, Jingwei Sun
    </p>
    <p class="pub-card__desc">
      A self-speculative decoding framework for memory-limited LLM inference on edge devices:
      a lightweight draft adapter proposes a candidate token tree, a shallow verifier cheaply
      prunes it, and the target model confirms the survivors in a single pass — cutting
      target-model forward calls without raising peak memory. Achieves up to 5.08&times;
      wall-clock speedup with no loss in generation quality, outperforming the prior SOTA by
      up to 1.45&times;.
    </p>
    <p class="pub-card__actions">
      <a href="https://arxiv.org/abs/2605.11186" class="btn btn--info">Read Paper</a>
      <a href="https://github.com/ElizaFuLan/CATS" class="btn btn--ghost">Code</a>
    </p>
  </div>
</article>

<article class="pub-card reveal">
  <div class="pub-card__figure">
    <a href="/images/publications/uibdiffusion.jpg" target="_blank" rel="noopener">
      <img src="/images/publications/uibdiffusion.jpg"
           alt="UIBDiffusion trigger generation and forward/backward diffusion process">
    </a>
  </div>
  <div class="pub-card__body">
    <span class="pub-card__venue">CVPR 2025</span>
    <h3 class="pub-card__title">
      UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models
    </h3>
    <p class="pub-card__authors">
      <strong>Yuning Han</strong>, Bingyin Zhao, Rui Chu, Feng Luo, Biplab Sikdar, Yingjie Lao
    </p>
    <p class="pub-card__desc">
      A universal, imperceptible backdoor trigger for diffusion models built from universal
      adversarial perturbations: image- and model-agnostic, it drives a high attack success
      rate on triggered inputs while keeping generation quality high on clean data, and evades
      state-of-the-art backdoor defenses (Elijah, TERD).
    </p>
    <p class="pub-card__actions">
      <a href="https://ieeexplore.ieee.org/abstract/document/11093857" class="btn btn--info">Read Paper</a>
      <a href="https://github.com/TheLaoLab/UIBDiffusion" class="btn btn--ghost">Code</a>
    </p>
  </div>
</article>

<h2 class="section-heading reveal">Education</h2>

<ul class="edu-list reveal">
  <li>
    <span class="edu-list__degree">Ph.D. in Computer Science</span>
    <span class="edu-list__school">University of Florida</span>
    <span class="edu-list__date">Aug 2025 – Present</span>
  </li>
  <li>
    <span class="edu-list__degree">M.S. in Electrical Engineering</span>
    <span class="edu-list__school">Columbia University</span>
    <span class="edu-list__date">Sept 2023 – Feb 2025</span>
  </li>
  <li>
    <span class="edu-list__degree">B.S. in Information Engineering</span>
    <span class="edu-list__school">Shanghai Jiao Tong University</span>
    <span class="edu-list__date">Sept 2019 – Jun 2023</span>
  </li>
</ul>

<p class="reveal"><a href="/cv/" class="btn btn--info">Full CV</a></p>
