"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { AGENFIC_BANNER_DESKTOP_HTML } from "./agenfic-banner-desktop-html";
import { createAgenficParticles } from "./agenfic-particles-scene";

const HEADING = "Autonomous Agents for Real Work";
const HEADING_BREAK_BEFORE = "Real Work";
const AGENFIC_WORDMARK_TEXT = "AGENFIC";
const AGENFIC_NAV_CSS_URL =
  "https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/css/ant-brand.shared.ac3f37dad.min.css";

const AGENFIC_WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 16" width="143" height="16" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <text x="3" y="12.1" fill="#181818" font-family="'Avenir Next', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif" font-size="15.2" font-weight="700" letter-spacing="1.15">${AGENFIC_WORDMARK_TEXT}</text>
</svg>`;

const AGENFIC_BANNER_IFRAME_SRCDOC = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="${AGENFIC_NAV_CSS_URL}" rel="stylesheet" type="text/css" crossorigin="anonymous" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: visible;
      }
      .nav_wrap,
      .nav_contain,
      .nav_contain.u-container,
      .nav_desktop_layout,
      .nav_links_component,
      .nav_links_wrap {
        background: transparent !important;
      }
      .nav_wrap {
        position: relative !important;
        box-shadow: none !important;
        border: 0 !important;
      }
      .nav_wrap.is-desktop {
        display: block !important;
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      .nav_contain {
        max-width: var(--container--main) !important;
      }
      .nav_contain.u-container {
        width: 100% !important;
        max-width: min(1600px, calc(100vw - 48px)) !important;
        margin: 0 auto !important;
        padding: 0 24px !important;
        height: 84px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 16px !important;
      }
      .nav_desktop_layout {
        flex: 1 1 auto !important;
      }
      .nav_links_component.is-desktop {
        display: flex !important;
        justify-content: flex-start !important;
        align-items: center !important;
      }
      .nav_links_wrap.w-list-unstyled.is-desktop {
        display: flex !important;
        align-items: center !important;
        gap: 0 !important;
      }
      .nav_dropdown_component.w-dropdown {
        position: relative !important;
      }
      .nav_dropdown_main_wrap.is-desktop {
        z-index: 9999 !important;
      }
      .nav_dropdown_main_content.is-desktop {
        pointer-events: auto !important;
        background: #f5f5f7 !important;
        border: 1px solid rgba(29, 29, 31, 0.12) !important;
      }
      .nav_dropdown_link:hover,
      .nav_dropdown_link:focus-visible {
        background: #e8e8ed !important;
      }
      .nav_logo_lottie {
        display: inline-flex !important;
        align-items: center !important;
        height: 24px !important;
      }
      .nav_logo_lottie svg {
        display: block !important;
        width: 214.5px !important;
        height: 24px !important;
      }
      .nav_logo_wordmark {
        display: inline-flex !important;
        align-items: center !important;
        min-height: 16px !important;
        font-size: 18px !important;
        line-height: 1 !important;
        letter-spacing: -0.02em !important;
        font-weight: 500 !important;
        color: #181818 !important;
        font-family: inherit !important;
      }
    </style>
  </head>
  <body>
    ${AGENFIC_BANNER_DESKTOP_HTML}
    <script>
      (() => {
        // frameElement comes from the parent browsing context, so instanceof checks can fail across realms.
        const frameElement =
          window.frameElement && window.frameElement.tagName === "IFRAME" ? window.frameElement : null;
        const frameWrapElement = frameElement ? frameElement.parentElement : null;
        const BASE_FRAME_HEIGHT = 84;
        const MAX_FRAME_HEIGHT = 760;
        const PANEL_PADDING = 20;
        const CLOSE_DELAY_MS = 120;
        const closeTimers = new WeakMap();

        const setFrameHeight = (value) => {
          const nextHeight = Math.max(BASE_FRAME_HEIGHT, Math.min(MAX_FRAME_HEIGHT, Math.ceil(value)));
          if (frameElement) {
            frameElement.style.height = nextHeight + "px";
          }
          if (frameWrapElement) {
            frameWrapElement.style.height = nextHeight + "px";
          }
        };

        const syncFrameHeight = () => {
          const openPanels = Array.from(document.querySelectorAll(".w-dropdown-list.w--open"));
          if (openPanels.length === 0) {
            setFrameHeight(BASE_FRAME_HEIGHT);
            return;
          }
          let neededHeight = BASE_FRAME_HEIGHT;
          openPanels.forEach((panel) => {
            const rect = panel.getBoundingClientRect();
            neededHeight = Math.max(neededHeight, rect.bottom + PANEL_PADDING);
          });
          setFrameHeight(neededHeight);
        };

        const logoLink = document.querySelector(".nav_logo_wrap");
        if (logoLink && logoLink.tagName === "A") {
          logoLink.setAttribute("href", "/");
          logoLink.setAttribute("target", "_top");
          logoLink.setAttribute("aria-label", "Home page");
          logoLink.setAttribute("data-cta", "Navigation");
          logoLink.setAttribute("data-cta-copy", "Agenfic");
        }

        const logo = document.querySelector(".nav_logo_lottie");
        if (logo) {
          logo.innerHTML = ${JSON.stringify(AGENFIC_WORDMARK_SVG)};
        }

        const desktopNavList = document.querySelector(".nav_links_wrap.w-list-unstyled.is-desktop");
        if (desktopNavList) {
          const navItems = Array.from(desktopNavList.querySelectorAll(":scope > .nav_links_item.is-desktop"));
          const preservedItems = navItems.filter((item) => item.querySelector(".nav_btn_combo_wrap"));
          const dropdownTemplate =
            navItems
              .map((item) => item.querySelector(".nav_dropdown_component.w-dropdown"))
              .find((dropdown) => {
                const label = dropdown?.querySelector(".nav_links_text.is-desktop")?.textContent?.trim();
                return label === "Commitments";
              }) ??
            navItems.map((item) => item.querySelector(".nav_dropdown_component.w-dropdown")).find(Boolean);

          if (dropdownTemplate) {
            navItems.forEach((item) => item.remove());
            ["Products", "Services", "About Us"].forEach((label) => {
              const item = document.createElement("li");
              item.className = "nav_links_item is-desktop";
              const dropdown = dropdownTemplate.cloneNode(true);
              if (!(dropdown instanceof HTMLElement)) {
                return;
              }
              dropdown.classList.remove("w--open", "open");

              const toggle = dropdown.querySelector(".w-dropdown-toggle");
              if (toggle) {
                toggle.classList.remove("w--open");
                toggle.setAttribute("aria-expanded", "false");
                const text = toggle.querySelector(".nav_links_text.is-desktop");
                if (text) {
                  text.textContent = label;
                }
              }

              const panel = dropdown.querySelector(".w-dropdown-list");
              if (panel) {
                panel.classList.remove("w--open", "open");
                if (label === "Products") {
                  const sectionHeading = panel.querySelector(
                    ".nav_dropdown_main_scroll .u-detail-s.u-weight-medium.u-mb-text.u-color-faded"
                  );
                  if (sectionHeading) {
                    sectionHeading.textContent = "Apps";
                  }
                  const firstItemText = panel.querySelector(".nav_dropdown_list .nav_dropdown_item .nav_dropdown_text");
                  if (firstItemText) {
                    firstItemText.textContent = "Betroth";
                  }
                  const dropdownTexts = panel.querySelectorAll(".nav_dropdown_list .nav_dropdown_item .nav_dropdown_text");
                  const secondItemText = dropdownTexts[1];
                  if (secondItemText) {
                    secondItemText.textContent = "Energy Dashboard";
                  }
                  const thirdItemText = dropdownTexts[2];
                  if (thirdItemText) {
                    thirdItemText.textContent = "Machine Efficiency";
                  }
                } else if (label === "Services") {
                  const sectionHeadings = panel.querySelectorAll(
                    ".nav_dropdown_main_scroll .u-detail-s.u-weight-medium.u-mb-text.u-color-faded"
                  );
                  const primaryHeading = sectionHeadings[0];
                  if (primaryHeading) {
                    primaryHeading.textContent = "AI";
                  }
                  const secondaryHeading = sectionHeadings[1];
                  if (secondaryHeading) {
                    secondaryHeading.textContent = "Production";
                  }

                  const dropdownTexts = panel.querySelectorAll(".nav_dropdown_list .nav_dropdown_item .nav_dropdown_text");
                  const firstItemText = dropdownTexts[0];
                  if (firstItemText) {
                    firstItemText.textContent = "Agent Implementation";
                  }
                  const secondItemText = dropdownTexts[1];
                  if (secondItemText) {
                    secondItemText.textContent = "Automations";
                  }
                  const thirdItemText = dropdownTexts[2];
                  if (thirdItemText) {
                    thirdItemText.textContent = "Web applications";
                  }
                  const fourthItemText = dropdownTexts[3];
                  if (fourthItemText) {
                    fourthItemText.textContent = "Production Monitoring";
                  }

                  const dropdownLists = panel.querySelectorAll(".nav_dropdown_list");
                  const applicationsList = dropdownLists[1];
                  if (applicationsList) {
                    ["Predictive Maintenance", "Process Optimization"].forEach((textValue) => {
                      const listItem = document.createElement("li");
                      listItem.className = "nav_dropdown_item";
                      const link = document.createElement("a");
                      link.className = "nav_dropdown_link w-inline-block is-desktop";
                      link.href = "#";
                      const text = document.createElement("div");
                      text.className = "nav_dropdown_text";
                      text.textContent = textValue;
                      link.appendChild(text);
                      listItem.appendChild(link);
                      applicationsList.appendChild(listItem);
                    });
                  }
                }
              }

              item.appendChild(dropdown);
              desktopNavList.appendChild(item);
            });
            preservedItems.forEach((item) => desktopNavList.appendChild(item));

            const tryAgenficSectionHeadings = desktopNavList.querySelectorAll(
              ".nav_btn_combo_wrap .nav_dropdown_main_scroll .u-detail-s.u-weight-medium.u-mb-text.u-color-faded"
            );
            tryAgenficSectionHeadings.forEach((heading) => {
              const value = heading.textContent?.trim();
              if (value === "Products") {
                heading.textContent = "Support";
              } else if (value === "Models") {
                heading.textContent = "Products";
              } else if (value === "Log in") {
                heading.textContent = "Services";
              }
            });
          }
        }

        const dropdowns = Array.from(document.querySelectorAll(".nav_dropdown_component.w-dropdown"));
        const clearCloseTimer = (dropdown) => {
          const timer = closeTimers.get(dropdown);
          if (timer) {
            window.clearTimeout(timer);
            closeTimers.delete(dropdown);
          }
        };

        const setDropdownOpenState = (dropdown, open) => {
          const toggle = dropdown.querySelector(".w-dropdown-toggle");
          const panel = dropdown.querySelector(".w-dropdown-list");
          dropdown.classList.toggle("w--open", open);
          dropdown.classList.toggle("open", open);
          if (toggle) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.classList.toggle("w--open", open);
          }
          if (panel) {
            panel.classList.toggle("w--open", open);
            panel.classList.toggle("open", open);
          }
        };

        const closeDropdown = (dropdown) => {
          clearCloseTimer(dropdown);
          const toggle = dropdown.querySelector(".w-dropdown-toggle");
          setDropdownOpenState(dropdown, false);
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
          }
          requestAnimationFrame(syncFrameHeight);
        };

        const closeAll = (except) => {
          dropdowns.forEach((dropdown) => {
            if (dropdown !== except) {
              closeDropdown(dropdown);
            }
          });
        };

        const openDropdown = (dropdown) => {
          clearCloseTimer(dropdown);
          closeAll(dropdown);
          // Expand early so pointer can enter the menu without crossing a clipped iframe edge.
          setFrameHeight(MAX_FRAME_HEIGHT);
          setDropdownOpenState(dropdown, true);
          requestAnimationFrame(syncFrameHeight);
        };

        const scheduleClose = (dropdown) => {
          clearCloseTimer(dropdown);
          const timer = window.setTimeout(() => {
            setDropdownOpenState(dropdown, false);
            syncFrameHeight();
            closeTimers.delete(dropdown);
          }, CLOSE_DELAY_MS);
          closeTimers.set(dropdown, timer);
        };

        const isDropdownOpen = (dropdown) => {
          const toggle = dropdown.querySelector(".w-dropdown-toggle");
          return toggle ? toggle.getAttribute("aria-expanded") === "true" : dropdown.classList.contains("w--open");
        };

        const maybeCloseAll = () => {
          const hasOpen = dropdowns.some((dropdown) => isDropdownOpen(dropdown));
          if (!hasOpen) {
            syncFrameHeight();
          }
        };

        const closeAllWithSync = () => {
          closeAll();
          requestAnimationFrame(syncFrameHeight);
        };

        const onEscape = (event) => {
          if (event.key !== "Escape") {
            return;
          }
          closeAllWithSync();
        };

        document.addEventListener("keydown", onEscape);

        dropdowns.forEach((dropdown) => {
          const panel = dropdown.querySelector(".w-dropdown-list");
          if (panel) {
            panel.addEventListener("mouseenter", () => clearCloseTimer(dropdown));
            panel.addEventListener("mouseleave", () => scheduleClose(dropdown));
          }
        });

        dropdowns.forEach((dropdown) => {
          const toggle = dropdown.querySelector(".w-dropdown-toggle");
          if (!toggle) {
            return;
          }
          if (!toggle.hasAttribute("tabindex")) {
            toggle.setAttribute("tabindex", "0");
          }
          if (!toggle.hasAttribute("role")) {
            toggle.setAttribute("role", "button");
          }
          toggle.setAttribute("aria-haspopup", "menu");
          toggle.setAttribute("aria-expanded", "false");

          dropdown.addEventListener("mouseenter", () => openDropdown(dropdown));
          dropdown.addEventListener("mouseleave", () => {
            scheduleClose(dropdown);
            maybeCloseAll();
          });
          dropdown.addEventListener("focusin", () => openDropdown(dropdown));
          dropdown.addEventListener("focusout", (event) => {
            const next = event.relatedTarget;
            if (next && dropdown.contains(next)) {
              return;
            }
            scheduleClose(dropdown);
            maybeCloseAll();
          });
          toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            if (expanded) {
              closeDropdown(dropdown);
            } else {
              openDropdown(dropdown);
            }
          });
          toggle.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }
            event.preventDefault();
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            if (expanded) {
              closeDropdown(dropdown);
            } else {
              openDropdown(dropdown);
            }
          });
        });

        const navRoot = document.querySelector(".nav_wrap");
        document.addEventListener("mousedown", (event) => {
          const target = event.target;
          if (navRoot && target instanceof Node && navRoot.contains(target)) {
            return;
          }
          closeAllWithSync();
        });

        window.addEventListener("resize", () => requestAnimationFrame(syncFrameHeight));
        setFrameHeight(BASE_FRAME_HEIGHT);
        requestAnimationFrame(syncFrameHeight);
      })();
    <\/script>
  </body>
</html>`;

