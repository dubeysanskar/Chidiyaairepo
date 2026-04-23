import BlogClient from "./BlogClient";

export const metadata = {
    title: "Blog & News — ChidiyaAI",
    description: "Read the latest articles, insights, and news from ChidiyaAI.",
    keywords: "blog, news, articles, B2B sourcing, ChidiyaAI",
    openGraph: {
        title: "Blog & News — ChidiyaAI",
        description: "Articles, insights, and news from ChidiyaAI.",
        url: "https://chidiyaai.com/blog",
    },
    alternates: { canonical: "/blog" },
};

export default function BlogPage() {
    return <BlogClient />;
}
