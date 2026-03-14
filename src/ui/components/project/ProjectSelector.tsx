import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Project } from "../../../domain/project";
import { Plus, Book as BookIcon } from "lucide-react";

interface ProjectSelectorProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelector({ onSelectProject }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await invoke<Project[]>("list_projects");
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const project = await invoke<Project>("create_project", {
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      setProjects([...projects, project]);
      setIsCreating(false);
      setNewProjectName("");
      setNewProjectDescription("");
      // @ts-ignore - Tauri returns raw ID string
      onSelectProject(project.id);
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center text-text-muted">Carregando universos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in">
      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-4xl font-serif text-text-main tracking-tight">Seus Universos</h1>
          <p className="text-text-muted mt-2">
            Selecione um projeto para continuar ou crie um novo império narrativo.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-text-main text-bg-base px-4 py-2 rounded font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          <span>Novo Universo</span>
        </button>
      </header>

      {isCreating && (
        <div className="bg-bg-hover border border-border-subtle p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-serif text-text-main">Criar Novo Universo</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Nome do Universo
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: As Crônicas de Gelo e Fogo"
                className="w-full bg-bg-main border border-border-default rounded px-3 py-2 text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-text-muted transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Descrição Curta (Opcional)
              </label>
              <input
                type="text"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Ex: Um mundo de fantasia focado em intrigas políticas."
                className="w-full bg-bg-main border border-border-default rounded px-3 py-2 text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-text-muted transition-colors"
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
                disabled={!newProjectName.trim()}
                className="bg-text-main text-bg-base px-4 py-2 rounded font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 && !isCreating ? (
        <div className="text-center py-20 border border-border-subtle border-dashed rounded-lg">
          <BookIcon className="mx-auto h-12 w-12 text-text-muted opacity-50 mb-4" />
          <h3 className="text-xl font-serif text-text-main mb-2">Nenhum Universo Encontrado</h3>
          <p className="text-text-muted max-w-md mx-auto">
            O começo de toda grande história é uma página em branco. Crie seu primeiro universo para
            começar a forjar suas crônicas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <button
              key={project.id as any}
              onClick={() => onSelectProject(project.id as any)}
              className="text-left group flex flex-col h-full bg-bg-main border border-border-subtle rounded-lg p-6 hover:border-text-muted hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-text-muted"
            >
              <div className="mb-4 text-text-muted group-hover:text-text-main transition-colors">
                <BookIcon size={24} />
              </div>
              <h3 className="text-xl font-serif text-text-main mb-2 line-clamp-1">
                {project.name}
              </h3>
              <p className="text-sm text-text-muted line-clamp-2 mb-4 grow">
                {project.description || "Nenhuma descrição fornecida."}
              </p>
              <div className="flex justify-between items-center text-xs text-text-muted font-mono mt-auto pt-4 border-t border-border-subtle/50">
                <span>Criado em</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
