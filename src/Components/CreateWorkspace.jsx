import React from 'react';

const CreateWorkspace = () => {
  const createDefaultWorkspace = () => {
    // Create default workspace (to be implemented)
  };

  return (
    <div className="create-workspace">
      <button onClick={createDefaultWorkspace}>Select Template</button>
    </div>
  );
};

export default CreateWorkspace;
