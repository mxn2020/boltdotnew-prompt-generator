import React from 'react';
import { Layout } from '../components/layout/Layout';
import { ComponentLibrary } from '../components/prompt/components/ComponentLibrary';

export function ComponentLibraryPage() {
  const handleCreateComponent = () => {
    // TODO: Implement component creation modal/page
    alert('Component creation will be implemented in the next phase!');
  };

  const handleSelectComponent = (component: any) => {
    // TODO: Implement component selection/usage
    console.log('Selected component:', component);
    alert(`Selected component: ${component.title}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComponentLibrary
          onCreateComponent={handleCreateComponent}
          onSelectComponent={handleSelectComponent}
        />
      </div>
    </Layout>
  );
}