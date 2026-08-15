import { storageService, ONBOARDING_NOTE_CONTENT } from '../../src/services/storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clearAll();
  });

  it('saves and retrieves active note', async () => {
    const note = await storageService.saveActiveNote('Buy groceries\n- [ ] Milk');
    expect(note.content).toBe('Buy groceries\n- [ ] Milk');

    const retrieved = await storageService.getActiveNote();
    expect(retrieved.content).toBe('Buy groceries\n- [ ] Milk');
  });

  it('archives active note and resets active note to blank', async () => {
    await storageService.saveActiveNote('Important plan');
    const archived = await storageService.archiveActiveNote();

    expect(archived.content).toBe('Important plan');
    expect(archived.archivedAt).toBeDefined();

    const active = await storageService.getActiveNote();
    expect(active.content).toBe('');

    const history = await storageService.getArchivedNotes();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(archived.id);
  });

  it('restores archived note', async () => {
    await storageService.saveActiveNote('Old thought');
    const archived = await storageService.archiveActiveNote();

    await storageService.restoreArchivedNote(archived.id);
    const active = await storageService.getActiveNote();
    expect(active.content).toBe('Old thought');
  });

  it('deletes archived note', async () => {
    await storageService.saveActiveNote('Note to delete');
    const archived = await storageService.archiveActiveNote();

    let history = await storageService.getArchivedNotes();
    expect(history.length).toBe(1);

    await storageService.deleteArchivedNote(archived.id);
    history = await storageService.getArchivedNotes();
    expect(history.length).toBe(0);
  });

  it('exports and imports backup data', async () => {
    await storageService.saveActiveNote('Active note content');
    await storageService.archiveActiveNote();
    await storageService.saveActiveNote('Current active note');

    const backupJson = await storageService.exportBackup();
    expect(backupJson).toContain('Current active note');
    expect(backupJson).toContain('Active note content');

    await storageService.clearAll();
    const activeAfterClear = await storageService.getActiveNote();
    expect(activeAfterClear.content).toBe(ONBOARDING_NOTE_CONTENT);

    const imported = await storageService.importBackup(backupJson);
    expect(imported).toBe(true);

    const activeAfterImport = await storageService.getActiveNote();
    expect(activeAfterImport.content).toBe('Current active note');

    const archivedAfterImport = await storageService.getArchivedNotes();
    expect(archivedAfterImport.length).toBe(1);
  });
});
