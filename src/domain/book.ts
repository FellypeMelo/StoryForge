import { z } from "zod";
import { BookId, BookIdSchema } from "./value-objects/book-id";
import { ProjectId, ProjectIdSchema } from "./value-objects/project-id";

export const BookStatusSchema = z.enum(["draft", "in_progress", "completed"]);
export type BookStatus = z.infer<typeof BookStatusSchema>;

export const BookSchema = z.object({
  id: BookIdSchema,
  projectId: ProjectIdSchema,
  title: z.string().min(1, "Title cannot be empty"),
  genre: z.string().default("Geral"),
  synopsis: z.string().default(""),
  description: z.string().default(""),
  status: BookStatusSchema.default("draft"),
  orderInSeries: z.number().int().min(1).default(1),
  createdAt: z.date().or(z.string().pipe(z.coerce.date())).optional(),
});

export interface BookProps {
  id: BookId;
  projectId: ProjectId;
  title: string;
  genre: string;
  synopsis: string;
  description: string;
  status: BookStatus;
  orderInSeries: number;
  createdAt: Date;
}

export class Book {
  private constructor(private readonly props: BookProps) {}

  public static create(props: {
    id: BookId;
    projectId: ProjectId;
    title: string;
    genre?: string;
    synopsis?: string;
    description?: string;
    status?: BookStatus;
    orderInSeries?: number;
    createdAt?: Date;
  }): Book {
    const validated = BookSchema.parse({
      id: props.id.value,
      projectId: props.projectId.value,
      title: props.title,
      genre: props.genre,
      synopsis: props.synopsis,
      description: props.description,
      status: props.status,
      orderInSeries: props.orderInSeries,
      createdAt: props.createdAt || new Date(),
    });

    return new Book({
      id: BookId.create(validated.id),
      projectId: ProjectId.create(validated.projectId),
      title: validated.title,
      genre: validated.genre,
      synopsis: validated.synopsis,
      description: validated.description,
      status: validated.status,
      orderInSeries: validated.orderInSeries,
      createdAt: validated.createdAt as Date || new Date(),
    });
  }

  public static generate(projectId: ProjectId, title: string): Book {
    return Book.create({
      id: BookId.generate(),
      projectId,
      title,
    });
  }

  public get id(): BookId {
    return this.props.id;
  }

  public get projectId(): ProjectId {
    return this.props.projectId;
  }

  public get title(): string {
    return this.props.title;
  }

  public get genre(): string {
    return this.props.genre;
  }

  public get synopsis(): string {
    return this.props.synopsis;
  }

  public get description(): string {
    return this.props.description;
  }

  public get status(): BookStatus {
    return this.props.status;
  }

  public get orderInSeries(): number {
    return this.props.orderInSeries;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toProps(): BookProps {
    return { ...this.props };
  }
}
