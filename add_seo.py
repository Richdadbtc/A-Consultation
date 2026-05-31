#!/usr/bin/env python3
"""Add SEO tags to all HTML pages in the Aegirum Consulting website."""

import re
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
BASE_URL = "https://aegirumconsulting.com"
OG_IMAGE = f"{BASE_URL}/image/1.png"
SITE_NAME = "Aegirum Consulting"

# ---------------------------------------------------------------------------
# Per-page configuration
# ---------------------------------------------------------------------------
PAGES = {
    "index.html": {
        "canonical": f"{BASE_URL}/",
        "title": "Aegirum Consulting | Risk Management & Tax Advisory",
        "description": "Aegirum Consulting delivers bespoke risk management, tax advisory, corporate governance, and regulatory compliance solutions for organisations operating in global markets.",
        "og_type": "website",
        "schema_type": "Organization",
        "robots": "index, follow",
    },
    "about.html": {
        "canonical": f"{BASE_URL}/about.html",
        "title": "About Us | Aegirum Consulting",
        "description": "Learn about Aegirum Consulting's mission, values, and the experienced professionals who help organisations navigate complex risk, compliance, and governance challenges worldwide.",
        "og_type": "website",
        "schema_type": "AboutPage",
        "robots": "index, follow",
    },
    "services.html": {
        "canonical": f"{BASE_URL}/services.html",
        "title": "Services | Aegirum Consulting",
        "description": "Explore Aegirum Consulting's full range of services: enterprise risk management, tax advisory, ISO certification support, corporate governance, and regulatory compliance consulting.",
        "og_type": "website",
        "schema_type": "Service",
        "robots": "index, follow",
    },
    "training.html": {
        "canonical": f"{BASE_URL}/training.html",
        "title": "Training Programs | Aegirum Consulting",
        "description": "Advance your career with PECB-accredited training in ISO 31000, ISO 37301, ISO 27001, ISO 27701, ISO 37000, ISO 37001, CAIP, and AI Risk Management offered by Aegirum Consulting.",
        "og_type": "website",
        "schema_type": "EducationEvent",
        "robots": "index, follow",
    },
    "team.html": {
        "canonical": f"{BASE_URL}/team.html",
        "title": "Our Team | Aegirum Consulting",
        "description": "Meet the Aegirum Consulting team — seasoned risk, compliance, governance, and tax specialists committed to delivering practical, results-driven advisory services.",
        "og_type": "website",
        "schema_type": "AboutPage",
        "robots": "index, follow",
    },
    "contact.html": {
        "canonical": f"{BASE_URL}/contact.html",
        "title": "Contact Us | Aegirum Consulting",
        "description": "Get in touch with Aegirum Consulting to discuss your risk management, compliance, or governance needs. Reach our team by email, phone, or through our online enquiry form.",
        "og_type": "website",
        "schema_type": "ContactPage",
        "robots": "index, follow",
    },
    "process.html": {
        "canonical": f"{BASE_URL}/process.html",
        "title": "Our Process | Aegirum Consulting",
        "description": "Discover how Aegirum Consulting's structured engagement process — from initial assessment through implementation and review — delivers measurable compliance and risk outcomes.",
        "og_type": "website",
        "schema_type": "WebPage",
        "robots": "index, follow",
    },
    "insights.html": {
        "canonical": f"{BASE_URL}/insights.html",
        "title": "Insights | Aegirum Consulting",
        "description": "Read the latest insights, articles, and thought leadership from Aegirum Consulting on risk management, regulatory compliance, governance, and ISO standards.",
        "og_type": "website",
        "schema_type": "CollectionPage",
        "robots": "index, follow",
    },
    "iso-27001.html": {
        "canonical": f"{BASE_URL}/iso-27001.html",
        "title": "ISO/IEC 27001:2022 Foundation Training | Aegirum Consulting",
        "description": "Build a strong foundation in information security management with Aegirum Consulting's PECB-accredited ISO/IEC 27001:2022 Foundation course. Flexible online and classroom options.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "iso-27701.html": {
        "canonical": f"{BASE_URL}/iso-27701.html",
        "title": "ISO/IEC 27701 Privacy Information Management Training | Aegirum Consulting",
        "description": "Gain expertise in privacy information management with Aegirum Consulting's PECB-accredited ISO/IEC 27701 Foundation course. Learn to establish and maintain a robust PIMS.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "iso-37000.html": {
        "canonical": f"{BASE_URL}/iso-37000.html",
        "title": "ISO 37000 Corporate Governance Manager Training | Aegirum Consulting",
        "description": "Master organisational governance principles with Aegirum Consulting's ISO 37000 Corporate Governance Manager course — PECB-accredited and designed for senior executives and directors.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "iso-37301.html": {
        "canonical": f"{BASE_URL}/iso-37301.html",
        "title": "ISO 37301 Lead Implementer Training | Aegirum Consulting",
        "description": "Become a certified compliance management expert with Aegirum Consulting's PECB-accredited ISO 37301 Lead Implementer programme. Develop and maintain world-class compliance systems.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "caip.html": {
        "canonical": f"{BASE_URL}/caip.html",
        "title": "Certified Artificial Intelligence Professional (CAIP) | Aegirum Consulting",
        "description": "Earn the CAIP credential with Aegirum Consulting. This professional certification validates expertise in AI governance, ethics, risk, and responsible deployment of artificial intelligence.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "ai-risk-manager.html": {
        "canonical": f"{BASE_URL}/ai-risk-manager.html",
        "title": "AI Lead Risk Manager Training | Aegirum Consulting",
        "description": "Lead the management of AI-related risks with Aegirum Consulting's AI Lead Risk Manager programme. Build competencies in AI risk frameworks, assessment, and mitigation strategies.",
        "og_type": "website",
        "schema_type": "Course",
        "robots": "index, follow",
    },
    "blog/index.html": {
        "canonical": f"{BASE_URL}/blog/",
        "title": "News & Insights | Aegirum Consulting",
        "description": "Stay current with Aegirum Consulting's News & Insights blog — expert commentary on risk management, ISO standards, corporate governance, and regulatory compliance trends.",
        "og_type": "website",
        "schema_type": "Blog",
        "robots": "index, follow",
    },
    "blog/post.html": {
        "canonical": f"{BASE_URL}/blog/post.html",
        "title": "Article | Aegirum Consulting",
        "description": "Read the latest expert article from Aegirum Consulting covering risk management, compliance, governance, and ISO standards topics.",
        "og_type": "article",
        "schema_type": "Article",
        "robots": "index, follow",
    },
    # Admin pages — noindex
    "admin/index.html": {
        "canonical": f"{BASE_URL}/admin/",
        "title": "Admin Login | Aegirum Consulting",
        "description": "Aegirum Consulting admin login.",
        "og_type": "website",
        "schema_type": None,
        "robots": "noindex, nofollow",
    },
    "admin/dashboard.html": {
        "canonical": f"{BASE_URL}/admin/dashboard.html",
        "title": "Admin Dashboard | Aegirum Consulting",
        "description": "Aegirum Consulting admin dashboard.",
        "og_type": "website",
        "schema_type": None,
        "robots": "noindex, nofollow",
    },
    "admin/editor.html": {
        "canonical": f"{BASE_URL}/admin/editor.html",
        "title": "Editor | Aegirum Consulting",
        "description": "Aegirum Consulting content editor.",
        "og_type": "website",
        "schema_type": None,
        "robots": "noindex, nofollow",
    },
}

