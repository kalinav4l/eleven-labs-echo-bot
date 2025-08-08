import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  members: number;
  budget: string;
  completion: number;
  type: 'agent' | 'conversation' | 'call';
}

interface ProjectsListProps {
  projects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects }) => {
  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return '🤖';
      case 'conversation':
        return '💬';
      case 'call':
        return '📞';
      default:
        return '📋';
    }
  };

  const getProgressColor = (completion: number) => {
    if (completion >= 80) return 'bg-emerald-500';
    if (completion >= 60) return 'bg-blue-500';
    if (completion >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white">Projects</CardTitle>
            <p className="text-gray-400 text-sm">📈 {projects.filter(p => p.completion === 100).length} done this month</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-xs text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-700">
            <span>Projects</span>
            <span>Members</span>
            <span>Budget</span>
            <span>Completion</span>
          </div>
          
          {projects.map((project, index) => (
            <div key={project.id} className="grid grid-cols-4 gap-4 items-center py-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getProjectIcon(project.type)}</span>
                <span className="text-sm font-medium text-white">{project.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {Array.from({ length: Math.min(project.members, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-gray-800 flex items-center justify-center"
                    >
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  ))}
                  {project.members > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                      +{project.members - 3}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm font-semibold text-white">
                {project.budget}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{project.completion}%</span>
                </div>
                <Progress 
                  value={project.completion} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsList;