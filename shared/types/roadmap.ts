export type RoadmapType = 'company' | 'topic' | 'custom';

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  type: RoadmapType;
  company?: string;
  problemIds: number[];
  createdAt: string;
  updatedAt: string;
}
