/** Public files live under the deploy base path (e.g. /scent-storizes/ on GitHub Pages, / locally). */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
