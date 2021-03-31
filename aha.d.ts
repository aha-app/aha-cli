declare namespace Aha {
  interface RecordStub {
    id: string;
    referenceNum: string;
    type: string;
  }

  interface Settings {
    get(name: string): Settings | unknown;
  }

  interface Context {
    settings: Settings;
    identifier: string;
  }

  interface UpdateCallback {
    (newState: any): Promise<void>;
  }

  interface RenderExtensionProps {
    isUpdate: boolean;
    record: RecordStub;
    fields: { [index: string]: unknown };
    update: UpdateCallback;
    state: any;
  }

  interface RenderExtension {
    (container: HTMLElement, props: RenderExtensionProps): void | Function;
  }

  interface CommandExtension<Param> {
    (param: Param, context: Context): void;
  }

  interface CommandPromptOptions {
    placeholder?: string;
    default?: string;
  }
}

interface Aha {
  /**
   * Register an extension function
   *
   * @param name
   * @param extension
   */
  on<T = Aha.RenderExtension>(name: string, extension: T): void;
  on<Param, T = Aha.CommandExtension<Param>>(name: string, extension: T): void;

  /**
   * Request user input
   *
   * @param prompt
   * @param options
   */
  commandPrompt(
    prompt: string,
    options?: Aha.CommandPromptOptions
  ): Promise<any>;
  /**
   * Call a registered extension command
   *
   * @param name
   * @param args
   */
  command<T>(name: string, args?: T);
}

declare const aha: Aha;
declare const csrfToken: () => string;
declare const Env: { [index: string]: string };
