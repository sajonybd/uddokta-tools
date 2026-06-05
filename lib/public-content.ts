export type PublicContentSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export type PublicContentPage = {
  title: string;
  description: string;
  eyebrow?: string;
  sections: PublicContentSection[];
};

export function getPublicContent(siteName: string): Record<string, PublicContentPage> {
  return {
    "about-us": {
      title: "About Us",
      description: `${siteName} helps customers buy trusted premium digital tools with responsive onboarding and support.`,
      eyebrow: "Who we are",
      sections: [
        {
          heading: "Digital Tools by DigiAid",
          body: [
            `${siteName} is built for customers who want premium digital tools without the confusion that usually comes with group-buy style access.`,
            "We focus on clarity before purchase, guided onboarding after payment, and fast support whenever a customer gets stuck.",
          ],
        },
        {
          heading: "What customers can expect",
          bullets: [
            "Trusted premium digital tools by DigiAid",
            "Clear package details, pricing, and product access information",
            "WhatsApp, Messenger, email, and phone support options",
            "Practical buying guidance for new customers",
          ],
        },
      ],
    },
    "affiliate-program": {
      title: "Become an Affiliate",
      description: `Partner with ${siteName} and help more customers discover trusted premium digital tools.`,
      eyebrow: "Affiliate",
      sections: [
        {
          heading: "Who should apply",
          bullets: [
            "Content creators in SEO, freelancing, marketing, design, and business niches",
            "Agencies and trainers who recommend digital tools regularly",
            "Community owners who want a trusted tool partner for their audience",
          ],
        },
        {
          heading: "How to get started",
          body: [
            "Contact the DigiAid team with your audience details, traffic sources, and the product categories you want to promote.",
            "We will review your fit, share the next steps, and confirm the campaign workflow manually.",
          ],
        },
      ],
    },
    "refund-policy": {
      title: "Refund Policy",
      description: "Review the situations where refunds may or may not be approved before you place an order.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "Refund eligibility",
          bullets: [
            "Refund requests must be made quickly after purchase and before extensive use or delivery completion",
            "Requests are reviewed case by case based on the product type and the issue reported",
            "Orders delivered exactly as described may not qualify for a refund",
          ],
        },
        {
          heading: "Non-refundable situations",
          bullets: [
            "A customer changes their mind after successful delivery or setup",
            "The customer does not read the product details, terms, or access requirements before purchase",
            "Service interruption is caused by third-party platform changes outside DigiAid control",
          ],
        },
      ],
    },
    "return-policy": {
      title: "Return Policy",
      description: "Digital products do not work like physical goods, so returns are handled differently.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "How returns work for digital goods",
          body: [
            "Because these are digital products and access-based services, items usually cannot be returned after delivery in the same way physical products can.",
            "If access cannot be provided as promised, our team will first attempt a replacement, correction, or support-based resolution.",
          ],
        },
        {
          heading: "Resolution path",
          bullets: [
            "Access fix or troubleshooting",
            "Replacement access where possible",
            "Refund review if the issue cannot be resolved fairly",
          ],
        },
      ],
    },
    "privacy-policy": {
      title: "Privacy & Data Policy",
      description: "This Privacy Policy explains how UddoktaBD (\"UddoktaBD Premium Tools\" extension and tools.uddoktabd.com) handles user data, cookies, and session tokens.",
      eyebrow: "Policies",
      sections: [
        {
          heading: "1. Browser Extension Data Collection & Storage",
          body: [
            "Our helper extension, UddoktaBD Premium Tools, is designed strictly to synchronize ChatGPT session layers directly from the UddoktaBD user dashboard. Here is how your data is handled:",
          ],
          bullets: [
            "Cookies & Access Tokens: The extension reads access tokens and session data from tools.uddoktabd.com and securely applies them to chatgpt.com to keep you logged in automatically.",
            "Local Processing Only: All session tokens and cookies are handled locally within your browser runtime. The extension does not store, upload, or transmit your credentials, cookies, or personal data to any external server or third party.",
            "No Tracking: We do not collect or track your browsing history, search queries, IP addresses, or personal information.",
          ],
        },
        {
          heading: "2. Website Account & Order Information",
          body: [
            "For subscribers of tools.uddoktabd.com, we collect the minimum necessary data to provide our services:",
          ],
          bullets: [
            "Basic Account Details: We collect your name, email address, and billing history to manage your subscription.",
            "Customer Support: We use your contact details (such as WhatsApp, Messenger, or email) to assist you with onboarding or support requests.",
            "Technical Logging: We collect basic server logs to maintain platform security, prevent abuse, and troubleshoot access issues.",
          ],
        },
        {
          heading: "3. Data Sharing & Third-Party Services",
          body: [
            "We maintain strict boundaries regarding your personal and subscription data:",
          ],
          bullets: [
            "No Selling or Sharing: We never sell, trade, rent, or share user data or session layers with any third parties.",
            "Strict Closed-Loop Transmission: Access tokens are only transmitted locally between tools.uddoktabd.com and designated destination tools (e.g. chatgpt.com) to perform the session synchronization you initiate.",
          ],
        },
        {
          heading: "4. User Control & Data Deletion",
          bullets: [
            "Extension Deletion: Removing the UddoktaBD Premium Tools extension from your browser instantly purges all locally held session cache and tokens.",
            "Account Deletion: You can request complete deletion of your website account and data by contacting our support team.",
          ],
        },
        {
          heading: "5. Contact & Support Information",
          body: [
            "For any inquiries regarding this privacy policy or your data, you can reach out via tools.uddoktabd.com support channels (WhatsApp or Messenger) or contact us directly at our official homepage.",
          ],
        },
      ],
    },
    "terms-and-conditions": {
      title: "Must Read Before Purchase",
      description: "These terms and conditions explain the basic rules customers agree to before buying.",
      eyebrow: "Terms",
      sections: [
        {
          heading: "Important purchase terms",
          bullets: [
            "Read the product title, description, delivery notes, and support terms before placing an order",
            "Access timelines can vary depending on the product and any manual setup required",
            "Misuse, abuse, credential sharing, or violating platform rules may result in access removal",
            "Third-party tool availability can change without notice due to provider policies",
          ],
        },
        {
          heading: "Customer responsibility",
          bullets: [
            "Use accurate contact information at checkout",
            "Follow onboarding instructions after purchase",
            "Contact support quickly if there is an issue with access or delivery",
          ],
        },
      ],
    },
    "how-to-buy": {
      title: "How to Buy",
      description: "A quick walkthrough for placing an order on the site.",
      eyebrow: "Buying guide",
      sections: [
        {
          heading: "Step by step",
          bullets: [
            "Browse the product catalog or packages and open the product details page",
            "Review pricing, included tools, terms, and support notes before buying",
            "Add the item to your cart or choose Buy Now",
            "Complete checkout with your contact details and payment information",
            "Wait for confirmation and onboarding instructions from DigiAid support",
          ],
        },
      ],
    },
    "how-to-access": {
      title: "How to Access Your Product",
      description: "What happens after payment and how customers receive their purchased access.",
      eyebrow: "Access guide",
      sections: [
        {
          heading: "After checkout",
          bullets: [
            "Check your account dashboard for purchased products and billing history",
            "Watch for email, WhatsApp, or Messenger updates if manual onboarding is required",
            "Use the provided instructions, linked page, or extension flow to access the purchased tool",
          ],
        },
        {
          heading: "If access is delayed",
          bullets: [
            "Confirm your order details were submitted correctly",
            "Review the product-specific access notes",
            "Reach out to DigiAid support with your order details for help",
          ],
        },
      ],
    },
    "get-support": {
      title: "How to Get Support",
      description: "Support is available across WhatsApp, Messenger, phone, and email.",
      eyebrow: "Support",
      sections: [
        {
          heading: "Fastest ways to reach us",
          bullets: [
            "WhatsApp chat for quick purchase and access help",
            "Messenger chat for Facebook-based support",
            "Phone support for urgent order issues",
            "Email for detailed follow-up and documentation",
          ],
        },
        {
          heading: "Before you contact support",
          bullets: [
            "Keep your order information ready",
            "Mention the product or package name clearly",
            "Explain whether the issue is payment, access, setup, or renewal related",
          ],
        },
      ],
    },
  };
}
