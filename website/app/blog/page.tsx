import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Blog",
  description: "Cycle-syncing training tips, guides and research from the Lunara Fit team.",
};

// PLACEHOLDER POSTS — replace with real articles once the blog is live.
const POSTS = [
  {
    title: "What is cycle syncing, actually?",
    excerpt:
      "A plain-language guide to what cycle syncing means for your training, and what the research does and doesn't support.",
    tag: "Guide",
    readTime: "6 min read",
  },
  {
    title: "Training through your luteal phase without burning out",
    excerpt:
      "Energy dips in the second half of your cycle don't mean you should stop training — here's how to adjust instead of skip.",
    tag: "Training",
    readTime: "5 min read",
  },
  {
    title: "How we built phase predictions at Lunara Fit",
    excerpt:
      "A behind-the-scenes look at how logged cycle data becomes a phase prediction — and why we lean conservative.",
    tag: "Product",
    readTime: "4 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Cycle-syncing, explained"
        subtitle="Guides and notes on training with your cycle. More posts coming soon."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post) => (
              <article
                key={post.title}
                className="flex flex-col rounded-[22px] border border-beige-100 bg-white p-7"
              >
                <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-sky-50 to-blush-50" />
                <span className="mt-5 inline-block w-fit rounded-full bg-blush-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-blush-600">
                  {post.tag}
                </span>
                <h2 className="mt-4 text-lg font-semibold leading-snug text-beige-800">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-[13.5px] font-light leading-relaxed text-beige-600">
                  {post.excerpt}
                </p>
                <span className="mt-5 text-xs font-light text-beige-400">
                  {post.readTime}
                </span>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
