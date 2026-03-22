import { describe, it, expect } from 'vitest';

describe('Module smoke tests', () => {
  it('should import vector.js without errors', async () => {
    const module = await import('../../js/vector.js');
    expect(module.Vector).toBeDefined();
  });

  it('should import model.js without errors', async () => {
    const module = await import('../../js/model.js');
    expect(module.model).toBeDefined();
    expect(module.createCar).toBeDefined();
  });

  it('should import framemanager.js without errors', async () => {
    const module = await import('../../js/framemanager.js');
    expect(module.frameManager).toBeDefined();
  });

  it('should import controller.js without errors', async () => {
    const module = await import('../../js/controller.js');
    expect(module.Keys).toBeDefined();
    expect(module.createCarController).toBeDefined();
    expect(module.createKeyboardController).toBeDefined();
  });

  it('should import physicsengine.js without errors', async () => {
    const module = await import('../../js/physicsengine.js');
    expect(module.createPhysicsEngine).toBeDefined();
  });

  it('should import track.js without errors', async () => {
    const module = await import('../../js/track.js');
    expect(module.Track).toBeDefined();
    expect(module.createTrack).toBeDefined();
    expect(module.Drawer).toBeDefined();
  });

  it('should import config.js without errors', async () => {
    const module = await import('../../js/config.js');
    expect(module.config).toBeDefined();
  });

  it('should import view/view.js without errors', async () => {
    const module = await import('../../js/view/view.js');
    expect(module.createDOMProxy).toBeDefined();
    expect(module.SplitScreen).toBeDefined();
    expect(module.Screen).toBeDefined();
    expect(module.MovingTrack).toBeDefined();
    expect(module.TireTracks).toBeDefined();
    expect(module.HeadUpDisplay).toBeDefined();
    expect(module.MiniMap).toBeDefined();
  });

  it('should import view/car.js without errors', async () => {
    const module = await import('../../js/view/car.js');
    expect(module.StaticCar).toBeDefined();
    expect(module.MovingCar).toBeDefined();
  });

  it('should import application.js without errors', async () => {
    const module = await import('../../js/application.js');
    expect(module.startup).toBeDefined();
  });
});
