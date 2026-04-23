import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chidiyaai.com";
const SITE_NAME = "ChidiyaAI";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await prisma.blog.findFirst({ where: { slug, published: true } });
    if (!blog) return { title: `Article Not Found | ${SITE_NAME}` };

    const title = blog.metaTitle || `${blog.title} | ${SITE_NAME}`;
    const description = blog.metaDescription || blog.excerpt || blog.title;

    return {
        title, description,
        openGraph: { title, description, type: "article", url: `${SITE_URL}/blog/${slug}`, siteName: SITE_NAME, images: blog.coverImage ? [{ url: blog.coverImage.startsWith("/") ? `${SITE_URL}${blog.coverImage}` : blog.coverImage }] : undefined },
        alternates: { canonical: blog.canonicalUrl || `/blog/${slug}` },
    };
}

export default async function BlogDetailPage({ params }) {
    const { slug } = await params;
    const blog = await prisma.blog.findFirst({
        where: { slug, published: true },
        include: { media: { orderBy: { sortOrder: "asc" } } },
    });
    if (!blog) notFound();

    const jsonLd = {
        "@context": "https://schema.org", "@type": "Article",
        headline: blog.title, description: blog.excerpt,
        image: blog.coverImage, datePublished: blog.createdAt,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BlogDetailClient blog={JSON.parse(JSON.stringify(blog))} />
        </>
    );
}
