"use client";

require("../polyfill");

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEventHandler,
} from "react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";
import LeftIcon from "../icons/left.svg";
import RightIcon from "../icons/right.svg";

import { Message, SubmitKey, useChatStore } from "../store";
import { isMobileScreen } from "../utils";
import Locale from "../locales";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { REPO_URL } from "../constant";
import { ErrorBoundary } from "./error";
import { useDebounce } from "use-debounce";

import type { Prompt } from "../store/prompt";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"]}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getComputedStyle(document.body)
        .getPropertyValue("--theme-color")
        .trim();
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(500, Math.max(220, x));

  const chatStore = useChatStore();
  const startX = useRef(0);
  const startDragWidth = useRef(chatStore.config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 100) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    chatStore.updateConfig((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = chatStore.config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };

  useEffect(() => {
    if (isMobileScreen()) {
      return;
    }

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${limit(chatStore.config.sidebarWidth ?? 300)}px`,
    );
  }, [chatStore.config.sidebarWidth]);

  return {
    onDragMouseDown,
  };
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function _Home() {
  const [createNewSession, currentIndex, removeSession] = useChatStore(
    (state) => [
      state.newSession,
      state.currentSessionIndex,
      state.removeSession,
    ],
  );
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [sidebarCollapse, setSideBarCollapse] = useChatStore((state) => [
    state.sidebarCollapse,
    state.setSidebarCollapse,
  ]);

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  // drag side bar
  const { onDragMouseDown } = useDragSideBar();

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen()
          ? styles["tight-container"]
          : styles.container
      }`}
    >
      <div
        className={
          sidebarCollapse ? styles["sidebar-collapse"] : styles["sidebar"]
        }
      >
        <div
          className={
            sidebarCollapse
              ? styles["sidebar-header-collapse"]
              : styles["sidebar-header"]
          }
        >
          {sidebarCollapse ? null : (
            <>
              <div className={styles["sidebar-title"]}>ChatGPT Next</div>
              <div className={styles["sidebar-sub-title"]}>
                Build your own AI assistant.
              </div>
            </>
          )}
          {sidebarCollapse ? (
            <div className={styles["sidebar-logo-collapse"]}>
              <ChatGptIcon />
            </div>
          ) : (
            <div className={styles["sidebar-logo"]}>
              <ChatGptIcon />
            </div>
          )}
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => {
            setOpenSettings(false);
            if (window.innerWidth < 768) {
              setSideBarCollapse(true);
            }
          }}
          onDoubleClick={() => {
            createNewSession();
          }}
        >
          <ChatList />
        </div>

        <div
          className={
            sidebarCollapse
              ? styles["sidebar-tail-collapse"]
              : styles["sidebar-tail"]
          }
        >
          <div
            className={
              sidebarCollapse
                ? styles["sidebar-actions-collapse"]
                : styles["sidebar-actions"]
            }
          >
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              {sidebarCollapse ? (
                <IconButton
                  icon={<RightIcon />}
                  onClick={() => {
                    setSideBarCollapse(false);
                  }}
                />
              ) : (
                <IconButton
                  icon={<LeftIcon />}
                  onClick={() => {
                    setSideBarCollapse(true);
                  }}
                />
              )}
            </div>
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"] + " " + styles.mobile
              }
            >
              <IconButton
                icon={<CloseIcon />}
                onClick={chatStore.deleteSession}
              />
            </div>

            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setSideBarCollapse(true);
                }}
                shadow
              />
            </div>
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              <a href={REPO_URL} target="_blank">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
          </div>
          <div
            className={
              sidebarCollapse ? styles["sidebar-action-collapse"] : undefined
            }
          >
            <IconButton
              icon={<AddIcon />}
              text={
                isMobileScreen()
                  ? undefined
                  : sidebarCollapse
                  ? undefined
                  : Locale.Home.NewChat
              }
              onClick={() => {
                createNewSession();
                setSideBarCollapse(true);
              }}
              shadow
            />
          </div>
        </div>

        <div
          className={styles["sidebar-drag"]}
          onMouseDown={(e) => onDragMouseDown(e as any)}
        ></div>
      </div>

      <div
        className={
          sidebarCollapse
            ? styles["window-content-collapse"]
            : styles["window-content"]
        }
      >
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setSideBarCollapse(false);
            }}
          />
        ) : (
          <Chat key="chat" />
        )}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <ErrorBoundary>
      <_Home></_Home>
    </ErrorBoundary>
  );
}
