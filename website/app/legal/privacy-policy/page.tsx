import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Lunara Fit OÜ collects, uses, and protects your personal data under GDPR.",
};

// PLACEHOLDER LEGAL TEXT — this entire document is a draft for structure and
// tone only. It must be reviewed by qualified counsel before publishing.
// For the plain-language version of this policy, see the /privacy page.
export default function PrivacyPolicyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      effectiveDate="Not yet published"
      intro="Lunara Fit OÜ ('Lunara Fit', 'we', 'us'), registered in Estonia, is the data controller for personal data processed through the Lunara Fit app and website. This policy explains what we collect, why, and the rights you have under the EU General Data Protection Regulation (GDPR)."
      sections={[
        {
          heading: "Data we collect",
          body: [
            "Account data: email address and authentication credentials.",
            "Profile data: birth date, height, weight, body composition, and fitness level, where you choose to provide them.",
            "Cycle data: logged period days, spotting, mood, and symptoms.",
            "Workout data: logged exercises, sets, reps, and weights.",
            "Technical data: basic device and usage information needed to operate and secure the Service.",
          ],
        },
        {
          heading: "Legal basis for processing",
          body: [
            "We process your data on the basis of: performance of a contract (to provide the Service you signed up for), your consent (for optional health data you choose to enter), and legitimate interest (to secure and improve the Service).",
          ],
        },
        {
          heading: "How we use your data",
          body: [
            "To provide core features: cycle predictions, phase-based workout recommendations, and progress insights.",
            "To maintain account security and prevent abuse.",
            "To communicate with you about your account or respond to support requests.",
            "We do not use your health data for advertising, and we do not sell personal data to third parties.",
          ],
        },
        {
          heading: "Third-party processors",
          body: [
            "We use a small number of infrastructure providers (such as our backend hosting and authentication providers) to operate the Service. These providers process data on our behalf under data processing agreements and do not use it for their own purposes.",
          ],
        },
        {
          heading: "International transfers",
          body: [
            "Where data is processed outside the EU/EEA, we rely on appropriate safeguards such as Standard Contractual Clauses to ensure it receives an equivalent level of protection.",
          ],
        },
        {
          heading: "Data retention",
          body: [
            "We retain your personal data for as long as your account is active. If you delete your account, we delete your personal data from production systems, except where retention is required by law (e.g. billing records).",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Under GDPR, you have the right to access, rectify, export, restrict, or delete your personal data, and to object to certain processing. You can exercise most of these rights directly in the app, or by emailing lunarafitapp@gmail.com.",
            "You also have the right to lodge a complaint with your local data protection authority, or with the Estonian Data Protection Inspectorate (Andmekaitse Inspektsioon).",
          ],
        },
        {
          heading: "Children's privacy",
          body: [
            "The Service is not directed at children under 16, and we require users to confirm they meet this age minimum during onboarding.",
          ],
        },
        {
          heading: "Changes to this policy",
          body: [
            "We may update this Privacy Policy from time to time. Material changes will be communicated in-app or by email before they take effect.",
          ],
        },
        {
          heading: "Contact & data controller",
          body: [
            "Lunara Fit OÜ, Estonia. For any privacy request or question, email lunarafitapp@gmail.com.",
          ],
        },
      ]}
    />
  );
}