export default function AgenficHero() {
  const typedContentRef = useRef<HTMLSpanElement>(null);
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const heroVideoWrapperRef = useRef<HTMLDivElement>(null);
  const mainParticlesContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastScrollYRef = useRef(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const typedEl = typedContentRef.current;
    const cursorEl = cursorContainerRef.current;
    if (!typedEl || !cursorEl) {
      return;
    }

    typedEl.innerHTML = "";
    cursorEl.style.opacity = "1";

    const chars: HTMLSpanElement[] = [];
    const forcedBreakIndex = HEADING.indexOf(HEADING_BREAK_BEFORE);
    for (let i = 0; i < HEADING.length; i += 1) {
      if (i === forcedBreakIndex && forcedBreakIndex !== -1) {
        typedEl.appendChild(document.createElement("br"));
      }
      const character = HEADING[i];
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = character;
      typedEl.appendChild(span);
      chars.push(span);
    }

    let visible = 0;
    const timers: number[] = [];

    const updateCursor = (index: number) => {
      if (index < 0 || index >= chars.length) {
        return;
      }
      const char = chars[index];
      const x = char.offsetLeft + char.offsetWidth + 10;
      const y = char.offsetTop;
      cursorEl.style.setProperty("--cursor-pos-x", `${x}px`);
      cursorEl.style.setProperty("--cursor-pos-y", `${y}px`);
    };

    const step = () => {
      if (visible >= chars.length) {
        const hideTimer = window.setTimeout(() => {
          cursorEl.style.opacity = "0";
        }, 320);
        timers.push(hideTimer);
        return;
      }

      chars[visible].classList.add("visible");
      updateCursor(visible);

      const currentChar = HEADING[visible];
      visible += 1;
      const delay = currentChar === " " ? 24 : 16 + Math.random() * 24;
      const timer = window.setTimeout(step, delay);
      timers.push(timer);
    };

    const initialTimer = window.setTimeout(step, 950);
    timers.push(initialTimer);

    const onResize = () => {
      const activeIndex = Math.max(0, Math.min(visible - 1, chars.length - 1));
      updateCursor(activeIndex);
    };

    window.addEventListener("resize", onResize);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mainParticlesContainerRef.current;
    if (!canvas || !container) {
      return;
    }

    const controller = createAgenficParticles({
      canvas,
      container,
      theme: "light",
      interactive: true,
      ringWidth: 0.107,
      ringWidth2: 0.05,
      particlesScale: 0.75,
      ringDisplacement: 0.15,
      density: 200
    });

    return () => {
      controller.destroy();
    };
  }, []);
  useEffect(() => {
    const heroVideoWrapper = heroVideoWrapperRef.current;
    if (!heroVideoWrapper) {
      return;
    }

    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.6));
      heroVideoWrapper.style.opacity = String(1 - progress);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);

      if (scrollY <= 0) {
        setNavVisible(true);
        lastScrollYRef.current = scrollY;
        return;
      }

      const delta = scrollY - lastScrollYRef.current;
      if (delta > 5) {
        setNavVisible(false);
      } else if (delta < -5) {
        setNavVisible(true);
      }

      if (Math.abs(delta) > 5) {
        lastScrollYRef.current = scrollY;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="main">
      <section className="welcome-wrapper">
        <header className={["header", isScrolled ? "scrolled" : "", !navVisible ? "hidden" : ""].filter(Boolean).join(" ")}>
          <div className="agenfic-banner-frame-wrap" style={{ height: "84px" }}>
            <iframe
              title="Agenfic Banner"
              className="agenfic-banner-frame"
              style={{ height: "84px" }}
              srcDoc={AGENFIC_BANNER_IFRAME_SRCDOC}
              scrolling="no"
            />
          </div>
        </header>

        <div className="hero-video-wrapper" ref={heroVideoWrapperRef} style={{ opacity: 1 }}>
          <div style={{ opacity: 1 }}>
            {createElement(
              "landing-main-particles-component",
              { theme: "light" },
              <div className="main-particles-component-section">
                <div className="main-particles-container" ref={mainParticlesContainerRef}>
                  <canvas ref={canvasRef} data-engine="three.js r180" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="welcome-section">
          <div className="logo-container">
            <div className="logo">
              <span className="hero-brand-word" aria-label="Agenfic">
                {AGENFIC_WORDMARK_TEXT}
              </span>
            </div>
          </div>

          <div className="header-container">
            <h1 className="landing-main-header">
              <span className="typed-container landing-main">
                <div className="cursor-container" ref={cursorContainerRef}>
                  <img
                    src="/assets/agenfic-cursor.png"
                    alt="Agenfic Blinking Cursor"
                    className="blinking-cursor"
                  />
                </div>
                <span className="typed-content" ref={typedContentRef} aria-label={HEADING} />
              </span>
            </h1>
          </div>

          <div className="grid-row welcome-cta">
            <button type="button" className="button button-primary call-to-action">
              Contact Us
            </button>
            <button type="button" className="button button-secondary call-to-action">
              Explore use cases
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

