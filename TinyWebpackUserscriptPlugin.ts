import { resolve as urlResolve } from 'url';
import { compilation as CompilationNS, Compiler, Plugin } from 'webpack';
import { ConcatSource, RawSource } from 'webpack-sources';
import * as pad from "pad";

const PLUGIN_NAME = 'WebpackUserscriptPlugin';

export class TinyWebpackUserscriptPlugin implements Plugin {
  constructor (public options: { meta: IMetaSchema, distributionUrl: string, development?: { baseUrl: string; }, }) {
    this.options = options;
  }

  apply (compiler: Compiler) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (input) => {
      type CompliationWithMethods = typeof input & { emitAsset(f: string, a: any): void, updateAsset(f: string, a: any): void  }
      const compilation = input as CompliationWithMethods

      const mainFilename = `${this.options.meta.name}.user.js`;
      const devFilename = `${this.options.meta.name}.dev.user.js`;

      const meta = {
        ...this.options.meta,
        ...(() => {
          if (this.options.development) {
            return {
              updateURL: urlResolve(this.options.development.baseUrl, devFilename),
            };
          }
        })(),
      };

      const scriptUrl = `${this.options.distributionUrl}/${this.options.meta.name}.user.js`;

      const distributionHeader = renderScriptHeader({
        ...meta,
        updateURL: scriptUrl,
        downloadURL: scriptUrl,
      });

      compilation.chunks.forEach((chunk: CompilationNS.Chunk) => {
        if (!chunk.canBeInitial()) { return; }

        chunk.files.forEach((filename) => {
          (compilation as any).updateAsset(
            filename,
            (src: string) => new ConcatSource(distributionHeader, '\n', src),
          );
        });
      });

      // Produces a header-only file which is used for development
      if (this.options.development) {
        const devHeaderFile = renderScriptHeader({
          ...meta,
          // Causes the actual script to be included
          require: urlResolve(this.options.development.baseUrl, mainFilename),
        });

        compilation.emitAsset(devFilename, new RawSource(devHeaderFile));
      }
    });
  }
}

export function renderScriptHeader (meta: Partial<IMetaSchema>, { omitRequire = false, name = 'UserScript' } = {}): string {
  function addProperty (key: string, value: string | IMap) {
    if (omitRequire && key === 'require') { return; }

    if (typeof value !== 'string') { value = JSON.stringify(value) }

    lines.push(`// @${pad(key, padLength)} ${value}`);
  };

  const lines: string[] = [];
  const padLength = Math.max(...Object.keys(meta).map((k) => k.length));

  lines.push(`// ==${name}==`);

  for (const key of Object.keys(meta)) {
    if (key[0] === '$') { continue; }

    const value = meta[key];

    if (Array.isArray(value)) {
      for (const subValue of value) {
        addProperty(key, subValue);
      }
    } else if (typeof (value) === 'string') {
      addProperty(key, value);
    } else if (typeof (value) === 'boolean' && value) {
      addProperty(key, '');
    }
  }

  lines.push(`// ==/${name}==\n`);

  return lines.join('\n');
}

export type IStrings = string | string[];
export type IMap = { [k: string]: any };

export interface IMetaSchema {
  name: string;
  author: string;
  license: string;
  description?: string;
  namespace: string;
  version: string;
  downloadURL?: string;
  updateURL?: string;
  homepageURL?: string;
  icon?: string;
  include?: IStrings;
  exclude?: IStrings;
  match?: IStrings;
  require?: IStrings;
  resource?: IStrings;
  webRequest?: IMap[];

  grant?: (
    Array<
        'unsafeWindow'
      | 'GM_getValue'
      | 'GM_setValue'
      | 'GM_listValues'
      | 'GM_deleteValue'
      | 'GM_getResourceText'
      | 'GM_getResourceURL'
      | 'GM_addStyle'
      | 'GM_log'
      | 'GM_openInTab'
      | 'GM_registerMenuCommand'
      | 'GM_setClipboard'
      | 'GM_xmlhttpRequest'
    >
    | 'none'
  );
  'run-at'?: 'document-end' | 'document-start' | 'document-idle';
  noframes?: boolean;
  [k: string]: IStrings | boolean | undefined | IMap | IMap[];
}
