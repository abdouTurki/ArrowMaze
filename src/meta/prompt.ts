interface PromptChoice {
  kind?: 'ad' | 'coin';
  label: string;
  cost: string | number;
  disabled?: boolean;
  onPick: () => void;
}

interface PromptOpts {
  title: string;
  text: string;
  icon?: string;
  choices: PromptChoice[];
  onCancel?: () => void;
}

export function showPrompt(opts: PromptOpts): void {
  const promptOverlay = document.getElementById('promptOverlay')!;
  document.getElementById('promptTitle')!.textContent = opts.title;
  document.getElementById('promptText')!.textContent = opts.text;
  document.getElementById('promptIcon')!.textContent = opts.icon || '⚡';
  const list = document.getElementById('promptChoices')!;
  list.innerHTML = '';
  opts.choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.className = 'choice ' + (c.kind || 'coin');
    btn.disabled = !!c.disabled;
    btn.innerHTML = `<span>${c.label}</span><span class="chip">${c.cost}</span>`;
    btn.addEventListener('click', () => {
      promptOverlay.classList.remove('show');
      c.onPick();
    });
    list.appendChild(btn);
  });
  const cancelBtn = document.getElementById('promptCancel') as HTMLButtonElement;
  cancelBtn.onclick = (): void => {
    promptOverlay.classList.remove('show');
    if (opts.onCancel) opts.onCancel();
  };
  promptOverlay.classList.add('show');
}
