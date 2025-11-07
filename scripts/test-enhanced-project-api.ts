import { enhancedProjectApiService } from '../services/enhancedProjectApi';

/**
 * Test script for Enhanced Project API Service
 * Validates API integration with construction project management
 */

async function testEnhancedProjectApi() {
  console.log('🧪 Testing Enhanced Project API Service...\n');
  
  const apiService = enhancedProjectApiService;

  try {
    // Test 1: Get Projects
    console.log('📋 Test 1: Getting projects...');
    const projectsResult = await apiService.getProjects();
    console.log(`✅ Found ${projectsResult.projects.length} projects`);
    console.log(`📊 Total: ${projectsResult.total}`);
    
    if (projectsResult.projects.length > 0) {
      const firstProject = projectsResult.projects[0];
      console.log(`📝 First project: ${firstProject.project_name} (${firstProject.project_code})`);
    }

    // Test 2: Get Project by ID
    if (projectsResult.projects.length > 0) {
      console.log('\n🔍 Test 2: Getting project by ID...');
      const projectId = projectsResult.projects[0].id;
      const project = await apiService.getProject(projectId);
      if (project) {
        console.log(`✅ Retrieved project: ${project.project_name}`);
      } else {
        console.log(`⚠️  Project not found with ID: ${projectId}`);
      }
    }

    // Test 3: Create New Project
    console.log('\n➕ Test 3: Creating new project...');
    const newProjectData = {
      project_name: 'Test Villa Resort',
      project_type: 'biet_thu' as const,
      description: 'Test project for API validation',
      owner_name: 'Test Owner',
      location: 'Test Address, Test Ward, Test District, Test Province',
      budget: 5000000000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    const createdProject = await apiService.createProject(newProjectData);
    console.log(`✅ Created project: ${createdProject.project_name} (ID: ${createdProject.id})`);

    // Test 4: Upload File (Skip in test environment)
    console.log('\n📁 Test 4: Testing file upload interface...');
    console.log(`⚠️  File upload test skipped (test environment - requires actual File/Blob object)`);
    console.log(`✅ Upload method available: ${typeof apiService.uploadProjectFile === 'function'}`);

    // Test 5: Update Project
    console.log('\n✏️  Test 5: Updating project...');
    const updatedProject = await apiService.updateProject(createdProject.id, {
      description: 'Updated test project description'
    });
    console.log(`✅ Updated project: ${updatedProject.project_name}`);

    console.log('\n🎉 All tests completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in other test files
export { testEnhancedProjectApi };

// Run if called directly
if (require.main === module) {
  testEnhancedProjectApi()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}