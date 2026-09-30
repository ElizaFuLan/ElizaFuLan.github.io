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
      <figure class="pub__figure">
        <a href="/images/publications/latentsift-main.png" target="_blank" rel="noopener">
          <img src="/images/publications/latentsift-main.png"
               alt="LatentSift verification pipeline: expert bank buildup during policy training, candidate pickup at inference, verification token-cost comparison, and score aggregation with channel fusion"
               width="2664" height="806" loading="lazy" decoding="async">
        </a>
        <figcaption>Verification pipeline and token-cost comparison · open full size ↗</figcaption>
      </figure>

      <p class="pub__meta">
        <span class="pub__venue">arXiv 2026</span>
        <span class="pub__status">In Submission</span>
      </p>
      <h3 class="pub__title">
        <a href="https://arxiv.org/abs/2609.36371">LatentSift: Policy-State Filtering for Token-Efficient Verification of Software Engineering Agents</a>
      </h3>
      <p class="pub__authors">
        <strong>Yuning Han</strong>, Yangchenchen Jin, Tyler Jandreau, Jingwei Sun
      </p>

      <div class="pub__body">
        <p class="pub__desc">
          Verifying the many candidate trajectories a software engineering agent generates at test
          time can cost as many tokens as generating them. LatentSift replaces the LLM-based first
          verification stage with a token-free, execution-free filter over hidden states the policy
          already produced — reasoning, observation and function-call states compared against banks
          from successful and unsuccessful training trajectories. On SWE-bench Verified, hybrid
          Best@16 matches or improves on each agent's reference workflow.
        </p>
        <figure class="pub__stat">
          <span class="pub__stat-num" data-count="62.1" data-count-from="0" data-count-decimals="1" data-count-suffix="%">62.1%</span>
          <figcaption>Fewer total verification tokens at K = 16 · 66.6–81.0% fewer LLM-verifier tokens</figcaption>
        </figure>
      </div>

      <p class="pub__links">
        <a href="https://arxiv.org/abs/2609.36371">Paper<span class="arrow" aria-hidden="true">↗</span></a>
      </p>

      <figure class="pub__loop">
        <!-- Animated by assets/js/token-flow.js; the image is the no-script fallback -->
        <div class="vloop tflow" data-tflow>
          <a href="/images/publications/latentsift-pipeline.png" target="_blank" rel="noopener">
            <img src="/images/publications/latentsift-pipeline.png"
                 alt="Existing hybrid verification versus LatentSift hybrid verification, with the tokens each stage spends"
                 width="2592" height="739" loading="lazy" decoding="async">
          </a>
        </div>
        <figcaption>
          Where the verification tokens go, stage by stage ·
          <a href="/images/publications/latentsift-pipeline.png" target="_blank" rel="noopener">static figure ↗</a>
        </figcaption>
      </figure>
    </article>

    <article class="pub">
      <figure class="pub__figure">
        <a href="/images/publications/cats-framework.png" target="_blank" rel="noopener">
          <img src="/images/publications/cats-framework.png"
               alt="CATS cascaded adaptive tree speculation framework overview"
               width="2273" height="2076" loading="lazy" decoding="async">
        </a>
        <figcaption>Framework overview · open full size ↗</figcaption>
      </figure>

      <p class="pub__meta">
        <span class="pub__venue">arXiv 2026</span>
        <span class="pub__status">In Submission</span>
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
          <a href="/images/publications/cats-verify-loop.png" target="_blank" rel="noopener">static figure ↗</a>
        </figcaption>
      </figure>
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
