"use client";

import { useState, FormEvent } from "react";

/**
 * Front-end only contact form — no backend wired up yet. On submit it just
 * shows a confirmation state. Swap the onSubmit handler for a real request
 * (e.g. POST to an API route or a form service) when one exists.
 */
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-[22px] border border-blush-100 bg-blush-50 p-8 text-center">
        <h3 className="text-lg font-semibold text-beige-800">Message received</h3>
        <p className="mt-2 text-[14px] font-light leading-relaxed text-beige-600">
          Thanks for reaching out — this form is a front-end placeholder for
          now, so please also email us directly to make sure we see it.
        </p>
        <a
          href="mailto:lunarafitapp@gmail.com"
          className="mt-4 inline-block text-sm font-medium text-blush-600 hover:text-blush-400"
        >
          lunarafitapp@gmail.com
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-beige-600">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-xl border border-beige-100 bg-white px-4 py-3 text-[14px] text-beige-800 placeholder:text-beige-400 outline-none transition-colors focus:border-blush-400"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-beige-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-beige-100 bg-white px-4 py-3 text-[14px] text-beige-800 placeholder:text-beige-400 outline-none transition-colors focus:border-blush-400"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-beige-600">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className="w-full resize-none rounded-xl border border-beige-100 bg-white px-4 py-3 text-[14px] text-beige-800 placeholder:text-beige-400 outline-none transition-colors focus:border-blush-400"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-blush-400 px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
      >
        Send message
      </button>
    </form>
  );
}
