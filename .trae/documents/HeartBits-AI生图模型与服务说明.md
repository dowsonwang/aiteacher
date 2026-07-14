# HeartBits AI Image Model and Service Disclosure

**Effective Date: July 13, 2026**  
**Last Updated: July 14, 2026**

## 1. Overview

HeartBits (the "Platform") uses an artificial intelligence image generation model to provide AI image generation and editing services. This disclosure identifies the exact model used by the Platform, the model developer, the integration provider, its primary capabilities, and the applicable content safety controls.

## 2. Exact Model and Integration Information

- **Official Model Name:** OpenAI GPT Image 2
- **OpenRouter Listing Name:** OpenAI: GPT Image 2
- **Model ID:** `openai/gpt-image-2`
- **Model Developer:** OpenAI
- **Integration Platform and API Provider:** OpenRouter
- **Model Type:** Artificial intelligence image generation and image editing model
- **Primary Interface:** OpenRouter API

HeartBits accesses OpenAI GPT Image 2 through OpenRouter. OpenRouter provides the API routing and integration layer used by HeartBits, while OpenAI is the developer of the underlying image model.

## 3. Model Purpose and Supported Uses

OpenAI GPT Image 2 is used by HeartBits to generate or edit images from user-provided instructions and materials. Supported uses may include:

- Text-to-image generation from a user prompt;
- Image generation based on character descriptions and creative settings;
- Image editing based on user instructions and authorized reference materials;
- AI character portraits and character images;
- Scene images and other image creation features supported by HeartBits.

The availability of a specific function may depend on the current product interface, account eligibility, and technical availability.

## 4. Image Generation Process

When a user submits an image generation or editing request, HeartBits sends the information necessary to process that request through the OpenRouter API to OpenAI GPT Image 2. This information may include the user's text prompt, character settings, creation parameters, and any reference images or other materials voluntarily submitted by the user.

After the generated or edited image is returned to HeartBits, it enters a post-generation human content review process. The image may remain in a processing or pending-review status until the review is complete.

Only images that comply with applicable laws and regulations, the HeartBits User Agreement, the Content Safety and Review Policy, and the Prohibited Content Policy may be displayed or delivered to users. Images that do not pass review will be blocked and will not be displayed or delivered.

## 5. Content Safety Measures

HeartBits maintains a prohibited-term and prompt-filtering library to identify high-risk generation requests and support content review. The library covers risk categories including illegal activity, violence and terrorism, sexual content and child safety, hate and harassment, fraud and impersonation, privacy violations, intellectual property infringement, dangerous goods, illegal drugs, gambling, cyber abuse, and attempts to circumvent review controls.

HeartBits performs a routine update of the filtering library once per month and may issue emergency updates in response to changes in law, regulatory requirements, risk events, user reports, or review findings.

## 6. User Responsibilities

Users must ensure that all prompts, character settings, reference images, and other submitted materials are obtained and used lawfully. Users must possess all necessary intellectual property, likeness, privacy, and other applicable rights or authorizations.

Users may not use OpenAI GPT Image 2 or any HeartBits image generation feature to create, distribute, or store unlawful, infringing, fraudulent, sexually explicit, violent, hateful, harassing, deceptive, non-consensual synthetic, or otherwise prohibited content. Users may not attempt to evade Platform safeguards by using altered spellings, split words, homophones, encoded language, coded expressions, prompt injection, or similar methods.

## 7. Limitations of AI-Generated Images

AI image generation is probabilistic and may produce visual defects, inaccuracies, bias, factual errors, or results that do not match a user's expectations. HeartBits does not guarantee that generated images will be accurate, authentic, unique, or suitable for any particular purpose.

Before publishing, commercially using, or otherwise distributing a generated image, users must independently review it and satisfy any disclosure, authorization, and compliance obligations applicable to the intended use.

## 8. Review Records

To support content safety management, regulatory review, dispute resolution, and security audits, HeartBits retains necessary image review records for **180 days**. The categories of retained information and the applicable handling practices are further described in the HeartBits Content Safety and Review Policy and Privacy Policy.

## 9. Data and Privacy

HeartBits processes relevant information only to the extent necessary to provide image generation services, conduct content safety reviews, resolve disputes, and comply with legal obligations. Requests may be transmitted through OpenRouter to the underlying model provider as necessary to provide the requested service. Additional information about data processing, user rights, and security measures is available in the HeartBits Privacy Policy.

## 10. Service Changes

HeartBits may update the model, model version, model ID, integration method, or service scope due to model upgrades, service improvements, provider changes, or compliance requirements. This disclosure will be updated when a material change occurs.

## 11. Contact Us

For questions about this disclosure or the AI image generation service, please contact:

- **Product:** HeartBits
- **Support Email:** contact@heartbits.ai
