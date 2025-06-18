import React, { useRef } from "react";
import "./Footer.css";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com/yourprofile",
    svg: (
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.9a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com/yourprofile",
    svg: (
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.07 9.07 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.12A12.84 12.84 0 013 4.8a4.52 4.52 0 001.4 6 4.47 4.47 0 01-2.05-.56v.06a4.53 4.53 0 003.63 4.44 4.5 4.5 0 01-2.04.08 4.53 4.53 0 004.22 3.14A9.06 9.06 0 013 19.54 12.78 12.78 0 008.29 21c7.55 0 11.68-6.26 11.68-11.69 0-.18 0-.35-.01-.53A8.18 8.18 0 0023 3z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/yourprofile",
    svg: (
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M22 12a10 10 0 10-11.5 9.87v-6.99h-2.2v-2.88h2.2v-2.2c0-2.18 1.31-3.4 3.32-3.4.96 0 1.97.17 1.97.17v2.17h-1.1c-1.08 0-1.42.67-1.42 1.36v1.99h2.42l-.39 2.88h-2.03v6.99A10 10 0 0022 12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/yourprofile",
    svg: (
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 3A2 2 0 0121 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-9 14v-6H7v6h3zm-1.5-7.2a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6zm9.5 7.2v-3.2c0-1.71-2-1.58-2 0v3.2h3z" />
      </svg>
    ),
  },
];

const footerSections = [

  {
    title: "Shubh Muhurat 2025",
    items: [
      "Marriage",
      "Griha Pravesh",
      "Naamkaran",

      "Gold Buying",
      "Vehicle Purchase",
      "Mundan",

    ].map((item) => ({
      text: `${item} Muhurat`,
      href: `/muhurat-2025/${item.toLowerCase().replace(/\s/g, "-")}`,
    })),
  },
  {
    title: "Quick Links",
    items: [
      { text: "Free Kundli", href: "/" },
      { text: "Kundli Matching", href: "/ashtakootmilan" },
      { text: "Today Panchang", href: "/" },
      { text: "Astrology Blog", href: "/blog" },
    ]
  },


  {
    title: "Corporate Info",
    items: [
      {text : "About Us", href:"/about"},
      {text : "Privacy Policy", href:"/privacy"},
      {text : "Terms & Conditions", href:"/terms-conditions"},

   
    ]
  },
  {
    title: "Contact",
    type: "contact",
    content: (
      <>
        <p>Available 24/7 via chat support</p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@taarakapp.com">support@taarakapp.com</a>
        </p>
      </>
    ),
  },
];

const Footer = ({ style = {} }) => {
  const footerRef = useRef(null);

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      aria-label="Main footer for Taarak App"
    >
      {/* Primary Navigation Links */}
      <nav aria-label="Footer primary navigation">
        <ul>
          {["Home", "About Us", "Services", "Blog", "Contact"].map((text) => (
            <li key={text}>
              <a href={`/${text.toLowerCase().replace(/\s/g, "")}`}>{text}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Dynamic Content Sections */}
      <div>
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4>{section.title}</h4>
            {section.type === "about" && <p>{section.content}</p>}
            {section.type === "contact" && section.content}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item.text}>
                    <a href={item.href}>{item.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {/* Social Media Icons */}
      <div aria-label="Social media links">
        {socialLinks.map(({ name, href, svg }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit us on ${name}`}
          >
            {svg}
          </a>
        ))}
      </div>
      {/* Copyright */}
      <div>
        &copy; {new Date().getFullYear()} Taarak App. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
