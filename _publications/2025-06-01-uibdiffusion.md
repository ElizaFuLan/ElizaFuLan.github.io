---
title: "UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models"
collection: publications
category: conferences
permalink: /publication/2025-06-01-uibdiffusion
excerpt: 'A universal, imperceptible backdoor trigger for diffusion models based on universal adversarial perturbations, achieving high attack success rate while preserving generation quality and evading state-of-the-art backdoor defenses (Elijah, TERD).'
date: 2025-06-01
venue: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)'
paperurl: 'https://ieeexplore.ieee.org/abstract/document/11093857'
citation: 'Han, Y., Zhao, B., Chu, R., Luo, F., Sikdar, B., &amp; Lao, Y. (2025). &quot;UIBDiffusion: Universal Imperceptible Backdoor Attack for Diffusion Models.&quot; <i>Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)</i>.'
---

Applied a specific imperceptible trigger, built from universal adversarial perturbations, to part of the images in a training dataset to poison it. The poisoned diffusion model exhibits significant, controllable performance deviations when generating target images upon detecting the trigger, while keeping generation quality high on clean data. The trigger is image- and model-agnostic, and is shown to bypass state-of-the-art backdoor defenses for diffusion models (Elijah, TERD). Experiments were carried out on CIFAR-10 and CelebA-HQ 256, evaluated with FID, MSE, and SSIM.
