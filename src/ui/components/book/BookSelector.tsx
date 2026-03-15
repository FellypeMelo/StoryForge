import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Book } from "../../../domain/book";
import { Project } from "../../../domain/project";
import { Plus, BookOpen, ArrowLeft } from "lucide-react";

interface BookSelectorProps {
  projectId: string;
  onSelectBook: (bookId: string) => void;
  onBack: () => void;
}

export function BookSelector({ projectId, onSelectBook, onBack }: BookSelectorProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch both the project details and its books
      const [bookData, projectData] = await Promise.all([
        invoke<Book[]>("list_books", { projectId }),
        invoke<Project>("get_project", { id: projectId }), // Assuming this command exists, if not we'll just handle undefined
      ]);
      setBooks(bookData);
      setProject(projectData);
    } catch (err) {
      console.error("Failed to load project/books", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    try {
      const book = await invoke<Book>("create_book", {
        projectId,
        title: newBookTitle.trim(),
      });
      setBooks([...books, book]);
      setIsCreating(false);
      setNewBookTitle("");
      // @ts-ignore - Tauri returns raw ID string
      onSelectBook(book.id);
    } catch (err) {
      console.error("Failed to create book", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center text-text-muted">Carregando livros...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Voltar aos Universos</span>
        </button>
      </div>

      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-text-muted uppercase mb-1">
            {project ? project.name : "Universo Selecionado"}
          </div>
          <h1 className="text-4xl font-serif text-text-main tracking-tight">Livros desta Saga</h1>
          <p className="text-text-muted mt-2">
            Escolha com qual história você deseja trabalhar hoje.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-text-main text-bg-base px-4 py-2 rounded font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          <span>Novo Livro</span>
        </button>
      </header>

      {isCreating && (
        <div className="bg-bg-hover border border-border-subtle p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-serif text-text-main">Criar Novo Livro</h2>
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div>
              <label htmlFor="book-title" className="block text-sm font-medium text-text-main mb-1">
                Título do Livro
              </label>
              <input
                id="book-title"
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Ex: A Sociedade do Anel"
                className="w-full bg-bg-main border border-border-default rounded px-3 py-2 text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-text-muted transition-colors"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded text-text-muted hover:text-text-main transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newBookTitle.trim()}
                className="bg-text-main text-bg-base px-4 py-2 rounded font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {books.length === 0 && !isCreating ? (
        <div className="text-center py-20 border border-border-subtle border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-4" />
          <h3 className="text-xl font-serif text-text-main mb-2">Nenhum Livro Registrado</h3>
          <p className="text-text-muted max-w-md mx-auto">
            Este universo ainda não possui histórias catalogadas. Crie o primeiro livro para começar
            sua jornada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <button
              key={book.id as any}
              onClick={() => onSelectBook(book.id as any)}
              className="text-left group flex flex-col h-full bg-bg-main border border-border-subtle rounded-lg p-6 hover:border-text-muted hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-text-muted"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-text-muted group-hover:text-text-main transition-colors">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs px-2 py-1 rounded bg-bg-hover text-text-muted font-mono">
                  {book.genre || "Geral"}
                </span>
              </div>
              <h3 className="text-xl font-serif text-text-main mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-text-muted mb-4 capitalize grow">
                Status: {book.status.replace("_", " ")}
              </p>

              <div className="flex justify-between items-center text-xs text-text-muted font-mono mt-auto pt-4 border-t border-border-subtle/50">
                <span>Ordem: #{book.orderInSeries}</span>
                <span>{new Date(book.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
