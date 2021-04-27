declare namespace Aha {
  type EpicOrder_workflowBoardPosition = 'workflowBoardPosition';
  type EpicOrder_createdAt = 'createdAt';
  type EpicOrder_position = 'position';
  type EpicOrderEnum =
    | EpicOrder_workflowBoardPosition
    | EpicOrder_createdAt
    | EpicOrder_position;
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
  type RecordUnion = Epic | Feature | Requirement;
  type TaskableSubjectUnion = Feature;
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
   */
  interface AccountAttributes {
    readonly id: string;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
  }

  /**
   * Account Aha! model
   *
   * An Aha! account
   */
  class Account extends ApplicationModel implements AccountAttributes {
    static typename: 'Account';

    static select<F extends keyof AccountAttributes>(
      names: F[]
    ): Query<Account, never>;

    static select<F extends keyof AccountAttributes>(
      ...names: F[]
    ): Query<Account, never>;

    static blank(attrs: AccountAttributes): Account;

    readonly typename: 'Account';

    attributes: AccountAttributes;

    readonly id: string;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
  }

  /**
   * Attributes for BookmarksRecordPosition
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

  /**
   * BookmarksRecordPosition Aha! model
   *
   * The position of a record in a specific bookmark type. This is used to sort records in different ways when they belong to different views.
   */
  class BookmarksRecordPosition
    extends ApplicationModel
    implements BookmarksRecordPositionAttributes {
    static typename: 'BookmarksRecordPosition';

    static select<F extends keyof BookmarksRecordPositionAttributes>(
      names: F[]
    ): Query<BookmarksRecordPosition, never>;

    static select<F extends keyof BookmarksRecordPositionAttributes>(
      ...names: F[]
    ): Query<BookmarksRecordPosition, never>;

    static blank(
      attrs: BookmarksRecordPositionAttributes
    ): BookmarksRecordPosition;

    readonly typename: 'BookmarksRecordPosition';

    attributes: BookmarksRecordPositionAttributes;

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

  /**
   * Attributes for BookmarksTeamBacklog
   */
  interface BookmarksTeamBacklogAttributes {
    readonly id: string;
    /**
     * The project / team this backlog applies to
     */

    readonly projectId: string;
    readonly records: Array<RecordUnion>;
  }

  /**
   * BookmarksTeamBacklog Aha! model
   *
   * A reorderable backlog for a team
   */
  class BookmarksTeamBacklog
    extends ApplicationModel
    implements BookmarksTeamBacklogAttributes {
    static typename: 'BookmarksTeamBacklog';

    static select<F extends keyof BookmarksTeamBacklogAttributes>(
      names: F[]
    ): Query<BookmarksTeamBacklog, never>;

    static select<F extends keyof BookmarksTeamBacklogAttributes>(
      ...names: F[]
    ): Query<BookmarksTeamBacklog, never>;

    static blank(attrs: BookmarksTeamBacklogAttributes): BookmarksTeamBacklog;

    readonly typename: 'BookmarksTeamBacklog';

    attributes: BookmarksTeamBacklogAttributes;

    readonly id: string;
    /**
     * The project / team this backlog applies to
     */

    readonly projectId: string;
    readonly records: Array<RecordUnion>;
  }

  /**
   * Attributes for BookmarksWorkflowBoard
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

  /**
   * BookmarksWorkflowBoard Aha! model
   *
   * A workflow board for a team or iteration
   */
  class BookmarksWorkflowBoard
    extends ApplicationModel
    implements BookmarksWorkflowBoardAttributes {
    static typename: 'BookmarksWorkflowBoard';

    static select<F extends keyof BookmarksWorkflowBoardAttributes>(
      names: F[]
    ): Query<BookmarksWorkflowBoard, never>;

    static select<F extends keyof BookmarksWorkflowBoardAttributes>(
      ...names: F[]
    ): Query<BookmarksWorkflowBoard, never>;

    static blank(
      attrs: BookmarksWorkflowBoardAttributes
    ): BookmarksWorkflowBoard;

    readonly typename: 'BookmarksWorkflowBoard';

    attributes: BookmarksWorkflowBoardAttributes;

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

  /**
   * Attributes for Epic
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
     * Path to the epic's details page
     */

    readonly path: string;
    /**
     * Position of the epic when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the epic. Example: DEV-E-123
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

  /**
   * Epic Aha! model
   *
   * A high-level record that can contain multiple related features
   */
  class Epic extends ApplicationModel implements EpicAttributes {
    static typename: 'Epic';

    static select<F extends keyof EpicAttributes>(
      names: F[]
    ): Query<Epic, EpicFilters>;

    static select<F extends keyof EpicAttributes>(
      ...names: F[]
    ): Query<Epic, EpicFilters>;

    static where(filters: Partial<EpicFilters>): Query<Epic, EpicFilters>;

    static blank(attrs: EpicAttributes): Epic;

    readonly typename: 'Epic';

    attributes: EpicAttributes;

    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the epic's details page
     */

    readonly path: string;
    /**
     * Position of the epic when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the epic. Example: DEV-E-123
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

  /**
   * Attributes for Estimate
   */
  interface EstimateAttributes {
    /**
     * A string representation of the estimate. Example: 14p for 14 points
     */

    readonly text: string;
    readonly units: WorkUnitEnumEnum;
    readonly value: number;
  }

  /**
   * Estimate Aha! model
   *
   * An estimate of work done or work remaining for a record
   */
  class Estimate extends ApplicationModel implements EstimateAttributes {
    static typename: 'Estimate';

    static select<F extends keyof EstimateAttributes>(
      names: F[]
    ): Query<Estimate, never>;

    static select<F extends keyof EstimateAttributes>(
      ...names: F[]
    ): Query<Estimate, never>;

    static blank(attrs: EstimateAttributes): Estimate;

    readonly typename: 'Estimate';

    attributes: EstimateAttributes;

    /**
     * A string representation of the estimate. Example: 14p for 14 points
     */

    readonly text: string;
    readonly units: WorkUnitEnumEnum;
    readonly value: number;
  }

  /**
   * Attributes for Extension
   */
  interface ExtensionAttributes {
    readonly enabled: boolean;
    readonly id: string;
    readonly identifier: string;
    readonly name: string;
    readonly extensionLogs: Array<ExtensionLog>;
  }

  /**
   * Extension Aha! model
   *
   *
   */
  class Extension extends ApplicationModel implements ExtensionAttributes {
    static typename: 'Extension';

    static select<F extends keyof ExtensionAttributes>(
      names: F[]
    ): Query<Extension, never>;

    static select<F extends keyof ExtensionAttributes>(
      ...names: F[]
    ): Query<Extension, never>;

    static blank(attrs: ExtensionAttributes): Extension;

    readonly typename: 'Extension';

    attributes: ExtensionAttributes;

    readonly enabled: boolean;
    readonly id: string;
    readonly identifier: string;
    readonly name: string;
    readonly extensionLogs: Array<ExtensionLog>;
  }

  /**
   * Attributes for ExtensionContribution
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

  /**
   * ExtensionContribution Aha! model
   *
   * A contribution provided by an extension
   */
  class ExtensionContribution
    extends ApplicationModel
    implements ExtensionContributionAttributes {
    static typename: 'ExtensionContribution';

    static select<F extends keyof ExtensionContributionAttributes>(
      names: F[]
    ): Query<ExtensionContribution, ExtensionContributionFilters>;

    static select<F extends keyof ExtensionContributionAttributes>(
      ...names: F[]
    ): Query<ExtensionContribution, ExtensionContributionFilters>;

    static where(
      filters: Partial<ExtensionContributionFilters>
    ): Query<ExtensionContribution, ExtensionContributionFilters>;

    static blank(attrs: ExtensionContributionAttributes): ExtensionContribution;

    readonly typename: 'ExtensionContribution';

    attributes: ExtensionContributionAttributes;

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

  /**
   * Attributes for ExtensionField
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
  }

  /**
   * ExtensionField Aha! model
   *
   * Holds data related to an extension
   */
  class ExtensionField
    extends ApplicationModel
    implements ExtensionFieldAttributes {
    static typename: 'ExtensionField';

    static select<F extends keyof ExtensionFieldAttributes>(
      names: F[]
    ): Query<ExtensionField, never>;

    static select<F extends keyof ExtensionFieldAttributes>(
      ...names: F[]
    ): Query<ExtensionField, never>;

    static blank(attrs: ExtensionFieldAttributes): ExtensionField;

    readonly typename: 'ExtensionField';

    attributes: ExtensionFieldAttributes;

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
  }

  /**
   * Attributes for ExtensionInvocation
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

  /**
   * ExtensionInvocation Aha! model
   *
   * A single invocation of an extension contribution
   */
  class ExtensionInvocation
    extends ApplicationModel
    implements ExtensionInvocationAttributes {
    static typename: 'ExtensionInvocation';

    static select<F extends keyof ExtensionInvocationAttributes>(
      names: F[]
    ): Query<ExtensionInvocation, never>;

    static select<F extends keyof ExtensionInvocationAttributes>(
      ...names: F[]
    ): Query<ExtensionInvocation, never>;

    static blank(attrs: ExtensionInvocationAttributes): ExtensionInvocation;

    readonly typename: 'ExtensionInvocation';

    attributes: ExtensionInvocationAttributes;

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

  /**
   * Attributes for ExtensionLog
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

  /**
   * ExtensionLog Aha! model
   *
   * Log messages for a single invocation of an extension contribution
   */
  class ExtensionLog
    extends ApplicationModel
    implements ExtensionLogAttributes {
    static typename: 'ExtensionLog';

    static select<F extends keyof ExtensionLogAttributes>(
      names: F[]
    ): Query<ExtensionLog, ExtensionLogFilters>;

    static select<F extends keyof ExtensionLogAttributes>(
      ...names: F[]
    ): Query<ExtensionLog, ExtensionLogFilters>;

    static where(
      filters: Partial<ExtensionLogFilters>
    ): Query<ExtensionLog, ExtensionLogFilters>;

    static blank(attrs: ExtensionLogAttributes): ExtensionLog;

    readonly typename: 'ExtensionLog';

    attributes: ExtensionLogAttributes;

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

  /**
   * Attributes for Feature
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
     * Path to the feature's details page
     */

    readonly path: string;
    /**
     * Position of the feature when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the feature. Example: DEV-123
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

  /**
   * Feature Aha! model
   *
   * A basic record representing work to be done
   */
  class Feature extends ApplicationModel implements FeatureAttributes {
    static typename: 'Feature';

    static select<F extends keyof FeatureAttributes>(
      names: F[]
    ): Query<Feature, FeatureFilters>;

    static select<F extends keyof FeatureAttributes>(
      ...names: F[]
    ): Query<Feature, FeatureFilters>;

    static where(
      filters: Partial<FeatureFilters>
    ): Query<Feature, FeatureFilters>;

    static blank(attrs: FeatureAttributes): Feature;

    readonly typename: 'Feature';

    attributes: FeatureAttributes;

    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the feature's details page
     */

    readonly path: string;
    /**
     * Position of the feature when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the feature. Example: DEV-123
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

  /**
   * Attributes for Iteration
   */
  interface IterationAttributes {
    /**
     * Duration of the iteration, in days
     */

    duration: number;
    readonly id: string;
    name: string;
    startDate: string;
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

  /**
   * Iteration Aha! model
   *
   * A group of records scheduled during a particular time period
   */
  class Iteration extends ApplicationModel implements IterationAttributes {
    static typename: 'Iteration';

    static select<F extends keyof IterationAttributes>(
      names: F[]
    ): Query<Iteration, IterationFilters>;

    static select<F extends keyof IterationAttributes>(
      ...names: F[]
    ): Query<Iteration, IterationFilters>;

    static where(
      filters: Partial<IterationFilters>
    ): Query<Iteration, IterationFilters>;

    static blank(attrs: IterationAttributes): Iteration;

    readonly typename: 'Iteration';

    attributes: IterationAttributes;

    /**
     * Duration of the iteration, in days
     */

    duration: number;
    readonly id: string;
    name: string;
    startDate: string;
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

  /**
   * Attributes for Project
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

  /**
   * Project Aha! model
   *
   * An Aha! workspace or team
   */
  class Project extends ApplicationModel implements ProjectAttributes {
    static typename: 'Project';

    static select<F extends keyof ProjectAttributes>(
      names: F[]
    ): Query<Project, never>;

    static select<F extends keyof ProjectAttributes>(
      ...names: F[]
    ): Query<Project, never>;

    static blank(attrs: ProjectAttributes): Project;

    readonly typename: 'Project';

    attributes: ProjectAttributes;

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

  /**
   * Attributes for Release
   */
  interface ReleaseAttributes {
    readonly id: string;
    readonly name: string;
    /**
     * True if the release appears in the parking lot, false if it is a scheduled release
     */

    readonly parkingLot: boolean;
    readonly position: number;
    /**
     * Reference number of the feature. Example: DEV-R-2
     */

    readonly referenceNum: string;
    readonly releaseDate: string;
  }

  /**
   * Release Aha! model
   *
   * A group of records with a release date or theme
   */
  class Release extends ApplicationModel implements ReleaseAttributes {
    static typename: 'Release';

    static select<F extends keyof ReleaseAttributes>(
      names: F[]
    ): Query<Release, ReleaseFilters>;

    static select<F extends keyof ReleaseAttributes>(
      ...names: F[]
    ): Query<Release, ReleaseFilters>;

    static where(
      filters: Partial<ReleaseFilters>
    ): Query<Release, ReleaseFilters>;

    static blank(attrs: ReleaseAttributes): Release;

    readonly typename: 'Release';

    attributes: ReleaseAttributes;

    readonly id: string;
    readonly name: string;
    /**
     * True if the release appears in the parking lot, false if it is a scheduled release
     */

    readonly parkingLot: boolean;
    readonly position: number;
    /**
     * Reference number of the feature. Example: DEV-R-2
     */

    readonly referenceNum: string;
    readonly releaseDate: string;
  }

  /**
   * Attributes for Requirement
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
     * Path to the requirement's details page
     */

    readonly path: string;
    /**
     * Position of the requirement when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the requirement. Example: DEV-123
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

  /**
   * Requirement Aha! model
   *
   * A record representing one part of a larger feature
   */
  class Requirement extends ApplicationModel implements RequirementAttributes {
    static typename: 'Requirement';

    static select<F extends keyof RequirementAttributes>(
      names: F[]
    ): Query<Requirement, RequirementFilters>;

    static select<F extends keyof RequirementAttributes>(
      ...names: F[]
    ): Query<Requirement, RequirementFilters>;

    static where(
      filters: Partial<RequirementFilters>
    ): Query<Requirement, RequirementFilters>;

    static blank(attrs: RequirementAttributes): Requirement;

    readonly typename: 'Requirement';

    attributes: RequirementAttributes;

    readonly commentsCount: number;
    /**
     * Long-form description in HTML
     */

    description: string;
    readonly id: string;
    name: string;
    /**
     * Path to the requirement's details page
     */

    readonly path: string;
    /**
     * Position of the requirement when a record_position does not apply
     */

    position: number;
    /**
     * Reference number of the requirement. Example: DEV-123
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

  /**
   * Attributes for Tag
   */
  interface TagAttributes {
    /**
     * Hex color converted to decimal
     */

    readonly color: number;
    readonly id: string;
    readonly name: string;
  }

  /**
   * Tag Aha! model
   *
   * A tag on a record
   */
  class Tag extends ApplicationModel implements TagAttributes {
    static typename: 'Tag';

    static select<F extends keyof TagAttributes>(
      names: F[]
    ): Query<Tag, TagFilters>;

    static select<F extends keyof TagAttributes>(
      ...names: F[]
    ): Query<Tag, TagFilters>;

    static where(filters: Partial<TagFilters>): Query<Tag, TagFilters>;

    static blank(attrs: TagAttributes): Tag;

    readonly typename: 'Tag';

    attributes: TagAttributes;

    /**
     * Hex color converted to decimal
     */

    readonly color: number;
    readonly id: string;
    readonly name: string;
  }

  /**
   * Attributes for Task
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

  /**
   * Task Aha! model
   *
   *
   */
  class Task extends ApplicationModel implements TaskAttributes {
    static typename: 'Task';

    static select<F extends keyof TaskAttributes>(
      names: F[]
    ): Query<Task, never>;

    static select<F extends keyof TaskAttributes>(
      ...names: F[]
    ): Query<Task, never>;

    static blank(attrs: TaskAttributes): Task;

    readonly typename: 'Task';

    attributes: TaskAttributes;

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

  /**
   * Attributes for TaskUser
   */
  interface TaskUserAttributes {
    readonly completedDate: string;
    readonly id: string;
    readonly status: TaskStatusEnumEnum;
    readonly task: Task;
    readonly user: User;
  }

  /**
   * TaskUser Aha! model
   *
   *
   */
  class TaskUser extends ApplicationModel implements TaskUserAttributes {
    static typename: 'TaskUser';

    static select<F extends keyof TaskUserAttributes>(
      names: F[]
    ): Query<TaskUser, never>;

    static select<F extends keyof TaskUserAttributes>(
      ...names: F[]
    ): Query<TaskUser, never>;

    static blank(attrs: TaskUserAttributes): TaskUser;

    readonly typename: 'TaskUser';

    attributes: TaskUserAttributes;

    readonly completedDate: string;
    readonly id: string;
    readonly status: TaskStatusEnumEnum;
    readonly task: Task;
    readonly user: User;
  }

  /**
   * Attributes for User
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

  /**
   * User Aha! model
   *
   *
   */
  class User extends ApplicationModel implements UserAttributes {
    static typename: 'User';

    static select<F extends keyof UserAttributes>(
      names: F[]
    ): Query<User, UserFilters>;

    static select<F extends keyof UserAttributes>(
      ...names: F[]
    ): Query<User, UserFilters>;

    static where(filters: Partial<UserFilters>): Query<User, UserFilters>;

    static blank(attrs: UserAttributes): User;

    readonly typename: 'User';

    attributes: UserAttributes;

    readonly avatarUrl: string;
    readonly id: string;
    readonly name: string;
    /**
     * Additional data stored by extensions
     */

    readonly extensionFields: Array<ExtensionField>;
    readonly taskUsers: Array<TaskUser>;
  }

  /**
   * Attributes for Workflow
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

  /**
   * Workflow Aha! model
   *
   * A record workflow
   */
  class Workflow extends ApplicationModel implements WorkflowAttributes {
    static typename: 'Workflow';

    static select<F extends keyof WorkflowAttributes>(
      names: F[]
    ): Query<Workflow, never>;

    static select<F extends keyof WorkflowAttributes>(
      ...names: F[]
    ): Query<Workflow, never>;

    static blank(attrs: WorkflowAttributes): Workflow;

    readonly typename: 'Workflow';

    attributes: WorkflowAttributes;

    /**
     * If true, this is a global status that cannot be edited
     */

    readonly builtIn: boolean;
    readonly id: string;
    readonly name: string;
    readonly workflowStatuses: Array<WorkflowStatus>;
  }

  /**
   * Attributes for WorkflowStatus
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

  /**
   * WorkflowStatus Aha! model
   *
   * A single status within a workflow
   */
  class WorkflowStatus
    extends ApplicationModel
    implements WorkflowStatusAttributes {
    static typename: 'WorkflowStatus';

    static select<F extends keyof WorkflowStatusAttributes>(
      names: F[]
    ): Query<WorkflowStatus, never>;

    static select<F extends keyof WorkflowStatusAttributes>(
      ...names: F[]
    ): Query<WorkflowStatus, never>;

    static blank(attrs: WorkflowStatusAttributes): WorkflowStatus;

    readonly typename: 'WorkflowStatus';

    attributes: WorkflowStatusAttributes;

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

  interface Models {
    Account: typeof Account;
    BookmarksRecordPosition: typeof BookmarksRecordPosition;
    BookmarksTeamBacklog: typeof BookmarksTeamBacklog;
    BookmarksWorkflowBoard: typeof BookmarksWorkflowBoard;
    Epic: typeof Epic;
    Estimate: typeof Estimate;
    Extension: typeof Extension;
    ExtensionContribution: typeof ExtensionContribution;
    ExtensionField: typeof ExtensionField;
    ExtensionInvocation: typeof ExtensionInvocation;
    ExtensionLog: typeof ExtensionLog;
    Feature: typeof Feature;
    Iteration: typeof Iteration;
    Project: typeof Project;
    Release: typeof Release;
    Requirement: typeof Requirement;
    Tag: typeof Tag;
    Task: typeof Task;
    TaskUser: typeof TaskUser;
    User: typeof User;
    Workflow: typeof Workflow;
    WorkflowStatus: typeof WorkflowStatus;
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
    where(filters: Filters): this;
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

  class ApplicationModel {
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
    onUnmounted: (callback: () => void) => void;
    record?: RecordStub;
    fields?: { [index: string]: unknown };
    update?: UpdateCallback;
    state?: any;
  }

  interface RenderExtension {
    (props: RenderExtensionProps, context: Context): void | React.ReactNode;
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
    type: 'autocomplete' | 'text' | 'select';
  }

  interface ListFilters {
    [filterName: string]: ListFilter;
  }

  interface ListFiltersCallback {
    /**
     * Return a list of available filters
     */
    (): ListFilters | Promise<ListFilters>;
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

class Aha {
  /**
   * The current account
   */
  account: Aha.Account;

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
    elements: import('react').ReactNode,
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
