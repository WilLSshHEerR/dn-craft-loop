export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  color: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Proyecto 1",
    description: "Descripción breve del proyecto. Qué problema resuelve y qué tecnologías usaste.",
    tags: ["React", "TypeScript", "CSS"],
    liveUrl: "#",
    repoUrl: "#",
    color: "#7c3aed",
  },
  {
    id: 2,
    title: "Proyecto 2",
    description: "Descripción breve del proyecto. Qué problema resuelve y qué tecnologías usaste.",
    tags: ["Next.js", "Node.js", "MongoDB"],
    liveUrl: "#",
    repoUrl: "#",
    color: "#2563eb",
  },
  {
    id: 3,
    title: "Proyecto 3",
    description: "Descripción breve del proyecto. Qué problema resuelve y qué tecnologías usaste.",
    tags: ["HTML", "CSS", "JavaScript"],
    liveUrl: "#",
    color: "#059669",
  },
  {
    id: 4,
    title: "Proyecto 4",
    description: "Descripción breve del proyecto. Qué problema resuelve y qué tecnologías usaste.",
    tags: ["React", "Tailwind", "Firebase"],
    repoUrl: "#",
    color: "#dc2626",
  },
];
