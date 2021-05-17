declare namespace Aha {
  type EpicOrder_workflowBoardPosition = 'workflowBoardPosition';
  type EpicOrder_createdAt = 'createdAt';
  type EpicOrder_position = 'position';
  type EpicOrderEnum =
    | EpicOrder_workflowBoardPosition
    | EpicOrder_createdAt
    | EpicOrder_position;
  type ExtensionFieldableTypeEnum_EPIC = 'EPIC';
  type ExtensionFieldableTypeEnum_FEATURE = 'FEATURE';
  type ExtensionFieldableTypeEnum_REQUIREMENT = 'REQUIREMENT';
  type ExtensionFieldableTypeEnumEnum =
    | ExtensionFieldableTypeEnum_EPIC
    | ExtensionFieldableTypeEnum_FEATURE
    | ExtensionFieldableTypeEnum_REQUIREMENT;
  type FeatureOrder_workflowBoardPosition = 'workflowBoardPosition';
  type FeatureOrder_createdAt = 'createdAt';
  type FeatureOrder_position = 'position';
  type FeatureOrder_featureBoardPosition = 'featureBoardPosition';
  type FeatureOrderEnum =
    | FeatureOrder_workflowBoardPosition
    | FeatureOrder_createdAt
    | FeatureOrder_position
    | FeatureOrder_featureBoardPosition;
  type InternalMeaning_NOT_STARTED = 'NOT_STARTED';
  type InternalMeaning_IN_PROGRESS = 'IN_PROGRESS';
  type InternalMeaning_DONE = 'DONE';
  type InternalMeaning_SHIPPED = 'SHIPPED';
  type InternalMeaning_WONT_DO = 'WONT_DO';
  type InternalMeaning_ALREADY_EXISTS = 'ALREADY_EXISTS';
  type InternalMeaningEnum =
    | InternalMeaning_NOT_STARTED
    | InternalMeaning_IN_PROGRESS
    | InternalMeaning_DONE
    | InternalMeaning_SHIPPED
    | InternalMeaning_WONT_DO
    | InternalMeaning_ALREADY_EXISTS;
  type IterationOrder_startDate = 'startDate';
  type IterationOrderEnum = IterationOrder_startDate;
  type OrderDirection_ASC = 'ASC';
  type OrderDirection_DESC = 'DESC';
  type OrderDirectionEnum = OrderDirection_ASC | OrderDirection_DESC;
  type RecordPlacementEnum_TOP = 'TOP';
  type RecordPlacementEnum_BOTTOM = 'BOTTOM';
  type RecordPlacementEnumEnum =
    | RecordPlacementEnum_TOP
    | RecordPlacementEnum_BOTTOM;
  type ReleaseOrder_featuresBoardOrder = 'featuresBoardOrder';
  type ReleaseOrderEnum = ReleaseOrder_featuresBoardOrder;
  type RequirementOrder_workflowBoardPosition = 'workflowBoardPosition';
  type RequirementOrder_createdAt = 'createdAt';
  type RequirementOrder_position = 'position';
  type RequirementOrderEnum =
    | RequirementOrder_workflowBoardPosition
    | RequirementOrder_createdAt
    | RequirementOrder_position;
  type TaskStatusEnum_PENDING = 'PENDING';
  type TaskStatusEnum_COMPLETE = 'COMPLETE';
  type TaskStatusEnum_APPROVED = 'APPROVED';
  type TaskStatusEnum_APPROVED_CONDITIONALLY = 'APPROVED_CONDITIONALLY';
  type TaskStatusEnum_REJECTED = 'REJECTED';
  type TaskStatusEnum_SKIPPED = 'SKIPPED';
  type TaskStatusEnumEnum =
    | TaskStatusEnum_PENDING
    | TaskStatusEnum_COMPLETE
    | TaskStatusEnum_APPROVED
    | TaskStatusEnum_APPROVED_CONDITIONALLY
    | TaskStatusEnum_REJECTED
    | TaskStatusEnum_SKIPPED;
  type WorkUnitEnum_MINUTES = 'MINUTES';
  type WorkUnitEnum_POINTS = 'POINTS';
  type WorkUnitEnumEnum = WorkUnitEnum_MINUTES | WorkUnitEnum_POINTS;
  type ExtensionFieldableSubjectUnion =
    | Account
    | Epic
    | Feature
    | Project
    | Requirement
    | User;
  type RecordUnion = Epic | Feature | Requirement;
  type TaskableSubjectUnion = Feature;
  type CapacityEstimateInterface = Epic | Feature | Requirement;
  type ExtensionFieldsInterface =
    | Account
    | Epic
    | Feature
    | Project
    | Requirement
    | User;
  type ReferenceInterface = Epic | Feature | Release | Requirement;
  type TaskableInterface = Feature;
  type UserAssignableInterface = Epic | Feature | Requirement;
  type EpicFilters = {
    /**
     * Only show epics in active releases
     */
    active: boolean;
    id: Array<string>;
    projectId: string;
    releaseId: string;
    teamId: string;
    iterationId: string;
  };
  type ExtensionContributionFilters = {
    id: Array<string>;
    /**
     * Filters contributions by identifier. Example: 'aha-develop.github-import.issues'
     */
    identifier: string;
    /**
     * Filters contributions by contribution type: 'commands', 'endpoints', 'events', 'importers', 'settings', or 'views'
     */
    contributes: string;
  };
  type ExtensionFieldsFilters = {
    name: string;
    /**
     * The record type that the extension field belongs to.
     */
    extensionFieldableType: ExtensionFieldableTypeEnumEnum;
    /**
     * Finds fields for the extension with the specified ID
     */
    extensionId: string;
    /**
     * Finds fields for the extension with the specified identifier. Example: 'aha-develop.github-import'
     */
    extensionIdentifier: string;
  };
  type ExtensionLogFilters = {
    /**
     * Return only log lines after the specified date (in ISO8601 format)
     */
    createdSince: string;
    extensionId: string;
    extensionContributionId: string;
    extensionInvocationId: string;
  };
  type FeatureFilters = {
    /**
     * Only show features in active releases
     */
    active: boolean;
    iterationId: string;
    id: Array<string>;
    projectId: string;
    teamId: string;
    releaseId: string;
  };
  type IterationFilters = {
    projectId: string;
    /**
     * Limit to iterations in the specified statuses. PLANNING: 10, ACTIVE: 20, COMPLETE: 30
     */
    status: Array<number>;
  };
  type ReleaseFilters = {
    id: Array<string>;
    projectId: string;
    /**
     * Only return active releases
     */
    active: boolean;
  };
  type RequirementFilters = {
    /**
     * Only show requirements in active releases
     */
    active: boolean;
    id: Array<string>;
    releaseId: string;
    projectId: string;
    teamId: string;
    iterationId: string;
  };
  type TagFilters = {
    id: Array<string>;
  };
  type UserFilters = {
    projectId: string;
    id: Array<string>;
  };
  /**
   * Attributes for Account
   * @category Aha! Model Attributes
   */
  interface AccountAttributes {
    readonly id: string;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
  }

  type AccountQuery = Query<Account, never>;

  /**
   * Account Aha! model
   *
   * An Aha! account
   *
   * Instance type: [[Account]]
   *
   * @category Aha! Model
   */
  interface AccountConstructor {
    typename: 'Account';

    select<F extends keyof AccountAttributes>(names: F[]): AccountQuery;

    select<F extends keyof AccountAttributes>(...names: F[]): AccountQuery;

    blank(attrs: AccountAttributes): Account;

    new (attributes: Partial<AccountAttributes>): Account;
  }

  /**
   * Account Aha! model
   *
   * An Aha! account
   *
   * Constructor: [[AccountConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Account
    extends ApplicationModel,
      AccountAttributes,
      HasExtensionFields {
    readonly typename: 'Account';

    readonly query: AccountQuery;

    attributes: AccountAttributes;
  }

  /**
   * Attributes for BookmarksRecordPosition
   * @category Aha! Model Attributes
   */
  interface BookmarksRecordPositionAttributes {
    /**
     * The type of bookmark this position applies to. For example: 'Iteration', 'Bookmarks::WorkflowBoard'
     */

    readonly bookmarkType: string;
    readonly id: string;
    /**
     * The position of the record. Smaller / more negative is higher.
     */

    readonly position: number;
    readonly recordId: string;
    readonly recordType: string;
  }

  type BookmarksRecordPositionQuery = Query<BookmarksRecordPosition, never>;

  /**
   * BookmarksRecordPosition Aha! model
   *
   * The position of a record in a specific bookmark type. This is used to sort records in different ways when they belong to different views.
   *
   * Instance type: [[BookmarksRecordPosition]]
   *
   * @category Aha! Model
   */
  interface BookmarksRecordPositionConstructor {
    typename: 'BookmarksRecordPosition';

    select<F extends keyof BookmarksRecordPositionAttributes>(
      names: F[]
    ): BookmarksRecordPositionQuery;

    select<F extends keyof BookmarksRecordPositionAttributes>(
      ...names: F[]
    ): BookmarksRecordPositionQuery;

    blank(attrs: BookmarksRecordPositionAttributes): BookmarksRecordPosition;

    new (
      attributes: Partial<BookmarksRecordPositionAttributes>
    ): BookmarksRecordPosition;
  }

  /**
   * BookmarksRecordPosition Aha! model
   *
   * The position of a record in a specific bookmark type. This is used to sort records in different ways when they belong to different views.
   *
   * Constructor: [[BookmarksRecordPositionConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface BookmarksRecordPosition
    extends ApplicationModel,
      BookmarksRecordPositionAttributes {
    readonly typename: 'BookmarksRecordPosition';

    readonly query: BookmarksRecordPositionQuery;

    attributes: BookmarksRecordPositionAttributes;
  }

  /**
   * Attributes for BookmarksTeamBacklog
   * @category Aha! Model Attributes
   */
  interface BookmarksTeamBacklogAttributes {
    readonly id: string;
    /**
     * The project / team this backlog applies to
     */

    readonly projectId: string;
    readonly records: Array<RecordUnion>;
  }

  type BookmarksTeamBacklogQuery = Query<BookmarksTeamBacklog, never>;

  /**
   * BookmarksTeamBacklog Aha! model
   *
   * A reorderable backlog for a team
   *
   * Instance type: [[BookmarksTeamBacklog]]
   *
   * @category Aha! Model
   */
  interface BookmarksTeamBacklogConstructor {
    typename: 'BookmarksTeamBacklog';

    select<F extends keyof BookmarksTeamBacklogAttributes>(
      names: F[]
    ): BookmarksTeamBacklogQuery;

    select<F extends keyof BookmarksTeamBacklogAttributes>(
      ...names: F[]
    ): BookmarksTeamBacklogQuery;

    blank(attrs: BookmarksTeamBacklogAttributes): BookmarksTeamBacklog;

    new (
      attributes: Partial<BookmarksTeamBacklogAttributes>
    ): BookmarksTeamBacklog;
  }

  /**
   * BookmarksTeamBacklog Aha! model
   *
   * A reorderable backlog for a team
   *
   * Constructor: [[BookmarksTeamBacklogConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface BookmarksTeamBacklog
    extends ApplicationModel,
      BookmarksTeamBacklogAttributes {
    readonly typename: 'BookmarksTeamBacklog';

    readonly query: BookmarksTeamBacklogQuery;

    attributes: BookmarksTeamBacklogAttributes;
  }

  /**
   * Attributes for BookmarksWorkflowBoard
   * @category Aha! Model Attributes
   */
  interface BookmarksWorkflowBoardAttributes {
    /**
     * Currently active filters on the board
     */

    readonly filters: any;
    readonly id: string;
    /**
     * The project or team whose records appear on this board
     */

    readonly projectId: string;
    /**
     * How to view the board: 'my_work', 'team_work', or 'none'
     */

    readonly view: string;
    /**
     * The ID of the workflow of the records on this board
     */

    readonly workflowId: string;
    /**
     * The iteration whose records appear on this board, if applicable
     */

    readonly iteration: Iteration;
    readonly records: Array<RecordUnion>;
  }

  type BookmarksWorkflowBoardQuery = Query<BookmarksWorkflowBoard, never>;

  /**
   * BookmarksWorkflowBoard Aha! model
   *
   * A workflow board for a team or iteration
   *
   * Instance type: [[BookmarksWorkflowBoard]]
   *
   * @category Aha! Model
   */
  interface BookmarksWorkflowBoardConstructor {
    typename: 'BookmarksWorkflowBoard';

    select<F extends keyof BookmarksWorkflowBoardAttributes>(
      names: F[]
    ): BookmarksWorkflowBoardQuery;

    select<F extends keyof BookmarksWorkflowBoardAttributes>(
      ...names: F[]
    ): BookmarksWorkflowBoardQuery;

    blank(attrs: BookmarksWorkflowBoardAttributes): BookmarksWorkflowBoard;

    new (
      attributes: Partial<BookmarksWorkflowBoardAttributes>
    ): BookmarksWorkflowBoard;
  }

  /**
   * BookmarksWorkflowBoard Aha! model
   *
   * A workflow board for a team or iteration
   *
   * Constructor: [[BookmarksWorkflowBoardConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface BookmarksWorkflowBoard
    extends ApplicationModel,
      BookmarksWorkflowBoardAttributes {
    readonly typename: 'BookmarksWorkflowBoard';

    readonly query: BookmarksWorkflowBoardQuery;

    attributes: BookmarksWorkflowBoardAttributes;
  }

  /**
   * Attributes for Epic
   * @category Aha! Model Attributes
   */
  interface EpicAttributes {
    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the details page
     */

    readonly path: string;
    /**
     * Position of the epic when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the record. Example: DEV-123
     */

    readonly referenceNum: string;
    assignedToUser: User;
    iteration: Iteration;
    /**
     * Originally estimated amount of work
     */

    readonly originalEstimate: Estimate;
    readonly project: Project;
    release: Release;
    /**
     * Current estimate of work left to do
     */

    readonly remainingEstimate: Estimate;
    /**
     * Team this epic belongs to
     */

    team: Project;
    /**
     * Current team workflow status
     */

    teamWorkflowStatus: WorkflowStatus;
    /**
     * Amount of work done so far
     */

    readonly workDone: Estimate;
    /**
     * Current overall workflow status
     */

    workflowStatus: WorkflowStatus;
    /**
     * The position of a record when it is listed in a specific bookmark type
     */

    readonly bookmarksRecordPositions: Array<BookmarksRecordPosition>;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
    readonly features: Array<Feature>;
    readonly tags: Array<Tag>;
  }

  type EpicQuery = Query<Epic, EpicFilters>;

  /**
   * Epic Aha! model
   *
   * A high-level record that can contain multiple related features
   *
   * Instance type: [[Epic]]
   *
   * @category Aha! Model
   */
  interface EpicConstructor {
    typename: 'Epic';

    select<F extends keyof EpicAttributes>(names: F[]): EpicQuery;

    select<F extends keyof EpicAttributes>(...names: F[]): EpicQuery;

    where(filters: Partial<EpicFilters>): EpicQuery;

    blank(attrs: EpicAttributes): Epic;

    new (attributes: Partial<EpicAttributes>): Epic;
  }

  /**
   * Epic Aha! model
   *
   * A high-level record that can contain multiple related features
   *
   * Constructor: [[EpicConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Epic extends ApplicationModel, EpicAttributes, HasExtensionFields {
    readonly typename: 'Epic';

    readonly query: EpicQuery;

    attributes: EpicAttributes;
  }

  /**
   * Attributes for Estimate
   * @category Aha! Model Attributes
   */
  interface EstimateAttributes {
    /**
     * A string representation of the estimate. Example: 14p for 14 points
     */

    readonly text: string;
    readonly units: WorkUnitEnumEnum;
    readonly value: number;
  }

  type EstimateQuery = Query<Estimate, never>;

  /**
   * Estimate Aha! model
   *
   * An estimate of work done or work remaining for a record
   *
   * Instance type: [[Estimate]]
   *
   * @category Aha! Model
   */
  interface EstimateConstructor {
    typename: 'Estimate';

    select<F extends keyof EstimateAttributes>(names: F[]): EstimateQuery;

    select<F extends keyof EstimateAttributes>(...names: F[]): EstimateQuery;

    blank(attrs: EstimateAttributes): Estimate;

    new (attributes: Partial<EstimateAttributes>): Estimate;
  }

  /**
   * Estimate Aha! model
   *
   * An estimate of work done or work remaining for a record
   *
   * Constructor: [[EstimateConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Estimate extends ApplicationModel, EstimateAttributes {
    readonly typename: 'Estimate';

    readonly query: EstimateQuery;

    attributes: EstimateAttributes;
  }

  /**
   * Attributes for Extension
   * @category Aha! Model Attributes
   */
  interface ExtensionAttributes {
    readonly enabled: boolean;
    readonly id: string;
    readonly identifier: string;
    readonly name: string;
    readonly extensionLogs: Array<ExtensionLog>;
  }

  type ExtensionQuery = Query<Extension, never>;

  /**
   * Extension Aha! model
   *
   *
   *
   * Instance type: [[Extension]]
   *
   * @category Aha! Model
   */
  interface ExtensionConstructor {
    typename: 'Extension';

    select<F extends keyof ExtensionAttributes>(names: F[]): ExtensionQuery;

    select<F extends keyof ExtensionAttributes>(...names: F[]): ExtensionQuery;

    blank(attrs: ExtensionAttributes): Extension;

    new (attributes: Partial<ExtensionAttributes>): Extension;
  }

  /**
   * Extension Aha! model
   *
   *
   *
   * Constructor: [[ExtensionConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Extension extends ApplicationModel, ExtensionAttributes {
    readonly typename: 'Extension';

    readonly query: ExtensionQuery;

    attributes: ExtensionAttributes;
  }

  /**
   * Attributes for ExtensionContribution
   * @category Aha! Model Attributes
   */
  interface ExtensionContributionAttributes {
    readonly id: string;
    /**
     * The identifier of the extensin contribution. Example: 'aha-develop.github-import.issues'
     */

    readonly identifier: string;
    readonly name: string;
    /**
     * The extension providing this contribution
     */

    readonly extension: Extension;
  }

  type ExtensionContributionQuery = Query<
    ExtensionContribution,
    ExtensionContributionFilters
  >;

  /**
   * ExtensionContribution Aha! model
   *
   * A contribution provided by an extension
   *
   * Instance type: [[ExtensionContribution]]
   *
   * @category Aha! Model
   */
  interface ExtensionContributionConstructor {
    typename: 'ExtensionContribution';

    select<F extends keyof ExtensionContributionAttributes>(
      names: F[]
    ): ExtensionContributionQuery;

    select<F extends keyof ExtensionContributionAttributes>(
      ...names: F[]
    ): ExtensionContributionQuery;

    where(
      filters: Partial<ExtensionContributionFilters>
    ): ExtensionContributionQuery;

    blank(attrs: ExtensionContributionAttributes): ExtensionContribution;

    new (
      attributes: Partial<ExtensionContributionAttributes>
    ): ExtensionContribution;
  }

  /**
   * ExtensionContribution Aha! model
   *
   * A contribution provided by an extension
   *
   * Constructor: [[ExtensionContributionConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface ExtensionContribution
    extends ApplicationModel,
      ExtensionContributionAttributes {
    readonly typename: 'ExtensionContribution';

    readonly query: ExtensionContributionQuery;

    attributes: ExtensionContributionAttributes;
  }

  /**
   * Attributes for ExtensionField
   * @category Aha! Model Attributes
   */
  interface ExtensionFieldAttributes {
    /**
     * The ID of the object the field is attached to
     */

    extensionFieldableId: string;
    /**
     * The type of object the field is attached to
     */

    extensionFieldableType: string;
    readonly id: string;
    name: string;
    value: any;
    /**
     * The extension responsible for this field
     */

    extension: Extension;
    readonly extensionFieldable: ExtensionFieldableSubjectUnion;
  }

  type ExtensionFieldQuery = Query<ExtensionField, ExtensionFieldsFilters>;

  /**
   * ExtensionField Aha! model
   *
   * Holds data related to an extension
   *
   * Instance type: [[ExtensionField]]
   *
   * @category Aha! Model
   */
  interface ExtensionFieldConstructor {
    typename: 'ExtensionField';

    select<F extends keyof ExtensionFieldAttributes>(
      names: F[]
    ): ExtensionFieldQuery;

    select<F extends keyof ExtensionFieldAttributes>(
      ...names: F[]
    ): ExtensionFieldQuery;

    where(filters: Partial<ExtensionFieldsFilters>): ExtensionFieldQuery;

    blank(attrs: ExtensionFieldAttributes): ExtensionField;

    new (attributes: Partial<ExtensionFieldAttributes>): ExtensionField;
  }

  /**
   * ExtensionField Aha! model
   *
   * Holds data related to an extension
   *
   * Constructor: [[ExtensionFieldConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface ExtensionField extends ApplicationModel, ExtensionFieldAttributes {
    readonly typename: 'ExtensionField';

    readonly query: ExtensionFieldQuery;

    attributes: ExtensionFieldAttributes;
  }

  /**
   * Attributes for ExtensionInvocation
   * @category Aha! Model Attributes
   */
  interface ExtensionInvocationAttributes {
    readonly createdAt: string;
    readonly id: string;
    /**
     * The contribution that was invoked
     */

    readonly extensionContribution: ExtensionContribution;
    /**
     * Log messages written during this invocation
     */

    readonly extensionLogs: ExtensionLog;
  }

  type ExtensionInvocationQuery = Query<ExtensionInvocation, never>;

  /**
   * ExtensionInvocation Aha! model
   *
   * A single invocation of an extension contribution
   *
   * Instance type: [[ExtensionInvocation]]
   *
   * @category Aha! Model
   */
  interface ExtensionInvocationConstructor {
    typename: 'ExtensionInvocation';

    select<F extends keyof ExtensionInvocationAttributes>(
      names: F[]
    ): ExtensionInvocationQuery;

    select<F extends keyof ExtensionInvocationAttributes>(
      ...names: F[]
    ): ExtensionInvocationQuery;

    blank(attrs: ExtensionInvocationAttributes): ExtensionInvocation;

    new (
      attributes: Partial<ExtensionInvocationAttributes>
    ): ExtensionInvocation;
  }

  /**
   * ExtensionInvocation Aha! model
   *
   * A single invocation of an extension contribution
   *
   * Constructor: [[ExtensionInvocationConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface ExtensionInvocation
    extends ApplicationModel,
      ExtensionInvocationAttributes {
    readonly typename: 'ExtensionInvocation';

    readonly query: ExtensionInvocationQuery;

    attributes: ExtensionInvocationAttributes;
  }

  /**
   * Attributes for ExtensionLog
   * @category Aha! Model Attributes
   */
  interface ExtensionLogAttributes {
    /**
     * Structured log messages
     */

    readonly content: any;
    readonly createdAt: string;
    readonly id: string;
    /**
     * The contribution that was invoked
     */

    readonly extensionContribution: ExtensionContribution;
    /**
     * The invocation writing these log messages
     */

    readonly extensionInvocation: ExtensionInvocation;
  }

  type ExtensionLogQuery = Query<ExtensionLog, ExtensionLogFilters>;

  /**
   * ExtensionLog Aha! model
   *
   * Log messages for a single invocation of an extension contribution
   *
   * Instance type: [[ExtensionLog]]
   *
   * @category Aha! Model
   */
  interface ExtensionLogConstructor {
    typename: 'ExtensionLog';

    select<F extends keyof ExtensionLogAttributes>(
      names: F[]
    ): ExtensionLogQuery;

    select<F extends keyof ExtensionLogAttributes>(
      ...names: F[]
    ): ExtensionLogQuery;

    where(filters: Partial<ExtensionLogFilters>): ExtensionLogQuery;

    blank(attrs: ExtensionLogAttributes): ExtensionLog;

    new (attributes: Partial<ExtensionLogAttributes>): ExtensionLog;
  }

  /**
   * ExtensionLog Aha! model
   *
   * Log messages for a single invocation of an extension contribution
   *
   * Constructor: [[ExtensionLogConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface ExtensionLog extends ApplicationModel, ExtensionLogAttributes {
    readonly typename: 'ExtensionLog';

    readonly query: ExtensionLogQuery;

    attributes: ExtensionLogAttributes;
  }

  /**
   * Attributes for Feature
   * @category Aha! Model Attributes
   */
  interface FeatureAttributes {
    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the details page
     */

    readonly path: string;
    /**
     * Position of the feature when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the record. Example: DEV-123
     */

    readonly referenceNum: string;
    assignedToUser: User;
    /**
     * Epic this feature belongs to, if present
     */

    epic: Epic;
    iteration: Iteration;
    /**
     * Originally estimated amount of work
     */

    readonly originalEstimate: Estimate;
    readonly project: Project;
    release: Release;
    /**
     * Current estimate of work left to do
     */

    readonly remainingEstimate: Estimate;
    /**
     * Team this feature belongs to
     */

    team: Project;
    /**
     * Current team workflow status
     */

    teamWorkflowStatus: WorkflowStatus;
    /**
     * Amount of work done so far
     */

    readonly workDone: Estimate;
    /**
     * Current overall workflow status
     */

    workflowStatus: WorkflowStatus;
    /**
     * Position when this feature is listed in a specific bookmark type
     */

    readonly bookmarksRecordPositions: Array<BookmarksRecordPosition>;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
    readonly requirements: Array<Requirement>;
    readonly tags: Array<Tag>;
    readonly tasks: Array<Task>;
  }

  type FeatureQuery = Query<Feature, FeatureFilters>;

  /**
   * Feature Aha! model
   *
   * A basic record representing work to be done
   *
   * Instance type: [[Feature]]
   *
   * @category Aha! Model
   */
  interface FeatureConstructor {
    typename: 'Feature';

    select<F extends keyof FeatureAttributes>(names: F[]): FeatureQuery;

    select<F extends keyof FeatureAttributes>(...names: F[]): FeatureQuery;

    where(filters: Partial<FeatureFilters>): FeatureQuery;

    blank(attrs: FeatureAttributes): Feature;

    new (attributes: Partial<FeatureAttributes>): Feature;
  }

  /**
   * Feature Aha! model
   *
   * A basic record representing work to be done
   *
   * Constructor: [[FeatureConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Feature
    extends ApplicationModel,
      FeatureAttributes,
      HasExtensionFields {
    readonly typename: 'Feature';

    readonly query: FeatureQuery;

    attributes: FeatureAttributes;
  }

  /**
   * Attributes for Iteration
   * @category Aha! Model Attributes
   */
  interface IterationAttributes {
    /**
     * Duration of the iteration, in days
     */

    duration: number;
    readonly id: string;
    name: string;
    startDate: string;
    /**
     * The iteration status. PLANNING: 10, ACTIVE: 20, COMPLETE: 30
     */

    status: number;
    /**
     * Capacity of the iteration
     */

    capacity: Estimate;
    /**
     * Total amount of work planned when the iteration started
     */

    readonly originalEstimate: Estimate;
    project: Project;
    /**
     * Records scheduled in this iteration
     */

    readonly records: Array<RecordUnion>;
  }

  type IterationQuery = Query<Iteration, IterationFilters>;

  /**
   * Iteration Aha! model
   *
   * A group of records scheduled during a particular time period
   *
   * Instance type: [[Iteration]]
   *
   * @category Aha! Model
   */
  interface IterationConstructor {
    typename: 'Iteration';

    select<F extends keyof IterationAttributes>(names: F[]): IterationQuery;

    select<F extends keyof IterationAttributes>(...names: F[]): IterationQuery;

    where(filters: Partial<IterationFilters>): IterationQuery;

    blank(attrs: IterationAttributes): Iteration;

    new (attributes: Partial<IterationAttributes>): Iteration;
  }

  /**
   * Iteration Aha! model
   *
   * A group of records scheduled during a particular time period
   *
   * Constructor: [[IterationConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Iteration extends ApplicationModel, IterationAttributes {
    readonly typename: 'Iteration';

    readonly query: IterationQuery;

    attributes: IterationAttributes;
  }

  /**
   * Attributes for Project
   * @category Aha! Model Attributes
   */
  interface ProjectAttributes {
    /**
     * ID of the BookmarksWorkflowBoard correspanding to this team
     */

    readonly backlogBookmarkId: string;
    readonly id: string;
    /**
     * True if the project is a team, false if it is a workspace
     */

    readonly isTeam: boolean;
    readonly name: string;
    /**
     * Release new records are created in, by default
     */

    readonly defaultRelease: Release;
    /**
     * User assigned to records if none is specified
     */

    readonly defaultUser: User;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
    readonly releases: Array<Release>;
    /**
     * Users belonging to the project or team
     */

    readonly users: Array<User>;
  }

  type ProjectQuery = Query<Project, never>;

  /**
   * Project Aha! model
   *
   * An Aha! workspace or team
   *
   * Instance type: [[Project]]
   *
   * @category Aha! Model
   */
  interface ProjectConstructor {
    typename: 'Project';

    select<F extends keyof ProjectAttributes>(names: F[]): ProjectQuery;

    select<F extends keyof ProjectAttributes>(...names: F[]): ProjectQuery;

    blank(attrs: ProjectAttributes): Project;

    new (attributes: Partial<ProjectAttributes>): Project;
  }

  /**
   * Project Aha! model
   *
   * An Aha! workspace or team
   *
   * Constructor: [[ProjectConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Project
    extends ApplicationModel,
      ProjectAttributes,
      HasExtensionFields {
    readonly typename: 'Project';

    readonly query: ProjectQuery;

    attributes: ProjectAttributes;
  }

  /**
   * Attributes for Release
   * @category Aha! Model Attributes
   */
  interface ReleaseAttributes {
    readonly id: string;
    readonly name: string;
    /**
     * True if the release appears in the parking lot, false if it is a scheduled release
     */

    readonly parkingLot: boolean;
    /**
     * Path to the details page
     */

    readonly path: string;
    readonly position: number;
    /**
     * Reference number of the record. Example: DEV-123
     */

    readonly referenceNum: string;
    readonly releaseDate: string;
  }

  type ReleaseQuery = Query<Release, ReleaseFilters>;

  /**
   * Release Aha! model
   *
   * A group of records with a release date or theme
   *
   * Instance type: [[Release]]
   *
   * @category Aha! Model
   */
  interface ReleaseConstructor {
    typename: 'Release';

    select<F extends keyof ReleaseAttributes>(names: F[]): ReleaseQuery;

    select<F extends keyof ReleaseAttributes>(...names: F[]): ReleaseQuery;

    where(filters: Partial<ReleaseFilters>): ReleaseQuery;

    blank(attrs: ReleaseAttributes): Release;

    new (attributes: Partial<ReleaseAttributes>): Release;
  }

  /**
   * Release Aha! model
   *
   * A group of records with a release date or theme
   *
   * Constructor: [[ReleaseConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Release extends ApplicationModel, ReleaseAttributes {
    readonly typename: 'Release';

    readonly query: ReleaseQuery;

    attributes: ReleaseAttributes;
  }

  /**
   * Attributes for Requirement
   * @category Aha! Model Attributes
   */
  interface RequirementAttributes {
    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the details page
     */

    readonly path: string;
    /**
     * Position of the requirement when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the record. Example: DEV-123
     */

    readonly referenceNum: string;
    assignedToUser: User;
    /**
     * Epic this requirement belongs to, if present
     */

    readonly epic: Epic;
    /**
     * Feature this requirement belongs to, if present
     */

    feature: Feature;
    iteration: Iteration;
    /**
     * Originally estimated amount of work
     */

    readonly originalEstimate: Estimate;
    readonly project: Project;
    readonly release: Release;
    /**
     * Current estimate of work left to do
     */

    readonly remainingEstimate: Estimate;
    /**
     * Team this requirement belongs to
     */

    team: Project;
    /**
     * Current team workflow status
     */

    teamWorkflowStatus: WorkflowStatus;
    /**
     * Amount of work done so far
     */

    readonly workDone: Estimate;
    /**
     * Current overall workflow status
     */

    workflowStatus: WorkflowStatus;
    /**
     * Position when this record is listed in a specific bookmark type
     */

    readonly bookmarksRecordPositions: Array<BookmarksRecordPosition>;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
  }

  type RequirementQuery = Query<Requirement, RequirementFilters>;

  /**
   * Requirement Aha! model
   *
   * A record representing one part of a larger feature
   *
   * Instance type: [[Requirement]]
   *
   * @category Aha! Model
   */
  interface RequirementConstructor {
    typename: 'Requirement';

    select<F extends keyof RequirementAttributes>(names: F[]): RequirementQuery;

    select<F extends keyof RequirementAttributes>(
      ...names: F[]
    ): RequirementQuery;

    where(filters: Partial<RequirementFilters>): RequirementQuery;

    blank(attrs: RequirementAttributes): Requirement;

    new (attributes: Partial<RequirementAttributes>): Requirement;
  }

  /**
   * Requirement Aha! model
   *
   * A record representing one part of a larger feature
   *
   * Constructor: [[RequirementConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Requirement
    extends ApplicationModel,
      RequirementAttributes,
      HasExtensionFields {
    readonly typename: 'Requirement';

    readonly query: RequirementQuery;

    attributes: RequirementAttributes;
  }

  /**
   * Attributes for Tag
   * @category Aha! Model Attributes
   */
  interface TagAttributes {
    /**
     * Hex color converted to decimal
     */

    readonly color: number;
    readonly id: string;
    readonly name: string;
  }

  type TagQuery = Query<Tag, TagFilters>;

  /**
   * Tag Aha! model
   *
   * A tag on a record
   *
   * Instance type: [[Tag]]
   *
   * @category Aha! Model
   */
  interface TagConstructor {
    typename: 'Tag';

    select<F extends keyof TagAttributes>(names: F[]): TagQuery;

    select<F extends keyof TagAttributes>(...names: F[]): TagQuery;

    where(filters: Partial<TagFilters>): TagQuery;

    blank(attrs: TagAttributes): Tag;

    new (attributes: Partial<TagAttributes>): Tag;
  }

  /**
   * Tag Aha! model
   *
   * A tag on a record
   *
   * Constructor: [[TagConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Tag extends ApplicationModel, TagAttributes {
    readonly typename: 'Tag';

    readonly query: TagQuery;

    attributes: TagAttributes;
  }

  /**
   * Attributes for Task
   * @category Aha! Model Attributes
   */
  interface TaskAttributes {
    body: string;
    readonly dueDate: string;
    readonly id: string;
    name: string;
    position: number;
    status: TaskStatusEnumEnum;
    record: TaskableSubjectUnion;
    readonly taskUsers: Array<TaskUser>;
    readonly users: Array<User>;
  }

  type TaskQuery = Query<Task, never>;

  /**
   * Task Aha! model
   *
   *
   *
   * Instance type: [[Task]]
   *
   * @category Aha! Model
   */
  interface TaskConstructor {
    typename: 'Task';

    select<F extends keyof TaskAttributes>(names: F[]): TaskQuery;

    select<F extends keyof TaskAttributes>(...names: F[]): TaskQuery;

    blank(attrs: TaskAttributes): Task;

    new (attributes: Partial<TaskAttributes>): Task;
  }

  /**
   * Task Aha! model
   *
   *
   *
   * Constructor: [[TaskConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Task extends ApplicationModel, TaskAttributes {
    readonly typename: 'Task';

    readonly query: TaskQuery;

    attributes: TaskAttributes;
  }

  /**
   * Attributes for TaskUser
   * @category Aha! Model Attributes
   */
  interface TaskUserAttributes {
    readonly completedDate: string;
    readonly id: string;
    readonly status: TaskStatusEnumEnum;
    readonly task: Task;
    readonly user: User;
  }

  type TaskUserQuery = Query<TaskUser, never>;

  /**
   * TaskUser Aha! model
   *
   *
   *
   * Instance type: [[TaskUser]]
   *
   * @category Aha! Model
   */
  interface TaskUserConstructor {
    typename: 'TaskUser';

    select<F extends keyof TaskUserAttributes>(names: F[]): TaskUserQuery;

    select<F extends keyof TaskUserAttributes>(...names: F[]): TaskUserQuery;

    blank(attrs: TaskUserAttributes): TaskUser;

    new (attributes: Partial<TaskUserAttributes>): TaskUser;
  }

  /**
   * TaskUser Aha! model
   *
   *
   *
   * Constructor: [[TaskUserConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface TaskUser extends ApplicationModel, TaskUserAttributes {
    readonly typename: 'TaskUser';

    readonly query: TaskUserQuery;

    attributes: TaskUserAttributes;
  }

  /**
   * Attributes for User
   * @category Aha! Model Attributes
   */
  interface UserAttributes {
    readonly avatarUrl: string;
    readonly id: string;
    readonly name: string;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
    readonly taskUsers: Array<TaskUser>;
  }

  type UserQuery = Query<User, UserFilters>;

  /**
   * User Aha! model
   *
   *
   *
   * Instance type: [[User]]
   *
   * @category Aha! Model
   */
  interface UserConstructor {
    typename: 'User';

    select<F extends keyof UserAttributes>(names: F[]): UserQuery;

    select<F extends keyof UserAttributes>(...names: F[]): UserQuery;

    where(filters: Partial<UserFilters>): UserQuery;

    blank(attrs: UserAttributes): User;

    new (attributes: Partial<UserAttributes>): User;
  }

  /**
   * User Aha! model
   *
   *
   *
   * Constructor: [[UserConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface User extends ApplicationModel, UserAttributes, HasExtensionFields {
    readonly typename: 'User';

    readonly query: UserQuery;

    attributes: UserAttributes;
  }

  /**
   * Attributes for Workflow
   * @category Aha! Model Attributes
   */
  interface WorkflowAttributes {
    /**
     * If true, this is a global status that cannot be edited
     */

    readonly builtIn: boolean;
    readonly id: string;
    readonly name: string;
    readonly workflowStatuses: Array<WorkflowStatus>;
  }

  type WorkflowQuery = Query<Workflow, never>;

  /**
   * Workflow Aha! model
   *
   * A record workflow
   *
   * Instance type: [[Workflow]]
   *
   * @category Aha! Model
   */
  interface WorkflowConstructor {
    typename: 'Workflow';

    select<F extends keyof WorkflowAttributes>(names: F[]): WorkflowQuery;

    select<F extends keyof WorkflowAttributes>(...names: F[]): WorkflowQuery;

    blank(attrs: WorkflowAttributes): Workflow;

    new (attributes: Partial<WorkflowAttributes>): Workflow;
  }

  /**
   * Workflow Aha! model
   *
   * A record workflow
   *
   * Constructor: [[WorkflowConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface Workflow extends ApplicationModel, WorkflowAttributes {
    readonly typename: 'Workflow';

    readonly query: WorkflowQuery;

    attributes: WorkflowAttributes;
  }

  /**
   * Attributes for WorkflowStatus
   * @category Aha! Model Attributes
   */
  interface WorkflowStatusAttributes {
    /**
     * If true, this is a global status that cannot be edited
     */

    readonly builtIn: boolean;
    /**
     * Hex color converted to decimal
     */

    color: number;
    readonly id: string;
    readonly internalMeaning: InternalMeaningEnum;
    name: string;
    position: number;
    /**
     * Workflow containing this status
     */

    workflow: Workflow;
  }

  type WorkflowStatusQuery = Query<WorkflowStatus, never>;

  /**
   * WorkflowStatus Aha! model
   *
   * A single status within a workflow
   *
   * Instance type: [[WorkflowStatus]]
   *
   * @category Aha! Model
   */
  interface WorkflowStatusConstructor {
    typename: 'WorkflowStatus';

    select<F extends keyof WorkflowStatusAttributes>(
      names: F[]
    ): WorkflowStatusQuery;

    select<F extends keyof WorkflowStatusAttributes>(
      ...names: F[]
    ): WorkflowStatusQuery;

    blank(attrs: WorkflowStatusAttributes): WorkflowStatus;

    new (attributes: Partial<WorkflowStatusAttributes>): WorkflowStatus;
  }

  /**
   * WorkflowStatus Aha! model
   *
   * A single status within a workflow
   *
   * Constructor: [[WorkflowStatusConstructor]]
   *
   * @category Aha! Model Instance
   */
  interface WorkflowStatus extends ApplicationModel, WorkflowStatusAttributes {
    readonly typename: 'WorkflowStatus';

    readonly query: WorkflowStatusQuery;

    attributes: WorkflowStatusAttributes;
  }

  interface Models {
    Account: AccountConstructor;
    BookmarksRecordPosition: BookmarksRecordPositionConstructor;
    BookmarksTeamBacklog: BookmarksTeamBacklogConstructor;
    BookmarksWorkflowBoard: BookmarksWorkflowBoardConstructor;
    Epic: EpicConstructor;
    Estimate: EstimateConstructor;
    Extension: ExtensionConstructor;
    ExtensionContribution: ExtensionContributionConstructor;
    ExtensionField: ExtensionFieldConstructor;
    ExtensionInvocation: ExtensionInvocationConstructor;
    ExtensionLog: ExtensionLogConstructor;
    Feature: FeatureConstructor;
    Iteration: IterationConstructor;
    Project: ProjectConstructor;
    Release: ReleaseConstructor;
    Requirement: RequirementConstructor;
    Tag: TagConstructor;
    Task: TaskConstructor;
    TaskUser: TaskUserConstructor;
    User: UserConstructor;
    Workflow: WorkflowConstructor;
    WorkflowStatus: WorkflowStatusConstructor;
  }
}

