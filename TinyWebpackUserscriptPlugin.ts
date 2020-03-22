import { URL } from 'url';
import { compilation as CompilationNS, Compiler, Plugin } from 'webpack';
import { ConcatSource, RawSource } from 'webpack-sources';
import * as pad from 'pad';

const PLUGIN_NAME = 'WebpackUserscriptPlugin';

const urlResolve = (base: string, frag: string) =>
  new URL(frag, base).toString();

export class TinyWebpackUserscriptPlugin implements Plugin {
  constructor(
    public options: {
      meta: IMetaSchema;
      /** The URL to your development server @example http://localhost:9002 */
      developmentUrl?: string;
      /** Adds a timestamp to the version @example 1.0.0-1584857821510 */
      addTimestampToVersion: boolean;
    },
  ) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (input) => {
      type CompliationWithMethods = typeof input & {
        emitAsset(f: string, a: any): void;
        updateAsset(f: string, a: any): void;
      };
      const compilation = input as CompliationWithMethods;

      const mainFilename = `${this.options.meta.name}.user.js`;
      const devFilename = `${this.options.meta.name}.dev.user.js`;

      const mainHeader = (() => {
        const header = renderScriptHeader(this.options.meta);

        // TODO: omit this, instead implement it with an array parameter for this.options.meta
        // if (!this.options.appendOpenUserJSHeader) {
        //   const openUserJsHeader = renderScriptHeader(
        //     { author: this.options.meta.author },
        //     { name: 'OpenUserJS' },
        //   );

        //   return [header, openUserJsHeader].join('\n');
        // }

        return header;
      })();

      compilation.chunks.forEach((chunk: CompilationNS.Chunk) => {
        if (!chunk.canBeInitial()) {
          return;
        }

        chunk.files.forEach((filename) => {
          compilation.updateAsset(
            filename,
            (src: string) => new ConcatSource(mainHeader, '\n', src),
          );
        });
      });

      // Produces a header-only file, which is used for development
      if (this.options.developmentUrl) {
        const versionWithTimestampOverride = this.options.addTimestampToVersion
          ? { version: `${this.options.meta.version}-${Date.now()}` }
          : {};

        const devHeader = renderScriptHeader({
          ...this.options.meta,
          ...versionWithTimestampOverride,
          updateURL: urlResolve(this.options.developmentUrl, devFilename),
          require: urlResolve(this.options.developmentUrl, mainFilename),
        });

        compilation.emitAsset(devFilename, new RawSource(devHeader));
      }
    });
  }
}

export function renderScriptHeader(
  meta: Partial<IMetaSchema>,
  { omitRequire = false, name = 'UserScript' } = {},
): string {
  function addProperty(key: string, value: string | IMap) {
    if (omitRequire && key === 'require') {
      return;
    }

    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    lines.push(`// @${pad(key, padLength)} ${value}`);
  }

  const lines: string[] = [];
  const padLength = Math.max(...Object.keys(meta).map((k) => k.length));

  lines.push(`// ==${name}==`);

  for (const key of Object.keys(meta)) {
    if (key[0] === '$') {
      continue;
    }

    const value = meta[key];

    if (Array.isArray(value)) {
      for (const subValue of value) {
        addProperty(key, subValue);
      }
    } else if (typeof value === 'string') {
      addProperty(key, value);
    } else if (typeof value === 'boolean' && value) {
      addProperty(key, '');
    }
  }

  lines.push(`// ==/${name}==\n`);

  return lines.join('\n');
}

export type IStrings = string | string[];
export type IMap = { [k: string]: any };

export interface IMetaSchema {
  'name': string;
  'author': string;
  'license': string;
  'description'?: string;
  'namespace': string;
  'version': string;
  'downloadURL'?: string;
  'updateURL'?: string;
  'homepageURL'?: string;
  'icon'?: string;
  'include'?: IStrings;
  'exclude'?: IStrings;
  'match'?: IStrings;
  'require'?: IStrings;
  'resource'?: IStrings;
  'webRequest'?: IMap[];

  'grant'?:
    | Array<
        | 'unsafeWindow'
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
    | 'none';
  'run-at'?: 'document-end' | 'document-start' | 'document-idle';
  'noframes'?: boolean;
  [k: string]: IStrings | boolean | undefined | IMap | IMap[];
}
