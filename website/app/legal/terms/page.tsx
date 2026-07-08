import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Lunara Fit.",
};

// PLACEHOLDER LEGAL TEXT — this entire document is a draft for structure and
// tone only. It must be reviewed by qualified counsel before publishing.
export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      effectiveDate="Not yet published"
      intro="These Terms of Service ('Terms') govern your access to and use of the Lunara Fit mobile application and website (together, the 'Service'), operated by Lunara Fit OÜ ('Lunara Fit', 'we', 'us'). By creating an account or using the Service, you agree to these Terms."
      sections={[
        {
          heading: "Using Lunara Fit",
          body: [
            "You must be at least 16 years old to create an account. You're responsible for keeping your login credentials secure and for all activity under your account.",
            "You agree to use the Service only for its intended purpose — personal cycle tracking and workout planning — and not to misuse, reverse engineer, or attempt to disrupt the Service.",
          ],
        },
        {
          heading: "Not medical advice",
          body: [
            "Lunara Fit is a fitness and wellness tool, not a medical device, and it does not provide medical advice, diagnosis, or treatment. Cycle predictions and workout recommendations are estimates based on the data you provide.",
            "Always consult a qualified healthcare professional before making decisions about your health, fertility, or exercise regimen, especially if you have a medical condition.",
          ],
        },
        {
          heading: "Subscriptions & billing",
          body: [
            "Lunara Fit offers a free plan and paid premium subscriptions (monthly or yearly), billed through the Apple App Store or Google Play. Prices are shown in-app before purchase.",
            "Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period, through your device's app store account settings. Refunds are handled per the relevant app store's policy.",
          ],
        },
        {
          heading: "Your content and data",
          body: [
            "You retain ownership of the data you enter into Lunara Fit. By using the Service, you grant us a limited license to store and process that data solely to provide and improve the Service, as described in our Privacy Policy.",
            "You can export or permanently delete your data at any time from within the app.",
          ],
        },
        {
          heading: "Termination",
          body: [
            "You may stop using the Service and delete your account at any time. We may suspend or terminate accounts that violate these Terms or that we reasonably believe pose a security risk to the Service or other users.",
          ],
        },
        {
          heading: "Disclaimers & limitation of liability",
          body: [
            "The Service is provided 'as is' without warranties of any kind, express or implied. To the maximum extent permitted by law, Lunara Fit OÜ is not liable for indirect, incidental, or consequential damages arising from your use of the Service.",
          ],
        },
        {
          heading: "Changes to these Terms",
          body: [
            "We may update these Terms from time to time. We'll notify you of material changes in-app or by email before they take effect. Continued use of the Service after changes take effect constitutes acceptance.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These Terms are governed by the laws of Estonia, without regard to conflict-of-law principles, without prejudice to any mandatory consumer-protection rights you have under the law of your country of residence.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about these Terms? Email lunarafitapp@gmail.com.",
          ],
        },
      ]}
    />
  );
}
