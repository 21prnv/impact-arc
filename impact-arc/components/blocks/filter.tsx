"use client";

import { useState, useEffect } from "react";
import { FilterGallery, FilterGalleryItem } from "./filtergallery";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supbase/client";

const Filter = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [filteredItems, setFilteredItems] = useState<FilterGalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchCategoriesAndCreators = async () => {
      try {
        const { data: creatorData, error: creatorError } = await supabase
          .from("user_data")
          .select("id, insta_username, reponse, category, scrapped_data");

        if (creatorError) {
          console.error("Error fetching creators:", creatorError);
          setLoading(false);
          return;
        }

        setCreators(creatorData?.length ? creatorData : []);
        console.log("Fetched creators:", creatorData?.length || 0);

        const uniqueCategories = new Set<string>();
        creatorData?.forEach((creator) => {
          if (
            creator.category &&
            typeof creator.category === "string" &&
            creator.category.trim() !== ""
          ) {
            uniqueCategories.add(creator.category);
          }
        });

        const categoryArray = Array.from(uniqueCategories).sort();
        setCategories(categoryArray);

        if (categoryArray.length > 0) {
          setActiveCategory(categoryArray[0]);
        }

        console.log("Categories extracted from creators:", categoryArray);
      } catch (error) {
        console.error("General error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndCreators();
  }, []);

  const formatCreatorsData = (): FilterGalleryItem[] =>
    creators.map((creator, index) => {
      const category = creator.category || "Other";
      const engagement = creator.reponse?.ratings?.engagement || {
        score: "N/A",
        dailyTrend: "N/A",
        percentage: "N/A",
      };
      const profileImage =
        creator.scrapped_data?.userInfo?.profileImage ||
        creator.reponse?.profileInfo?.profilePic ||
        "https://i.pinimg.com/474x/0f/9c/fe/0f9cfeada1c8b4196a52a45c8e48f8cf.jpg";

      return {
        id: creator.id || String(index),
        title: creator.insta_username || "Unknown Creator",
        description: category,
        href: `/analysis/${creator.insta_username || "unknown"}`,
        image: profileImage,
        category: category,
        engagement: {
          score: engagement.score,
          dailyTrend: engagement.dailyTrend,
          percentage: engagement.percentage,
        },
      };
    });

  useEffect(() => {
    if (creators.length === 0 || !activeCategory) return;

    const creatorItems = formatCreatorsData();
    const filtered = creatorItems.filter(
      (creator) => creator.category === activeCategory
    );
    setFilteredItems(filtered);
  }, [activeCategory, creators]);

  return (
    <div className="py-12 px-4 md:px-10">
      <div className="container px-4 md:px-12 lg:px-24 mb-10">
        <h2 className="text-3xl py-4 font-medium md:text-4xl lg:text-5xl text-white mb-6">
          Top Creator Rankings
        </h2>
        <p className="text-zinc-400 mb-8 max-w-3xl">
          Browse the rankings of the most influential content creators across
          various categories. Numbers indicate their position in our rankings
          based on popularity and engagement.
        </p>
        <div className="flex flex-wrap gap-3 md:gap-4 mb-2">
          <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex space-x-4 md:flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full transition-all duration-300 px-5 py-2 text-sm font-medium shadow-sm ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-white to-gray-50 text-black hover:from-purple-600 hover:to-indigo-700 border-transparent transform scale-105"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="container mx-auto text-center py-20">
          <h3 className="text-2xl text-zinc-400">Loading creators...</h3>
        </div>
      ) : filteredItems.length > 0 ? (
        <FilterGallery
          title={`Top ${activeCategory} Creators`}
          items={filteredItems}
        />
      ) : (
        <div className="container mx-auto text-center py-20">
          <h3 className="text-2xl text-zinc-400">
            No creators found in this category.
          </h3>
          {categories.length > 1 && (
            <Button
              onClick={() => setActiveCategory(categories[0])}
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              View {categories[0]} Creator Rankings
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;
