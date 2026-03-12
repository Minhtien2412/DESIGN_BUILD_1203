/**
 * E2E Test - Project Management Flow
 */

describe('Project Management', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    
    // Login before tests
    await element(by.id('email-input')).typeText('demo@baotienweb.cloud');
    await element(by.id('password-input')).typeText('Demo123!');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(10000);
  });

  it('should display project list', async () => {
    await expect(element(by.id('projects-list'))).toBeVisible();
    await expect(element(by.id('project-card-0'))).toBeVisible();
  });

  it('should navigate to project detail', async () => {
    await element(by.id('project-card-0')).tap();
    await waitFor(element(by.id('project-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('Overview'))).toBeVisible();
    await expect(element(by.text('Timeline'))).toBeVisible();
    await expect(element(by.text('Tasks'))).toBeVisible();
  });

  it('should create a new task', async () => {
    await element(by.id('tasks-tab')).tap();
    await element(by.id('add-task-button')).tap();
    
    await element(by.id('task-title-input')).typeText('E2E Test Task');
    await element(by.id('task-description-input')).typeText('Created by automated test');
    await element(by.id('task-priority-picker')).tap();
    await element(by.text('High')).tap();
    
    await element(by.id('create-task-button')).tap();
    
    await waitFor(element(by.text('E2E Test Task')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should update task status', async () => {
    await element(by.text('E2E Test Task')).tap();
    await element(by.id('task-status-picker')).tap();
    await element(by.text('In Progress')).tap();
    await element(by.id('save-task-button')).tap();
    
    await waitFor(element(by.text('Task updated')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should search for projects', async () => {
    await element(by.id('back-button')).tap();
    await element(by.id('search-input')).typeText('Test Project');
    
    await waitFor(element(by.id('search-results')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should filter projects by status', async () => {
    await element(by.id('filter-button')).tap();
    await element(by.text('Active')).tap();
    await element(by.id('apply-filters-button')).tap();
    
    await expect(element(by.id('projects-list'))).toBeVisible();
  });
});
