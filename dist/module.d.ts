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
     * @default true
     * @description Whether to cache generated images
     */
    cache?: boolean;
    /**
     * Directory where cached images will be stored
     * @default
     * () => {
     *       return `${__dirname}/cache`
     *  }
     */
    cacheDir: string;
    /**
     * @default []
     * @description Array of fonts to load
     * @example
     * [
     *     {
     *       path: "src/fonts/Roboto/Roboto-Thin.ttf",
     *       options: {
     *          family: "robotothin"
     *       },
     *     },
     *     {
     *       path: "src/fonts/Roboto/Roboto-Regular.ttf",
     *       options: {
     *          family: "robotoregular"
     *       }
     *     }
     * ]
     */
    fonts?: Array<any>;
    /**
     * @default "Fixed header text goes here"
     */
    fixedText?: string;
    /**
     * @default {}
     * @description Background images to use for each section, or "default" for all sections, can be an array of images to randomly select from
     * @example
     * {
     *    "default": "socialBg.png",
     *    "about": "socialBgAbout.png",
     *    "experience": "socialBgExperience.png",
     *    "projects": "socialBgProjects.png",
     *    "references": "socialBgReferences.png",
     *    "skills": ["socialBgSkills.png", "socialBgSkills2.png", "socialBgSkills3.png"],
     * }
     */
    backgrounds?: {};
    /**
     * @default true
     * @description Whether to try and use images from the page to enhance the OpenGraph image
     */
    usePageImages?: boolean;
    /**
     * Path to importable custom handler function
     * @default undefined
     *
     * @example "src/socialImage.handler.mjs"
     */
    customHandler?: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { ModuleOptions, _default as default };
