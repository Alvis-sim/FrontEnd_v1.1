"use client";

import { useEffect, useRef, useState } from "react";
import { ANTHROPIC_BANNER_DESKTOP_HTML } from "./anthropic-banner-desktop-html";

const HEADING = "Autonomous Agents for Real Work";
const HEADING_BREAK_BEFORE = "Real Work";
const TAU = Math.PI * 2;
const PARTICLE_STYLE = {
  current: "v1.2" as "v1.1" | "v1.2"
};
const DATA_FONT_STACK = "\"JetBrains Mono\", \"IBM Plex Mono\", \"Consolas\", monospace";
const BIT_GLYPHS = "01";
const AGENFIC_WORDMARK_TEXT = "AGENF\\C";
const ANTHROPIC_WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 16" width="143" height="16" preserveAspectRatio="xMidYMid meet"><g><g transform="matrix(1,0,0,1,18.299999237060547,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M10.716191291809082,10.829001426696777 C10.716191291809082,10.829001426696777 3.756195545196533,0 3.756195545196533,0 C3.756195545196533,0 0,0 0,0 C0,0 0,15.470022201538086 0,15.470022201538086 C0,15.470022201538086 3.2038140296936035,15.470022201538086 3.2038140296936035,15.470022201538086 C3.2038140296936035,15.470022201538086 3.2038140296936035,4.6410064697265625 3.2038140296936035,4.6410064697265625 C3.2038140296936035,4.6410064697265625 10.163809776306152,15.470022201538086 10.163809776306152,15.470022201538086 C10.163809776306152,15.470022201538086 13.919991493225098,15.470022201538086 13.919991493225098,15.470022201538086 C13.919991493225098,15.470022201538086 13.919991493225098,0 13.919991493225098,0 C13.919991493225098,0 10.716191291809082,0 10.716191291809082,0 C10.716191291809082,0 10.716191291809082,10.829001426696777 10.716191291809082,10.829001426696777 z"></path></g><g transform="matrix(1,0,0,1,34.869998931884766,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M0,2.983504056930542 C0,2.983504056930542 5.19273567199707,2.983504056930542 5.19273567199707,2.983504056930542 C5.19273567199707,2.983504056930542 5.19273567199707,15.470022201538086 5.19273567199707,15.470022201538086 C5.19273567199707,15.470022201538086 8.507256507873535,15.470022201538086 8.507256507873535,15.470022201538086 C8.507256507873535,15.470022201538086 8.507256507873535,2.983504056930542 8.507256507873535,2.983504056930542 C8.507256507873535,2.983504056930542 13.700006484985352,2.983504056930542 13.700006484985352,2.983504056930542 C13.700006484985352,2.983504056930542 13.700006484985352,0 13.700006484985352,0 C13.700006484985352,0 0,0 0,0 C0,0 0,2.983504056930542 0,2.983504056930542 z"></path></g><g transform="matrix(1,0,0,1,51.22999954223633,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M10.605714797973633,6.165900230407715 C10.605714797973633,6.165900230407715 3.3142902851104736,6.165900230407715 3.3142902851104736,6.165900230407715 C3.3142902851104736,6.165900230407715 3.3142902851104736,0 3.3142902851104736,0 C3.3142902851104736,0 0,0 0,0 C0,0 0,15.470022201538086 0,15.470022201538086 C0,15.470022201538086 3.3142902851104736,15.470022201538086 3.3142902851104736,15.470022201538086 C3.3142902851104736,15.470022201538086 3.3142902851104736,9.149404525756836 3.3142902851104736,9.149404525756836 C3.3142902851104736,9.149404525756836 10.605714797973633,9.149404525756836 10.605714797973633,9.149404525756836 C10.605714797973633,9.149404525756836 10.605714797973633,15.470022201538086 10.605714797973633,15.470022201538086 C10.605714797973633,15.470022201538086 13.919991493225098,15.470022201538086 13.919991493225098,15.470022201538086 C13.919991493225098,15.470022201538086 13.919991493225098,0 13.919991493225098,0 C13.919991493225098,0 10.605714797973633,0 10.605714797973633,0 C10.605714797973633,0 10.605714797973633,6.165900230407715 10.605714797973633,6.165900230407715 z"></path></g><g transform="matrix(1,0,0,1,69.23999786376953,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M3.3151700496673584,2.983504056930542 C3.3151700496673584,2.983504056930542 7.403865814208984,2.983504056930542 7.403865814208984,2.983504056930542 C9.03934097290039,2.983504056930542 9.901290893554688,3.5801939964294434 9.901290893554688,4.707304000854492 C9.901290893554688,5.834399700164795 9.03934097290039,6.431103706359863 7.403865814208984,6.431103706359863 C7.403865814208984,6.431103706359863 3.3151700496673584,6.431103706359863 3.3151700496673584,6.431103706359863 C3.3151700496673584,6.431103706359863 3.3151700496673584,2.983504056930542 3.3151700496673584,2.983504056930542 z M13.216461181640625,4.707304000854492 C13.216461181640625,1.7900969982147217 11.072648048400879,0 7.558576583862305,0 C7.558576583862305,0 0,0 0,0 C0,0 0,15.470022201538086 0,15.470022201538086 C0,15.470022201538086 3.3151700496673584,15.470022201538086 3.3151700496673584,15.470022201538086 C3.3151700496673584,15.470022201538086 3.3151700496673584,9.414593696594238 3.3151700496673584,9.414593696594238 C3.3151700496673584,9.414593696594238 7.005825519561768,9.414593696594238 7.005825519561768,9.414593696594238 C7.005825519561768,9.414593696594238 10.321218490600586,15.470022201538086 10.321218490600586,15.470022201538086 C10.321218490600586,15.470022201538086 13.990056991577148,15.470022201538086 13.990056991577148,15.470022201538086 C13.990056991577148,15.470022201538086 10.319005966186523,8.953378677368164 10.319005966186523,8.953378677368164 C12.161579132080078,8.245061874389648 13.216461181640625,6.753532409667969 13.216461181640625,4.707304000854492 z"></path></g><g transform="matrix(1,0,0,1,84.98999786376953,0)"><path fill="rgb(24,24,24)" d="M7.622087478637695,12.906073570251465 C5.015110492706299,12.906073570251465 3.4244225025177,11.049725532531738 3.4244225025177,8.022093772888184 C3.4244225025177,4.95027494430542 5.015110492706299,3.0939269065856934 7.622087478637695,3.0939269065856934 C10.206976890563965,3.0939269065856934 11.775577545166016,4.95027494430542 11.775577545166016,8.022093772888184 C11.775577545166016,11.049725532531738 10.206976890563965,12.906073570251465 7.622087478637695,12.906073570251465 z M7.622087478637695,0 C3.1593029499053955,0 0,3.3149218559265137 0,8.022093772888184 C0,12.685078620910645 3.1593029499053955,16 7.622087478637695,16 C12.062784194946289,16 15.200028419494629,12.685078620910645 15.200028419494629,8.022093772888184 C15.200028419494629,3.3149218559265137 12.062784194946289,0 7.622087478637695,0 z"></path></g><g transform="matrix(1,0,0,1,103.29000091552734,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M7.405848026275635,6.873104095458984 C7.405848026275635,6.873104095458984 3.3160574436187744,6.873104095458984 3.3160574436187744,6.873104095458984 C3.3160574436187744,6.873104095458984 3.3160574436187744,2.983504056930542 3.3160574436187744,2.983504056930542 C3.3160574436187744,2.983504056930542 7.405848026275635,2.983504056930542 7.405848026275635,2.983504056930542 C9.04176139831543,2.983504056930542 9.90394115447998,3.646505117416382 9.90394115447998,4.928304195404053 C9.90394115447998,6.2101030349731445 9.04176139831543,6.873104095458984 7.405848026275635,6.873104095458984 z M7.5605998039245605,0 C7.5605998039245605,0 0,0 0,0 C0,0 0,15.470022201538086 0,15.470022201538086 C0,15.470022201538086 3.3160574436187744,15.470022201538086 3.3160574436187744,15.470022201538086 C3.3160574436187744,15.470022201538086 3.3160574436187744,9.85659408569336 3.3160574436187744,9.85659408569336 C3.3160574436187744,9.85659408569336 7.5605998039245605,9.85659408569336 7.5605998039245605,9.85659408569336 C11.07561206817627,9.85659408569336 13.219999313354492,8.000200271606445 13.219999313354492,4.928304195404053 C13.219999313354492,1.8563942909240723 11.07561206817627,0 7.5605998039245605,0 z"></path></g><g transform="matrix(1,0,0,1,117.83000183105469,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M0,0 C0,0 6.1677093505859375,15.470022201538086 6.1677093505859375,15.470022201538086 C6.1677093505859375,15.470022201538086 9.550004005432129,15.470022201538086 9.550004005432129,15.470022201538086 C9.550004005432129,15.470022201538086 3.382294178009033,0 3.382294178009033,0 C3.382294178009033,0 0,0 0,0 z"></path></g><g transform="matrix(1,0,0,1,128.0399932861328,0)"><path fill="rgb(24,24,24)" d="M10.914844512939453,10.5414400100708 C10.340370178222656,12.044201850891113 9.191434860229492,12.906073570251465 7.622706890106201,12.906073570251465 C5.0155181884765625,12.906073570251465 3.4246866703033447,11.049725532531738 3.4246866703033447,8.022093772888184 C3.4246866703033447,4.95027494430542 5.0155181884765625,3.0939269065856934 7.622706890106201,3.0939269065856934 C9.191434860229492,3.0939269065856934 10.340370178222656,3.9557981491088867 10.914844512939453,5.458559989929199 C10.914844512939453,5.458559989929199 14.427860260009766,5.458559989929199 14.427860260009766,5.458559989929199 C13.566211700439453,2.1436522006988525 10.981111526489258,0 7.622706890106201,0 C3.1595458984375,0 0,3.3149218559265137 0,8.022093772888184 C0,12.685078620910645 3.1595458984375,16 7.622706890106201,16 C11.003214836120605,16 13.588300704956055,13.834254264831543 14.449976921081543,10.5414400100708 C14.449976921081543,10.5414400100708 10.914844512939453,10.5414400100708 10.914844512939453,10.5414400100708 z"></path></g><g transform="matrix(1,0,0,1,0,0.27000001072883606)"><path fill="rgb(24,24,24)" d="M5.824605464935303,9.348296165466309 C5.824605464935303,9.348296165466309 7.93500280380249,3.911694288253784 7.93500280380249,3.911694288253784 C7.93500280380249,3.911694288253784 10.045400619506836,9.348296165466309 10.045400619506836,9.348296165466309 C10.045400619506836,9.348296165466309 5.824605464935303,9.348296165466309 5.824605464935303,9.348296165466309 z M6.166755199432373,0 C6.166755199432373,0 0,15.470022201538086 0,15.470022201538086 C0,15.470022201538086 3.4480772018432617,15.470022201538086 3.4480772018432617,15.470022201538086 C3.4480772018432617,15.470022201538086 4.709278583526611,12.22130012512207 4.709278583526611,12.22130012512207 C4.709278583526611,12.22130012512207 11.16093635559082,12.22130012512207 11.16093635559082,12.22130012512207 C11.16093635559082,12.22130012512207 12.421928405761719,15.470022201538086 12.421928405761719,15.470022201538086 C12.421928405761719,15.470022201538086 15.87000560760498,15.470022201538086 15.87000560760498,15.470022201538086 C15.87000560760498,15.470022201538086 9.703250885009766,0 9.703250885009766,0 C9.703250885009766,0 6.166755199432373,0 6.166755199432373,0 z"></path></g></g></svg>`;

type TunnelParticle = {
  theta: number;
  lane: number;
  depth: number;
  speed: number;
  size: number;
  hue: number;
  seed: number;
  glyph: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickDataGlyph(): string {
  return BIT_GLYPHS[Math.floor(Math.random() * BIT_GLYPHS.length)];
}

const ANTHROPIC_NAV_CSS_URL =
  "https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/css/ant-brand.shared.ac3f37dad.min.css";

const AGENFIC_WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 16" width="143" height="16" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <text x="3" y="12.1" fill="#181818" font-family="'Avenir Next', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif" font-size="15.2" font-weight="700" letter-spacing="1.15">${AGENFIC_WORDMARK_TEXT}</text>
</svg>`;

const ANTHROPIC_BANNER_IFRAME_SRCDOC = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="${ANTHROPIC_NAV_CSS_URL}" rel="stylesheet" type="text/css" crossorigin="anonymous" />
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
    ${ANTHROPIC_BANNER_DESKTOP_HTML}
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

export default function AntigravityHero() {
  const typedContentRef = useRef<HTMLSpanElement>(null);
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const heroVideoWrapperRef = useRef<HTMLDivElement>(null);
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
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let outerRadius = 0;
    let innerRadius = 0;
    let wallThickness = 0;
    let radialYScale = 0.79;
    let animationFrame = 0;
    let previousTime = 0;

    let tunnelParticles: TunnelParticle[] = [];

    const buildParticles = () => {
      const diagonal = Math.hypot(width, height);
      const tunnelCount =
        PARTICLE_STYLE.current === "v1.2"
          ? clamp(Math.floor(diagonal * 0.1), 160, 260)
          : clamp(Math.floor(diagonal * 0.13), 200, 360);

      tunnelParticles = [];

      for (let i = 0; i < tunnelCount; i += 1) {
        tunnelParticles.push({
          theta: Math.random() * TAU,
          lane: (Math.random() - 0.5) * 0.26,
          depth: Math.random(),
          speed: 0.00192 + Math.random() * 0.002176,
          size: 0.85 + Math.random() * 1.4,
          hue: 208 + Math.random() * 28,
          seed: Math.random(),
          glyph: pickDataGlyph()
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      centerX = width * 0.5;
      centerY = height * 0.54;
      outerRadius = Math.min(width, height) * (width < 900 ? 0.82 : 0.86);
      innerRadius = Math.min(width, height) * 0.06;
      wallThickness = outerRadius - innerRadius;
      radialYScale = width < 900 ? 0.84 : 0.79;

      buildParticles();
    };

    const draw = (now: number) => {
      if (!previousTime) {
        previousTime = now;
      }
      const dt = Math.min(34, now - previousTime);
      const dtNorm = dt / 16.666;
      previousTime = now;

      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(centerX, centerY, innerRadius * 0.2, centerX, centerY, outerRadius * 0.35);
      glow.addColorStop(0, "rgba(84, 210, 255, 0.23)");
      glow.addColorStop(0.4, "rgba(54, 182, 236, 0.12)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (let i = 0; i < tunnelParticles.length; i += 1) {
        const particle = tunnelParticles[i];
        const previousDepth = particle.depth;
        particle.depth -= particle.speed * dtNorm;

        if (particle.depth <= 0.015) {
          particle.depth = 1 + Math.random() * 0.08;
          particle.theta = (particle.theta + (Math.random() * 0.7 + 0.35)) % TAU;
          particle.lane = (Math.random() - 0.5) * 0.26;
          particle.speed = 0.00192 + Math.random() * 0.002176;
          particle.glyph = pickDataGlyph();
        }

        const prevProgress = clamp(previousDepth, 0, 1);
        const nextProgress = clamp(particle.depth, 0, 1);

        const prevAngle = particle.theta + (1 - prevProgress) * 1.18;
        const nextAngle = particle.theta + (1 - nextProgress) * 1.18;

        const laneWobblePrev = 1 + particle.lane + Math.sin(prevAngle * 2 + now * 0.00025 + particle.seed * 8) * 0.04;
        const laneWobbleNext = 1 + particle.lane + Math.sin(nextAngle * 2 + now * 0.00025 + particle.seed * 8) * 0.04;

        const prevRadius = innerRadius + wallThickness * Math.pow(prevProgress, 1.68) * laneWobblePrev;
        const nextRadius = innerRadius + wallThickness * Math.pow(nextProgress, 1.68) * laneWobbleNext;

        const xPrev = centerX + Math.cos(prevAngle) * prevRadius;
        const yPrev = centerY + Math.sin(prevAngle) * prevRadius * radialYScale;
        const x = centerX + Math.cos(nextAngle) * nextRadius;
        const y = centerY + Math.sin(nextAngle) * nextRadius * radialYScale;

        const alpha = clamp(0.16 + nextProgress * 0.66, 0.16, 0.86);
        const radius = clamp(0.7 + particle.size * 0.25 + nextProgress * 1.25, 0.7, 2.7);
        const flowAngle = Math.atan2(y - yPrev, x - xPrev);

        const warmSide = (Math.cos(nextAngle - Math.PI) + 1) * 0.5;
        const hueShift = warmSide > 0.52 ? 140 * Math.pow((warmSide - 0.52) / 0.48, 1.25) : 0;
        const hue = (particle.hue + hueShift) % 360;
        const saturation = clamp(84 + nextProgress * 15, 80, 98);
        const lightness = clamp(33 + nextProgress * 36, 28, 72);

        if (PARTICLE_STYLE.current === "v1.1") {
          context.globalAlpha = alpha;
          context.fillStyle = `hsl(${hue} ${saturation}% ${lightness}%)`;
          context.beginPath();
          context.arc(x, y, radius, 0, TAU);
          context.fill();
          continue;
        }

        if (Math.random() < 0.0032) {
          particle.glyph = pickDataGlyph();
        }

        const fontSize = clamp(6 + particle.size * 2.2 + nextProgress * 8.4, 6, 17);
        context.save();
        context.translate(x, y);
        context.rotate(flowAngle);
        context.globalAlpha = alpha;
        context.fillStyle = `hsl(${hue} ${saturation}% ${lightness}%)`;
        context.font = `${fontSize}px ${DATA_FONT_STACK}`;
        context.fillText(particle.glyph, 0, 0);
        context.restore();
      }

      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);

    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
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
          <div className="anthropic-banner-frame-wrap" style={{ height: "84px" }}>
            <iframe
              title="Agenfic Banner"
              className="anthropic-banner-frame"
              style={{ height: "84px" }}
              srcDoc={ANTHROPIC_BANNER_IFRAME_SRCDOC}
              scrolling="no"
            />
          </div>
        </header>

        <div className="hero-video-wrapper" ref={heroVideoWrapperRef}>
          <div>
            <div className="main-particles-component-section">
              <div className="main-particles-container">
                <canvas ref={canvasRef} />
              </div>
            </div>
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
                    src="/assets/antigravity-cursor.png"
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
              <span className="icon windows-icon" aria-hidden="true">
                <svg fill="none" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 11.3H9.2V17.3L17.5 18.5V11.3Z" fill="currentColor" />
                  <path d="M8.7 11.3H2.5V16.3L8.7 17.2V11.3Z" fill="currentColor" />
                  <path d="M17.5 3.5L9.2 4.7V10.8H17.5V3.5Z" fill="currentColor" />
                  <path d="M8.7 4.8L2.5 5.6V10.8H8.7V4.8Z" fill="currentColor" />
                </svg>
              </span>
              Download for Windows
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
