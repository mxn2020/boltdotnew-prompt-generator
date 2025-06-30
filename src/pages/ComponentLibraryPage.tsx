import React from 'react';
import { Layout } from '../components/layout/Layout';
import { ComponentLibrary } from '../components/prompt/components/ComponentLibrary';
import { CreateComponentModal } from '../components/prompt/components/CreateComponentModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ComponentLibraryPage() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const handleCreateComponent = () => {
    setShowCreateModal(true);
  };

  const handleSelectComponent = (component: any) => {
    console.log('Selected component:', component);
    alert(`Selected component: ${component.title}`);
  };

  return (
    <>
      <Layout>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Component Library</h1>
                <p className="text-muted-foreground mt-1">
                  Build and manage reusable components for your prompts
                </p>
              </div>
              <Button onClick={handleCreateComponent} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Component
              </Button>
            </div>
          </div>

          {/* Component Library */}
          <ComponentLibrary
            onCreateComponent={handleCreateComponent}
            onSelectComponent={handleSelectComponent}
          />
        </div>
      </Layout>

      {/* Create Component Modal */}
      {showCreateModal && (
        <CreateComponentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(componentId) => {
            console.log('Component created:', componentId);
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
}