interface Aha {
  models: Aha.Models;
}

declare namespace Aha {
  type GetElementType<T extends Array<any>> = T extends (infer U)[] ? U : never;

  type BelongsTos<T extends ApplicationModel> = {
    [P in keyof T['attributes'] as T['attributes'][P] extends ApplicationModel
      ? P
      : never]: T['attributes'][P] extends ApplicationModel
      ? T['attributes'][P]
      : never;
  };
  type HasManys<T extends ApplicationModel> = {
    [P in keyof T['attributes'] as T['attributes'][P] extends ApplicationModel[]
      ? P
      : never]: T['attributes'][P] extends ApplicationModel[]
      ? GetElementType<T['attributes'][P]>
      : never;
  };
  type Relations<T extends ApplicationModel> = BelongsTos<T> & HasManys<T>;

  type NonRelations<T extends ApplicationModel> = Omit<
    T['attributes'],
    keyof Relations<T>
  >;

  type Subquery<
    T extends ApplicationModel,
    K extends Relations<T> = Relations<T>
  > = {
    [P in keyof K]?: Query<K[P]> | Array<keyof K[P]['attributes']>;
  };

  interface Query<T extends ApplicationModel, Filters = never> {
    /**
     * Unions this query with another query, using GraphQL union
     * types. Should only be used in subqueries.
     *
     * Example: Epic.select(['id', 'name'])
     *            .union(Feature.select(['id', 'name']));
     */
    union(query: Query<T>): this;
    merge(subqueries: Subquery<T>): this;
    where(filters: Partial<Filters>): this;
    order(criteria: { [field: string]: string }): this;
    reorder(criteria: { [field: string]: string }): this;
    first(): SingleQuery<T, Filters>;
    find(id: string): Promise<T>;
    all(): Promise<T[]>;
  }

  interface SingleQuery<T extends ApplicationModel, Filters = never>
    extends Omit<Query<T, Filters>, 'all'> {
    all(): Promise<T>;
  }

  /**
   * Functions for getting and setting extension data for a particular model
   */
  interface HasExtensionFields {
    getExtensionFields(identifier: string): Promise<any>;

    /**
     * Get the value of an extension field on this record. This will return
     * null if the value has never been set
     *
     * @param identifier the extension identifier
     * @param fieldName the name of the field
     */
    getExtensionField<T>(
      identifier: string,
      fieldName: string
    ): Promise<T | null>;

    /**
     * Set the value of an extension field for this record
     *
     * @param identifier the extension identifier
     * @param fieldName the name of the field
     */
    setExtensionField(
      identifier: string,
      fieldName: string,
      value: any
    ): Promise<void>;
  }

  interface ApplicationModel {
    readonly typename: string;
    /**
     * `true` if the object is an existing record, `false` otherwise.
     */
    readonly persisted: boolean;
    /**
     * A guaranteed unique identifier for the record. Returns internalObjectId if id is falsy (unsaved).
     */
    readonly uniqueId: string;

    attributes: {};

    /**
     * Clear the value from an extension field for this record
     *
     * @param identifier the extension identifier
     * @param fieldName the name of the field
     */
    clearExtensionField(identifier: string, fieldName: string): Promise<void>;

