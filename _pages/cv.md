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

* July 2022 - June 2023: Research Assistant
  * Shanghai Jiao Tong University
  * Supervisor: Zhiyong Chen
  * Propose a hierarchical adaptive semantic communication ML system, applying it to the processing of video semantics used for video reconstruction at the users’ head receiving compressed key frames with no background knowledge.
  * Propose a learnable model to extract and encode video keyframes based on the U-net structure. The receiver can use the compressed key frames to reconstruct the full frames with no background knowledge based on the trained model. Collaborate with the Kinetics dataset to train the model and evaluate its performance.
  * Achieved a compression ratio of 99.87%, video keyframe restoration accuracy is over 95% under simple noise circumstances.

* July 2021 - Feb 2022: Research Assistant
  * Shanghai Jiao Tong University
  * Supervisor: Liyao Xiang
  * Build an attacking defense model against typical attacking scenarios based on GMM, GAN, and DQN.
  * Propose a model to defend the black-box attack against datasets based on GAN with clean and poisoned datasets, making the model resilient to tag attacks. Train and evaluate over CelebA dataset, and achieve a classification accuracy of over 90%.
  * Design a DQN network to improve the model’s performance compared with the original model, and improve accuracy by 15%.

  
Skills
======
* Programming Languages: C/C++, Python
* Technologies:
  * PyTorch
  * Tensorflow
* Interests:
  * Generative Model & Security
  * NeRF
  * Large Language Model
  * AI Security

Publications
======
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
