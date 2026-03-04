import { Id, createIdSchema } from "./id";

export const LocationIdSchema = createIdSchema("LocationId");
export class LocationId extends Id {
  private constructor(value: string) {
    super(value);
  }
  public static create(value: string): LocationId {
    const result = LocationIdSchema.safeParse(value);
    if (!result.success) throw new Error(result.error.issues[0].message);
    return new LocationId(result.data);
  }
  public static generate(): LocationId {
    return new LocationId(crypto.randomUUID());
  }
}

export const WorldRuleIdSchema = createIdSchema("WorldRuleId");
export class WorldRuleId extends Id {
  private constructor(value: string) {
    super(value);
  }
  public static create(value: string): WorldRuleId {
    const result = WorldRuleIdSchema.safeParse(value);
    if (!result.success) throw new Error(result.error.issues[0].message);
    return new WorldRuleId(result.data);
  }
  public static generate(): WorldRuleId {
    return new WorldRuleId(crypto.randomUUID());
  }
}

export const TimelineEventIdSchema = createIdSchema("TimelineEventId");
export class TimelineEventId extends Id {
  private constructor(value: string) {
    super(value);
  }
  public static create(value: string): TimelineEventId {
    const result = TimelineEventIdSchema.safeParse(value);
    if (!result.success) throw new Error(result.error.issues[0].message);
    return new TimelineEventId(result.data);
  }
  public static generate(): TimelineEventId {
    return new TimelineEventId(crypto.randomUUID());
  }
}

export const RelationshipIdSchema = createIdSchema("RelationshipId");
export class RelationshipId extends Id {
  private constructor(value: string) {
    super(value);
  }
  public static create(value: string): RelationshipId {
    const result = RelationshipIdSchema.safeParse(value);
    if (!result.success) throw new Error(result.error.issues[0].message);
    return new RelationshipId(result.data);
  }
  public static generate(): RelationshipId {
    return new RelationshipId(crypto.randomUUID());
  }
}

export const BlacklistEntryIdSchema = createIdSchema("BlacklistEntryId");
export class BlacklistEntryId extends Id {
  private constructor(value: string) {
    super(value);
  }
  public static create(value: string): BlacklistEntryId {
    const result = BlacklistEntryIdSchema.safeParse(value);
    if (!result.success) throw new Error(result.error.issues[0].message);
    return new BlacklistEntryId(result.data);
  }
  public static generate(): BlacklistEntryId {
    return new BlacklistEntryId(crypto.randomUUID());
  }
}