    /**
     * `true` if the object's attributes have been modified, `false` otherwise.
     */
    isDirty(): boolean;
    /**
     * Updates or creates this record using a GraphQL mutation. Will use
     * the `update{ModelName}` or `create{ModelName}` mutations,
     * respectively. Sends all changed attributes and relationships as
     * arguments, and, by default, updates attributes using the query used to
     * construct this object.
     *
     * @param options Data used to modify the mutation query.
     *
     * `options`:
     *   - args: Bare, top-level (non-attribute) arguments passed along with the mutation. These will be at the same level as `id`, for example.
     *   - query: A Query object used to override the default query.
     *
     * @returns `true` if the mutation ran without errors, `false` otherwise.
     */
    save(options?: Partial<{ args: any; query: any }>): Promise<boolean>;

    reload<T extends this>(options?: { query?: Query<T> }): Promise<void>;

    /**
     * Load additional attributes from the API:
     *
     * ```
     * const record = await Feature.select('referenceNum').find('REF-123');
     * record.name => null
     * await record.loadAttributes('name');
     * record.name => 'Record 123'
     * ```
     */
    loadAttributes<F extends keyof NonRelations<this>>(
      ...attributes: F[]
    ): Promise<void>;

    /**
     * Destroys this record.
     *
     * @returns `true` if the mutation ran without errors, `false` otherwise.
     */
    destroy(): Promise<boolean>;

