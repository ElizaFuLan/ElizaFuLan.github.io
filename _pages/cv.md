---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

Education
======
* M.S. in Electrical Engineering, Columbia University University, 2025
* B.S. in Electrical Engineering, Shanghai Jiao Tong University, 2023

Research experience
======
* April 2024 - Dec 2024: Research Assistant
  * Tufts University
  * Supervisor: Yingjie Lao
  * Project leader and the first author of the paper ‘UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models’, CVPR 2025 accepted.
  * Design a universal imperceptible image trigger generator based on Universal Adversarial Perturbation (UAP) with a trainable network and an image classifier network, generate various triggers based on different datasets and classifier networks, all proved to be imperceptible both on image level and on noise level during the diffusion process.
  * Use our trigger to backdoor attack diffusion models and achieve an amazingly high Attack Success Rate (ASR) with 100% in a very low data poisoning rate (5%). The model performs well on different generation models and different samplers.
  * Evaluate our trigger on Elijah and TERD, two SOTA backdoor attack defense methods. Experiments show that our trigger can fully escape these two defense methods with a 100% escaping success rate and existing methods can’t reverse our trigger.

* Dec 2022 - June 2023: Research Assistant
  * Shanghai Jiao Tong University
  * Supervisor: Zhiyong Chen

* Summer 2015: Research Assistant
  * GitHub University
  * Duties included: Tagging issues
  * Supervisor: Professor Git
  
Skills
======
* Skill 1
* Skill 2
  * Sub-skill 2.1
  * Sub-skill 2.2
  * Sub-skill 2.3
* Skill 3

Publications
======
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
