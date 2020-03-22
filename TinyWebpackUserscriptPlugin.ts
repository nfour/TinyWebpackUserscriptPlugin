import { URL } from 'url';
import { compilation as CompilationNS, Compiler, Plugin } from 'webpack';
import { ConcatSource, RawSource } from 'webpack-sources';
import * as pad from 'pad';

const PLUGIN_NAME = 'TinyWebpackUserscriptPlugin';

interface IMetaConfig {
  /**
   * The header block name
   * @default "UserScript"
   * @example "OpenUserJS"
   */
  headerName?: string;
  meta: Partial<IMetaSchema>;
}

export class TinyWebpackUserscriptPlugin implements Plugin {
  constructor(
    public options: {
      scriptName: string;
      headers: IMetaConfig[];
      /** The URL to your development server @example http://localhost:9002 */
      developmentUrl?: string;
      /** Adds a timestamp to the version @example 1.0.0-1584857821510 */
      addTimestampToVersionInDevelopment?: boolean;
    },
  ) {
    this.options = { ...options };
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tap(PLUGIN_NAME, (input) => {
      type CompliationWithMethods = typeof input & {
        emitAsset(f: string, a: any): void;
        updateAsset(f: string, a: any): void;
      };
      const compilation = input as CompliationWithMethods;

      const { scriptName } = this.options;
      const [mainConfig] = this.options.headers;

      const mainFilename = `${scriptName}.user.js`;
      const devFilename = `${scriptName}.dev.user.js`;
      const headerBlocks = this.options.headers.map(renderScriptHeader);

      compilation.chunks.forEach((chunk: CompilationNS.Chunk) => {
        if (!chunk.canBeInitial()) {
          return;
        }

        chunk.files.forEach((filename) => {
          compilation.updateAsset(
            filename,
            (src: string) => new ConcatSource(...headerBlocks, src),
          );
        });
      });

      //  Produces a header-only file, used for development
      if (this.options.developmentUrl) {
        const { addTimestampToVersionInDevelopment } = this.options;

        const versionWithTimestampOverride = addTimestampToVersionInDevelopment
          ? { version: `${mainConfig.meta.version}-${Date.now()}` }
          : {};

        const devHeader = renderScriptHeader({
          ...mainConfig,
          meta: {
            ...mainConfig.meta,
            ...versionWithTimestampOverride,
            updateURL: urlResolve(this.options.developmentUrl, devFilename),
            require: urlResolve(this.options.developmentUrl, mainFilename),
          },
        });

        compilation.emitAsset(devFilename, new RawSource(devHeader));
      }
    });
  }
}

export function renderScriptHeader({
  meta,
  headerName = 'UserScript',
}: {
  meta: Partial<IMetaSchema>;
  headerName?: string;
}): string {
  function addProperty(key: string, value: string | IMap) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    lines.push(`// @${pad(key, padLength)} ${value}`);
  }

  const lines: string[] = [];
  const padLength = Math.max(...Object.keys(meta).map((k) => k.length));

  lines.push(`// ==${headerName}==`);

  Object.keys(meta).forEach((key) => {
    if (key[0] === '$') {
      return;
    }

    const value = meta[key];

    if (Array.isArray(value)) {
      value.forEach((subValue: any) => {
        addProperty(key, subValue);
      });
    } else if (typeof value === 'string') {
      addProperty(key, value);
    } else if (typeof value === 'boolean' && value) {
      addProperty(key, '');
    }
  });

  lines.push(`// ==/${headerName}==\n\n`);

  return lines.join('\n');
}

const urlResolve = (base: string, frag: string) =>
  new URL(frag, base).toString();

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
