import React, { useEffect, useState, useRef } from "react";
import Hero from "../components/hero";
import "./Home.css";


const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://cafeastrology.com/feed"
        );
        const data = await res.json();

        if (!data.items) throw new Error("No blog items found");

        const latestBlogs = data.items.slice(0, 6).map((item, index) => ({
          id: index,
          title: item.title,
          excerpt:
            item.description.replace(/<[^>]+>/g, "").slice(0, 150) + "...",
          link: item.link,
          image: item.thumbnail || null,
        }));

        setBlogs(latestBlogs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch RSS:", error);
        setLoading(false);
      }
    };

    fetchRSS();
  }, []);

  return (
    <div>
      <Hero />
      <div className="blog-section">
        <h2 className="blog-title" style={{color:"rgb(192, 189, 234)"}}>Latest Blogs</h2>
        {loading ? (
          <p>Loading blogs...</p>
        ) : (
          <div className="blog-carousel-wrapper">
            <button
              className="scroll-arrow left"
              onClick={() => scroll("left")}
            >
              &lt;
            </button>
            <div className="blog-cards-container" ref={scrollRef}>
              {blogs.map(({ id, title, excerpt, image, link }) => (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={id}
                  className="blog-card"
                >
                  {image && (
                    <img src={image} alt={title} className="blog-card-image" />
                  )}
                  <h3 className="blog-card-title">{title}</h3>
                  <p className="blog-card-excerpt">{excerpt}</p>
                </a>
              ))}
            </div>
            <button
              className="scroll-arrow right"
              onClick={() => scroll("right")}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
