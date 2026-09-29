---
permalink: /
title: "About"
description: "Yuning Han is a PhD student in CISE at the University of Florida working on efficient LLM inference: speculative decoding for memory-limited edge devices."
layout: home
redirect_from: 
  - /about/
  - /about.html

# Hero (rendered by _layouts/home.html)
hero_eyebrow: "PhD student · CISE · University of Florida"
hero_statement: "Making large language model inference fast and practical under real memory budgets."
# The hero statement is written out by speculative decoding, one step per "|":
#   plain word  = drafted and accepted by the verifier
#   ~word       = drafted, then rejected
#   +word       = emitted by the target model itself
# The accepted and +words must spell hero_statement exactly, or the animation
# is skipped and the plain sentence stays.
hero_spec: "Making large language model +inference | fast and ~efficient ~under +practical | under real memory budgets."
---

<section class="home-section" id="about" aria-labelledby="about-label">
  <h2 class="home-section__label" id="about-label">About</h2>
  <div class="home-section__body">
    <p class="lead">
      I'm a PhD student in Computer &amp; Information Science &amp; Engineering at the
      University of Florida, advised by Dr. Jingwei Sun. I work on speculative decoding
      for memory-limited LLM inference on edge devices, and previously on backdoor attacks
      against diffusion models.
    </p>

    <p class="kicker">Research interests</p>
    <ul class="interests">
      <li>Efficient LLM Inference</li>
      <li>Speculative Decoding</li>
      <li>On-Device &amp; Edge AI</li>
      <li>Diffusion Models</li>
      <li>AI Security</li>
    </ul>
  </div>
</section>

<section class="home-section" id="publications" aria-labelledby="pubs-label">
  <h2 class="home-section__label" id="pubs-label">Selected publications</h2>
  <div class="home-section__body">

    <article class="pub">
      <figure class="pub__loop">
        <!-- Animated by assets/js/verify-loop.js; the image is the no-script fallback -->
        <div class="vloop" data-vloop>
          <a href="/images/publications/cats-verify-loop.png" target="_blank" rel="noopener">
            <img src="/images/publications/cats-verify-loop.png"
                 alt="CATS full verification loop: drafting, shallow verification, put back and draft, main and correction branch comparison"
                 width="2275" height="675" loading="lazy" decoding="async">
          </a>
        </div>
        <figcaption>
          The full verification loop, left to right ·
          <a href="/images/publications/cats-verify-loop.png" target="_blank" rel="noopener">static figure ↗</a> ·
          <a href="/images/publications/cats-framework.png" target="_blank" rel="noopener">framework overview ↗</a>
        </figcaption>
      </figure>

      <p class="pub__meta">
        <span class="pub__venue">NeurIPS 2026</span>
        <span class="pub__status">Under review</span>
      </p>
      <h3 class="pub__title">
        <a href="https://arxiv.org/abs/2605.11186">CATS: Cascaded Adaptive Tree Speculation for Memory-Limited LLM Inference Acceleration</a>
      </h3>
      <p class="pub__authors">
        <strong>Yuning Han</strong>, Yangchenchen Jin, Dylan Zhao, Jingwei Sun
      </p>

      <div class="pub__body">
        <p class="pub__desc">
          A self-speculative decoding framework for memory-limited LLM inference on edge
          devices: a lightweight draft adapter proposes a candidate token tree, a shallow
          verifier cheaply prunes it, and the target model confirms the survivors in a single
          pass — cutting target-model forward calls without raising peak memory.
        </p>
        <figure class="pub__stat">
          <span class="pub__stat-num" data-count="5.08">5.08×</span>
          <figcaption>Wall-clock speedup, no loss in generation quality · up to 1.45× over prior SOTA</figcaption>
        </figure>
      </div>

      <p class="pub__links">
        <a href="https://arxiv.org/abs/2605.11186">Paper<span class="arrow" aria-hidden="true">↗</span></a>
        <a href="https://github.com/ElizaFuLan/CATS">Code<span class="arrow" aria-hidden="true">↗</span></a>
      </p>
    </article>

    <article class="pub">
      <figure class="pub__figure">
        <a href="/images/publications/uibdiffusion.jpg" target="_blank" rel="noopener">
          <img src="/images/publications/uibdiffusion.jpg"
               alt="UIBDiffusion trigger generation and forward/backward diffusion process"
               width="1676" height="1209" loading="lazy" decoding="async">
        </a>
        <figcaption>Trigger generation and the forward / backward diffusion process · open full size ↗</figcaption>
      </figure>

      <p class="pub__meta">
        <span class="pub__venue">CVPR 2025</span>
      </p>
      <h3 class="pub__title">
        <a href="https://ieeexplore.ieee.org/abstract/document/11093857">UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models</a>
      </h3>
      <p class="pub__authors">
        <strong>Yuning Han</strong>, Bingyin Zhao, Rui Chu, Feng Luo, Biplab Sikdar, Yingjie Lao
      </p>

      <div class="pub__body">
        <p class="pub__desc">
          A universal, imperceptible backdoor trigger for diffusion models built from universal
          adversarial perturbations: image- and model-agnostic, it drives a high attack success
          rate on triggered inputs while keeping generation quality high on clean data, and evades
          state-of-the-art backdoor defenses (Elijah, TERD).
        </p>
      </div>

      <p class="pub__links">
        <a href="https://ieeexplore.ieee.org/abstract/document/11093857">Paper<span class="arrow" aria-hidden="true">↗</span></a>
        <a href="https://github.com/TheLaoLab/UIBDiffusion">Code<span class="arrow" aria-hidden="true">↗</span></a>
      </p>
    </article>

  </div>
</section>

<section class="home-section" id="education" aria-labelledby="edu-label">
  <h2 class="home-section__label" id="edu-label">Education</h2>
  <div class="home-section__body">
    <ol class="edu">
      <li class="edu__item is-current">
        <span class="edu__date">Aug 2025 – Present</span>
        <div>
          <p class="edu__degree">Ph.D. in Computer Science</p>
          <p class="edu__school">University of Florida</p>
        </div>
      </li>
      <li class="edu__item">
        <span class="edu__date">Sept 2023 – Feb 2025</span>
        <div>
          <p class="edu__degree">M.S. in Electrical Engineering</p>
          <p class="edu__school">Columbia University</p>
        </div>
      </li>
      <li class="edu__item">
        <span class="edu__date">Sept 2019 – Jun 2023</span>
        <div>
          <p class="edu__degree">B.S. in Information Engineering</p>
          <p class="edu__school">Shanghai Jiao Tong University</p>
        </div>
      </li>
    </ol>
  </div>
</section>

<section class="home-section" id="contact" aria-labelledby="contact-label">
  <h2 class="home-section__label" id="contact-label">Contact</h2>
  <div class="home-section__body">
    <a class="contact__mail" href="mailto:{{ site.author.email }}">{{ site.author.email }}</a>
    <ul class="contact__links">
      <li><a href="{{ site.author.googlescholar }}">Google Scholar</a></li>
      <li><a href="https://github.com/{{ site.author.github }}">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/{{ site.author.linkedin }}">LinkedIn</a></li>
      <li><a href="/cv/">Full CV</a></li>
      <li><a href="/files/Yuning_Han_CV.pdf">CV (PDF)</a></li>
    </ul>
  </div>
</section>
