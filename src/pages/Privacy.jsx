export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="text-base font-semibold text-zinc-900">Privacy Policy</div>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-700 shadow-sm">
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Brand Placeholder</div>
          <div>
            This Privacy Policy explains how <span className="font-semibold">[Brand Name]</span> (“we”, “us”) collects,
            uses, shares, and protects information when you use the <span className="font-semibold">AI Language Coach</span>{" "}
            app and related services (the “Service”).
          </div>

          <div className="text-sm font-semibold text-zinc-900">1. What we collect</div>
          <div>
            <div className="font-semibold text-zinc-900">Account information.</div> If you create an account, we may
            collect identifiers such as email/phone (depending on your sign-in method) and basic profile information.
          </div>
          <div>
            <div className="font-semibold text-zinc-900">Learning content.</div> We collect the messages you send in
            chat, including text and any images you upload, so we can provide corrections, feedback, and learning
            features.
          </div>
          <div>
            <div className="font-semibold text-zinc-900">Usage and device data.</div> We may collect basic analytics such
            as pages viewed, feature usage, crash logs, device type, and approximate location (e.g., country/region) to
            improve reliability and performance.
          </div>

          <div className="text-sm font-semibold text-zinc-900">2. How we use information</div>
          <div>
            We use information to operate the Service, deliver language coaching, generate corrections and practice
            prompts, personalize learning experiences, maintain security, and improve product quality.
          </div>

          <div className="text-sm font-semibold text-zinc-900">3. Sharing</div>
          <div>
            We do not sell your personal information. We may share information with service providers that help us run
            the Service (e.g., hosting, analytics, payments) under contracts that require appropriate safeguards. We may
            also share information when required by law or to protect the safety and integrity of the Service.
          </div>

          <div className="text-sm font-semibold text-zinc-900">4. Your choices</div>
          <div>
            You can avoid sharing sensitive personal information in chat. You may request access, correction, or deletion
            of your personal information where applicable. If you delete your account, we will take reasonable steps to
            remove or de-identify associated data, subject to legal and operational retention needs.
          </div>

          <div className="text-sm font-semibold text-zinc-900">5. Data retention</div>
          <div>
            We retain information only as long as necessary to provide the Service, comply with legal obligations, and
            resolve disputes. Retention periods may vary depending on data type and usage context.
          </div>

          <div className="text-sm font-semibold text-zinc-900">6. Security</div>
          <div>
            We use reasonable administrative, technical, and organizational safeguards to protect information. No method
            of transmission or storage is fully secure, so we cannot guarantee absolute security.
          </div>

          <div className="text-sm font-semibold text-zinc-900">7. Children</div>
          <div>
            The Service is not intended for children under the minimum age required by local law. If you believe a child
            has provided personal information, please contact us so we can take appropriate action.
          </div>

          <div className="text-sm font-semibold text-zinc-900">8. Contact</div>
          <div>
            For privacy questions, contact <span className="font-semibold">[Brand Support Email]</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
