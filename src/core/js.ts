export { mix } from 'mixwith.ts'
export type { Constructable } from 'mixwith.ts'

export const getExportFromPath = async (path: string, exportName = null) => {
  const module = await import(path)

  if (exportName) {
    if (!module[exportName]) {
      throw new ReferenceError(`Export ${exportName} not found in module ${path}`)
    }
    return module[exportName]
  }

  const keys = Object.keys(module)
  if (keys.length !== 1) {
    throw new Error(`Multiple exports found in ${path}, specify 'exportName'`)
  }
  return module[keys[0]]
}
