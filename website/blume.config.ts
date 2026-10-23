import { typeTableDetailsIds, routeByBrowserLanguage } from "@tai-kun/blume-integrations";
import { defineConfig } from "blume";
import { filesystem, githubReleases } from "blume/sources";

const PROJECT_NAME = "tai-kun's Vite+ Lint Plugins";
const GITHUB_REPO = "vp-lint-plugins";
const GITHUB_OWNER = "tai-kun";

export default defineConfig({
  integrations: [typeTableDetailsIds(), routeByBrowserLanguage()],

  title: PROJECT_NAME,
  description: `Documentation for ${PROJECT_NAME}`,

  content: {
    sources: [
      filesystem({ root: "content" }),
      githubReleases({
        repo: GITHUB_REPO,
        owner: GITHUB_OWNER,
        prefix: "changelog",
      }),
    ],
  },
  deployment: {
    base: `/${GITHUB_REPO}`,
    site: `https://${GITHUB_OWNER}.github.io`,
  },

  i18n: {
    locales: [
      {
        code: "ja",
        label: "日本語",
      },
      {
        code: "en",
        label: "English",
      },
    ],
    defaultLocale: "ja",
  },
  navigation: {
    repo: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
    // タブのラベルは必ず en を一番上にしてください。
    // ドキュメント以外のページでは英語版の UI にフォールバックされるようにします。
    tabs: [
      {
        path: "/",
        label: {
          en: "Documents",
          ja: "ドキュメント",
        },
      },
      {
        path: "/changelog",
        label: {
          en: "Changelog",
          ja: "変更履歴",
        },
      },
    ],
  },
});
