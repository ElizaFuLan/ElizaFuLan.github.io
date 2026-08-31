---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

[Download full CV (PDF)]({{ base_path }}/files/Yuning_Han_CV.pdf){: .btn .btn--primary}

Education
======
* Ph.D. in Computer Science, University of Florida, Aug 2025 - Present
* M.S. in Electrical Engineering, Columbia University, Sept 2023 - Feb 2025
  * Tesla Scholarship of Columbia University Electrical Engineering Department (Honored)
* B.S. in Information Engineering, Shanghai Jiao Tong University (SJTU), Sept 2019 - Jun 2023
  * Eastern China's second prize, Freescale Cup National College Student Smart Car Competition 2020 (Top 20%)

Research Experience
======
**Graduate Research Assistant**

* **Inference Speedup Structure Design for Memory-Limited LLM**, University of Florida
  * Advisor: Dr. Jingwei Sun | Sept 2025 - May 2026
  * First author, posted paper: [CATS: Cascaded Adaptive Tree Speculation for Memory-Limited LLM Inference Acceleration](https://arxiv.org/abs/2605.11186) *(under review, NeurIPS 2026)*
  * Designed a self-speculative decoding structure, CATS, applicable to different auto-regressive LLM architectures, outperforming SOTA self-speculative decoding structures in inference speed under edge scenarios
  * Evaluated CATS on different models across five benchmarks on real edge devices, achieving a wall-clock speedup of up to 5.08x with no degradation in generation quality, outperforming the SOTA method by up to 1.45x under edge memory constraints

* **Analysis of Backdoor Attack and Protection of Diffusion Model**, Tufts University
  * Advisor: Prof. Yingjie Lao | Apr 2024 - Feb 2025
  * First author, posted paper: [UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models](https://ieeexplore.ieee.org/abstract/document/11093857), **CVPR 2025**
  * Applied a specific imperceptible trigger to part of the images in a dataset to poison it, causing the diffusion model trained on the poisoned dataset to exhibit significant performance deviations when generating target images upon detecting the trigger, while keeping generation quality high on clean data
  * Explored other trigger construction techniques for backdoor attacks on diffusion models and validated their feasibility
  * Ran experiments on CIFAR-10 and CelebA-HQ 256, evaluating performance with FID, MSE, and SSIM

* **Research in Reinforcement Learning Model Based on Non-IID Dataset**, Columbia University
  * Advisor: Prof. Javad Ghaderi | Feb 2024 - May 2024
  * Replicated and evaluated the non-open-source FAVOR model in PyTorch, adapting its deep Q-learning core into Double DQN, Dueling DQN, and a new policy-gradient-based network
  * Ran experiments on four non-IID variants of CIFAR-10, reaching accuracy close to 49.98% and model reward higher than -0.51, matching the original paper
  * Found Double DQN performed best on accuracy, reward, and stability among the compared methods

* **Replication and Performance Evaluation of Swin Transformer Model**, Columbia University
  * Advisor: Dr. Mehmet Kerem Turkcan | Oct 2023 - Dec 2023
  * Replicated and evaluated the Swin Transformer in TensorFlow, implementing multi-scale processing, the sliding window mechanism, self- and multi-head attention, masking, and relative positional encoding
  * Achieved 99.64% accuracy on Tiny ImageNet, versus 63.4% for a variant lacking the shifted-window feature, reproducing the original paper's ablation result

**Undergraduate Research Assistant**

* **Adaptive Semantic Communication System for Videos on Machine Learning**, SJTU
  * Advisor: Prof. Zhiyong Chen | Jul 2022 - Sep 2022
  * Proposed a hierarchical adaptive semantic communication ML system for video semantics, using a U-Net-based learnable model to extract, encode, transmit, and reconstruct video key frames through a simulated Gaussian channel
  * Achieved a 99.87% compression ratio with over 95% key-frame restoration accuracy under no-noise conditions on the Kinetics dataset

* **Development and Integration of A-C RL-Based ABR Algorithm for Video Streaming**, SJTU
  * Advisor: Prof. Roger Zimmermann, School of Computing, NUS | May 2022 - Jul 2022
  * Built an actor-critic RL-based ABR algorithm, reaching an error rate below 0.02; wrapped ffmpeg into a callable Java package and integrated the model into dash.js behind an HTTPS server
  * Awarded the honored prize among more than 30 groups (Top 10%)

* **Analysis of Internet Security and Protection from Attack**, SJTU
  * Advisor: Prof. Liyao Xiang, John Hopcroft Computer Science Center | Jul 2021 - Feb 2022
  * Built a Gaussian Mixture Model / Pareto-based model to reduce information loss under dataset poisoning attacks, trained and evaluated on CelebA
  * Improved classification accuracy by 5% using reinforcement learning

* **Vision and Electromagnetic Guidance Solutions for Smart Car**, SJTU
  * Advisor: Prof. Bing Wang, Department of Automation, SEIEE | Jul 2020 - Aug 2020
  * Built edge-line and electromagnetic-wire recognition using image enhancement, edge detection, and template matching; designed an SVM-based motion control system reaching 2.8 m/s
  * Won the Eastern China's second prize, Freescale Cup National College Student Smart Car Competition

Skills
======
* **Programming Languages:** C/C++, Python (mainly)
* **Tools:** PyTorch, TensorFlow, Keil, LaTeX, MATLAB
* **Machine Learning Methods:** CNN, RNN, Transformer, Diffusion Model, Large Language Model

Publications
======
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