    /**
     * Sets the attribute `name` to `value`. This function can be used
     * even if this object didn't declare a setter for the attribute
     * `name`.
     */
    setAttribute<K extends keyof this['attributes']>(
      name: K,
      value: this['attributes'][K],
      flagDirty?: boolean
    ): void;

    /**
     * Sends a GraphQL mutation request, updating the current object from the response.
     *
     * @param {string} mutationName The name of the mutation to call
     * @param {object} options All data passed along to generate the mutation query.
     *
     * `options`:
     *   - args: The arguments passed to the mutation
     *   - query: The Query object used to update data from the mutation response
     *   - stringify: When true, will stringify args using Query.stringifyValue
     *   - cacheId: The key that is expected to be used to cache the result
     *
     * @returns {Promise<boolean>} `true` if the mutation ran without errors, `false` otherwise.
     */
    mutate(
      mutationName: string,
      options?: Partial<{
        args: any;
        query: any;
        stringify: boolean;
        cacheId: string;
      }>
    ): Promise<boolean>;

    /**
     * Returns a shallow duplicate of this record.
     */
    dup(): this;
  }

  /**
   * @deprecated
   * @hidden
   */
  interface RecordStub extends ApplicationModel {
    id: string;
    referenceNum: string;
    type: string;
  }

