/**
 * TableOfContents - 文章目录组件 (React)
 *
 * 功能:
 * - 自动提取 H2 标题生成目录
 * - 桌面端: Sticky 侧边栏
 * - 移动端: 折叠下拉 + Sticky
 * - Intersection Observer 高亮当前章节
 * - 平滑滚动到锚点
 *
 * @see TASKS-BLOG.md Task-B.3
 */

import { useState, useEffect, useCallback } from 'react';

interface Heading {
    text: string;
    slug: string;
    depth: number;
}

interface TOCProps {
    headings: Heading[];
}

export default function TableOfContents({ headings }: TOCProps) {
    const [activeId, setActiveId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    // Scroll to heading
    const scrollToHeading = useCallback((slug: string) => {
        const element = document.getElementById(slug);
        if (element) {
            const offset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu after click
            setIsOpen(false);
        }
    }, []);

    // Intersection Observer for active section tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0px -66%',
                threshold: 0
            }
        );

        // Observe all headings
        headings.forEach(({ slug }) => {
            const element = document.getElementById(slug);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className="toc-container" aria-label="Table of contents">
            {/* Mobile: Collapsible */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800 font-medium shadow-sm"
                    aria-expanded={isOpen}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h12" />
                        </svg>
                        Contents
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4 space-y-1">
                        {headings.map(({ text, slug }) => (
                            <button
                                key={slug}
                                onClick={() => scrollToHeading(slug)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeId === slug
                                    ? 'bg-brand/10 text-brand font-semibold'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop: Sticky Sidebar */}
            <div className="hidden lg:block sticky top-24">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h12" />
                        </svg>
                        Contents
                    </h4>
                    <ul className="space-y-1">
                        {headings.map(({ text, slug }) => (
                            <li key={slug}>
                                <button
                                    onClick={() => scrollToHeading(slug)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeId === slug
                                        ? 'bg-brand/15 text-brand font-semibold border-l-2 border-brand'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