# ---------------------------------------------------------------------------
# Schema builders
# ---------------------------------------------------------------------------

def build_schema(schema_type, page):
    cfg = PAGES[page]
    url = cfg["canonical"]
    title = cfg["title"]
    desc = cfg["description"]

    if schema_type == "Organization":
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": SITE_NAME,
            "url": BASE_URL,
            "logo": OG_IMAGE,
            "description": desc,
            "sameAs": [],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": f"{BASE_URL}/contact.html",
            },
        }
    if schema_type == "Course":
        return {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": title,
            "description": desc,
            "url": url,
            "provider": {
                "@type": "Organization",
                "name": SITE_NAME,
                "url": BASE_URL,
            },
        }
    if schema_type == "Blog":
        return {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": title,
            "description": desc,
            "url": url,
            "publisher": {
                "@type": "Organization",
                "name": SITE_NAME,
                "url": BASE_URL,
            },
        }
    if schema_type == "Article":
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": desc,
            "url": url,
            "publisher": {
                "@type": "Organization",
                "name": SITE_NAME,
                "logo": {"@type": "ImageObject", "url": OG_IMAGE},
            },
        }
    if schema_type == "ContactPage":
        return {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": title,
            "description": desc,
            "url": url,
        }
    if schema_type == "EducationEvent":
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": title,
            "description": desc,
            "url": url,
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "ISO 31000 Risk Manager", "url": f"{BASE_URL}/training.html#iso31000"},
                {"@type": "ListItem", "position": 2, "name": "ISO 37301 Lead Implementer", "url": f"{BASE_URL}/training.html#iso37301"},
                {"@type": "ListItem", "position": 3, "name": "ISO/IEC 27701", "url": f"{BASE_URL}/training.html#iso27701"},
                {"@type": "ListItem", "position": 4, "name": "CAIP", "url": f"{BASE_URL}/training.html#caip"},
                {"@type": "ListItem", "position": 5, "name": "ISO/IEC 27001", "url": f"{BASE_URL}/training.html#iso27001"},
                {"@type": "ListItem", "position": 6, "name": "AI Lead Risk Manager", "url": f"{BASE_URL}/training.html#ai-lead-risk-manager"},
            ],
        }
    if schema_type == "Service":
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": title,
            "description": desc,
            "url": url,
            "provider": {
                "@type": "Organization",
                "name": SITE_NAME,
                "url": BASE_URL,
            },
        }
    # Generic WebPage / AboutPage / CollectionPage
    return {
        "@context": "https://schema.org",
        "@type": schema_type if schema_type else "WebPage",
        "name": title,
        "description": desc,
        "url": url,
        "isPartOf": {"@type": "WebSite", "name": SITE_NAME, "url": BASE_URL},
    }


