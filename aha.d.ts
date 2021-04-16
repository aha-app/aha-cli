declare namespace Aha {
  class ApplicationModel {
    typename: string;

    id: string;

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

    save(): Promise<void>;
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
    parameters?: unknown;
  }

  interface AuthData {
    token: string;
  }
  interface AuthCallback {
    (authData: AuthData): void;
  }

  interface ListFiltersEvent {
    action: 'listFilters';
  }

  interface ListFilter {
    title: string;
    required: boolean;
    type: string;
  }
  interface ListFiltersCallback {
    /**
     * Return a list of available filters
     */
    (): Promise<{ [index: string]: ListFilter }>;
  }

  interface FilterValuesEvent {
    action: 'filterValues';
  }

  /**
   * Some filters will require information from the external server. For
   * example, when filtering to an assigned user, you may want to fetch the
   * list of users from the system you are importing from. filterValues
   * returns the list of possible values for a filter field.
   */
  type FilterValuesCallback = (props: {
    filterName: string;
    filters: { [index: string]: any };
  }) => Promise<FilterValue[]>;

  interface FilterValue {
    text?: string;
    value: any;
  }

  interface ListCandidatesEvent {
    action: 'listCandidates';
  }

  interface ListCandidatesCallback<T extends ImportRecord> {
    (props: { filters: { [index: string]: any }; nextPage?: any }): Promise<
      ListCandidate<T>
    >;
  }

  interface ListCandidate<T extends ImportRecord> {
    records: T[];
    nextPage?: any;
  }

  interface RenderRecordEvent {
    action: 'renderRecord';
  }

  interface RenderRecordCallback<T extends ImportRecord> {
    (props: { record: T; onUnmounted: () => any }): void;
  }

  interface ImportRecordEvent {
    action: 'importRecord';
  }

  interface ImportRecordCallback<T extends ImportRecord> {
    (props: { importRecord: T; ahaRecord: RecordStub }): Promise<void>;
  }

  interface ImportRecord {
    uniqueId: string;
    name: string;
    identifier?: string;
    url?: string;
  }

  interface Importer<T extends ImportRecord> {
    on(event: ListFiltersEvent, callback: ListFiltersCallback): void;
    on(event: FilterValuesEvent, callback: FilterValuesCallback): void;
    on(event: ListCandidatesEvent, callback: ListCandidatesCallback<T>): void;
    on(event: RenderRecordEvent, callback: RenderRecordCallback<T>): void;
    on(event: ImportRecordEvent, callback: ImportRecordCallback<T>): void;
  }
}

interface Aha {
  /**
   * The current account
   */
  account: Aha.Account;

  /**
   * Fetch a model constructor
   */
  models: {
    [index: string]: any;
  };

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

  getImporter<T extends Aha.ImportRecord>(identifier: string): Aha.Importer<T>;

  auth(service: string, options: Aha.AuthOptions): Promise<Aha.AuthData>;
  auth(
    service: string,
    options: Aha.AuthOptions,
    callback?: Aha.AuthCallback
  ): void;

  triggerBrowser(event: string, args: any): void;
  triggerServer(event: string, args: any): void;
}

declare const aha: Aha;
declare const csrfToken: () => string;
declare const Env: { [index: string]: string };

declare namespace JSX {
  interface IntrinsicElements {
    'aha-flex': Partial<
      {
        className: string;
        direction: 'column' | 'row';
        children: React.ReactNode;
        wrap: CSSStyleDeclaration['flexWrap'];
      } & Pick<
        CSSStyleDeclaration,
        'justifyContent' | 'gap' | 'alignItems' | 'alignContent'
      >
    >;
    'aha-icon': { icon: string };
    'aha-button': any;
    'aha-menu': any;
    'aha-menu-item': any;
    'aha-action-menu': any;
    'aha-spinner': any;
  }
}
