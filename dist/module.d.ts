import * as _nuxt_schema from '@nuxt/schema';



// -- Unbuild CommonJS Shims --
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
interface ModuleOptions {
    /**
     * @default built from request headers
     * @description The base URL of the site, no trailing slash!
     * @example http://localhost:3000
     * @example https://example.com
     * @example https://example.com/subdir
     */
    baseUrl?: string;
    /**
     * Endpoint URL for generating image(s)
     * @default /socialImage
     */
    path?: string;
    /**
     * Directory where cached images will be stored
     * @default
     * () => {
     *       return `${__dirname}/cache`
     *  }
     */
    cacheDir: string;
    fonts?: Array<any>;
    fixedText?: string;
    /**
     * Path to importable custom handler function
     */
    customHandler?: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { ModuleOptions, _default as default };
