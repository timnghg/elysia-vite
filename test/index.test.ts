import {afterAll, describe, expect, it} from "bun:test";
import {Elysia} from "elysia";
import {elysiaVite} from "../src";
import * as path from "path";
import getPort from "get-port";

describe("elysia-vite", async () => {
    const htmlFile = Bun.file(path.join(import.meta.dir, "../src/index.html"));
    const html = await htmlFile.text();

    const vitePort = await getPort({
        port: 5173,
        host: "localhost",
    });

    const app = new Elysia()
        .use(elysiaVite({
            server: {
                port: vitePort,
            },
            base: '/vite',
            root: import.meta.dir,
            entryClientFile: "entry-client.tsx",
            entryHtmlFile: path.resolve(import.meta.dir, "../src/index.html"),
        }));

    it("should serve and transform html file", async () => {
        const textHome = await app.handle(new Request(`http://localhost/`)).then(r => r.text());
        const textVite = await app.handle(new Request(`http://localhost/vite/`)).then(r => r.text());
        expect(textHome).toBe("NOT_FOUND");
        expect(textVite && textVite != html).toBeTrue();
        expect(textVite.indexOf("TS + Bun + Elysia + Vite + React")).toBeGreaterThan(-1);
        expect(textVite.indexOf("<!--vite-dev-scripts-->")).toBe(-1);
        expect(textVite.indexOf(`http://localhost:${vitePort}/@vite/client`)).toBeGreaterThan(0);
        expect(textVite.indexOf((`http://localhost:${vitePort}/entry-client.tsx`))).toBeGreaterThan(0);
    });
});