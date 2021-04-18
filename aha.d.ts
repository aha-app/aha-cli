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
  interface AccountAttributes {
    readonly id: string;
    /**
     * Additional data stored by extensions
     */
    readonly extensionFields: Array<ExtensionField>;
  }
  class Account extends ApplicationModel implements AccountAttributes {
    static typename: 'Account';

    static select<F extends keyof AccountAttributes>(
      names: F[]
    ): Query<Account>;

    static select<F extends keyof AccountAttributes>(
      ...names: F[]
    ): Query<Account>;

    static where(filters: any): Query<Account>;

    static blank(attrs: AccountAttributes): Account;

    readonly typename: 'Account';

    attributes: AccountAttributes;

    readonly id: string;
    /**
     * Additional data stored by extensions
     */
    readonly extensionFields: Array<ExtensionField>;
  }

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
  class BookmarksRecordPosition
    extends ApplicationModel
    implements BookmarksRecordPositionAttributes {
    static typename: 'BookmarksRecordPosition';

    static select<F extends keyof BookmarksRecordPositionAttributes>(
      names: F[]
    ): Query<BookmarksRecordPosition>;

    static select<F extends keyof BookmarksRecordPositionAttributes>(
      ...names: F[]
    ): Query<BookmarksRecordPosition>;

    static where(filters: any): Query<BookmarksRecordPosition>;

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

  interface BookmarksTeamBacklogAttributes {
    readonly id: string;
    /**
     * The project / team this backlog applies to
     */
    readonly projectId: string;
    readonly records: Array<RecordUnion>;
  }
  class BookmarksTeamBacklog
    extends ApplicationModel
    implements BookmarksTeamBacklogAttributes {
    static typename: 'BookmarksTeamBacklog';

    static select<F extends keyof BookmarksTeamBacklogAttributes>(
      names: F[]
    ): Query<BookmarksTeamBacklog>;

    static select<F extends keyof BookmarksTeamBacklogAttributes>(
      ...names: F[]
    ): Query<BookmarksTeamBacklog>;

    static where(filters: any): Query<BookmarksTeamBacklog>;

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
  class BookmarksWorkflowBoard
    extends ApplicationModel
    implements BookmarksWorkflowBoardAttributes {
    static typename: 'BookmarksWorkflowBoard';

    static select<F extends keyof BookmarksWorkflowBoardAttributes>(
      names: F[]
    ): Query<BookmarksWorkflowBoard>;

    static select<F extends keyof BookmarksWorkflowBoardAttributes>(
      ...names: F[]
    ): Query<BookmarksWorkflowBoard>;

    static where(filters: any): Query<BookmarksWorkflowBoard>;

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
  class Epic extends ApplicationModel implements EpicAttributes {
    static typename: 'Epic';

    static select<F extends keyof EpicAttributes>(names: F[]): Query<Epic>;

    static select<F extends keyof EpicAttributes>(...names: F[]): Query<Epic>;

    static where(filters: any): Query<Epic>;

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

  interface EstimateAttributes {
    /**
     * A string representation of the estimate. Example: 14p for 14 points
     */
    readonly text: string;
    readonly units: WorkUnitEnumEnum;
    readonly value: number;
  }
  class Estimate extends ApplicationModel implements EstimateAttributes {
    static typename: 'Estimate';

    static select<F extends keyof EstimateAttributes>(
      names: F[]
    ): Query<Estimate>;

    static select<F extends keyof EstimateAttributes>(
      ...names: F[]
    ): Query<Estimate>;

    static where(filters: any): Query<Estimate>;

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

  interface ExtensionAttributes {
    readonly enabled: boolean;
    readonly id: string;
    readonly identifier: string;
    readonly name: string;
    readonly extensionLogs: Array<ExtensionLog>;
  }
  class Extension extends ApplicationModel implements ExtensionAttributes {
    static typename: 'Extension';

    static select<F extends keyof ExtensionAttributes>(
      names: F[]
    ): Query<Extension>;

    static select<F extends keyof ExtensionAttributes>(
      ...names: F[]
    ): Query<Extension>;

    static where(filters: any): Query<Extension>;

    static blank(attrs: ExtensionAttributes): Extension;

    readonly typename: 'Extension';

    attributes: ExtensionAttributes;

    readonly enabled: boolean;
    readonly id: string;
    readonly identifier: string;
    readonly name: string;
    readonly extensionLogs: Array<ExtensionLog>;
  }

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
  class ExtensionContribution
    extends ApplicationModel
    implements ExtensionContributionAttributes {
    static typename: 'ExtensionContribution';

    static select<F extends keyof ExtensionContributionAttributes>(
      names: F[]
    ): Query<ExtensionContribution>;

    static select<F extends keyof ExtensionContributionAttributes>(
      ...names: F[]
    ): Query<ExtensionContribution>;

    static where(filters: any): Query<ExtensionContribution>;

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
  class ExtensionField
    extends ApplicationModel
    implements ExtensionFieldAttributes {
    static typename: 'ExtensionField';

    static select<F extends keyof ExtensionFieldAttributes>(
      names: F[]
    ): Query<ExtensionField>;

    static select<F extends keyof ExtensionFieldAttributes>(
      ...names: F[]
    ): Query<ExtensionField>;

    static where(filters: any): Query<ExtensionField>;

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
  class ExtensionInvocation
    extends ApplicationModel
    implements ExtensionInvocationAttributes {
    static typename: 'ExtensionInvocation';

    static select<F extends keyof ExtensionInvocationAttributes>(
      names: F[]
    ): Query<ExtensionInvocation>;

    static select<F extends keyof ExtensionInvocationAttributes>(
      ...names: F[]
    ): Query<ExtensionInvocation>;

    static where(filters: any): Query<ExtensionInvocation>;

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
  class ExtensionLog
    extends ApplicationModel
    implements ExtensionLogAttributes {
    static typename: 'ExtensionLog';

    static select<F extends keyof ExtensionLogAttributes>(
      names: F[]
    ): Query<ExtensionLog>;

    static select<F extends keyof ExtensionLogAttributes>(
      ...names: F[]
    ): Query<ExtensionLog>;

    static where(filters: any): Query<ExtensionLog>;

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
  class Feature extends ApplicationModel implements FeatureAttributes {
    static typename: 'Feature';

    static select<F extends keyof FeatureAttributes>(
      names: F[]
    ): Query<Feature>;

    static select<F extends keyof FeatureAttributes>(
      ...names: F[]
    ): Query<Feature>;

    static where(filters: any): Query<Feature>;

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
  class Iteration extends ApplicationModel implements IterationAttributes {
    static typename: 'Iteration';

    static select<F extends keyof IterationAttributes>(
      names: F[]
    ): Query<Iteration>;

    static select<F extends keyof IterationAttributes>(
      ...names: F[]
    ): Query<Iteration>;

    static where(filters: any): Query<Iteration>;

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
  class Project extends ApplicationModel implements ProjectAttributes {
    static typename: 'Project';

    static select<F extends keyof ProjectAttributes>(
      names: F[]
    ): Query<Project>;

    static select<F extends keyof ProjectAttributes>(
      ...names: F[]
    ): Query<Project>;

    static where(filters: any): Query<Project>;

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
  class Release extends ApplicationModel implements ReleaseAttributes {
    static typename: 'Release';

    static select<F extends keyof ReleaseAttributes>(
      names: F[]
    ): Query<Release>;

    static select<F extends keyof ReleaseAttributes>(
      ...names: F[]
    ): Query<Release>;

    static where(filters: any): Query<Release>;

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
  class Requirement extends ApplicationModel implements RequirementAttributes {
    static typename: 'Requirement';

    static select<F extends keyof RequirementAttributes>(
      names: F[]
    ): Query<Requirement>;

    static select<F extends keyof RequirementAttributes>(
      ...names: F[]
    ): Query<Requirement>;

    static where(filters: any): Query<Requirement>;

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

  interface TagAttributes {
    /**
     * Hex color converted to decimal
     */
    readonly color: number;
    readonly id: string;
    readonly name: string;
  }
  class Tag extends ApplicationModel implements TagAttributes {
    static typename: 'Tag';

    static select<F extends keyof TagAttributes>(names: F[]): Query<Tag>;

    static select<F extends keyof TagAttributes>(...names: F[]): Query<Tag>;

    static where(filters: any): Query<Tag>;

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
  class Task extends ApplicationModel implements TaskAttributes {
    static typename: 'Task';

    static select<F extends keyof TaskAttributes>(names: F[]): Query<Task>;

    static select<F extends keyof TaskAttributes>(...names: F[]): Query<Task>;

    static where(filters: any): Query<Task>;

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

  interface TaskUserAttributes {
    readonly completedDate: string;
    readonly id: string;
    readonly status: TaskStatusEnumEnum;
    readonly task: Task;
    readonly user: User;
  }
  class TaskUser extends ApplicationModel implements TaskUserAttributes {
    static typename: 'TaskUser';

    static select<F extends keyof TaskUserAttributes>(
      names: F[]
    ): Query<TaskUser>;

    static select<F extends keyof TaskUserAttributes>(
      ...names: F[]
    ): Query<TaskUser>;

    static where(filters: any): Query<TaskUser>;

    static blank(attrs: TaskUserAttributes): TaskUser;

    readonly typename: 'TaskUser';

    attributes: TaskUserAttributes;

    readonly completedDate: string;
    readonly id: string;
    readonly status: TaskStatusEnumEnum;
    readonly task: Task;
    readonly user: User;
  }

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
  class User extends ApplicationModel implements UserAttributes {
    static typename: 'User';

    static select<F extends keyof UserAttributes>(names: F[]): Query<User>;

    static select<F extends keyof UserAttributes>(...names: F[]): Query<User>;

    static where(filters: any): Query<User>;

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

  interface WorkflowAttributes {
    /**
     * If true, this is a global status that cannot be edited
     */
    readonly builtIn: boolean;
    readonly id: string;
    readonly name: string;
    readonly workflowStatuses: Array<WorkflowStatus>;
  }
  class Workflow extends ApplicationModel implements WorkflowAttributes {
    static typename: 'Workflow';

    static select<F extends keyof WorkflowAttributes>(
      names: F[]
    ): Query<Workflow>;

    static select<F extends keyof WorkflowAttributes>(
      ...names: F[]
    ): Query<Workflow>;

    static where(filters: any): Query<Workflow>;

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
  class WorkflowStatus
    extends ApplicationModel
    implements WorkflowStatusAttributes {
    static typename: 'WorkflowStatus';

    static select<F extends keyof WorkflowStatusAttributes>(
      names: F[]
    ): Query<WorkflowStatus>;

    static select<F extends keyof WorkflowStatusAttributes>(
      ...names: F[]
    ): Query<WorkflowStatus>;

    static where(filters: any): Query<WorkflowStatus>;

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

  interface Query<T extends ApplicationModel> {
    find(id: string): Promise<T>;
    union(query: Query<T>): Query<T>;
    merge(subqueries: Subquery<T>): Query<T>;
  }

  class ApplicationModel {
    readonly typename: string;
    readonly persisted: boolean;
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

    save(): Promise<void>;
    reload<T extends this>(options?: { query?: Query<T> }): Promise<void>;
    destroy(): Promise<void>;

    setAttribute<K extends keyof this['attributes']>(
      name: K,
      value: this['attributes'][K],
      flagDirty?: boolean
    ): void;

    dup(): this;
  }

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