  /**
   * Access the current settings for an extension
   *
   * @category Extensions
   */
  interface Settings {
    get(name: string): Settings | unknown;
  }

  /**
   * The context for an extension callback
   *
   * @category Extensions
   */
  interface Context {
    settings: Settings;
    identifier: string;
  }

  /**
   * @category Extensions
   */
  interface UpdateCallback {
    (newState: any): Promise<void>;
  }

  /**
   * @category Extensions
   */
  interface RenderExtensionProps {
    isUpdate: boolean;
    onUnmounted: (callback: () => void) => void;
    record?: RecordStub;
    fields?: { [index: string]: unknown };
    update?: UpdateCallback;
    state?: any;
  }

  /**
   * @category Extensions
   */
  interface RenderExtension {
    (props: RenderExtensionProps, context: Context): void | React.ReactNode;
  }

  /**
   * @category Extensions
   */
  interface CommandExtension<Param> {
    (param: Param, context: Context): void;
  }

  /**
   * @category Extensions
   */
  interface CommandPromptOptions {
    placeholder?: string;
    default?: string;
  }

  /**
   * @category Extensions
   */
  interface AuthOptions {
    reAuth?: boolean;
    useCachedRetry?: boolean;
    parameters?: unknown;
  }

  /**
   * @category Extensions
   */
  interface AuthData {
    token: string;
  }

  /**
   * @category Extensions
   */
  interface AuthCallback {
    (authData: AuthData): void;
  }

  /**
   * @category Extensions Importer
   */
  interface ListFiltersEvent {
    action: 'listFilters';
  }

  /**
   * @category Extensions Importer
   */
  interface ListFilter {
    title: string;
    required: boolean;
    type: 'autocomplete' | 'text' | 'select';
  }

  /**
   * @category Extensions Importer
   */
  interface ListFilters {
    [filterName: string]: ListFilter;
  }

  /**
   * @category Extensions Importer
   */
  interface ListFiltersCallback {
    /**
     * Return a list of available filters
     */
    (): ListFilters | Promise<ListFilters>;
  }

  /**
   * @category Extensions Importer
   */
  interface FilterValuesEvent {
    action: 'filterValues';
  }

  /**
   * Some filters will require information from the external server. For
   * example, when filtering to an assigned user, you may want to fetch the
   * list of users from the system you are importing from. filterValues
   * returns the list of possible values for a filter field.
   *
   * @category Extensions Importer
   */
  type FilterValuesCallback = (props: {
    filterName: string;
    filters: { [index: string]: any };
  }) => Promise<FilterValue[]>;

  /**
   * @category Extensions Importer
   */
  interface FilterValue {
    text?: string;
    value: any;
  }

