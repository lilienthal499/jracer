import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Module smoke tests', () => {
  it('should import vector.js without errors', async () => {
    const module = await import('../../js/vector.js');
    assert.ok(module.Vector, 'Vector should be exported');
  });

  it('should import model.js without errors', async () => {
    const module = await import('../../js/model.js');
    assert.ok(module.model, 'model should be exported');
    assert.ok(module.createCar, 'createCar should be exported');
  });

  it('should import framemanager.js without errors', async () => {
    const module = await import('../../js/framemanager.js');
    assert.ok(module.frameManager, 'frameManager should be exported');
  });

  it('should import controller.js without errors', async () => {
    const module = await import('../../js/controller.js');
    assert.ok(module.Keys, 'Keys should be exported');
    assert.ok(module.createCarController, 'createCarController should be exported');
    assert.ok(module.createKeyboardController, 'createKeyboardController should be exported');
  });

  it('should import physicsengine.js without errors', async () => {
    const module = await import('../../js/physicsengine.js');
    assert.ok(module.createPhysicsEngine, 'createPhysicsEngine should be exported');
  });

  it('should import track.js without errors', async () => {
    const module = await import('../../js/track.js');
    assert.ok(module.Track, 'Track should be exported');
    assert.ok(module.createTrack, 'createTrack should be exported');
    assert.ok(module.Drawer, 'Drawer should be exported');
  });

  it('should import config.js without errors', async () => {
    const module = await import('../../js/config.js');
    assert.ok(module.config, 'config should be exported');
  });

  it('should import view/view.js without errors', async () => {
    const module = await import('../../js/view/view.js');
    assert.ok(module.createDOMProxy, 'createDOMProxy should be exported');
    assert.ok(module.SplitScreen, 'SplitScreen should be exported');
    assert.ok(module.Screen, 'Screen should be exported');
    assert.ok(module.MovingTrack, 'MovingTrack should be exported');
    assert.ok(module.TireTracks, 'TireTracks should be exported');
    assert.ok(module.HeadUpDisplay, 'HeadUpDisplay should be exported');
    assert.ok(module.MiniMap, 'MiniMap should be exported');
  });

  it('should import view/car.js without errors', async () => {
    const module = await import('../../js/view/car.js');
    assert.ok(module.StaticCar, 'StaticCar should be exported');
    assert.ok(module.MovingCar, 'MovingCar should be exported');
  });

  it('should import application.js without errors', async () => {
    const module = await import('../../js/application.js');
    assert.ok(module.startup, 'startup should be exported');
  });
});
