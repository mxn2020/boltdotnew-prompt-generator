import React from 'react';
import { Layout } from '../components/layout/Layout';
import { ComponentLibrary } from '../components/prompt/components/ComponentLibrary';
import { CreateComponentModal } from '../components/prompt/components/CreateComponentModal';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComponentLibrary
            onCreateComponent={handleCreateComponent}
            onSelectComponent={handleSelectComponent}
          />
        </div>
      </Layout>

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