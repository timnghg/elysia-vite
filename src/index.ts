import { Elysia } from "elysia";
import { UserConfig } from "vite";
import * as path from "path";
import { html } from "@elysiajs/html";

type ViteConfig = UserConfig & {
    appRootPath?: string;
    viteConfigFilePath?: string;
    placeHolderDevScripts?: string;
    isReact?: boolean;
    entryClientFile?: string;
    entryHtmlFile?: string;
};

export const elysiaViteConfig =
    <C extends ViteConfig>(options?: C) =>
    (app: Elysia) => {
        let isLoaded = false;
        return app.derive(function () {
            return {
                async viteConfig(): Promise<ViteConfig> {
                    if (isLoaded) return options as ViteConfig;
                    const viteConfigPath =
                        options?.viteConfigFilePath ||
                        `${options?.appRootPath}/vite.config.ts` ||
                        `${import.meta.dir}/vite.config.ts`;

                    const viteConfigFile = viteConfigPath
                        ? Bun.file(viteConfigPath)
                        : null;

                    if (viteConfigPath && (await viteConfigFile?.exists())) {
                        const viteConfig = import.meta.require(viteConfigPath);
                        options = {
                            ...viteConfig?.default,
                            ...options,
                        };
                    }
                    isLoaded = true;
                    return options as ViteConfig;
                },
            };
        });
    };

export const elysiaVite = (options?: ViteConfig) => async (app: Elysia) => {
    return app
        .use(html())
        .use(elysiaViteConfig(options))
        .get(options?.base || "/", async (context) => {
            const viteConfig = await context.viteConfig();
            const vitePort = viteConfig?.server?.port || 5173;
            const viteHost = viteConfig?.server?.host || "localhost";
            const viteUrl = `http://${viteHost}:${vitePort}`;
            const entryClientFile =
                options?.entryClientFile || "entry-client.tsx";
            const entryHtmlFile =
                options?.entryHtmlFile ||
                path.resolve(
                    options?.appRootPath || import.meta.dir,
                    path.join(options?.root || "index.html")
                );
            const htmlFile = Bun.file(entryHtmlFile);
            if (await htmlFile.exists()) {
                const html = await htmlFile.text();
                let viteScripts = `<script type="module" src="${viteUrl}/@vite/client"></script>
<script type="module" src="${viteUrl}/${entryClientFile}"></script>`;

                // @see https://vitejs.dev/guide/backend-integration.html
                if (options?.isReact) {
                    viteScripts =
                        `<script type="module">
  import RefreshRuntime from '${viteUrl}/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
</script>` + viteScripts;
                }

                return context.html(
                    html.replace(
                        options?.placeHolderDevScripts ||
                            "<!--vite-dev-scripts-->",
                        viteScripts
                    )
                );
            }
        });
};
