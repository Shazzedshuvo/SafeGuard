export interface FiverrTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  template: string;
}

export const FIVERR_TEMPLATES: FiverrTemplate[] = [
  {
    id: "default-delivery",
    name: "Standard Order Delivery (User Preferred)",
    description: "The primary delivery format with bulleted completed tasks and live preview link.",
    badge: "Official",
    template: `Hello there,

I hope you and your family are safe and sound!

As per your order requirements and message requests, I’ve completed the following tasks:

- I’ve {{tasks}}

Please have a look at: {{websiteUrl}}

For some reason, if you have any questions, modifications, or concerns, let me know. I’ll get back to you as soon as possible.

Best regards.`,
  },
  {
    id: "revision-delivery",
    name: "Revision & Modification Delivery",
    description: "Polite delivery update addressing requested revisions.",
    badge: "Revision",
    template: `Hello there,

I have updated the project according to your requested revisions:

- I’ve {{tasks}}

Please review the updated work at: {{websiteUrl}}

If everything looks great, please complete the order. Should you need any fine-tuning, I am always ready to help!

Best regards.`,
  },
  {
    id: "order-acknowledgement",
    name: "Order Start & Acknowledgment",
    description: "Welcome note to send immediately when an order is placed.",
    badge: "Greeting",
    template: `Hello there,

Thank you for placing the order! I hope you and your family are safe and sound.

I have reviewed all your requirements and started working on:
- {{tasks}}

I will keep you posted with updates. If you have any additional details to add, feel free to send them over.

Best regards.`,
  },
  {
    id: "clarification-request",
    name: "Missing Requirements Clarification",
    description: "Polite note when client information is incomplete.",
    badge: "Inquiry",
    template: `Hello there,

Thank you for reaching out! To ensure we deliver the highest quality work, could you please clarify the following points:

- {{tasks}}

Once you provide these details, I will proceed right away. Looking forward to your response!

Best regards.`,
  },
];