# ---------------------------------------------------------------------------
# Tag builder
# ---------------------------------------------------------------------------

def build_seo_block(page):
    cfg = PAGES[page]
    desc = cfg["description"]
    canonical = cfg["canonical"]
    robots = cfg["robots"]
    og_type = cfg["og_type"]
    title = cfg["title"]
    schema_type = cfg["schema_type"]

    lines = []

    # robots
    lines.append(f'    <meta name="robots" content="{robots}" />')

    # Only add rich SEO for public pages
    if robots == "index, follow":
        # description
        lines.append(f'    <meta name="description" content="{desc}" />')
        # canonical
        lines.append(f'    <link rel="canonical" href="{canonical}" />')
        # Open Graph
        lines.append(f'    <meta property="og:type" content="{og_type}" />')
        lines.append(f'    <meta property="og:site_name" content="{SITE_NAME}" />')
        lines.append(f'    <meta property="og:title" content="{title}" />')
        lines.append(f'    <meta property="og:description" content="{desc}" />')
        lines.append(f'    <meta property="og:url" content="{canonical}" />')
        lines.append(f'    <meta property="og:image" content="{OG_IMAGE}" />')
        lines.append(f'    <meta property="og:image:width" content="1200" />')
        lines.append(f'    <meta property="og:image:height" content="630" />')
        # Twitter Card
        lines.append(f'    <meta name="twitter:card" content="summary_large_image" />')
        lines.append(f'    <meta name="twitter:title" content="{title}" />')
        lines.append(f'    <meta name="twitter:description" content="{desc}" />')
        lines.append(f'    <meta name="twitter:image" content="{OG_IMAGE}" />')
        # JSON-LD
        if schema_type:
            schema = build_schema(schema_type, page)
            json_str = json.dumps(schema, indent=6)
            lines.append('    <script type="application/ld+json">')
            lines.append(json_str)
            lines.append('    </script>')

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Patch a single file
# ---------------------------------------------------------------------------

ANCHOR_PATTERN = re.compile(
    r'(<meta\s+name="theme-color"[^>]*/?>)',
    re.IGNORECASE,
)

# Tags we'll be inserting (to detect already-patched files)
IDEMPOTENCY_MARKER = 'name="robots"'


def patch_file(rel_path):
    full_path = os.path.join(BASE, rel_path)
    with open(full_path, "r", encoding="utf-8") as fh:
        original = fh.read()

    # Skip if already patched
    if IDEMPOTENCY_MARKER in original:
        print(f"  [SKIP] {rel_path} — already patched")
        return

    seo_block = build_seo_block(rel_path)
    # Remove existing description tag if present (e.g. blog/post.html)
    cleaned = re.sub(r'\n\s*<meta\s+name="description"[^>]*/>', '', original)

    def replacer(m):
        return m.group(1) + "\n\n" + seo_block

    patched, count = ANCHOR_PATTERN.subn(replacer, cleaned, count=1)
    if count == 0:
        print(f"  [WARN] {rel_path} — theme-color anchor not found, skipping")
        return

    with open(full_path, "w", encoding="utf-8") as fh:
        fh.write(patched)
    print(f"  [OK]   {rel_path}")


# ---------------------------------------------------------------------------
# sitemap.xml
# ---------------------------------------------------------------------------

PUBLIC_PAGES = [
    ("", "1.0", "weekly"),
    ("about.html", "0.8", "monthly"),
    ("services.html", "0.8", "monthly"),
    ("training.html", "0.8", "weekly"),
    ("team.html", "0.7", "monthly"),
    ("contact.html", "0.7", "monthly"),
    ("process.html", "0.6", "monthly"),
    ("insights.html", "0.8", "weekly"),
    ("iso-27001.html", "0.8", "monthly"),
    ("iso-27701.html", "0.8", "monthly"),
    ("iso-37000.html", "0.8", "monthly"),
    ("iso-37301.html", "0.8", "monthly"),
    ("caip.html", "0.8", "monthly"),
    ("ai-risk-manager.html", "0.8", "monthly"),
    ("blog/", "0.9", "daily"),
]


def write_sitemap():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for path, priority, freq in PUBLIC_PAGES:
        url = f"{BASE_URL}/{path}"
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    dest = os.path.join(BASE, "sitemap.xml")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print("  [OK]   sitemap.xml")


# ---------------------------------------------------------------------------
# robots.txt
# ---------------------------------------------------------------------------

def write_robots():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "\n"
        f"Sitemap: {BASE_URL}/sitemap.xml\n"
    )
    dest = os.path.join(BASE, "robots.txt")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(content)
    print("  [OK]   robots.txt")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Patching HTML pages...")
    for page in PAGES:
        patch_file(page)

    print("\nGenerating sitemap.xml and robots.txt...")
    write_sitemap()
    write_robots()

    print("\nDone.")
