import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Composer } from '@/services/reedy/ui/Composer';

const draft = {
  id: 17,
  bookKey: 'sample-book',
  prompt: '请解释引用：原文与第 42 页',
};

describe('Reedy selection-to-AI composer', () => {
  afterEach(cleanup);

  it('prefills a sourced quote without sending it to any model', () => {
    const onSend = vi.fn();
    const onApplied = vi.fn();
    render(
      <Composer
        isRunning={false}
        onSend={onSend}
        onAbort={vi.fn()}
        draft={draft}
        onDraftApplied={onApplied}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveProperty('value', draft.prompt);
    expect(onApplied).toHaveBeenCalledWith(17);
    expect(onSend).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSend).toHaveBeenCalledExactlyOnceWith(draft.prompt);
  });

  it('appends a selected passage to an unfinished question instead of discarding it', () => {
    const onSend = vi.fn();
    const { rerender } = render(<Composer isRunning={false} onSend={onSend} onAbort={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '这个观点有证据吗？' },
    });
    rerender(<Composer isRunning={false} onSend={onSend} onAbort={vi.fn()} draft={draft} />);
    expect(screen.getByRole('textbox')).toHaveProperty(
      'value',
      '这个观点有证据吗？\n\n' + draft.prompt,
    );
    expect(onSend).not.toHaveBeenCalled();
  });
});