  /**
   * @category Extensions Importer
   */
  interface ListCandidatesEvent {
    action: 'listCandidates';
  }

  /**
   * @category Extensions Importer
   */
  interface ListCandidatesCallback<T extends ImportRecord> {
    (props: { filters: { [index: string]: any }; nextPage?: any }): Promise<
      ListCandidate<T>
    >;
  }

  /**
   * @category Extensions Importer
   */
  interface ListCandidate<T extends ImportRecord> {
    records: T[];
    nextPage?: any;
  }

  /**
   * @category Extensions Importer
   */
  interface RenderRecordEvent {
    action: 'renderRecord';
  }

  /**
   * @category Extensions Importer
   */
  interface RenderRecordCallback<T extends ImportRecord> {
    (props: { record: T; onUnmounted: () => any }): void;
  }

  /**
   * @category Extensions Importer
   */
  interface ImportRecordEvent {
    action: 'importRecord';
  }

  /**
   * @category Extensions Importer
   */
  interface ImportRecordCallback<T extends ImportRecord> {
    (props: { importRecord: T; ahaRecord: RecordStub }): Promise<void>;
  }

  /**
   * @category Extensions Importer
   */
  interface ImportRecord {
    uniqueId: string;
    name: string;
    identifier?: string;
    url?: string;
  }

  /**
   * @category Extensions Importer
   */
  interface Importer<T extends ImportRecord> {
    on(event: ListFiltersEvent, callback: ListFiltersCallback): void;
    on(event: FilterValuesEvent, callback: FilterValuesCallback): void;
    on(event: ListCandidatesEvent, callback: ListCandidatesCallback<T>): void;
    on(event: RenderRecordEvent, callback: RenderRecordCallback<T>): void;
    on(event: ImportRecordEvent, callback: ImportRecordCallback<T>): void;
  }

  interface Drawer {
    showRecord(record: ReferenceInterface): Promise<void>;
    showExtension(
      identifier: string,
      contribution: string,
      props: object
    ): Promise<void>;
    hide(): void;
  }
}

declare class Aha {
  /**
   * The current account
   */
  readonly account: Aha.Account;

  /**
   * Access the drawer
   */
  readonly drawer: Aha.Drawer;

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

  contextForIdentifier(identifier: string): Aha.Context;
  executeExtension(
    identifier: string,
    code: (context: Aha.Context) => void
  ): void;
  getEndpoints(identifier: string): Function[];
  render(
    elements: React.ReactNode,
    node: HTMLElement,
    onUnmounted?: (callback: Function) => void
  ): void;
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
