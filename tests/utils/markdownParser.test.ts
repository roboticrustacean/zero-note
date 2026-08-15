import {
  parseMarkdownLines,
  toggleChecklistLine,
  calculateNoteStats,
  formatTimeAgo,
} from '../../src/utils/markdownParser';

describe('Markdown Parser & Checklist Utils', () => {
  it('identifies checklist items, headings, and plain text', () => {
    const text = '# Today\n- [ ] Task 1\n- [x] Task 2\n• Bullet\nNormal note';
    const lines = parseMarkdownLines(text);

    expect(lines[0].type).toBe('heading');
    expect(lines[0].text).toBe('Today');
    expect(lines[0].level).toBe(1);

    expect(lines[1].type).toBe('checklist');
    expect(lines[1].checked).toBe(false);
    expect(lines[1].text).toBe('Task 1');

    expect(lines[2].type).toBe('checklist');
    expect(lines[2].checked).toBe(true);
    expect(lines[2].text).toBe('Task 2');

    expect(lines[3].type).toBe('bullet');
    expect(lines[3].text).toBe('Bullet');

    expect(lines[4].type).toBe('paragraph');
    expect(lines[4].text).toBe('Normal note');
  });

  it('toggles checklist line from unchecked to checked and vice versa', () => {
    const text = '- [ ] Buy coffee\n- [x] Write code';
    const updated = toggleChecklistLine(text, 0);
    expect(updated).toBe('- [x] Buy coffee\n- [x] Write code');

    const toggledBack = toggleChecklistLine(updated, 1);
    expect(toggledBack).toBe('- [x] Buy coffee\n- [ ] Write code');
  });

  it('calculates note word count and character count accurately', () => {
    const text = 'Hello world! Focus on one note.';
    const stats = calculateNoteStats(text);
    expect(stats.words).toBe(6);
    expect(stats.chars).toBe(31);
    expect(stats.lines).toBe(1);
  });

  it('formats relative timestamp accurately', () => {
    const now = Date.now();
    expect(formatTimeAgo(now - 10000)).toBe('Just now');
    expect(formatTimeAgo(now - 120000)).toBe('2m ago');
    expect(formatTimeAgo(now - 7200000)).toBe('2h ago');
  });
});
