"use client";
import { getCategoriesList } from "@/services/categories";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// NOTE: top-level await removed — was crashing the entire module tree when
export default function ViewAllButton() {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  useEffect(() => {
    getCategoriesList()
      .then((data) => {
        if (data?.[0]?.slug) setCategorySlug(data[0].slug);
      })
      .catch((err) => console.error("ViewAllButton: failed to fetch category", err));
  }, []);

  return (
    <Link
      href={categorySlug ? `/products?category=${categorySlug}` : "/products"}
      className="flex items-center gap-2 hoverEffect mx-10 hover:cursor-pointer"
    >
      View all <ChevronRight className="w-5 h-5" />
    </Link>
  );
}
