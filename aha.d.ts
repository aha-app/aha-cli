declare namespace Aha {
  interface ApplicationModel {
    typename: string;
    getExtensionFields(identifier: string): Promise<any>;
    getExtensionField<T>(
      identifier: string,
      fieldName: string
    ): Promise<T | null>;
    setExtensionField(
      identifier: string,
      fieldName: string,
      value: any
    ): Promise<void>;
  }

  interface RecordStub extends ApplicationModel {
    id: string;
    referenceNum: string;
    type: string;
  }

  interface Account extends ApplicationModel {
    id: string;
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

  interface AuthOptions {
    reAuth?: boolean;
    useCachedRetry?: boolean;
    parameters: unknown;
  }

  interface AuthData {
    token: string;
  }
  interface AuthCallback {
    (authData: AuthData): void;
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
  command<T>(name: string, args?: T): void;

  auth(service: string, options: Aha.AuthOptions): Promise<Aha.AuthData>;
  auth(
    service: string,
    options: Aha.AuthOptions,
    callback?: Aha.AuthCallback
  ): void;

  account: Aha.Account;
  models: {
    [index: string]: any;
  };
}

declare const aha: Aha;
declare const csrfToken: () => string;
declare const Env: { [index: string]: string };
