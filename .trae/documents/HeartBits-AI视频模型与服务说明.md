# HeartBits AI Video Model and Service Disclosure

**Effective Date: July 13, 2026**  
**Last Updated: July 14, 2026**

## 1. Overview

HeartBits (the "Platform") uses an artificial intelligence video generation model to provide AI video generation services. This disclosure identifies the exact model used by the Platform, the model developer, the integration provider, its primary capabilities, and the applicable content safety controls.

## 2. Exact Model and Integration Information

- **Official Model Name:** xAI Grok Imagine Video
- **OpenRouter Listing Name:** xAI: Grok Imagine Video
- **Model ID:** `x-ai/grok-imagine-video`
- **Model Developer:** xAI
- **Integration Platform and API Provider:** OpenRouter
- **Model Type:** Artificial intelligence video generation model
- **Primary Interface:** OpenRouter API

HeartBits accesses xAI Grok Imagine Video through OpenRouter. OpenRouter provides the API routing and integration layer used by HeartBits, while xAI is the developer of the underlying video model.

## 3. Model Purpose and Supported Uses

xAI Grok Imagine Video is used by HeartBits to create short videos from text, images, and supported reference inputs. Based on the model information provided through OpenRouter, its capabilities include:

- Text-to-video generation from a text prompt;
- Image-to-video generation from a user-provided or generated image;
- Reference-conditioned video generation using supported reference materials;
- Short video generation from 1 to 15 seconds;
- Video output at 24 frames per second;
- Supported output resolutions of 480p or 720p; and
- Supported aspect ratios of 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, and 2:3.

The availability of a specific mode, duration, resolution, or aspect ratio may depend on the current HeartBits product interface, account eligibility, and technical availability.

## 4. Video Generation Process

When a user submits a video generation request, HeartBits sends the information necessary to process that request through the OpenRouter API to xAI Grok Imagine Video. This information may include the user's text prompt, character settings, generation parameters, reference images, and other materials voluntarily submitted by the user.

After the generated video is returned to HeartBits, it enters a post-generation human content review process. The video may remain in a processing or pending-review status until the review is complete.

Only videos that comply with applicable laws and regulations, the HeartBits User Agreement, the Content Safety and Review Policy, and the Prohibited Content Policy may be displayed or delivered to users. Videos that do not pass review will be blocked and will not be displayed or delivered.

## 5. Content Safety Measures

HeartBits maintains a prohibited-term and prompt-filtering library to identify high-risk generation requests and support content review. The library covers risk categories including illegal activity, violence and terrorism, sexual content and child safety, hate and harassment, fraud and impersonation, privacy violations, intellectual property infringement, dangerous goods, illegal drugs, gambling, cyber abuse, and attempts to circumvent review controls.

HeartBits performs a routine update of the filtering library once per month and may issue emergency updates in response to changes in law, regulatory requirements, risk events, user reports, or review findings.

## 6. User Responsibilities

Users must ensure that all prompts, character settings, reference images, reference videos, and other submitted materials are obtained and used lawfully. Users must possess all necessary intellectual property, likeness, privacy, and other applicable rights or authorizations.

Users may not use xAI Grok Imagine Video or any HeartBits video generation feature to create, distribute, or store unlawful, infringing, fraudulent, sexually explicit, violent, hateful, harassing, deceptive, non-consensual synthetic, or otherwise prohibited content. Users may not create synthetic videos of real individuals without authorization or attempt to evade Platform safeguards by using altered spellings, split words, homophones, encoded language, coded expressions, prompt injection, or similar methods.

## 7. Limitations of AI-Generated Videos

AI video generation is probabilistic and may produce visual defects, abnormal motion, inconsistent audio or lip movements, inaccuracies, bias, factual errors, or results that do not match a user's expectations. HeartBits does not guarantee that generated videos will be accurate, authentic, unique, or suitable for any particular purpose.

Before publishing, commercially using, or otherwise distributing a generated video, users must independently review it and satisfy any AI-content disclosure, authorization, and compliance obligations applicable to the intended use. Users may not present generated videos as records of real events or use them to mislead others.

## 8. Review Records

To support content safety management, regulatory review, dispute resolution, and security audits, HeartBits retains necessary video review records for **180 days**. The categories of retained information and the applicable handling practices are further described in the HeartBits Content Safety and Review Policy and Privacy Policy.

## 9. Data and Privacy

HeartBits processes relevant information only to the extent necessary to provide video generation services, conduct content safety reviews, resolve disputes, and comply with legal obligations. Requests may be transmitted through OpenRouter to the underlying model provider as necessary to provide the requested service. Additional information about data processing, user rights, and security measures is available in the HeartBits Privacy Policy.

## 10. Service Changes

HeartBits may update the model, model version, model ID, integration method, or service scope due to model upgrades, service improvements, provider changes, or compliance requirements. This disclosure will be updated when a material change occurs.

## 11. Contact Us

For questions about this disclosure or the AI video generation service, please contact:

- **Product:** HeartBits
- **Support Email:** contact@heartbits.ai
